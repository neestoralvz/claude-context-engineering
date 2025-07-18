import { Server as SocketIOServer, Socket } from 'socket.io'
import { AuthService, User } from './auth-service'
import cookie from 'cookie'

// WebSocket authentication middleware
export interface AuthenticatedSocket extends Socket {
  user?: User
  permissions?: string[]
}

// Rate limiting for WebSocket connections
const connectionRateLimit = new Map()
const MAX_CONNECTIONS_PER_IP = 5
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

// Message rate limiting
const messageRateLimit = new Map()
const MAX_MESSAGES_PER_MINUTE = 100

export class WebSocketAuthService {
  private io: SocketIOServer

  constructor(io: SocketIOServer) {
    this.io = io
    this.setupAuthMiddleware()
  }

  /**
   * Setup authentication middleware for Socket.IO
   */
  private setupAuthMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Rate limiting by IP
        const clientIP = socket.handshake.address
        if (!this.checkConnectionRateLimit(clientIP)) {
          return next(new Error('Too many connections from this IP'))
        }

        // Extract token from handshake
        const token = this.extractToken(socket)
        if (!token) {
          return next(new Error('Authentication token required'))
        }

        // Verify token
        const payload = await AuthService.verifyToken(token)
        if (!payload) {
          return next(new Error('Invalid authentication token'))
        }

        // Get user information
        const user = AuthService.getUserById(payload.userId)
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'))
        }

        // Attach user info to socket
        socket.user = user
        socket.permissions = user.permissions

        next()
      } catch (error) {
        console.error('WebSocket authentication error:', error)
        next(new Error('Authentication failed'))
      }
    })

    // Setup connection handling
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket)
    })
  }

  /**
   * Extract authentication token from handshake
   */
  private extractToken(socket: Socket): string | null {
    // Try to get token from cookies
    const cookies = socket.handshake.headers.cookie
    if (cookies) {
      const parsedCookies = cookie.parse(cookies)
      if (parsedCookies['auth-token']) {
        return parsedCookies['auth-token']
      }
    }

    // Try to get token from auth header
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers.authorization
    if (authHeader) {
      return authHeader.replace('Bearer ', '')
    }

    // Try to get token from query parameters
    return socket.handshake.query.token as string || null
  }

  /**
   * Check connection rate limiting
   */
  private checkConnectionRateLimit(ip: string): boolean {
    const now = Date.now()
    const key = `conn:${ip}`
    
    if (!connectionRateLimit.has(key)) {
      connectionRateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
      return true
    }

    const rateData = connectionRateLimit.get(key)
    
    if (now > rateData.resetTime) {
      connectionRateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
      return true
    }

    return rateData.count < MAX_CONNECTIONS_PER_IP
  }

  /**
   * Check message rate limiting
   */
  private checkMessageRateLimit(socketId: string): boolean {
    const now = Date.now()
    const key = `msg:${socketId}`
    
    if (!messageRateLimit.has(key)) {
      messageRateLimit.set(key, { count: 1, resetTime: now + 60000 })
      return true
    }

    const rateData = messageRateLimit.get(key)
    
    if (now > rateData.resetTime) {
      messageRateLimit.set(key, { count: 1, resetTime: now + 60000 })
      return true
    }

    if (rateData.count >= MAX_MESSAGES_PER_MINUTE) {
      return false
    }

    rateData.count++
    return true
  }

  /**
   * Handle authenticated WebSocket connection
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    console.log(`Authenticated user connected: ${socket.user?.username} (${socket.id})`)

    // Join user to appropriate rooms based on role and permissions
    this.joinUserRooms(socket)

    // Set up message rate limiting
    socket.use((packet, next) => {
      if (!this.checkMessageRateLimit(socket.id)) {
        return next(new Error('Message rate limit exceeded'))
      }
      next()
    })

    // Handle reactor control (requires permission)
    socket.on('reactor:control', (data) => {
      if (!this.hasPermission(socket, 'control:reactors')) {
        socket.emit('error', { message: 'Insufficient permissions for reactor control' })
        return
      }

      this.handleReactorControl(socket, data)
    })

    // Handle station control (requires permission)
    socket.on('station:control', (data) => {
      if (!this.hasPermission(socket, 'control:stations')) {
        socket.emit('error', { message: 'Insufficient permissions for station control' })
        return
      }

      this.handleStationControl(socket, data)
    })

    // Handle metrics request (requires read permission)
    socket.on('metrics:request', (data) => {
      if (!this.hasPermission(socket, 'read:dashboard')) {
        socket.emit('error', { message: 'Insufficient permissions to view metrics' })
        return
      }

      this.handleMetricsRequest(socket, data)
    })

    // Handle user management (admin only)
    socket.on('user:manage', (data) => {
      if (!this.hasPermission(socket, 'manage:users')) {
        socket.emit('error', { message: 'Insufficient permissions for user management' })
        return
      }

      this.handleUserManagement(socket, data)
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id}), reason: ${reason}`)
      this.handleDisconnection(socket)
    })

    // Send initial data based on permissions
    this.sendInitialData(socket)
  }

  /**
   * Join user to appropriate rooms based on role
   */
  private joinUserRooms(socket: AuthenticatedSocket): void {
    if (!socket.user) return

    // Join general user room
    socket.join(`user:${socket.user.id}`)

    // Join role-based rooms
    socket.join(`role:${socket.user.role}`)

    // Join department room if applicable
    if (socket.user.department) {
      socket.join(`dept:${socket.user.department}`)
    }

    // Join shift room if applicable
    if (socket.user.shift) {
      socket.join(`shift:${socket.user.shift}`)
    }

    // Join permission-based rooms
    socket.user.permissions.forEach(permission => {
      socket.join(`perm:${permission}`)
    })
  }

  /**
   * Check if user has required permission
   */
  private hasPermission(socket: AuthenticatedSocket, permission: string): boolean {
    if (!socket.user || !socket.permissions) return false
    return AuthService.hasPermission(socket.user, permission)
  }

  /**
   * Handle reactor control commands
   */
  private handleReactorControl(socket: AuthenticatedSocket, data: any): void {
    // Validate data
    if (!data.reactorId || !data.action) {
      socket.emit('error', { message: 'Invalid reactor control data' })
      return
    }

    // Log the action for audit
    console.log(`Reactor control by ${socket.user?.username}: ${JSON.stringify(data)}`)

    // Simulate control response
    const response = {
      reactorId: data.reactorId,
      action: data.action,
      status: 'executed',
      timestamp: new Date().toISOString(),
      operator: socket.user?.username
    }

    // Send response to user
    socket.emit('reactor:control:response', response)

    // Broadcast to supervisors and admins
    this.io.to('role:supervisor').to('role:admin').emit('reactor:control:broadcast', {
      ...response,
      operator: socket.user?.username
    })
  }

  /**
   * Handle station control commands
   */
  private handleStationControl(socket: AuthenticatedSocket, data: any): void {
    // Validate data
    if (!data.stationId || !data.action) {
      socket.emit('error', { message: 'Invalid station control data' })
      return
    }

    // Log the action for audit
    console.log(`Station control by ${socket.user?.username}: ${JSON.stringify(data)}`)

    // Simulate control response
    const response = {
      stationId: data.stationId,
      action: data.action,
      status: 'executed',
      timestamp: new Date().toISOString(),
      operator: socket.user?.username
    }

    // Send response to user
    socket.emit('station:control:response', response)

    // Broadcast to supervisors and admins
    this.io.to('role:supervisor').to('role:admin').emit('station:control:broadcast', {
      ...response,
      operator: socket.user?.username
    })
  }

  /**
   * Handle metrics request
   */
  private handleMetricsRequest(socket: AuthenticatedSocket, data: any): void {
    // Generate metrics based on user permissions
    const metrics = this.generateMetrics(socket.user!)

    socket.emit('metrics:response', metrics)
  }

  /**
   * Handle user management commands
   */
  private handleUserManagement(socket: AuthenticatedSocket, data: any): void {
    // Only admins can manage users
    if (socket.user?.role !== 'admin') {
      socket.emit('error', { message: 'Admin access required' })
      return
    }

    // Handle different user management actions
    switch (data.action) {
      case 'list':
        socket.emit('users:list', AuthService.getAllUsers())
        break
      case 'update':
        const updatedUser = AuthService.updateUser(data.userId, data.updates)
        socket.emit('user:updated', updatedUser)
        break
      case 'deactivate':
        const success = AuthService.deactivateUser(data.userId)
        socket.emit('user:deactivated', { userId: data.userId, success })
        break
      default:
        socket.emit('error', { message: 'Invalid user management action' })
    }
  }

  /**
   * Handle disconnection cleanup
   */
  private handleDisconnection(socket: AuthenticatedSocket): void {
    // Clean up rate limiting data for this socket
    messageRateLimit.delete(`msg:${socket.id}`)
  }

  /**
   * Send initial data based on user permissions
   */
  private sendInitialData(socket: AuthenticatedSocket): void {
    if (!socket.user) return

    // Send user info
    socket.emit('user:info', {
      id: socket.user.id,
      username: socket.user.username,
      role: socket.user.role,
      department: socket.user.department,
      shift: socket.user.shift,
      permissions: socket.user.permissions
    })

    // Send initial metrics if user has permission
    if (this.hasPermission(socket, 'read:dashboard')) {
      socket.emit('metrics:initial', this.generateMetrics(socket.user))
    }

    // Send reactor status if user has permission
    if (this.hasPermission(socket, 'read:production')) {
      socket.emit('reactor:initial', this.generateReactorStatus())
    }
  }

  /**
   * Generate metrics based on user permissions
   */
  private generateMetrics(user: User): any {
    const baseMetrics = {
      timestamp: new Date().toISOString(),
      totalProduction: 12000 + Math.floor(Math.random() * 1000),
      efficiency: 85 + Math.random() * 10,
      activeOrders: 6 + Math.floor(Math.random() * 5)
    }

    // Add sensitive data only for supervisors and admins
    if (user.role === 'supervisor' || user.role === 'admin') {
      return {
        ...baseMetrics,
        qualityRate: 95 + Math.random() * 5,
        downtime: Math.random() * 5,
        alertsCount: Math.floor(Math.random() * 5),
        financialData: {
          dailyRevenue: 45000 + Math.random() * 10000,
          costPerUnit: 12.5 + Math.random() * 2
        }
      }
    }

    return baseMetrics
  }

  /**
   * Generate reactor status
   */
  private generateReactorStatus(): any {
    return {
      id: ['reactor-001', 'reactor-002', 'reactor-003'][Math.floor(Math.random() * 3)],
      timestamp: new Date().toISOString(),
      parameters: {
        temperature: 15 + Math.random() * 20,
        pressure: 0.8 + Math.random() * 0.8,
        mixingSpeed: Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0,
        pH: 6.5 + Math.random() * 1.5
      },
      efficiency: 80 + Math.random() * 20
    }
  }

  /**
   * Broadcast to users with specific permission
   */
  broadcastToPermission(permission: string, event: string, data: any): void {
    this.io.to(`perm:${permission}`).emit(event, data)
  }

  /**
   * Broadcast to users with specific role
   */
  broadcastToRole(role: string, event: string, data: any): void {
    this.io.to(`role:${role}`).emit(event, data)
  }

  /**
   * Send to specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data)
  }
}

// Export singleton instance
let wsAuthService: WebSocketAuthService | null = null

export function initializeWebSocketAuth(io: SocketIOServer): WebSocketAuthService {
  wsAuthService = new WebSocketAuthService(io)
  return wsAuthService
}

export function getWebSocketAuthService(): WebSocketAuthService | null {
  return wsAuthService
}
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { UserService, User } from '@/lib/services/user-service'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  email: string
  role: 'operator' | 'supervisor' | 'viewer'
  firstName?: string
  lastName?: string
  department?: string
  shift?: 'morning' | 'afternoon' | 'night'
}

export interface JWTPayload {
  userId: string
  username: string
  role: string
  permissions: string[]
  exp: number
  iat: number
  [key: string]: any
}

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)
const TOKEN_EXPIRY = '8h' // 8 hours for factory shifts
const REFRESH_TOKEN_EXPIRY = '7d' // 7 days

export class AuthService {
  /**
   * Generate JWT token
   */
  static async generateToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8 hours
      iat: Math.floor(Date.now() / 1000)
    }

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(TOKEN_EXPIRY)
      .setIssuedAt()
      .sign(JWT_SECRET)

    return token
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload as JWTPayload
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  /**
   * Authenticate user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
    const { username, password } = credentials

    // Initialize users table if needed
    await UserService.initializeUsersTable()

    // Authenticate user
    const user = await UserService.authenticate(username, password)
    if (!user) {
      return null
    }

    // Generate token
    const token = await this.generateToken(user)

    return { user, token }
  }

  /**
   * Register new user (admin only)
   */
  static async register(userData: RegisterData): Promise<User | null> {
    const { username, email, password, role, firstName, lastName, department, shift } = userData

    // Check if user already exists
    const existingUser = await UserService.getUserByUsername(username) || await UserService.getUserByEmail(email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Create new user
    const newUser = await UserService.createUser({
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      department,
      shift
    })

    return newUser
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    return await UserService.getUserById(id)
  }

  /**
   * Get current user from request headers
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = cookies()
      const token = cookieStore.get('auth-token')?.value

      if (!token) return null

      // Verify token and get user
      const payload = await this.verifyToken(token)
      if (!payload) return null

      return await UserService.getUserById(payload.userId)
    } catch {
      return null
    }
  }

  /**
   * Check if user has permission
   */
  static hasPermission(user: User, permission: string): boolean {
    return UserService.hasPermission(user, permission)
  }

  /**
   * Logout user
   */
  static logout(): void {
    const cookieStore = cookies()
    cookieStore.delete('auth-token')
    cookieStore.delete('csrf-token')
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    return await UserService.getAllUsers()
  }

  /**
   * Update user (admin only)
   */
  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return await UserService.updateUser(id, updates)
  }

  /**
   * Deactivate user (admin only)
   */
  static async deactivateUser(id: string): Promise<boolean> {
    return await UserService.deactivateUser(id)
  }
}

// Helper function to get user from token
export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = await AuthService.verifyToken(token)
  if (!payload) return null

  return await AuthService.getUserById(payload.userId)
}

// Helper function to require authentication
export function requireAuth(requiredPermission?: string) {
  return (user: User | null) => {
    if (!user) throw new Error('Authentication required')
    
    if (requiredPermission && !AuthService.hasPermission(user, requiredPermission)) {
      throw new Error('Insufficient permissions')
    }
    
    return user
  }
}
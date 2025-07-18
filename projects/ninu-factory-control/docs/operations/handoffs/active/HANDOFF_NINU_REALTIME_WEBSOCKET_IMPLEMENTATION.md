# 🔴 HANDOFF: NINU.MX REAL-TIME WEBSOCKET IMPLEMENTATION

**Updated**: 2024-07-18  
**Priority**: 🔴 HIGH - Factory Operations Critical  
**Status**: 🔴 PENDING (Dependencies: Backend API Foundation)  
**Scope**: Complete WebSocket server with real-time factory monitoring and control  
**Estimated Effort**: 40 hours over 10 days

## 📊 WEBSOCKET IMPLEMENTATION SUMMARY

**REAL-TIME STATUS**: 🔴 **PENDING - ARCHITECTURE COMPLETE** - Awaiting backend API foundation

### ✅ Completed Architecture (4/10)
- [x] **WebSocket Architecture Design** - Complete technical specification
- [x] **Message Protocol Design** - Factory-specific event types and payloads
- [x] **Client Integration Points** - Frontend WebSocket integration architecture
- [x] **Security Framework** - Authentication and authorization for WebSocket connections

### 🔴 Pending Implementation (6/10)
- [ ] **WebSocket Server Setup** - Node.js WebSocket server with Next.js integration
- [ ] **Real-time Event Broadcasting** - Factory event propagation system
- [ ] **Client Connection Management** - Authentication, subscriptions, health monitoring
- [ ] **Message Queuing System** - Offline message handling and delivery
- [ ] **Performance Optimization** - Connection pooling and message batching
- [ ] **Monitoring & Logging** - WebSocket performance and error tracking

## 🏗️ WEBSOCKET ARCHITECTURE DESIGN

### **Real-time Communication Framework** (✅ Complete)
```typescript
// WebSocket message protocol designed
interface FactoryWebSocketMessage {
  type: FactoryEventType
  payload: any
  timestamp: Date
  source: string           // reactor-A, station-1, system, etc.
  priority: 'low' | 'medium' | 'high' | 'critical'
  sequenceId: string       // For message ordering
}

enum FactoryEventType {
  // Reactor events
  REACTOR_STATUS_CHANGE = 'reactor_status_change',
  REACTOR_TEMPERATURE_UPDATE = 'reactor_temperature_update',
  REACTOR_PRESSURE_UPDATE = 'reactor_pressure_update',
  REACTOR_BATCH_START = 'reactor_batch_start',
  REACTOR_BATCH_COMPLETE = 'reactor_batch_complete',
  
  // Station events
  STATION_STATUS_CHANGE = 'station_status_change',
  STATION_EFFICIENCY_UPDATE = 'station_efficiency_update',
  STATION_QUEUE_UPDATE = 'station_queue_update',
  STATION_PRODUCT_CHANGE = 'station_product_change',
  
  // Quality events
  QUALITY_TEST_RESULT = 'quality_test_result',
  QUALITY_ALERT = 'quality_alert',
  BATCH_QUALITY_APPROVAL = 'batch_quality_approval',
  COFEPRIS_COMPLIANCE_UPDATE = 'cofepris_compliance_update',
  
  // System events
  SYSTEM_ALERT = 'system_alert',
  PRODUCTION_METRICS_UPDATE = 'production_metrics_update',
  MAINTENANCE_SCHEDULED = 'maintenance_scheduled',
  SHIFT_CHANGE = 'shift_change'
}
```

### **Factory-Specific Event Payloads** (✅ Designed)
```typescript
// Reactor status change event
interface ReactorStatusChangePayload {
  reactorId: string
  previousStatus: ReactorStatus
  newStatus: ReactorStatus
  reason?: string
  batchId?: string
  estimatedDuration?: number  // minutes
  operator?: string
}

// Station efficiency update event
interface StationEfficiencyUpdatePayload {
  stationId: string
  currentEfficiency: number
  targetEfficiency: number
  unitsProducedLastHour: number
  downtime: number           // minutes in last hour
  qualityRate: number        // percentage pass rate
}

// Quality alert event
interface QualityAlertPayload {
  alertId: string
  batchId: string
  parameter: string          // pH, viscosity, antimicrobial_efficacy
  measuredValue: number
  expectedRange: [number, number]
  severity: 'warning' | 'critical'
  cofepisRequirement: boolean
  actionRequired: string
}

// System production metrics
interface ProductionMetricsPayload {
  timestamp: Date
  totalProduction: number    // units produced today
  overallEfficiency: number  // factory-wide efficiency %
  qualityRate: number        // COFEPRIS compliance rate %
  activeOrders: number
  completedBatches: number
  alertsCount: number
  energyConsumption: number  // kWh
}
```

## 🔧 WEBSOCKET SERVER IMPLEMENTATION PLAN

### **Server Architecture** (🔴 Implementation Pending)
```typescript
// WebSocket server with Next.js integration
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import next from 'next'

class FactoryWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, AuthenticatedClient> = new Map()
  private messageQueue: Map<string, FactoryWebSocketMessage[]> = new Map()
  
  constructor() {
    this.setupWebSocketServer()
    this.setupEventHandlers()
  }
  
  // Client management
  async handleConnection(ws: WebSocket, request: Request): Promise<void> {
    const client = await this.authenticateClient(request)
    if (!client) {
      ws.close(1008, 'Authentication failed')
      return
    }
    
    this.clients.set(client.id, { ws, client, subscriptions: [] })
    this.sendQueuedMessages(client.id)
    
    ws.on('message', (data) => this.handleClientMessage(client.id, data))
    ws.on('close', () => this.handleClientDisconnect(client.id))
  }
  
  // Event broadcasting
  broadcastToSubscribers(eventType: FactoryEventType, payload: any): void {
    const message: FactoryWebSocketMessage = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source: 'system',
      priority: this.getEventPriority(eventType),
      sequenceId: generateSequenceId()
    }
    
    this.clients.forEach(({ ws, client, subscriptions }) => {
      if (this.isClientSubscribed(client, eventType) && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
      } else {
        // Queue message for offline clients
        this.queueMessage(client.id, message)
      }
    })
  }
  
  // Factory-specific event handlers
  onReactorStatusChange(reactorId: string, status: ReactorStatus): void {
    this.broadcastToSubscribers(FactoryEventType.REACTOR_STATUS_CHANGE, {
      reactorId,
      newStatus: status,
      timestamp: new Date()
    })
  }
  
  onQualityAlert(alert: QualityAlertPayload): void {
    this.broadcastToSubscribers(FactoryEventType.QUALITY_ALERT, alert)
    
    // Send SMS/email for critical quality alerts
    if (alert.severity === 'critical') {
      this.notifyQualityTeam(alert)
    }
  }
}
```

### **Client Subscription Management** (🔄 Architecture Complete)
```typescript
// Client subscription system
interface ClientSubscription {
  eventType: FactoryEventType | 'all'
  filters?: {
    reactorIds?: string[]
    stationIds?: string[]
    severity?: ('low' | 'medium' | 'high' | 'critical')[]
    userRole?: UserRole
  }
}

interface AuthenticatedClient {
  id: string
  userId: string
  role: UserRole
  subscriptions: ClientSubscription[]
  lastSeen: Date
  connectionType: 'dashboard' | 'mobile' | 'api'
}

// Role-based event filtering
const subscriptionPermissions: Record<UserRole, FactoryEventType[]> = {
  operator: [
    FactoryEventType.REACTOR_STATUS_CHANGE,
    FactoryEventType.STATION_STATUS_CHANGE,
    FactoryEventType.PRODUCTION_METRICS_UPDATE
  ],
  supervisor: [
    // All operator events plus:
    FactoryEventType.QUALITY_TEST_RESULT,
    FactoryEventType.QUALITY_ALERT,
    FactoryEventType.STATION_EFFICIENCY_UPDATE
  ],
  manager: [
    // All supervisor events plus:
    FactoryEventType.BATCH_QUALITY_APPROVAL,
    FactoryEventType.COFEPRIS_COMPLIANCE_UPDATE,
    FactoryEventType.MAINTENANCE_SCHEDULED
  ],
  admin: [
    // All events
    ...Object.values(FactoryEventType)
  ]
}
```

## 🔐 WEBSOCKET SECURITY IMPLEMENTATION

### **Authentication System** (✅ Designed)
```typescript
// WebSocket authentication via JWT
interface WebSocketAuthToken {
  userId: string
  role: UserRole
  permissions: string[]
  sessionId: string
  expiresAt: Date
}

class WebSocketAuthenticator {
  async authenticateConnection(request: Request): Promise<AuthenticatedClient | null> {
    // Extract token from query string or headers
    const token = this.extractToken(request)
    if (!token) return null
    
    // Validate JWT token
    const decoded = await this.validateJWT(token)
    if (!decoded || decoded.expiresAt < new Date()) return null
    
    // Check user permissions
    const user = await this.getUserById(decoded.userId)
    if (!user || !user.active) return null
    
    return {
      id: generateClientId(),
      userId: user.id,
      role: user.role,
      subscriptions: this.getDefaultSubscriptions(user.role),
      lastSeen: new Date(),
      connectionType: this.detectConnectionType(request)
    }
  }
  
  private extractToken(request: Request): string | null {
    // Try authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    
    // Fallback to query parameter
    const url = new URL(request.url)
    return url.searchParams.get('token')
  }
}
```

### **Message Security & Validation** (🔄 Planned)
```typescript
// Message validation and sanitization
import { z } from 'zod'

const websocketMessageSchema = z.object({
  type: z.enum(Object.values(FactoryEventType) as [string, ...string[]]),
  payload: z.any(),
  clientId: z.string().uuid()
})

class MessageValidator {
  validateIncomingMessage(rawMessage: string): ValidationResult {
    try {
      const parsed = JSON.parse(rawMessage)
      const validated = websocketMessageSchema.parse(parsed)
      
      // Additional factory-specific validation
      return this.validateFactoryMessage(validated)
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }
  
  private validateFactoryMessage(message: any): ValidationResult {
    switch (message.type) {
      case FactoryEventType.REACTOR_STATUS_CHANGE:
        return this.validateReactorStatusChange(message.payload)
      case FactoryEventType.QUALITY_TEST_RESULT:
        return this.validateQualityTestResult(message.payload)
      default:
        return { valid: true }
    }
  }
}
```

## 📊 REAL-TIME DATA INTEGRATION

### **Factory Data Sources** (✅ Integration Points Identified)
```typescript
// Integration with factory systems
interface FactoryDataSource {
  // Hardware sensors (planned integration)
  reactorSensors: {
    temperature: (reactorId: string) => Promise<number>
    pressure: (reactorId: string) => Promise<number>
    mixingSpeed: (reactorId: string) => Promise<number>
  }
  
  // Station monitoring systems
  stationMonitors: {
    efficiency: (stationId: string) => Promise<number>
    throughput: (stationId: string) => Promise<number>
    status: (stationId: string) => Promise<StationStatus>
  }
  
  // Quality control systems
  qualityControl: {
    testResults: () => Promise<QualityTestResult[]>
    cofepisCompliance: () => Promise<ComplianceStatus>
  }
}

// Real-time data polling and event generation
class FactoryDataPoller {
  private pollInterval = 5000 // 5 seconds
  private lastValues: Map<string, any> = new Map()
  
  async startPolling(): Promise<void> {
    setInterval(async () => {
      await this.pollReactorData()
      await this.pollStationData()
      await this.pollQualityData()
    }, this.pollInterval)
  }
  
  private async pollReactorData(): Promise<void> {
    for (const reactorId of ['reactor-A', 'reactor-B', 'reactor-C']) {
      const temperature = await this.dataSource.reactorSensors.temperature(reactorId)
      const lastTemp = this.lastValues.get(`${reactorId}.temperature`)
      
      if (Math.abs(temperature - (lastTemp || 0)) > 0.5) {
        this.websocketServer.broadcastToSubscribers(
          FactoryEventType.REACTOR_TEMPERATURE_UPDATE,
          { reactorId, temperature, timestamp: new Date() }
        )
        this.lastValues.set(`${reactorId}.temperature`, temperature)
      }
    }
  }
}
```

### **Event Aggregation & Analytics** (🔄 Architecture Planned)
```typescript
// Real-time analytics and aggregation
interface EventAggregator {
  // Production metrics calculation
  calculateRealTimeEfficiency(): Promise<number>
  calculateQualityRate(): Promise<number>
  getActiveAlerts(): Promise<Alert[]>
  
  // Trend analysis
  detectEfficiencyTrends(): Promise<TrendAnalysis>
  predictMaintenanceNeeds(): Promise<MaintenancePrediction[]>
  
  // Automatic alert generation
  checkThresholds(): Promise<Alert[]>
}

// Event storage for analytics
class EventStore {
  async storeEvent(event: FactoryWebSocketMessage): Promise<void> {
    // Store in time-series database for analytics
    await this.timeSeriesDB.insert({
      timestamp: event.timestamp,
      eventType: event.type,
      source: event.source,
      payload: event.payload,
      priority: event.priority
    })
  }
  
  async getEventsForAnalysis(
    timeRange: DateRange,
    eventTypes: FactoryEventType[]
  ): Promise<FactoryWebSocketMessage[]> {
    return this.timeSeriesDB.query({
      timestamp: { between: [timeRange.start, timeRange.end] },
      eventType: { in: eventTypes }
    })
  }
}
```

## 🚀 PERFORMANCE OPTIMIZATION STRATEGY

### **Connection Management** (🔄 Architecture Complete)
```typescript
// High-performance connection management
class ConnectionManager {
  private maxConnections = 100
  private heartbeatInterval = 30000 // 30 seconds
  private connectionPool: Map<string, ClientConnection> = new Map()
  
  // Connection health monitoring
  startHeartbeat(): void {
    setInterval(() => {
      this.connectionPool.forEach(async (connection, clientId) => {
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.ping()
          connection.lastPing = new Date()
        } else {
          await this.handleDeadConnection(clientId)
        }
      })
    }, this.heartbeatInterval)
  }
  
  // Message batching for high-frequency updates
  private messageBatch: Map<string, FactoryWebSocketMessage[]> = new Map()
  private batchInterval = 1000 // 1 second
  
  batchMessage(clientId: string, message: FactoryWebSocketMessage): void {
    if (!this.messageBatch.has(clientId)) {
      this.messageBatch.set(clientId, [])
    }
    
    this.messageBatch.get(clientId)!.push(message)
    
    // Send batch if it reaches max size
    if (this.messageBatch.get(clientId)!.length >= 10) {
      this.flushBatch(clientId)
    }
  }
  
  private flushBatch(clientId: string): void {
    const messages = this.messageBatch.get(clientId) || []
    if (messages.length === 0) return
    
    const connection = this.connectionPool.get(clientId)
    if (connection?.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify({
        type: 'batch',
        messages,
        timestamp: new Date()
      }))
    }
    
    this.messageBatch.set(clientId, [])
  }
}
```

### **Message Queuing System** (🔴 Implementation Pending)
```typescript
// Offline message queuing for reliability
interface MessageQueue {
  // Queue management
  enqueue(clientId: string, message: FactoryWebSocketMessage): Promise<void>
  dequeue(clientId: string, count?: number): Promise<FactoryWebSocketMessage[]>
  clear(clientId: string): Promise<void>
  
  // Persistence for critical messages
  persistCriticalMessage(message: FactoryWebSocketMessage): Promise<void>
  
  // Delivery guarantees
  markAsDelivered(messageId: string): Promise<void>
  getUndeliveredMessages(clientId: string): Promise<FactoryWebSocketMessage[]>
}

// Redis-based message queue implementation
class RedisMessageQueue implements MessageQueue {
  private redis: RedisClient
  
  async enqueue(clientId: string, message: FactoryWebSocketMessage): Promise<void> {
    const key = `queue:${clientId}`
    await this.redis.lpush(key, JSON.stringify(message))
    
    // Set TTL for non-critical messages
    if (message.priority !== 'critical') {
      await this.redis.expire(key, 3600) // 1 hour
    }
  }
  
  async dequeue(clientId: string, count = 10): Promise<FactoryWebSocketMessage[]> {
    const key = `queue:${clientId}`
    const rawMessages = await this.redis.lrange(key, 0, count - 1)
    await this.redis.ltrim(key, count, -1)
    
    return rawMessages.map(raw => JSON.parse(raw))
  }
}
```

## 📋 WEBSOCKET MONITORING & LOGGING

### **Performance Monitoring** (🔄 Architecture Planned)
```typescript
// WebSocket performance metrics
interface WebSocketMetrics {
  // Connection metrics
  activeConnections: number
  connectionsPerSecond: number
  averageConnectionDuration: number
  connectionFailureRate: number
  
  // Message metrics
  messagesPerSecond: number
  averageMessageLatency: number
  messageDeliveryRate: number
  queuedMessagesCount: number
  
  // Resource metrics
  memoryUsage: number
  cpuUsage: number
  networkBandwidth: number
}

class WebSocketMonitor {
  private metrics: WebSocketMetrics = this.initializeMetrics()
  
  // Prometheus metrics integration
  setupPrometheusMetrics(): void {
    const promClient = require('prom-client')
    
    const connectionGauge = new promClient.Gauge({
      name: 'websocket_active_connections',
      help: 'Number of active WebSocket connections'
    })
    
    const messageCounter = new promClient.Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['type', 'direction']
    })
    
    const latencyHistogram = new promClient.Histogram({
      name: 'websocket_message_latency_seconds',
      help: 'WebSocket message latency in seconds',
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
    })
  }
  
  // Real-time performance tracking
  trackMessageLatency(startTime: Date, endTime: Date): void {
    const latency = endTime.getTime() - startTime.getTime()
    this.metrics.averageMessageLatency = this.updateMovingAverage(
      this.metrics.averageMessageLatency,
      latency
    )
  }
}
```

### **Error Handling & Recovery** (🔄 Architecture Complete)
```typescript
// Robust error handling system
class WebSocketErrorHandler {
  // Error categorization
  handleError(error: Error, context: ErrorContext): void {
    const errorType = this.categorizeError(error)
    
    switch (errorType) {
      case 'connection_error':
        this.handleConnectionError(error, context)
        break
      case 'authentication_error':
        this.handleAuthenticationError(error, context)
        break
      case 'message_validation_error':
        this.handleValidationError(error, context)
        break
      case 'system_error':
        this.handleSystemError(error, context)
        break
    }
  }
  
  // Automatic recovery mechanisms
  async attemptRecovery(clientId: string, errorType: string): Promise<boolean> {
    switch (errorType) {
      case 'connection_lost':
        return this.attemptReconnection(clientId)
      case 'authentication_expired':
        return this.refreshAuthentication(clientId)
      case 'message_queue_full':
        return this.clearOldMessages(clientId)
      default:
        return false
    }
  }
  
  // Circuit breaker pattern for system protection
  private circuitBreaker = new CircuitBreaker({
    threshold: 5,     // Number of failures
    resetTimeout: 60000, // 1 minute
    monitorTime: 30000   // 30 seconds
  })
}
```

## 🎯 SUCCESS CRITERIA & IMPLEMENTATION PHASES

### **Phase 1: Core WebSocket Infrastructure** (Priority 1 - 1 week)
```bash
# Implementation checklist
- [ ] WebSocket server setup with Next.js integration
- [ ] Client authentication and authorization
- [ ] Basic message broadcasting for reactor/station updates
- [ ] Connection health monitoring with heartbeat
- [ ] Basic error handling and logging

# Success criteria:
- WebSocket server operational on port 8080
- Authentication working with JWT tokens
- Real-time reactor status updates functional
- <100ms message latency for local connections
- 95% message delivery rate
```

### **Phase 2: Advanced Features & Optimization** (Priority 2 - 1 week)
```bash
# Advanced implementation
- [ ] Message queuing for offline clients
- [ ] Subscription management and filtering
- [ ] Message batching for high-frequency updates
- [ ] Performance monitoring with Prometheus metrics
- [ ] Circuit breaker and recovery mechanisms

# Success criteria:
- Support for 50+ concurrent connections
- Message persistence for critical alerts
- Role-based event filtering operational
- Performance metrics collection active
- Automatic error recovery functional
```

### **Phase 3: Factory Integration & Analytics** (Priority 3 - 1 week)
```bash
# Factory-specific features
- [ ] Integration with factory data sources
- [ ] Real-time analytics and trend detection
- [ ] Automatic alert generation
- [ ] COFEPRIS compliance event tracking
- [ ] Production metrics aggregation

# Success criteria:
- Real-time sensor data integration
- Automatic quality alert generation
- Production efficiency calculations
- COFEPRIS compliance monitoring
- Historical event storage operational
```

## 🔧 DEVELOPMENT DEPENDENCIES & PREREQUISITES

### **Required Backend Components**
```bash
# Dependencies for WebSocket implementation
- Core API endpoints (/api/reactors, /api/stations) ✅ Designed
- Database schema with factory entities ✅ Complete
- Authentication system (NextAuth.js) 🔄 In progress
- Redis for message queuing 🔴 Setup pending
- Time-series database for event storage 🔴 Configuration pending
```

### **Integration Points**
```bash
# Frontend integration points ready
- React WebSocket hooks 🔄 Architecture complete
- Dashboard real-time state management ✅ Designed
- Component subscription patterns ✅ Established
- Error handling and reconnection ✅ Planned

# External system integration planned
- Factory sensor APIs 🔴 Mock implementation ready
- Quality control systems 🔴 COFEPRIS integration planned
- Production management systems 🔴 ERP integration designed
```

---

## 🎉 WEBSOCKET HANDOFF SUMMARY

**WEBSOCKET STATUS**: 🔴 **PENDING - COMPREHENSIVE ARCHITECTURE COMPLETE**

The Ninu.mx Factory WebSocket real-time implementation has achieved:
- **Complete technical architecture** with factory-specific event protocols
- **Security framework** designed with JWT authentication and role-based subscriptions
- **Performance optimization strategy** including connection pooling and message batching
- **Factory integration points** identified for sensor data and quality control systems
- **Monitoring and analytics framework** planned for operational excellence

**CRITICAL PATH DEPENDENCY**: Backend API foundation and database schema implementation

### **Implementation Roadmap (40 hours remaining)**
1. **Core infrastructure** - WebSocket server and authentication (1 week)
2. **Advanced features** - Message queuing and performance optimization (1 week)  
3. **Factory integration** - Real-time data sources and analytics (1 week)
4. **Production testing** - Load testing and monitoring setup (3 days)

**BUSINESS IMPACT**: Real-time factory monitoring enabling 85%+ efficiency targets and instant COFEPRIS compliance alerts

---

**HANDOFF COMPLETION**: 2024-07-18  
**WEBSOCKET PROGRESS**: Architecture complete, implementation pending backend foundation  
**READY FOR**: Server implementation, client integration, factory data source connection
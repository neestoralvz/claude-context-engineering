import WebSocket, { WebSocketServer } from 'ws'
import { ProductionMetrics, ReactorStatus, StationStatus } from '../types'

// WebSocket server para updates en tiempo real del dashboard de producción Ninu.mx
export class NinuFactoryWebSocketServer {
  private wss: WebSocketServer
  private clients: Set<WebSocket> = new Set()
  private metricsInterval: NodeJS.Timeout | null = null
  private port: number

  constructor(port: number = 8080) {
    this.port = port
    this.wss = new WebSocketServer({ port })
    this.setupWebSocketServer()
    this.startMetricsUpdates()
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New factory dashboard client connected')
      this.clients.add(ws)

      // Send initial factory state
      this.sendInitialState(ws)

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message)
          this.handleClientMessage(ws, data)
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error)
        }
      })

      ws.on('close', () => {
        console.log('🔌 Factory dashboard client disconnected')
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error)
        this.clients.delete(ws)
      })
    })

    console.log(`🏭 Ninu.mx Factory WebSocket Server running on port ${this.port}`)
  }

  private sendInitialState(ws: WebSocket) {
    const initialState = {
      type: 'INITIAL_STATE',
      data: {
        factoryStatus: 'operational',
        timestamp: new Date().toISOString(),
        reactors: this.generateReactorStates(),
        stations: this.generateStationStates(),
        metrics: this.generateProductionMetrics()
      }
    }

    ws.send(JSON.stringify(initialState))
  }

  private generateReactorStates(): any[] {
    return [
      {
        id: 'reactor-a',
        name: 'Reactor A - Líquidos',
        status: 'mixing',
        temperature: 75 + Math.random() * 5,
        pressure: 2.3 + Math.random() * 0.2,
        mixingSpeed: 450 + Math.random() * 50,
        efficiency: 85 + Math.random() * 10,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'reactor-b', 
        name: 'Reactor B - Desinfectantes',
        status: 'cooling',
        temperature: 45 + Math.random() * 5,
        pressure: 1.8 + Math.random() * 0.2,
        mixingSpeed: 0,
        efficiency: 72 + Math.random() * 10,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'reactor-c',
        name: 'Reactor C - Especialidades', 
        status: 'idle',
        temperature: 25,
        pressure: 1.0,
        mixingSpeed: 0,
        efficiency: 0,
        lastUpdate: new Date().toISOString()
      }
    ]
  }

  private generateStationStates(): any[] {
    return [
      {
        id: 'station-1',
        name: 'Estación Etiquetado Principal',
        status: 'running',
        efficiency: 94 + Math.random() * 6,
        unitsPerHour: 280 + Math.random() * 20,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'station-2',
        name: 'Estación Llenado',
        status: 'running', 
        efficiency: 87 + Math.random() * 8,
        unitsPerHour: 320 + Math.random() * 30,
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'station-3',
        name: 'Estación Polvos',
        status: 'idle',
        efficiency: 0,
        unitsPerHour: 0,
        lastUpdate: new Date().toISOString()
      }
    ]
  }

  private generateProductionMetrics(): ProductionMetrics {
    return {
      totalProduction: Math.floor(1200 + Math.random() * 200),
      efficiency: 85 + Math.random() * 15,
      qualityRate: 95 + Math.random() * 5,
      downtime: Math.random() * 5,
      activeOrders: Math.floor(5 + Math.random() * 10),
      completedOrders: Math.floor(20 + Math.random() * 10),
      alertsCount: Math.floor(Math.random() * 3),
      timestamp: new Date()
    }
  }

  private handleClientMessage(ws: WebSocket, data: any) {
    switch (data.type) {
      case 'REACTOR_CONTROL':
        this.handleReactorControl(data.payload)
        break
      case 'STATION_CONTROL': 
        this.handleStationControl(data.payload)
        break
      case 'REQUEST_METRICS':
        this.sendMetricsUpdate(ws)
        break
      case 'EMERGENCY_STOP':
        this.handleEmergencyStop(data.payload)
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  private handleReactorControl(payload: any) {
    console.log(`🔧 Reactor control: ${payload.action} on ${payload.reactorId}`)
    
    // Simulate reactor response
    const response = {
      type: 'REACTOR_STATUS_UPDATE',
      data: {
        reactorId: payload.reactorId,
        action: payload.action,
        success: true,
        timestamp: new Date().toISOString()
      }
    }

    this.broadcastToAll(response)
  }

  private handleStationControl(payload: any) {
    console.log(`🏭 Station control: ${payload.action} on ${payload.stationId}`)
    
    const response = {
      type: 'STATION_STATUS_UPDATE', 
      data: {
        stationId: payload.stationId,
        action: payload.action,
        success: true,
        timestamp: new Date().toISOString()
      }
    }

    this.broadcastToAll(response)
  }

  private handleEmergencyStop(payload: any) {
    console.log('🚨 EMERGENCY STOP activated:', payload)
    
    const alert = {
      type: 'EMERGENCY_ALERT',
      data: {
        message: 'Sistema de parada de emergencia activado',
        level: 'critical',
        timestamp: new Date().toISOString(),
        affectedSystems: payload.systems || ['all']
      }
    }

    this.broadcastToAll(alert)
  }

  private startMetricsUpdates() {
    // Send real-time updates every 5 seconds
    this.metricsInterval = setInterval(() => {
      if (this.clients.size > 0) {
        const update = {
          type: 'METRICS_UPDATE',
          data: {
            reactors: this.generateReactorStates(),
            stations: this.generateStationStates(), 
            metrics: this.generateProductionMetrics()
          }
        }

        this.broadcastToAll(update)
      }
    }, 5000)
  }

  private sendMetricsUpdate(ws: WebSocket) {
    const metrics = {
      type: 'METRICS_UPDATE',
      data: {
        reactors: this.generateReactorStates(),
        stations: this.generateStationStates(),
        metrics: this.generateProductionMetrics()
      }
    }

    ws.send(JSON.stringify(metrics))
  }

  private broadcastToAll(data: any) {
    const message = JSON.stringify(data)
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  public close() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
    }
    
    this.wss.close()
    console.log('🏭 Ninu.mx Factory WebSocket Server closed')
  }

  public getActiveClientsCount(): number {
    return this.clients.size
  }

  public getServerStatus() {
    return {
      isRunning: true,
      port: this.port,
      activeClients: this.clients.size,
      uptime: process.uptime()
    }
  }
}

// Factory singleton instance
let factoryServer: NinuFactoryWebSocketServer | null = null

export function createFactoryWebSocketServer(port: number = 8080): NinuFactoryWebSocketServer {
  if (!factoryServer) {
    factoryServer = new NinuFactoryWebSocketServer(port)
  }
  return factoryServer
}

export function getFactoryWebSocketServer(): NinuFactoryWebSocketServer | null {
  return factoryServer
}

// Export types for client usage
export interface ReactorControlMessage {
  type: 'REACTOR_CONTROL'
  payload: {
    reactorId: string
    action: 'start' | 'stop' | 'pause' | 'emergency_stop'
    parameters?: Record<string, any>
  }
}

export interface StationControlMessage {
  type: 'STATION_CONTROL'
  payload: {
    stationId: string 
    action: 'start' | 'stop' | 'pause' | 'maintenance'
    parameters?: Record<string, any>
  }
}

export interface EmergencyStopMessage {
  type: 'EMERGENCY_STOP'
  payload: {
    reason: string
    systems: string[]
    triggeredBy: string
  }
}
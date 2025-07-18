/**
 * Sistema de Logging Centralizado para Ninu.mx Factory Control
 * Proporciona logging comprensivo con niveles, contexto y debugging visual
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  component: string
  message: string
  data?: any
  error?: Error
  context?: Record<string, any>
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  enableVisualDebug: boolean
  maxStorageEntries: number
}

class NinuLogger {
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private visualDebugElement: HTMLElement | null = null

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      enableVisualDebug: false,
      maxStorageEntries: 1000,
      ...config
    }

    // Inicializar storage si está habilitado
    if (this.config.enableStorage) {
      this.loadStoredLogs()
    }

    // Configurar debug visual si está habilitado
    if (this.config.enableVisualDebug) {
      this.setupVisualDebug()
    }

    // Log de inicialización
    this.info('NinuLogger', 'Logger inicializado', { config: this.config })
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level
  }

  private createLogEntry(level: LogLevel, component: string, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date(),
      level,
      component,
      message,
      data,
      error,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
      }
    }
  }

  private formatLogMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const levelName = LogLevel[entry.level]
    const dataStr = entry.data ? ` | Data: ${JSON.stringify(entry.data, null, 2)}` : ''
    const errorStr = entry.error ? ` | Error: ${entry.error.message}\n${entry.error.stack}` : ''
    
    return `[${timestamp}] ${levelName} [${entry.component}] ${entry.message}${dataStr}${errorStr}`
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return

    const message = this.formatLogMessage(entry)
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data, entry.error)
        break
      case LogLevel.INFO:
        console.info(message, entry.data, entry.error)
        break
      case LogLevel.WARN:
        console.warn(message, entry.data, entry.error)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data, entry.error)
        break
    }
  }

  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage) return

    this.logs.push(entry)
    
    // Mantener límite de logs
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs = this.logs.slice(-this.config.maxStorageEntries)
    }

    // Guardar en localStorage si está disponible
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('ninu-factory-logs', JSON.stringify(this.logs.slice(-100))) // Solo últimos 100
      } catch (error) {
        console.warn('Error guardando logs en localStorage:', error)
      }
    }
  }

  private loadStoredLogs(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('ninu-factory-logs')
        if (stored) {
          const logs = JSON.parse(stored)
          this.logs = logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          }))
        }
      } catch (error) {
        console.warn('Error cargando logs desde localStorage:', error)
      }
    }
  }

  private setupVisualDebug(): void {
    if (typeof window === 'undefined') return

    // Crear elemento de debug visual
    this.visualDebugElement = document.createElement('div')
    this.visualDebugElement.id = 'ninu-debug-console'
    this.visualDebugElement.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 400px;
      height: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      padding: 10px;
      border-radius: 5px;
      overflow-y: auto;
      z-index: 10000;
      display: none;
    `

    // Agregar toggle con Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        if (this.visualDebugElement) {
          this.visualDebugElement.style.display = 
            this.visualDebugElement.style.display === 'none' ? 'block' : 'none'
        }
      }
    })

    document.body.appendChild(this.visualDebugElement)
  }

  private updateVisualDebug(entry: LogEntry): void {
    if (!this.visualDebugElement || this.visualDebugElement.style.display === 'none') return

    const logElement = document.createElement('div')
    const levelColors = {
      [LogLevel.DEBUG]: '#888',
      [LogLevel.INFO]: '#00ff00',
      [LogLevel.WARN]: '#ffff00',
      [LogLevel.ERROR]: '#ff0000',
      [LogLevel.CRITICAL]: '#ff0080'
    }

    logElement.style.color = levelColors[entry.level]
    logElement.textContent = `[${entry.timestamp.toLocaleTimeString()}] ${entry.component}: ${entry.message}`
    
    this.visualDebugElement.appendChild(logElement)
    this.visualDebugElement.scrollTop = this.visualDebugElement.scrollHeight

    // Mantener solo los últimos 50 logs visibles
    while (this.visualDebugElement.children.length > 50) {
      this.visualDebugElement.removeChild(this.visualDebugElement.firstChild!)
    }
  }

  private log(level: LogLevel, component: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, component, message, data, error)
    
    this.logToConsole(entry)
    this.storeLog(entry)
    
    if (this.config.enableVisualDebug) {
      this.updateVisualDebug(entry)
    }
  }

  // Métodos públicos de logging
  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data)
  }

  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data)
  }

  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data)
  }

  error(component: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data, error)
  }

  critical(component: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.CRITICAL, component, message, data, error)
  }

  // Métodos de utilidad
  getLogs(filter?: { level?: LogLevel; component?: string; since?: Date }): LogEntry[] {
    let filteredLogs = [...this.logs]

    if (filter) {
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!)
      }
      if (filter.component) {
        filteredLogs = filteredLogs.filter(log => log.component === filter.component)
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!)
      }
    }

    return filteredLogs
  }

  clearLogs(): void {
    this.logs = []
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('ninu-factory-logs')
    }
    this.info('NinuLogger', 'Logs limpiados')
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  getStats(): { total: number; byLevel: Record<string, number>; byComponent: Record<string, number> } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byComponent: {} as Record<string, number>
    }

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level]
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1
      stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1
    })

    return stats
  }

  // Configuración dinámica
  setLevel(level: LogLevel): void {
    this.config.level = level
    this.info('NinuLogger', `Nivel de logging cambiado a ${LogLevel[level]}`)
  }

  enableVisualDebug(): void {
    this.config.enableVisualDebug = true
    if (!this.visualDebugElement) {
      this.setupVisualDebug()
    }
    this.info('NinuLogger', 'Debug visual habilitado. Usa Ctrl+Shift+D para mostrar/ocultar')
  }

  disableVisualDebug(): void {
    this.config.enableVisualDebug = false
    if (this.visualDebugElement) {
      this.visualDebugElement.style.display = 'none'
    }
    this.info('NinuLogger', 'Debug visual deshabilitado')
  }
}

// Instancia global del logger
export const logger = new NinuLogger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableVisualDebug: process.env.NODE_ENV === 'development'
})

// Exportar tipos y utilidades
export { NinuLogger }

// Hook de React para usar el logger
export function useLogger(component: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(component, message, data),
    info: (message: string, data?: any) => logger.info(component, message, data),
    warn: (message: string, data?: any) => logger.warn(component, message, data),
    error: (message: string, error?: Error, data?: any) => logger.error(component, message, error, data),
    critical: (message: string, error?: Error, data?: any) => logger.critical(component, message, error, data)
  }
}

// Función para logging global sin componente específico
export function log(level: 'debug' | 'info' | 'warn' | 'error' | 'critical', message: string, data?: any, error?: Error) {
  const component = 'Global'
  switch (level) {
    case 'debug':
      logger.debug(component, message, data)
      break
    case 'info':
      logger.info(component, message, data)
      break
    case 'warn':
      logger.warn(component, message, data)
      break
    case 'error':
      logger.error(component, message, error, data)
      break
    case 'critical':
      logger.critical(component, message, error, data)
      break
  }
}
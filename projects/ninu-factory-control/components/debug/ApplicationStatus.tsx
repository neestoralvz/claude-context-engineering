'use client'

import React, { useState, useEffect } from 'react'
import { useLogger } from '../../lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Battery
} from 'lucide-react'

interface AppStatus {
  isOnline: boolean
  loadTime: number
  memoryUsage?: number
  lastActivity: Date
  componentsLoaded: string[]
  errors: number
  warnings: number
}

export function ApplicationStatus() {
  const logger = useLogger('ApplicationStatus')
  const [status, setStatus] = useState<AppStatus>({
    isOnline: navigator.onLine,
    loadTime: performance.now(),
    lastActivity: new Date(),
    componentsLoaded: [],
    errors: 0,
    warnings: 0
  })

  useEffect(() => {
    logger.info('ApplicationStatus component mounted')
    
    // Monitor estado online/offline
    const handleOnline = () => {
      logger.info('Aplicación ahora online')
      setStatus(prev => ({ ...prev, isOnline: true }))
    }
    
    const handleOffline = () => {
      logger.warn('Aplicación ahora offline')
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    // Monitor actividad del usuario
    const handleActivity = () => {
      setStatus(prev => ({ ...prev, lastActivity: new Date() }))
    }

    // Agregar event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('click', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity)

    // Monitor performance
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          logger.debug('Performance navigation', {
            type: entry.name,
            duration: entry.duration,
            loadEventEnd: (entry as PerformanceNavigationTiming).loadEventEnd
          })
        }
      })
    })

    if ('observe' in performanceObserver) {
      performanceObserver.observe({ entryTypes: ['navigation', 'resource'] })
    }

    // Monitor memory usage si está disponible
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory
        const memoryUsage = Math.round((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100)
        setStatus(prev => ({ ...prev, memoryUsage }))
        
        if (memoryUsage > 80) {
          logger.warn('Uso de memoria alto', { memoryUsage })
        }
      }
    }

    const memoryInterval = setInterval(updateMemoryUsage, 10000) // Cada 10 segundos

    // Registrar componentes cargados
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              const componentName = element.getAttribute('data-component')
              if (componentName) {
                logger.debug('Componente cargado', { componentName })
                setStatus(prev => {
                  const newComponents = prev.componentsLoaded.includes(componentName) 
                    ? prev.componentsLoaded 
                    : [...prev.componentsLoaded, componentName]
                  return {
                    ...prev,
                    componentsLoaded: newComponents
                  }
                })
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      performanceObserver.disconnect()
      clearInterval(memoryInterval)
      observer.disconnect()
      logger.debug('ApplicationStatus cleanup completed')
    }
  }, [logger])

  const getUptimeString = () => {
    const uptime = Date.now() - status.loadTime
    const minutes = Math.floor(uptime / 60000)
    const seconds = Math.floor((uptime % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getLastActivityString = () => {
    const diff = Date.now() - status.lastActivity.getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  const getConnectionIcon = () => {
    if (!status.isOnline) return <Wifi className="h-4 w-4 text-red-500" />
    return <Wifi className="h-4 w-4 text-green-500" />
  }

  const getMemoryStatus = () => {
    if (!status.memoryUsage) return { color: 'text-gray-500', label: 'N/A' }
    if (status.memoryUsage < 50) return { color: 'text-green-500', label: 'Bueno' }
    if (status.memoryUsage < 80) return { color: 'text-yellow-500', label: 'Moderado' }
    return { color: 'text-red-500', label: 'Alto' }
  }

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          Estado de la Aplicación
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Estado de conexión */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span>Conexión</span>
          </div>
          <span className={status.isOnline ? 'text-green-600' : 'text-red-600'}>
            {status.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Tiempo activo</span>
          </div>
          <span className="text-gray-600">{getUptimeString()}</span>
        </div>

        {/* Última actividad */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <span>Última actividad</span>
          </div>
          <span className="text-gray-600">{getLastActivityString()}</span>
        </div>

        {/* Uso de memoria */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-orange-500" />
            <span>Memoria</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={getMemoryStatus().color}>
              {status.memoryUsage ? `${status.memoryUsage}%` : 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              ({getMemoryStatus().label})
            </span>
          </div>
        </div>

        {/* Componentes cargados */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-green-500" />
            <span>Componentes</span>
          </div>
          <span className="text-gray-600">{status.componentsLoaded.length}</span>
        </div>

        {/* Lista de componentes (colapsable) */}
        {status.componentsLoaded.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Ver componentes cargados
            </summary>
            <div className="mt-2 pl-4 space-y-1">
              {status.componentsLoaded.map((component, index) => (
                <div key={index} className="text-gray-600">
                  • {component}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Estado general */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">Sistema Operativo</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Todas las funciones principales están disponibles
          </div>
        </div>

        {/* Información de desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
            <div>Modo: Desarrollo</div>
            <div>Build: {process.env.NEXT_PUBLIC_BUILD_TIME || 'dev'}</div>
            <div>Version: {process.env.NEXT_PUBLIC_VERSION || '1.0.0-dev'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { logger, LogLevel } from '../../lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Terminal,
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react'

export function LoggingStatus() {
  const [stats, setStats] = useState(logger.getStats())
  const [isVisible, setIsVisible] = useState(false)
  const [recentLogs, setRecentLogs] = useState(logger.getLogs({ since: new Date(Date.now() - 60000) }))

  // Actualizar estadísticas cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(logger.getStats())
      setRecentLogs(logger.getLogs({ since: new Date(Date.now() - 60000) }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Toggle con Ctrl+Shift+L
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isVisible])

  const handleExportLogs = () => {
    const logs = logger.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ninu-factory-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearLogs = () => {
    logger.clearLogs()
    setStats(logger.getStats())
    setRecentLogs([])
  }

  const enableVisualDebug = () => {
    logger.enableVisualDebug()
  }

  const disableVisualDebug = () => {
    logger.disableVisualDebug()
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'debug': return 'text-gray-500'
      case 'info': return 'text-blue-600'
      case 'warn': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      case 'critical': return 'text-red-800'
      default: return 'text-gray-600'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'debug': return <Terminal className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
      case 'warn': return <AlertCircle className="h-4 w-4" />
      case 'error': 
      case 'critical': return <AlertCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-green-400" />
            <span>Logging activo • Ctrl+Shift+L para mostrar</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Sistema de Logging
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-2xl font-bold text-green-400">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Logs</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-2xl font-bold text-blue-400">{recentLogs.length}</div>
              <div className="text-xs text-gray-400">Último minuto</div>
            </div>
          </div>

          {/* Logs por nivel */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300">Por Nivel:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(stats.byLevel).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className={`flex items-center gap-1 ${getLevelColor(level)}`}>
                    {getLevelIcon(level)}
                    <span>{level}</span>
                  </div>
                  <span className="text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logs por componente */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300">Por Componente:</div>
            <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
              {Object.entries(stats.byComponent).map(([component, count]) => (
                <div key={component} className="flex items-center justify-between">
                  <span className="text-gray-300 truncate">{component}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logs recientes */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300">Logs Recientes:</div>
            <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
              {recentLogs.slice(-5).reverse().map((log, index) => (
                <div key={index} className="border-l-2 border-gray-600 pl-2">
                  <div className={`flex items-center gap-1 ${getLevelColor(LogLevel[log.level])}`}>
                    {getLevelIcon(LogLevel[log.level])}
                    <span className="font-mono">{log.component}</span>
                  </div>
                  <div className="text-gray-400 truncate">{log.message}</div>
                  <div className="text-gray-500 text-xs">
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button
              onClick={enableVisualDebug}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              <Eye className="h-3 w-3" />
              Console
            </button>
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-700">
            Ctrl+Shift+D para console • Ctrl+Shift+L para panel
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
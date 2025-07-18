import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLogger } from '../../lib/logger'
import { ProductionMetrics, MetricsOverviewProps } from '../../types'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { formatNumber, formatDate } from '../../lib/utils'
import { 
  TrendingUp, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Activity,
  RefreshCw,
  BarChart3,
  Settings,
  Eye,
  ChevronRight,
  Loader2,
  Brain,
  ExternalLink
} from 'lucide-react'

export function MetricsOverview({ 
  metrics, 
  config = {}, 
  onRefresh,
  loading = false 
}: MetricsOverviewProps) {
  const logger = useLogger('MetricsOverview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(metrics.timestamp)
  const [showTrends, setShowTrends] = useState(config.showTrends || false)
  const [showResourceUtilization, setShowResourceUtilization] = useState(config.showResourceUtilization || false)

  // Auto-refresh functionality
  useEffect(() => {
    if (!config.autoRefresh || !onRefresh) {
      logger.debug('Auto-refresh deshabilitado', { autoRefresh: config.autoRefresh, hasOnRefresh: !!onRefresh })
      return
    }

    const refreshInterval = config.refreshInterval || 30000
    logger.info('Auto-refresh configurado', { interval: refreshInterval })

    const interval = setInterval(() => {
      logger.debug('Ejecutando auto-refresh')
      onRefresh()
    }, refreshInterval)

    return () => {
      logger.debug('Limpiando auto-refresh interval')
      clearInterval(interval)
    }
  }, [config.autoRefresh, config.refreshInterval, onRefresh, logger])

  // Update last update timestamp when metrics change
  useEffect(() => {
    logger.debug('Actualizando timestamp de métricas', { 
      oldTimestamp: lastUpdate, 
      newTimestamp: metrics.timestamp 
    })
    setLastUpdate(metrics.timestamp)
  }, [metrics.timestamp, lastUpdate, logger])

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) {
      logger.warn('Refresh no disponible', { hasOnRefresh: !!onRefresh, isRefreshing })
      return
    }
    
    logger.info('Iniciando refresh manual de métricas')
    setIsRefreshing(true)
    try {
      await onRefresh()
      logger.info('Refresh manual completado exitosamente')
    } catch (error) {
      logger.error('Error en refresh manual', error as Error)
    } finally {
      setIsRefreshing(false)
      logger.debug('Estado de refreshing restablecido')
    }
  }, [onRefresh, isRefreshing, logger])

  // Metric click handler for drill-down
  const handleMetricClick = useCallback((metricType: string) => {
    logger.info('Click en métrica para drill-down', { metricType })
    config.onMetricClick?.(metricType)
  }, [config, logger])

  // Memoized metric cards for performance
  const metricCards = useMemo(() => [
    {
      id: 'production',
      title: 'Producción Total',
      value: formatNumber(metrics.totalProduction),
      unit: 'unidades',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: metrics.trends?.production
    },
    {
      id: 'efficiency',
      title: 'Eficiencia General',
      value: `${metrics.efficiency}%`,
      unit: '',
      icon: TrendingUp,
      color: metrics.efficiency >= 85 ? 'text-green-600' : metrics.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.efficiency >= 85 ? 'bg-green-100' : metrics.efficiency >= 70 ? 'bg-yellow-100' : 'bg-red-100',
      trend: metrics.trends?.efficiency
    },
    {
      id: 'quality',
      title: 'Calidad',
      value: `${metrics.qualityRate}%`,
      unit: '',
      icon: CheckCircle,
      color: metrics.qualityRate >= 95 ? 'text-green-600' : metrics.qualityRate >= 90 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.qualityRate >= 95 ? 'bg-green-100' : metrics.qualityRate >= 90 ? 'bg-yellow-100' : 'bg-red-100',
      trend: metrics.trends?.quality
    },
    {
      id: 'downtime',
      title: 'Tiempo Inactivo',
      value: `${metrics.downtime}%`,
      unit: '',
      icon: Clock,
      color: metrics.downtime <= 5 ? 'text-green-600' : metrics.downtime <= 10 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.downtime <= 5 ? 'bg-green-100' : metrics.downtime <= 10 ? 'bg-yellow-100' : 'bg-red-100',
      trend: metrics.trends?.downtime
    },
    {
      id: 'orders',
      title: 'Órdenes Activas',
      value: formatNumber(metrics.activeOrders),
      unit: '',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'alerts',
      title: 'Alertas Activas',
      value: formatNumber(metrics.alertsCount),
      unit: '',
      icon: AlertCircle,
      color: metrics.alertsCount === 0 ? 'text-green-600' : metrics.alertsCount <= 3 ? 'text-yellow-600' : 'text-red-600',
      bgColor: metrics.alertsCount === 0 ? 'bg-green-100' : metrics.alertsCount <= 3 ? 'bg-yellow-100' : 'bg-red-100'
    }
  ], [metrics])

  // Calculate trend direction for display
  const getTrendDirection = (trendData: any[]) => {
    if (!trendData || trendData.length < 2) return null
    const latest = trendData[trendData.length - 1].value
    const previous = trendData[trendData.length - 2].value
    return latest > previous ? 'up' : latest < previous ? 'down' : 'stable'
  }

  return (
    <div className="space-y-6">
      {/* Factory Hero Image */}
      <div className="mb-6 relative h-40 rounded-xl overflow-hidden shadow-lg">
        <Image 
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&crop=center"
          alt="Factory Production Floor - Manufacturing equipment and machinery in operation at Ninu.mx facility"
          fill
          className="object-cover"
          priority
          quality={80}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Ninu.mx Factory Control</h2>
            <p className="text-lg opacity-90">Monitor de Producción en Tiempo Real</p>
          </div>
        </div>
      </div>

      {/* Header with refresh and controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas de Producción</h2>
          <div className="text-sm text-gray-500 mt-1">
            Actualizado: {formatDate(lastUpdate)}
            {config.autoRefresh && (
              <span className="ml-2 inline-flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Auto-refresh activo
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Controls */}
          <button
            onClick={() => setShowTrends(!showTrends)}
            className={`p-2 rounded-lg transition-colors ${
              showTrends ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Mostrar tendencias"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setShowResourceUtilization(!showResourceUtilization)}
            className={`p-2 rounded-lg transition-colors ${
              showResourceUtilization ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Mostrar utilización de recursos"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Manual refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Actualizar métricas"
          >
            {isRefreshing || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>

          {/* Advanced Inventory Link */}
          <Link
            href="/inventarios"
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Sistema de Inventario Avanzado"
          >
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">Inventario Avanzado</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((metric) => {
          const IconComponent = metric.icon
          const trendDirection = metric.trend ? getTrendDirection(metric.trend) : null
          
          return (
            <Card 
              key={metric.title} 
              className={`hover:shadow-md transition-all cursor-pointer group ${
                loading ? 'opacity-60' : ''
              }`}
              onClick={() => handleMetricClick(metric.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${metric.bgColor} transition-all group-hover:scale-110`}>
                    <IconComponent className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  
                  {/* Trend indicator */}
                  {showTrends && trendDirection && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      trendDirection === 'up' ? 'bg-green-100 text-green-600' :
                      trendDirection === 'down' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                    {metric.unit && <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">{metric.title}</div>
                    {config.onMetricClick && (
                      <ChevronRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resource Utilization Matrix */}
      {showResourceUtilization && metrics.resourceUtilization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-900">
              <BarChart3 className="h-5 w-5 mr-2" />
              Utilización de Recursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reactors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Reactores</h4>
                <div className="space-y-2">
                  {Object.entries(metrics.resourceUtilization.reactors).map(([id, data]) => (
                    <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          data.status === 'idle' ? 'bg-gray-400' :
                          data.status === 'mixing' ? 'bg-blue-500' :
                          data.status === 'cooling' ? 'bg-cyan-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-medium">{id.replace('reactor-', 'Reactor ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{data.utilization}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${data.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stations */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Estaciones</h4>
                <div className="space-y-2">
                  {Object.entries(metrics.resourceUtilization.stations).map(([id, data]) => (
                    <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          data.status === 'idle' ? 'bg-gray-400' :
                          data.status === 'running' ? 'bg-green-500' :
                          data.status === 'maintenance' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium">{id.replace('station-', 'Estación ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{data.utilization}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${data.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall utilization */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Utilización General de Planta</h4>
                  <p className="text-sm text-gray-600">Promedio de todos los recursos activos</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.resourceUtilization.overall.utilization}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Eficiencia: {metrics.resourceUtilization.overall.efficiency}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Resumen del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Órdenes Completadas:</span>
              <span className="ml-2 font-semibold text-green-600">{metrics.completedOrders}</span>
            </div>
            <div>
              <span className="text-gray-600">Promedio de Calidad:</span>
              <span className="ml-2 font-semibold text-blue-600">{metrics.qualityRate}%</span>
            </div>
            <div>
              <span className="text-gray-600">Eficiencia Objetivo:</span>
              <span className="ml-2 font-semibold text-purple-600">85%</span>
            </div>
            <div>
              <span className="text-gray-600">Estado General:</span>
              <span className={`ml-2 font-semibold ${
                metrics.efficiency >= 85 && metrics.qualityRate >= 95 && metrics.downtime <= 5
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                {metrics.efficiency >= 85 && metrics.qualityRate >= 95 && metrics.downtime <= 5
                  ? 'Excelente'
                  : 'Bueno'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { ReactorGrid } from '../../components/reactors/ReactorGrid'
import { StationGrid } from '../../components/stations/StationGrid'
import { MetricsOverview } from '../../components/dashboard/MetricsOverview'
import { ProductionInputForm } from '../../components/production/ProductionInputForm'
import { ProductionChart } from '../../components/charts/ProductionChart'
import { mockReactors, mockStations, mockProducts, ninuContactInfo } from '../../lib/mock-data'
import { Reactor, ProductionStation, ProductionMetrics, ProductionOrder } from '../../types'
import { useLogger } from '../../lib/logger'
import { 
  Factory, 
  Activity, 
  BarChart3, 
  ClipboardList, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  Users,
  Calendar
} from 'lucide-react'

type ProductionView = 'overview' | 'reactors' | 'stations' | 'orders' | 'analytics'

export default function ProduccionPage() {
  const logger = useLogger('ProductionModule')
  const [activeView, setActiveView] = useState<ProductionView>('overview')
  const [isRealTimeActive, setIsRealTimeActive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [reactors, setReactors] = useState<Reactor[]>(mockReactors)
  const [stations, setStations] = useState<ProductionStation[]>(mockStations)
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)

  // Simular métricas de producción en tiempo real
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    totalProduction: 2847,
    efficiency: 87.3,
    qualityRate: 96.8,
    downtime: 3.2,
    activeOrders: 12,
    completedOrders: 156,
    alertsCount: 2,
    timestamp: new Date()
  })

  // Mock real-time updates
  useEffect(() => {
    if (!isRealTimeActive) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
      
      // Simular variaciones en métricas
      setMetrics(prev => ({
        ...prev,
        totalProduction: prev.totalProduction + Math.floor(Math.random() * 5),
        efficiency: Math.max(80, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 2)),
        qualityRate: Math.max(90, Math.min(100, prev.qualityRate + (Math.random() - 0.5) * 1)),
        downtime: Math.max(0, Math.min(10, prev.downtime + (Math.random() - 0.5) * 0.5)),
        timestamp: new Date()
      }))

      logger.debug('Actualización tiempo real - producción', { timestamp: new Date() })
    }, 5000)

    return () => clearInterval(interval)
  }, [isRealTimeActive, logger])

  const handleNewProductionOrder = (order: any) => {
    const newOrder: ProductionOrder = {
      productId: order.productId,
      quantity: order.quantity,
      priority: order.priority,
      requestedDate: new Date(),
      customer: order.customer,
      specialInstructions: order.specialInstructions,
      id: `order-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    setProductionOrders(prev => [...prev, newOrder])
    setShowOrderForm(false)
    
    logger.info('Nueva orden de producción creada', { 
      orderId: newOrder.id, 
      productId: newOrder.productId,
      quantity: newOrder.quantity 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
      case 'mixing':
      case 'heating':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
      case 'idle':
        return <Badge variant="status" className="bg-gray-100 text-gray-800">Inactivo</Badge>
      case 'maintenance':
        return <Badge variant="destructive">Mantenimiento</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const productionViews = [
    { id: 'overview', label: 'Resumen General', icon: BarChart3 },
    { id: 'reactors', label: 'Reactores', icon: Factory },
    { id: 'stations', label: 'Estaciones', icon: Settings },
    { id: 'orders', label: 'Órdenes', icon: ClipboardList },
    { id: 'analytics', label: 'Análisis', icon: TrendingUp }
  ]

  const criticalAlerts = [
    { id: 1, type: 'warning', message: 'Reactor B - Temperatura alta (78°C)', time: '14:32' },
    { id: 2, type: 'info', message: 'Estación de Llenado - Mantenimiento programado mañana', time: '13:45' }
  ]

  const quickStats = {
    reactorsActive: reactors.filter(r => r.status === 'mixing' || r.status === 'heating').length,
    stationsRunning: stations.filter(s => s.status === 'running').length,
    ordersToday: productionOrders.filter(o => 
      o.createdAt && new Date(o.createdAt).toDateString() === new Date().toDateString()
    ).length,
    averageEfficiency: Math.round(stations.reduce((sum, s) => sum + s.efficiency, 0) / stations.length)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-ninu text-white rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Factory className="h-8 w-8 mr-3" />
              Control de Producción Ninu.mx
            </h1>
            <p className="text-blue-100 mb-4">
              Sistema integral de control y monitoreo de fábrica • {ninuContactInfo.slogan}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                {isRealTimeActive ? 'Tiempo real activo' : 'Tiempo real pausado'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {isRealTimeActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRealTimeActive ? 'Pausar' : 'Activar'} Tiempo Real
            </Button>
            <Button 
              onClick={() => setShowOrderForm(true)}
              className="bg-white text-ninu-primary hover:bg-gray-100"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reactores Activos</p>
              <p className="text-2xl font-bold text-green-600">{quickStats.reactorsActive}/3</p>
            </div>
            <Factory className="h-6 w-6 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estaciones en Línea</p>
              <p className="text-2xl font-bold text-blue-600">{quickStats.stationsRunning}/5</p>
            </div>
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Órdenes Hoy</p>
              <p className="text-2xl font-bold text-purple-600">{quickStats.ordersToday}</p>
            </div>
            <Package className="h-6 w-6 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eficiencia Promedio</p>
              <p className="text-2xl font-bold text-ninu-primary">{quickStats.averageEfficiency}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-ninu-primary" />
          </div>
        </Card>
      </div>

      {/* Alertas Críticas */}
      {criticalAlerts.length > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-medium text-yellow-800">Alertas del Sistema</h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="text-yellow-700">{alert.message}</span>
                <span className="text-yellow-600">{alert.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation Tabs */}
      <Card className="p-1">
        <div className="flex overflow-x-auto">
          {productionViews.map(view => {
            const Icon = view.icon
            return (
              <Button
                key={view.id}
                onClick={() => setActiveView(view.id as ProductionView)}
                variant={activeView === view.id ? "default" : "outline"}
                className={`min-w-fit mx-1 ${
                  activeView === view.id 
                    ? 'bg-ninu-primary text-white' 
                    : 'text-gray-600 hover:text-ninu-primary'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {view.label}
              </Button>
            )
          })}
        </div>
      </Card>

      {/* Content Area */}
      <div className="space-y-6">
        {activeView === 'overview' && (
          <div className="space-y-6">
            <MetricsOverview 
              metrics={metrics}
              config={{ autoRefresh: isRealTimeActive, refreshInterval: 5000 }}
              onRefresh={() => setLastUpdate(new Date())}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Reactores</h3>
                <div className="space-y-3">
                  {reactors.map(reactor => (
                    <div key={reactor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{reactor.name}</div>
                        <div className="text-sm text-gray-600">{reactor.capacity}L • {reactor.temperature}°C</div>
                      </div>
                      {getStatusBadge(reactor.status)}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estaciones de Producción</h3>
                <div className="space-y-3">
                  {stations.map(station => (
                    <div key={station.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{station.name}</div>
                        <div className="text-sm text-gray-600">Eficiencia: {station.efficiency}%</div>
                      </div>
                      {getStatusBadge(station.status)}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'reactors' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Control de Reactores</h2>
              <p className="text-gray-600 mb-6">
                Monitoreo y control en tiempo real de los 3 reactores de producción Ninu.mx
              </p>
              <ReactorGrid reactors={reactors} />
            </Card>
          </div>
        )}

        {activeView === 'stations' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estaciones de Producción</h2>
              <p className="text-gray-600 mb-6">
                Control de las 5 estaciones especializadas de la línea de producción
              </p>
              <StationGrid stations={stations} />
            </Card>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Órdenes de Producción</h2>
                  <p className="text-gray-600">Gestión completa del flujo de órdenes</p>
                </div>
                <Button onClick={() => setShowOrderForm(true)}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              </div>
              
              {productionOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de producción</h3>
                  <p className="text-gray-600 mb-4">Comienza creando tu primera orden de producción</p>
                  <Button onClick={() => setShowOrderForm(true)}>
                    Crear Primera Orden
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {productionOrders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Producto ID: {order.productId}</div>
                          <div className="text-sm text-gray-600">
                            Cantidad: {order.quantity} • Prioridad: {order.priority}
                          </div>
                        </div>
                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Análisis de Producción</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductionChart
                  data={[
                    { name: 'Lun', value: 85, efficiency: 85, quality: 94, production: 120, target: 100 },
                    { name: 'Mar', value: 88, efficiency: 88, quality: 96, production: 145, target: 100 },
                    { name: 'Mié', value: 92, efficiency: 92, quality: 98, production: 180, target: 100 },
                    { name: 'Jue', value: 89, efficiency: 89, quality: 95, production: 165, target: 100 },
                    { name: 'Vie', value: 94, efficiency: 94, quality: 97, production: 195, target: 100 },
                    { name: 'Sáb', value: 87, efficiency: 87, quality: 96, production: 150, target: 100 },
                    { name: 'Dom', value: 91, efficiency: 91, quality: 98, production: 175, target: 100 }
                  ]}
                  type="line"
                  title="Tendencia Semanal de Eficiencia"
                  valueKey="efficiency"
                  height={300}
                />

                <ProductionChart
                  data={[
                    { name: 'Multiusos', value: 450, fill: '#3b82f6' },
                    { name: 'Sanitizante', value: 320, fill: '#ef4444' },
                    { name: 'Jabón', value: 180, fill: '#10b981' },
                    { name: 'Detergente', value: 290, fill: '#f59e0b' },
                    { name: 'Kit Alberca', value: 120, fill: '#8b5cf6' }
                  ]}
                  type="pie"
                  title="Distribución de Productos"
                  height={300}
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Semanales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">89.3%</div>
                    <div className="text-sm text-blue-700">Eficiencia Promedio</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">96.2%</div>
                    <div className="text-sm text-green-700">Tasa de Calidad</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,360</div>
                    <div className="text-sm text-purple-700">Unidades Producidas</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal para Nueva Orden */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ninu-primary">Nueva Orden de Producción</h2>
                <Button
                  onClick={() => setShowOrderForm(false)}
                  variant="outline"
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>
              
              <ProductionInputForm
                onSubmit={handleNewProductionOrder}
                onCancel={() => setShowOrderForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
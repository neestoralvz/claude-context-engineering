import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { ProductionChart, ProductionCharts, ChartData } from '../charts/ProductionChart'
import { ProductionInputForm } from '../production/ProductionInputForm'
import { ProductionOrder } from '../../types'
import { ReactorCard } from '../reactors/ReactorCard'
import { StationCard } from '../stations/StationCard'
import { MetricsOverview } from './MetricsOverview'
import { 
  Plus, 
  BarChart3, 
  Activity, 
  Settings, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause
} from 'lucide-react'
import { useLogger } from '../../lib/logger'
import { productionOrderStorage, dashboardConfigStorage } from '../../lib/storage'

// Mock data for interactive demo
const generateMockTrendData = (): ChartData[] => [
  { name: '00:00', value: 85, efficiency: 85, quality: 94, production: 120, target: 100 },
  { name: '04:00', value: 88, efficiency: 88, quality: 96, production: 145, target: 100 },
  { name: '08:00', value: 92, efficiency: 92, quality: 98, production: 180, target: 100 },
  { name: '12:00', value: 89, efficiency: 89, quality: 95, production: 165, target: 100 },
  { name: '16:00', value: 94, efficiency: 94, quality: 97, production: 195, target: 100 },
  { name: '20:00', value: 91, efficiency: 91, quality: 96, production: 175, target: 100 }
]

const generateTrendData = () => [
  { value: 85, timestamp: new Date() },
  { value: 88, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  { value: 92, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
  { value: 89, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
  { value: 94, timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000) },
  { value: 91, timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000) }
]

const generateProductionData = (): ChartData[] => [
  { name: 'Multiusos 1L', value: 450, fill: '#3b82f6' },
  { name: 'Sanitizante 1L', value: 320, fill: '#10b981' },
  { name: 'Detergente 2kg', value: 180, fill: '#f59e0b' },
  { name: 'Jabón 500ml', value: 275, fill: '#ef4444' },
  { name: 'Kit Alberca', value: 95, fill: '#8b5cf6' }
]

export function InteractiveDashboard() {
  const logger = useLogger('InteractiveDashboard')
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'input'>('overview')
  const [showProductionForm, setShowProductionForm] = useState(false)
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([])
  const [isRealTimeActive, setIsRealTimeActive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Load persisted data on mount
  useEffect(() => {
    const savedOrders = productionOrderStorage.get()
    const dashboardConfig = dashboardConfigStorage.get()
    
    setProductionOrders(savedOrders)
    setIsRealTimeActive(dashboardConfig.autoRefresh)
    
    logger.info('Loaded persisted data', { 
      ordersCount: savedOrders.length,
      autoRefresh: dashboardConfig.autoRefresh 
    })
  }, [logger])

  // Mock real-time updates
  useEffect(() => {
    if (!isRealTimeActive) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
      logger.debug('Real-time update triggered')
    }, 5000)

    return () => clearInterval(interval)
  }, [isRealTimeActive, logger])

  const handleNewProductionOrder = (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: ProductionOrder = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    setProductionOrders(prev => {
      const updated = [...prev, newOrder]
      productionOrderStorage.set(updated) // Persist to localStorage
      return updated
    })
    setShowProductionForm(false)
    
    logger.info('Nueva orden de producción creada y guardada', { 
      orderId: newOrder.id, 
      productId: newOrder.productId,
      quantity: newOrder.quantity 
    })
  }

  const handleReactorControl = (reactorId: string, action: string, value?: number) => {
    logger.info('Control de reactor', { reactorId, action, value })
    // Aquí se integraría con la API real
  }

  const handleStationControl = (stationId: string, action: string, value?: any) => {
    logger.info('Control de estación', { stationId, action, value })
    // Aquí se integraría con la API real
  }

  const mockMetrics = {
    totalProduction: 1320,
    efficiency: 91.5,
    qualityRate: 96.2,
    downtime: 3.8,
    activeOrders: 8,
    completedOrders: 24,
    alertsCount: 2,
    timestamp: lastUpdate,
    trends: {
      production: generateTrendData(),
      efficiency: generateTrendData(),
      quality: generateTrendData(),
      downtime: generateTrendData()
    },
    resourceUtilization: {
      reactors: {
        'reactor-a': { utilization: 85, status: 'mixing' as const, efficiency: 88 },
        'reactor-b': { utilization: 72, status: 'cooling' as const, efficiency: 85 },
        'reactor-c': { utilization: 0, status: 'idle' as const, efficiency: 0 }
      },
      stations: {
        'station-1': { utilization: 94, status: 'running' as const, efficiency: 92 },
        'station-2': { utilization: 87, status: 'running' as const, efficiency: 89 },
        'station-3': { utilization: 0, status: 'idle' as const, efficiency: 0 }
      },
      overall: {
        capacity: 5000,
        utilization: 78.5,
        efficiency: 91.5
      }
    }
  }

  const mockReactors = [
    {
      id: 'reactor-a',
      name: 'Reactor A - Líquidos',
      capacity: 5000,
      status: 'mixing' as const,
      temperature: 75,
      pressure: 2.3,
      mixingSpeed: 450,
      currentBatch: {
        id: 'batch-001',
        productId: 'multiusos-1l',
        quantity: 4200,
        status: 'in_progress' as const,
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000),
        recipe: {
          id: 'recipe-001',
          productId: 'multiusos-1l',
          name: 'Multiusos 1L Recipe',
          ingredients: [],
          steps: [],
          duration: 180,
          temperature: 75,
          mixingSpeed: 450,
          qualityStandards: []
        },
        qualityMetrics: []
      },
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'reactor-b',
      name: 'Reactor B - Desinfectantes',
      capacity: 3000,
      status: 'cooling' as const,
      temperature: 45,
      pressure: 1.8,
      mixingSpeed: 0,
      currentBatch: {
        id: 'batch-002',
        productId: 'sanitizante-1l',
        quantity: 2800,
        status: 'in_progress' as const,
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000),
        recipe: {
          id: 'recipe-002',
          productId: 'sanitizante-1l',
          name: 'Sanitizante 1L Recipe',
          ingredients: [],
          steps: [],
          duration: 90,
          temperature: 45,
          mixingSpeed: 300,
          qualityStandards: []
        },
        qualityMetrics: []
      },
      lastMaintenance: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'reactor-c',
      name: 'Reactor C - Especialidades',
      capacity: 2000,
      status: 'idle' as const,
      temperature: 25,
      pressure: 1.0,
      mixingSpeed: 0,
      currentBatch: undefined,
      lastMaintenance: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
    }
  ]

  const mockStations = [
    {
      id: 'station-1',
      name: 'Estación Etiquetado Principal',
      type: 'labeling' as const,
      status: 'running' as const,
      efficiency: 94,
      unitsPerHour: 280,
      currentProduct: undefined,
      queue: [{ id: 'job-1', batchId: 'batch-001', priority: 'medium' as const, estimatedDuration: 60, scheduledStart: new Date() }],
      lastActivity: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 'station-2',
      name: 'Estación Llenado',
      type: 'filling' as const,
      status: 'running' as const,
      efficiency: 87,
      unitsPerHour: 320,
      currentProduct: undefined,
      queue: [],
      lastActivity: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 'station-3',
      name: 'Estación Polvos',
      type: 'powder' as const,
      status: 'idle' as const,
      efficiency: 0,
      unitsPerHour: 0,
      currentProduct: undefined,
      queue: [
        { id: 'job-2', batchId: 'batch-003', priority: 'low' as const, estimatedDuration: 90, scheduledStart: new Date(Date.now() + 30 * 60 * 1000) },
        { id: 'job-3', batchId: 'batch-004', priority: 'low' as const, estimatedDuration: 90, scheduledStart: new Date(Date.now() + 120 * 60 * 1000) }
      ],
      lastActivity: new Date(Date.now() - 45 * 60 * 1000)
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Control de Producción Ninu.mx</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isRealTimeActive ? 'En vivo' : 'Pausado'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant={isRealTimeActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              >
                {isRealTimeActive ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {isRealTimeActive ? 'Pausar' : 'Reanudar'}
              </Button>
              
              <Button
                variant="default"
                onClick={() => setShowProductionForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen General', icon: BarChart3 },
              { id: 'production', name: 'Control de Producción', icon: Activity },
              { id: 'input', name: 'Entrada de Datos', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Overview */}
            <MetricsOverview
              metrics={mockMetrics}
              config={{
                autoRefresh: isRealTimeActive,
                refreshInterval: 5000,
                showTrends: true,
                showResourceUtilization: true,
                onMetricClick: (metricType) => logger.info('Metric clicked', { metricType })
              }}
              onRefresh={() => setLastUpdate(new Date())}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductionCharts.EfficiencyTrend data={generateMockTrendData()} />
              <ProductionCharts.ProductionVolume data={generateProductionData()} />
              <ProductionCharts.QualityMetrics data={generateMockTrendData()} />
              <ProductionCharts.ResourceUtilization data={generateProductionData()} />
            </div>

            {/* Recent Orders */}
            {productionOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Órdenes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {productionOrders.slice(-5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            order.priority === 'urgent' ? 'bg-red-500' :
                            order.priority === 'high' ? 'bg-orange-500' :
                            order.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <div className="font-medium">Producto ID: {order.productId}</div>
                            <div className="text-sm text-gray-600">{order.quantity} unidades</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{order.priority.toUpperCase()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.requestedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'production' && (
          <div className="space-y-8">
            {/* Reactors */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reactores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockReactors.map((reactor) => (
                  <ReactorCard
                    key={reactor.id}
                    reactor={reactor}
                    onStart={(id) => handleReactorControl(id, 'start')}
                    onStop={(id) => handleReactorControl(id, 'stop')}
                    onPause={(id) => handleReactorControl(id, 'pause')}
                    onEmergencyStop={(id) => handleReactorControl(id, 'emergency_stop')}
                    onParameterChange={(id, parameter, value) => handleReactorControl(id, 'parameter_change', value)}
                  />
                ))}
              </div>
            </div>

            {/* Stations */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estaciones de Producción</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockStations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    onStart={(id) => handleStationControl(id, 'start')}
                    onStop={(id) => handleStationControl(id, 'stop')}
                    onPause={(id) => handleStationControl(id, 'pause')}
                    onMaintenance={(id) => handleStationControl(id, 'maintenance')}
                    onAddToQueue={(id, productId, quantity) => handleStationControl(id, 'add_to_queue', { productId, quantity })}
                    onTargetChange={(id, target) => handleStationControl(id, 'target_change', { target })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'input' && (
          <div className="space-y-8">
            <ProductionInputForm
              onSubmit={handleNewProductionOrder}
              availableReactors={mockReactors.map(r => ({ id: r.id, name: r.name, available: r.status === 'idle' }))}
              availableStations={mockStations.map(s => ({ id: s.id, name: s.name, available: s.status === 'idle' }))}
            />
          </div>
        )}
      </div>

      {/* Production Form Modal */}
      {showProductionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ProductionInputForm
                onSubmit={handleNewProductionOrder}
                onCancel={() => setShowProductionForm(false)}
                availableReactors={mockReactors.map(r => ({ id: r.id, name: r.name, available: r.status === 'idle' }))}
                availableStations={mockStations.map(s => ({ id: s.id, name: s.name, available: s.status === 'idle' }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
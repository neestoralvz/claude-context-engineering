'use client'

import { useState, useEffect } from 'react'
import { mockProducts } from '../../lib/mock-data'
import { Product, Batch } from '../../types'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Package, Clock, CheckCircle, AlertTriangle, BarChart3, Thermometer } from 'lucide-react'

interface BatchWithProduct extends Batch {
  product: Product
}

interface BatchQualityCheck {
  id: string
  batchId: string
  parameter: string
  value: number
  unit: string
  specification: string
  result: 'pass' | 'fail' | 'pending'
  timestamp: Date
  operator: string
}

export function BatchManagement() {
  const [batches, setBatches] = useState<BatchWithProduct[]>([])
  const [qualityChecks, setQualityChecks] = useState<BatchQualityCheck[]>([])
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Simular lotes de producción
  useEffect(() => {
    const generateBatches = () => {
      const newBatches: BatchWithProduct[] = []
      
      // Generar lotes para productos con mayor rotación
      const highVolumeProducts = mockProducts.filter(p => 
        p.category === 'desinfeccion' || p.category === 'limpieza'
      ).slice(0, 8)

      highVolumeProducts.forEach((product, index) => {
        const batchNumber = `${product.category.toUpperCase().substr(0, 3)}-${String(Date.now() + index).substr(-6)}`
        const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Últimas 24 horas
        const duration = product.category === 'desinfeccion' ? 4 : 6 // horas
        const estimatedCompletion = new Date(startTime.getTime() + duration * 60 * 60 * 1000)
        const progress = Math.random()
        
        let status: 'pending' | 'in_progress' | 'quality_check' | 'completed' | 'rejected' = 'in_progress'
        if (progress > 0.9) status = 'completed'
        else if (progress > 0.8) status = 'quality_check'
        else if (progress < 0.1) status = 'pending'

        const batch: BatchWithProduct = {
          id: `batch-${index + 1}`,
          productId: product.id,
          quantity: Math.floor((product.size * 100) + Math.random() * 500),
          status,
          startTime,
          estimatedCompletion,
          actualCompletion: status === 'completed' ? new Date() : undefined,
          recipe: {
            id: `recipe-${product.id}`,
            productId: product.id,
            name: `Receta ${product.name}`,
            ingredients: product.ingredients.map((ing, i) => ({
              id: `ing-${i}`,
              name: ing,
              quantity: Math.random() * 100,
              unit: 'kg',
              supplier: 'Proveedor SA',
              batchNumber: `PROV-${Math.random().toString(36).substr(2, 6)}`
            })),
            steps: [
              {
                id: 'step-1',
                stepNumber: 1,
                description: 'Preparación de ingredientes',
                duration: 30,
                checkpoints: ['Verificar calidad', 'Pesar ingredientes']
              },
              {
                id: 'step-2', 
                stepNumber: 2,
                description: 'Mezclado',
                duration: 120,
                temperature: product.alcoholContent ? 25 : 35,
                mixingSpeed: 150,
                checkpoints: ['Monitorear temperatura', 'Verificar homogeneidad']
              },
              {
                id: 'step-3',
                stepNumber: 3,
                description: 'Control de calidad',
                duration: 60,
                checkpoints: ['Análisis químico', 'Pruebas microbiológicas']
              }
            ],
            duration: duration * 60,
            temperature: product.alcoholContent ? 25 : 35,
            mixingSpeed: 150,
            qualityStandards: [
              {
                parameter: product.alcoholContent ? 'Alcohol' : 'pH',
                minValue: product.alcoholContent ? product.alcoholContent - 1 : 6.5,
                maxValue: product.alcoholContent ? product.alcoholContent + 1 : 8.5,
                unit: product.alcoholContent ? '%' : '',
                critical: true
              }
            ]
          },
          qualityMetrics: [],
          product
        }

        newBatches.push(batch)
      })

      setBatches(newBatches)
    }

    generateBatches()
  }, [])

  // Separate effect for quality checks that depends on batches
  useEffect(() => {
    const generateQualityChecks = () => {
      const checks: BatchQualityCheck[] = []
      
      batches.forEach(batch => {
        if (batch.status === 'quality_check' || batch.status === 'completed') {
          // pH
          checks.push({
            id: `qc-${batch.id}-ph`,
            batchId: batch.id,
            parameter: 'pH',
            value: 7.2 + (Math.random() - 0.5) * 1.0,
            unit: '',
            specification: '6.5 - 7.5',
            result: Math.random() > 0.1 ? 'pass' : 'fail',
            timestamp: new Date(batch.startTime.getTime() + 3 * 60 * 60 * 1000),
            operator: 'QC-001'
          })

          // Densidad
          checks.push({
            id: `qc-${batch.id}-density`,
            batchId: batch.id,
            parameter: 'Densidad',
            value: 1.05 + (Math.random() - 0.5) * 0.1,
            unit: 'g/mL',
            specification: '1.00 - 1.10',
            result: Math.random() > 0.05 ? 'pass' : 'fail',
            timestamp: new Date(batch.startTime.getTime() + 3.5 * 60 * 60 * 1000),
            operator: 'QC-002'
          })

          if (batch.product.quaternaryAmmoniumContent) {
            checks.push({
              id: `qc-${batch.id}-quat`,
              batchId: batch.id,
              parameter: 'Sales Cuaternarias',
              value: batch.product.quaternaryAmmoniumContent + (Math.random() - 0.5) * 0.04,
              unit: '%',
              specification: `${batch.product.quaternaryAmmoniumContent - 0.02} - ${batch.product.quaternaryAmmoniumContent + 0.02}`,
              result: Math.random() > 0.03 ? 'pass' : 'fail',
              timestamp: new Date(batch.startTime.getTime() + 4 * 60 * 60 * 1000),
              operator: 'QC-003'
            })
          }
        }
      })

      setQualityChecks(checks)
    }

    if (batches.length > 0) {
      setTimeout(generateQualityChecks, 1000)
    }
  }, [batches])

  // Filtrar lotes
  const filteredBatches = filterStatus === 'all' 
    ? batches 
    : batches.filter(b => b.status === filterStatus)

  // Estadísticas
  const stats = {
    total: batches.length,
    inProgress: batches.filter(b => b.status === 'in_progress').length,
    qualityCheck: batches.filter(b => b.status === 'quality_check').length,
    completed: batches.filter(b => b.status === 'completed').length,
    rejected: batches.filter(b => b.status === 'rejected').length
  }

  const qualityRate = qualityChecks.length > 0 
    ? Math.round((qualityChecks.filter(q => q.result === 'pass').length / qualityChecks.length) * 100)
    : 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ninu-primary">Gestión de Lotes</h2>
          <p className="text-gray-600">Control de producción y trazabilidad completa</p>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-ninu-secondary" />
          <span className="text-sm font-medium text-gray-700">
            {stats.total} lotes activos
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lotes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="h-10 w-10 text-gray-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Proceso</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Control Calidad</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.qualityCheck}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa Calidad</p>
              <p className="text-3xl font-bold text-ninu-primary">{qualityRate}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-ninu-primary" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ninu-primary mb-4">Filtrar por Estado</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Todos', count: stats.total },
            { key: 'pending', label: 'Pendientes', count: batches.filter(b => b.status === 'pending').length },
            { key: 'in_progress', label: 'En Proceso', count: stats.inProgress },
            { key: 'quality_check', label: 'Control Calidad', count: stats.qualityCheck },
            { key: 'completed', label: 'Completados', count: stats.completed },
            { key: 'rejected', label: 'Rechazados', count: stats.rejected }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === filter.key
                  ? 'bg-ninu-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </Card>

      {/* Lista de lotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBatches.map(batch => (
          <Card key={batch.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-ninu-primary/10 rounded-lg p-2">
                  <Package className="h-5 w-5 text-ninu-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Lote #{batch.id.split('-')[1]}</h3>
                  <p className="text-sm text-gray-600">{batch.product.name}</p>
                </div>
              </div>
              <Badge className={`${
                batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                batch.status === 'quality_check' ? 'bg-yellow-100 text-yellow-800' :
                batch.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                batch.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {batch.status === 'completed' ? 'Completado' :
                 batch.status === 'quality_check' ? 'Control Calidad' :
                 batch.status === 'in_progress' ? 'En Proceso' :
                 batch.status === 'rejected' ? 'Rechazado' :
                 'Pendiente'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cantidad:</span>
                <span className="font-medium">{batch.quantity} {batch.product.unit}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Inicio:</span>
                <span className="font-medium">
                  {batch.startTime.toLocaleDateString('es-MX')} {batch.startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimado:</span>
                <span className="font-medium">
                  {batch.estimatedCompletion.toLocaleDateString('es-MX')} {batch.estimatedCompletion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {batch.actualCompletion && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completado:</span>
                  <span className="font-medium text-green-600">
                    {batch.actualCompletion.toLocaleDateString('es-MX')} {batch.actualCompletion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {batch.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progreso:</span>
                    <span className="font-medium">
                      {Math.round(((Date.now() - batch.startTime.getTime()) / (batch.estimatedCompletion.getTime() - batch.startTime.getTime())) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-ninu-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, Math.round(((Date.now() - batch.startTime.getTime()) / (batch.estimatedCompletion.getTime() - batch.startTime.getTime())) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Quality checks */}
              {qualityChecks.filter(qc => qc.batchId === batch.id).length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">Control de Calidad:</p>
                  <div className="space-y-1">
                    {qualityChecks.filter(qc => qc.batchId === batch.id).map(check => (
                      <div key={check.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">{check.parameter}:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {check.value.toFixed(check.parameter === 'pH' ? 1 : 2)}{check.unit}
                          </span>
                          {check.result === 'pass' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : check.result === 'fail' ? (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex space-x-2 pt-3 border-t">
                <button 
                  onClick={() => setSelectedBatch(batch.id)}
                  className="flex-1 bg-ninu-primary text-white px-3 py-2 rounded text-sm hover:bg-ninu-primary/90 transition-colors"
                >
                  Ver Detalles
                </button>
                {batch.status === 'quality_check' && (
                  <button className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors">
                    Aprobar QC
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de detalles del lote */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                const batch = batches.find(b => b.id === selectedBatch)
                if (!batch) return null

                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-ninu-primary">
                        Lote #{batch.id.split('-')[1]} - {batch.product.name}
                      </h2>
                      <button
                        onClick={() => setSelectedBatch(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Información del lote */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Información del Lote</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Producto:</span>
                            <span className="font-medium">{batch.product.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cantidad:</span>
                            <span className="font-medium">{batch.quantity} {batch.product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <Badge className={`${
                              batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                              batch.status === 'quality_check' ? 'bg-yellow-100 text-yellow-800' :
                              batch.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {batch.status === 'completed' ? 'Completado' :
                               batch.status === 'quality_check' ? 'Control Calidad' :
                               batch.status === 'in_progress' ? 'En Proceso' : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Control de calidad */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Control de Calidad</h3>
                        <div className="space-y-2">
                          {qualityChecks.filter(qc => qc.batchId === batch.id).map(check => (
                            <div key={check.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{check.parameter}</p>
                                  <p className="text-sm text-gray-600">Especificación: {check.specification}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {check.value.toFixed(check.parameter === 'pH' ? 1 : 2)}{check.unit}
                                  </p>
                                  <div className="flex items-center space-x-1">
                                    {check.result === 'pass' ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-xs text-green-600">Aprobado</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <span className="text-xs text-red-600">Rechazado</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
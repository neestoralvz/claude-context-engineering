'use client'

import { useState, useEffect } from 'react'
import { mockProducts } from '../../lib/mock-data'
import { Product } from '../../types'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Beaker, Thermometer } from 'lucide-react'

interface ChemicalReading {
  id: string
  productId: string
  productName: string
  parameter: string
  value: number
  unit: string
  targetValue: number
  tolerance: number
  timestamp: Date
  status: 'normal' | 'warning' | 'critical'
  batchId: string
}

interface QualityAlert {
  id: string
  type: 'concentration' | 'temperature' | 'ph' | 'purity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  productId: string
  productName: string
  timestamp: Date
  acknowledged: boolean
}

export function ChemicalMonitoring() {
  const [products] = useState<Product[]>(mockProducts)
  const [readings, setReadings] = useState<ChemicalReading[]>([])
  const [alerts, setAlerts] = useState<QualityAlert[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('all')

  // Simular lecturas químicas en tiempo real
  useEffect(() => {
    const generateReadings = () => {
      const newReadings: ChemicalReading[] = []
      
      products.forEach(product => {
        // Generar lecturas para productos con concentraciones químicas específicas
        if (product.alcoholContent) {
          const variance = (Math.random() - 0.5) * 2 // ±1%
          const value = product.alcoholContent + variance
          const status = Math.abs(variance) > 0.5 ? 'warning' : 'normal'
          
          newReadings.push({
            id: `${product.id}-alcohol-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            parameter: 'Alcohol Etílico',
            value: parseFloat(value.toFixed(2)),
            unit: '%',
            targetValue: product.alcoholContent,
            tolerance: 1.0,
            timestamp: new Date(),
            status,
            batchId: `BATCH-${Math.random().toString(36).substr(2, 8)}`
          })
        }

        if (product.quaternaryAmmoniumContent) {
          const variance = (Math.random() - 0.5) * 0.04 // ±0.02%
          const value = product.quaternaryAmmoniumContent + variance
          const status = Math.abs(variance) > 0.01 ? 'warning' : 'normal'
          
          newReadings.push({
            id: `${product.id}-quat-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            parameter: 'Sales Cuaternarias',
            value: parseFloat(value.toFixed(3)),
            unit: '%',
            targetValue: product.quaternaryAmmoniumContent,
            tolerance: 0.02,
            timestamp: new Date(),
            status,
            batchId: `BATCH-${Math.random().toString(36).substr(2, 8)}`
          })
        }

        // pH para productos de limpieza
        if (product.category === 'limpieza') {
          const phTarget = 7.5
          const variance = (Math.random() - 0.5) * 1.0 // ±0.5 pH
          const value = phTarget + variance
          const status = Math.abs(variance) > 0.3 ? 'warning' : 'normal'
          
          newReadings.push({
            id: `${product.id}-ph-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            parameter: 'pH',
            value: parseFloat(value.toFixed(1)),
            unit: '',
            targetValue: phTarget,
            tolerance: 0.5,
            timestamp: new Date(),
            status,
            batchId: `BATCH-${Math.random().toString(36).substr(2, 8)}`
          })
        }
      })

      setReadings(prev => [...newReadings, ...prev.slice(0, 50)]) // Mantener últimas 50 lecturas
    }


    // Inicializar con datos
    generateReadings()

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      generateReadings()
    }, 30000)

    return () => clearInterval(interval)
  }, [products])

  // Separate effect for alerts that depends on readings
  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts: QualityAlert[] = []
      
      readings.forEach(reading => {
        if (reading.parameter === 'pH') {
          if (reading.value < 6.5 || reading.value > 8.5) {
            newAlerts.push({
              id: `alert-${Date.now()}-${Math.random()}`,
              type: 'ph',
              severity: reading.value < 6.0 || reading.value > 9.0 ? 'high' : 'medium',
              message: `${reading.parameter} fuera de especificación: ${reading.value}${reading.unit} (objetivo: ${reading.targetValue}${reading.unit})`,
              productId: reading.productId,
              productName: reading.productName,
              timestamp: reading.timestamp,
              acknowledged: false
            })
          }
        }
      })

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 20)]) // Mantener últimas 20 alertas
      }
    }

    if (readings.length > 0) {
      generateAlerts()
    }
  }, [readings])

  // Filtrar lecturas por producto
  const filteredReadings = selectedProduct === 'all' 
    ? readings 
    : readings.filter(r => r.productId === selectedProduct)

  // Estadísticas de calidad
  const qualityStats = {
    totalReadings: readings.length,
    normalReadings: readings.filter(r => r.status === 'normal').length,
    warningReadings: readings.filter(r => r.status === 'warning').length,
    criticalReadings: readings.filter(r => r.status === 'critical').length,
    activeAlerts: alerts.filter(a => !a.acknowledged).length
  }

  const complianceRate = readings.length > 0 
    ? Math.round((qualityStats.normalReadings / readings.length) * 100)
    : 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ninu-primary">Monitoreo Químico</h2>
          <p className="text-gray-600">Control de concentraciones y parámetros de calidad en tiempo real</p>
        </div>
        <div className="flex items-center space-x-2">
          <Beaker className="h-6 w-6 text-ninu-secondary" />
          <span className="text-sm font-medium text-gray-700">
            Última actualización: {new Date().toLocaleTimeString('es-MX')}
          </span>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lecturas Totales</p>
              <p className="text-3xl font-bold text-gray-900">{qualityStats.totalReadings}</p>
            </div>
            <Thermometer className="h-10 w-10 text-gray-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Especificación</p>
              <p className="text-3xl font-bold text-green-600">{qualityStats.normalReadings}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Advertencias</p>
              <p className="text-3xl font-bold text-yellow-600">{qualityStats.warningReadings}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticas</p>
              <p className="text-3xl font-bold text-red-600">{qualityStats.criticalReadings}</p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
              <p className="text-3xl font-bold text-ninu-primary">{complianceRate}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-ninu-primary" />
          </div>
        </Card>
      </div>

      {/* Alertas activas */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              Alertas Activas ({alerts.filter(a => !a.acknowledged).length})
            </h3>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
              <div key={alert.id} className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity === 'critical' ? 'Crítica' :
                         alert.severity === 'high' ? 'Alta' :
                         alert.severity === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <span className="text-sm font-medium text-red-900">{alert.productName}</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                    <p className="text-xs text-red-600">
                      {alert.timestamp.toLocaleTimeString('es-MX')}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setAlerts(prev => prev.map(a => 
                        a.id === alert.id ? { ...a, acknowledged: true } : a
                      ))
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Reconocer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filtro de productos */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ninu-primary mb-4">Filtrar por Producto</h3>
        <select 
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ninu-primary focus:border-transparent"
        >
          <option value="all">Todos los productos ({readings.length} lecturas)</option>
          {products
            .filter(p => p.alcoholContent || p.quaternaryAmmoniumContent || p.category === 'limpieza')
            .map(product => {
              const count = readings.filter(r => r.productId === product.id).length
              return (
                <option key={product.id} value={product.id}>
                  {product.name} ({count} lecturas)
                </option>
              )
            })}
        </select>
      </Card>

      {/* Tabla de lecturas recientes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ninu-primary mb-4">
          Lecturas Recientes {selectedProduct !== 'all' && '- ' + products.find(p => p.id === selectedProduct)?.name}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Producto</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Parámetro</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Valor</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Objetivo</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Lote</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReadings.slice(0, 20).map(reading => (
                <tr key={reading.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-xs">
                      {reading.productName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {reading.parameter}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${
                      reading.status === 'critical' ? 'text-red-600' :
                      reading.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {reading.value}{reading.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {reading.targetValue}{reading.unit}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${
                      reading.status === 'critical' ? 'bg-red-100 text-red-800' :
                      reading.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {reading.status === 'critical' ? 'Crítico' :
                       reading.status === 'warning' ? 'Advertencia' :
                       'Normal'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 font-mono text-xs">
                    {reading.batchId}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {reading.timestamp.toLocaleTimeString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Especificaciones químicas */}
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start space-x-3">
          <Beaker className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Especificaciones Químicas Ninu.mx
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Productos Desinfectantes:</p>
                  <ul className="ml-4 space-y-1">
                    <li>• Alcohol etílico: 70% ± 1%</li>
                    <li>• Sales cuaternarias: 0.18% ± 0.02%</li>
                    <li>• pH: 6.5 - 8.5</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Productos de Limpieza:</p>
                  <ul className="ml-4 space-y-1">
                    <li>• pH: 7.0 - 8.0</li>
                    <li>• Tensioactivos: Según formulación</li>
                    <li>• Densidad: ±2% del objetivo</li>
                  </ul>
                </div>
              </div>
              <p className="font-medium mt-4">
                Tolerancias: Las desviaciones &gt;5% requieren investigación inmediata
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
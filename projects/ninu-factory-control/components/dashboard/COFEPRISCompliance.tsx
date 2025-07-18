'use client'

import { useState, useEffect } from 'react'
import { mockProducts } from '../../lib/mock-data'
import { Product } from '../../types'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Calendar } from 'lucide-react'

interface COFEPRISStatus {
  registered: number
  pending: number
  expiring: number
  total: number
  compliance: number
}

export function COFEPRISCompliance() {
  const [products] = useState<Product[]>(mockProducts)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Calcular estadísticas COFEPRIS
  const cofepisStats: COFEPRISStatus = {
    registered: products.filter(p => p.cofepisApproval && p.cofepisRegistration).length,
    pending: products.filter(p => !p.cofepisApproval).length,
    expiring: 0, // Simulado - en producción vendría de fechas de vencimiento
    total: products.length,
    compliance: 0
  }
  
  cofepisStats.compliance = Math.round((cofepisStats.registered / cofepisStats.total) * 100)

  // Filtrar productos por categoría
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  // Obtener categorías únicas
  const categories = Array.from(new Set(products.map(p => p.category)))

  // Productos que requieren atención
  const attentionProducts = products.filter(p => 
    !p.cofepisApproval || 
    (p.category === 'desinfeccion' && !p.cofepisRegistration)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ninu-primary">Dashboard COFEPRIS</h2>
          <p className="text-gray-600">Monitoreo de cumplimiento regulatorio mexicano</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            Actualizado: {new Date().toLocaleDateString('es-MX')}
          </span>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Registrados</p>
              <p className="text-3xl font-bold text-green-600">{cofepisStats.registered}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">{cofepisStats.pending}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Por Vencer</p>
              <p className="text-3xl font-bold text-red-600">{cofepisStats.expiring}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
              <p className="text-3xl font-bold text-ninu-primary">{cofepisStats.compliance}%</p>
            </div>
            <Shield className="h-10 w-10 text-ninu-primary" />
          </div>
        </Card>
      </div>

      {/* Filtros por categoría */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ninu-primary mb-4">Filtrar por Categoría</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-ninu-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map(category => {
            const count = products.filter(p => p.category === category).length
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-ninu-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
              </button>
            )
          })}
        </div>
      </Card>

      {/* Lista de productos con estado COFEPRIS */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ninu-primary mb-4">
          Estado de Productos {selectedCategory !== 'all' && `- ${selectedCategory}`}
        </h3>
        <div className="space-y-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <Badge className={`${
                      product.cofepisApproval && product.cofepisRegistration
                        ? 'bg-green-100 text-green-800'
                        : product.cofepisApproval
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.cofepisApproval && product.cofepisRegistration
                        ? 'Registrado'
                        : product.cofepisApproval
                        ? 'Aprobado'
                        : 'Pendiente'
                      }
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Categoría: <span className="font-medium">{product.category}</span>
                    </p>
                    {product.cofepisRegistration && (
                      <p className="text-sm text-gray-600">
                        Registro: <span className="font-medium">{product.cofepisRegistration}</span>
                      </p>
                    )}
                    {product.alcoholContent && (
                      <p className="text-sm text-gray-600">
                        Alcohol: <span className="font-medium">{product.alcoholContent}%</span>
                      </p>
                    )}
                    {product.quaternaryAmmoniumContent && (
                      <p className="text-sm text-gray-600">
                        Sales Cuaternarias: <span className="font-medium">{product.quaternaryAmmoniumContent}%</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {product.cofepisApproval && product.cofepisRegistration ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : product.cofepisApproval ? (
                    <Clock className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Productos que requieren atención */}
      {attentionProducts.length > 0 && (
        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-800">
              Productos que Requieren Atención ({attentionProducts.length})
            </h3>
          </div>
          <div className="space-y-3">
            {attentionProducts.map(product => (
              <div key={product.id} className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-orange-900">{product.name}</h4>
                    <p className="text-sm text-orange-700">
                      {!product.cofepisApproval 
                        ? 'Sin aprobación COFEPRIS'
                        : 'Falta número de registro'
                      }
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors">
                    Gestionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Información regulatoria */}
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start space-x-3">
          <FileText className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Información Regulatoria COFEPRIS
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Aviso de Funcionamiento:</strong> No. 18300953X0146
              </p>
              <p>
                <strong>Productos Desinfectantes:</strong> Requieren registro sanitario específico
              </p>
              <p>
                <strong>Concentraciones Reguladas:</strong>
              </p>
              <ul className="ml-4 space-y-1">
                <li>• Alcohol etílico: 70% máximo permitido</li>
                <li>• Sales cuaternarias de amonio: 0.18% concentración estándar</li>
                <li>• Hipoclorito de sodio: Según normativa vigente</li>
              </ul>
              <p>
                <strong>Renovación:</strong> Los registros deben renovarse cada 5 años
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
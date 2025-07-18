'use client'

import { Product } from '../../types'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { UrgencyBadge } from '../ui/UrgencyBadge'
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { calculateUrgencyBadges, shouldHighlightProduct } from '../../lib/urgency-logic'

interface ProductCardProps {
  product: Product
  onClick?: (product: Product) => void
  showActions?: boolean
}

export function ProductCard({ product, onClick, showActions = false }: ProductCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(product)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'limpieza': '🧽',
      'desinfeccion': '🦠',
      'salud-bienestar': '💊',
      'albercas': '🏊',
      'autos': '🚗',
      'alimentos': '🍽️',
      'quimicos': '⚗️',
      'mascotas': '🐕'
    }
    return icons[category] || '📦'
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'limpieza': 'bg-blue-100 text-blue-800',
      'desinfeccion': 'bg-red-100 text-red-800',
      'salud-bienestar': 'bg-green-100 text-green-800',
      'albercas': 'bg-cyan-100 text-cyan-800',
      'autos': 'bg-gray-100 text-gray-800',
      'alimentos': 'bg-orange-100 text-orange-800',
      'quimicos': 'bg-purple-100 text-purple-800',
      'mascotas': 'bg-pink-100 text-pink-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getStockStatus = () => {
    if (product.currentStock <= product.minStock) {
      return { label: 'Stock Bajo', color: 'bg-red-100 text-red-800' }
    } else if (product.currentStock <= product.minStock * 1.5) {
      return { label: 'Stock Medio', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { label: 'Stock Alto', color: 'bg-green-100 text-green-800' }
    }
  }

  const stockStatus = getStockStatus()
  
  // Calculate urgency badges for Mexican e-commerce psychology
  const urgencyBadges = calculateUrgencyBadges(product)
  const isHighUrgency = shouldHighlightProduct(product)

  return (
    <Card 
      className={`p-6 transition-all duration-200 hover:shadow-lg border-l-4 ${
        isHighUrgency 
          ? 'border-l-red-500 shadow-lg ring-2 ring-red-100 bg-gradient-to-br from-white to-red-50' 
          : 'border-l-ninu-secondary'
      } ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Ver detalles de ${product.name}` : undefined}
    >
      {/* Header con categoría y certificación */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={getCategoryColor(product.category)}>
          {getCategoryIcon(product.category)} {product.category.replace('-', ' ')}
        </Badge>
        {product.cofepisApproval && (
          <div className="flex items-center space-x-1 text-green-600 text-xs">
            <CheckCircle className="h-3 w-3" />
            <span>COFEPRIS</span>
          </div>
        )}
      </div>

      {/* Urgency Badges - Mexican E-commerce Psychology */}
      {urgencyBadges.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {urgencyBadges.map((badge, index) => (
              <UrgencyBadge
                key={`${badge.type}-${index}`}
                type={badge.type}
                value={badge.value}
                urgencyLevel={badge.urgencyLevel}
                className="transform hover:scale-105 transition-transform"
              />
            ))}
          </div>
        </div>
      )}

      {/* Nombre y descripción del producto */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-ninu-primary mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {product.description}
        </p>
      </div>

      {/* Información del producto */}
      <div className="space-y-3">
        {/* Tamaño y presentación */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-ninu-secondary" />
            <span className="text-gray-700">
              {product.size} {product.unit} • {product.packaging}
            </span>
          </div>
          <Badge className={stockStatus.color}>
            {stockStatus.label}
          </Badge>
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-ninu-primary">
              ${product.salePrice.toFixed(2)} MXN
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Costo: ${product.productionCost.toFixed(2)}
          </div>
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Stock actual: <span className="font-medium">{product.currentStock}</span>
          </div>
          <div className="text-gray-500 text-xs">
            Mín: {product.minStock}
          </div>
        </div>

        {/* Vida útil */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Vida útil: {product.shelfLife} meses</span>
        </div>

        {/* Usos principales */}
        <div className="text-xs">
          <span className="text-gray-500">Usos:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {product.useCase.slice(0, 3).map((use, index) => (
              <Badge 
                key={index} 
                className="bg-gray-100 text-gray-700 text-xs"
              >
                {use}
              </Badge>
            ))}
            {product.useCase.length > 3 && (
              <Badge className="bg-gray-100 text-gray-700 text-xs">
                +{product.useCase.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Acciones opcionales */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="btn-ninu-secondary text-xs px-3 py-1">
              Ver Detalles
            </button>
            <button className="btn-ninu-primary text-xs px-3 py-1">
              Gestionar
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
'use client'

import { Product } from '../../types'
import { ProductCard } from './ProductCard'
import { calculateProductUrgencyScore, shouldHighlightProduct } from '../../lib/urgency-logic'
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react'

interface UrgentProductsShowcaseProps {
  products: Product[]
  onProductClick?: (product: Product) => void
  maxProducts?: number
}

export function UrgentProductsShowcase({ 
  products, 
  onProductClick, 
  maxProducts = 6 
}: UrgentProductsShowcaseProps) {
  // Filter and sort by urgency score
  const urgentProducts = products
    .filter(product => shouldHighlightProduct(product))
    .sort((a, b) => calculateProductUrgencyScore(b) - calculateProductUrgencyScore(a))
    .slice(0, maxProducts)

  if (urgentProducts.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-red-200 shadow-lg">
      {/* Header with Mexican-style urgency messaging */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-red-500 text-white rounded-full p-3 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-red-700 mb-2">
          🔥 ¡Ofertas Imperdibles!
        </h2>
        <p className="text-red-600 font-medium">
          Productos con alta demanda • Stock limitado • Precios especiales
        </p>
        <div className="flex items-center justify-center mt-3 space-x-4 text-sm text-red-500">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Alta demanda</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Tiempo limitado</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Stock bajo</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {urgentProducts.map((product) => (
          <div 
            key={product.id}
            className="transform hover:scale-105 transition-all duration-300"
          >
            <ProductCard
              product={product}
              onClick={onProductClick}
              showActions={false}
            />
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-6 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg">
        <p className="font-bold text-lg mb-2">
          ⚡ ¡No te quedes sin el tuyo!
        </p>
        <p className="text-red-100 text-sm">
          Aprovecha estos precios especiales antes de que se agoten. 
          <br />
          <span className="font-medium">Ninu.mx • Tu aliado esencial</span>
        </p>
      </div>
    </div>
  )
}

export default UrgentProductsShowcase
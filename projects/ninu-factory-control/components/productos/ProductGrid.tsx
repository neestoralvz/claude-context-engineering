'use client'

import { Product } from '../../types'
import { ProductCard } from './ProductCard'
import { ninuCategories } from '../../lib/mock-data'
import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { sortProductsByUrgency } from '../../lib/urgency-logic'

interface ProductGridProps {
  products: Product[]
  onProductClick?: (product: Product) => void
  showActions?: boolean
  showFilters?: boolean
}

export function ProductGrid({ 
  products, 
  onProductClick, 
  showActions = false,
  showFilters = true 
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'urgency' | 'name' | 'price' | 'stock'>('urgency')

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Ordenar productos
  const sortedProducts = (() => {
    switch (sortBy) {
      case 'urgency':
        return sortProductsByUrgency(filteredProducts)
      case 'name':
        return [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name))
      case 'price':
        return [...filteredProducts].sort((a, b) => a.salePrice - b.salePrice)
      case 'stock':
        return [...filteredProducts].sort((a, b) => b.currentStock - a.currentStock)
      default:
        return filteredProducts
    }
  })()

  // Obtener categorías con conteos
  const categoriesWithCount = ninuCategories.map(category => {
    const count = products.filter(p => p.category === category.id).length
    return { ...category, count }
  }).filter(category => category.count > 0)

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ninu-secondary focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-ninu-secondary focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categoriesWithCount.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'urgency' | 'name' | 'price' | 'stock')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-ninu-secondary focus:border-transparent"
              >
                <option value="urgency">🚨 Urgencia</option>
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="stock">Stock</option>
              </select>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {sortedProducts.length} de {products.length} productos
              {selectedCategory !== 'all' && (
                <span> en {categoriesWithCount.find(c => c.id === selectedCategory)?.name}</span>
              )}
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-ninu-secondary hover:text-ninu-primary"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid de productos */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onProductClick}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No hay productos que coincidan con "${searchTerm}"`
              : 'No hay productos disponibles en esta categoría'
            }
          </p>
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="mt-4 btn-ninu-secondary"
            >
              Ver todos los productos
            </button>
          )}
        </div>
      )}

      {/* Resumen de categorías */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-ninu-primary mb-4">
            Resumen por Categorías
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesWithCount.map(category => (
              <div 
                key={category.id}
                className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-ninu-secondary text-white' 
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
                <div className="text-xs opacity-75">{category.count} productos</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { ProductGrid } from '../../../components/productos/ProductGrid'
import { ProductCard } from '../../../components/productos/ProductCard'
import { mockProducts, ninuContactInfo } from '../../../lib/mock-data'
import { Product } from '../../../types'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react'

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'cofepris' | 'low-stock'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Filter products based on selected filter and search term
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    switch (filter) {
      case 'cofepris':
        return product.cofepisApproval
      case 'low-stock':
        return product.currentStock <= product.minStock
      default:
        return true
    }
  })

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    // Implement bulk actions
    console.log(`Bulk ${action} for products:`, selectedProducts)
    setSelectedProducts([])
  }

  const getStatusBadge = (product: Product) => {
    if (product.currentStock <= product.minStock) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Stock Bajo
        </Badge>
      )
    }
    if (product.cofepisApproval) {
      return (
        <Badge variant="status" className="text-xs bg-green-100 text-green-800">
          <Award className="h-3 w-3 mr-1" />
          COFEPRIS
        </Badge>
      )
    }
    return (
      <Badge variant="status" className="text-xs bg-red-100 text-red-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Activo
      </Badge>
    )
  }

  const stats = {
    total: products.length,
    cofepris: products.filter(p => p.cofepisApproval).length,
    lowStock: products.filter(p => p.currentStock <= p.minStock).length,
    totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.salePrice), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-ninu text-white rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Administración de Productos
            </h1>
            <p className="text-blue-100">
              {ninuContactInfo.brand} - Control total del catálogo de productos químicos
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-white text-ninu-primary hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Productos</p>
              <p className="text-2xl font-bold text-ninu-primary">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-ninu-primary" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Con COFEPRIS</p>
              <p className="text-2xl font-bold text-green-600">{stats.cofepris}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stock Bajo</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Valor Total</p>
              <p className="text-2xl font-bold text-ninu-primary">
                ${(stats.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-ninu-primary" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ninu-primary focus:border-transparent w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ninu-primary focus:border-transparent"
              >
                <option value="all">Todos los productos</option>
                <option value="cofepris">Solo con COFEPRIS</option>
                <option value="low-stock">Stock bajo</option>
              </select>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedProducts.length} seleccionados
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                Activar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                Desactivar
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id))
                      } else {
                        setSelectedProducts([])
                      }
                    }}
                    className="rounded border-gray-300 text-ninu-primary focus:ring-ninu-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                      className="rounded border-gray-300 text-ninu-primary focus:ring-ninu-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.size} {product.unit} - {product.packaging}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {product.category.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.currentStock} / {product.minStock}
                    </div>
                    {product.currentStock <= product.minStock && (
                      <div className="text-xs text-red-600">Stock bajo</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.salePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="text-center text-gray-600">
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>
    </div>
  )
}
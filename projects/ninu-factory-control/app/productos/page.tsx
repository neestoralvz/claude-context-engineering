'use client'

import { useState } from 'react'
import { ProductGrid } from '../../components/productos/ProductGrid'
import { UrgentProductsShowcase } from '../../components/productos/UrgentProductsShowcase'
import { mockProducts, ninuContactInfo, ninuCategories } from '../../lib/mock-data'
import { Product } from '../../types'
import { Package, ShoppingBag, Award, Truck } from 'lucide-react'
import StructuredData from '../../components/seo/StructuredData'

export default function ProductosPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const totalProducts = mockProducts.length
  const totalCategories = ninuCategories.filter(cat => 
    mockProducts.some(p => p.category === cat.id)
  ).length
  const cofepisProducts = mockProducts.filter(p => p.cofepisApproval).length
  const totalValue = mockProducts.reduce((sum, p) => sum + (p.currentStock * p.salePrice), 0)

  return (
    <>
      <StructuredData page="products" />
      <div className="space-y-8">
      {/* Hero Section */}
      <div className="gradient-ninu text-white rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Catálogo de Productos de Limpieza Ecológicos México | {ninuContactInfo.brand}
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            <strong>Gel antibacterial, desinfectantes biodegradables y jabones hipoalergénicos</strong> certificados COFEPRIS para el hogar mexicano
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-sm text-blue-100">Productos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalCategories}</div>
              <div className="text-sm text-blue-100">Categorías</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Award className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{cofepisProducts}</div>
              <div className="text-sm text-blue-100">Con COFEPRIS</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Truck className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</div>
              <div className="text-sm text-blue-100">Valor Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la empresa */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-ninu-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="h-8 w-8 text-ninu-primary" />
            </div>
            <h3 className="font-semibold text-ninu-primary mb-2">Calidad Certificada</h3>
            <p className="text-gray-600 text-sm">
              Todos nuestros productos cuentan con registro COFEPRIS y cumplen las normativas más estrictas.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-ninu-secondary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="h-8 w-8 text-ninu-secondary" />
            </div>
            <h3 className="font-semibold text-ninu-primary mb-2">Amplio Catálogo</h3>
            <p className="text-gray-600 text-sm">
              Desde limpieza doméstica hasta productos especializados para diferentes industrias.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-ninu-primary mb-2">Disponibilidad</h3>
            <p className="text-gray-600 text-sm">
              Stock disponible desde nuestra planta en Xalapa, Veracruz para todo México.
            </p>
          </div>
        </div>
      </div>

      {/* Urgent Products Showcase - Mexican E-commerce Psychology */}
      <UrgentProductsShowcase 
        products={mockProducts}
        onProductClick={handleProductClick}
        maxProducts={6}
      />

      {/* Grid de productos */}
      <ProductGrid 
        products={mockProducts}
        onProductClick={handleProductClick}
        showFilters={true}
      />

      {/* Modal de producto (si está seleccionado) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ninu-primary">
                  {selectedProduct.name}
                </h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="space-y-6">
                {/* Información básica */}
                <div>
                  <h3 className="font-semibold text-ninu-primary mb-2">Descripción</h3>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                </div>

                {/* Especificaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Especificaciones</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Tamaño: {selectedProduct.size} {selectedProduct.unit}</li>
                      <li>Presentación: {selectedProduct.packaging}</li>
                      <li>Vida útil: {selectedProduct.shelfLife} meses</li>
                      <li>Categoría: {selectedProduct.category}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Disponibilidad</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Stock actual: {selectedProduct.currentStock} unidades</li>
                      <li>Stock mínimo: {selectedProduct.minStock} unidades</li>
                      <li>Precio: ${selectedProduct.salePrice.toFixed(2)} MXN</li>
                      {selectedProduct.cofepisApproval && (
                        <li className="text-green-600 font-medium">✓ Registro COFEPRIS</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Ingredientes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ingredientes Principales</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ingredients.map((ingredient, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Usos */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usos Recomendados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.useCase.map((use, index) => (
                      <span 
                        key={index}
                        className="bg-ninu-secondary/10 text-ninu-secondary px-3 py-1 rounded-full text-sm"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    className="btn-ninu-primary flex-1"
                    onClick={() => {
                      // Aquí iría la lógica para agregar al carrito o hacer pedido
                      alert(`Producto "${selectedProduct.name}" agregado a solicitud de cotización`)
                      setSelectedProduct(null)
                    }}
                  >
                    Solicitar Cotización
                  </button>
                  <button 
                    className="btn-ninu-secondary"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de contacto */}
      <div className="bg-ninu-primary text-white rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas más información?</h2>
          <p className="text-blue-100 mb-6">
            Nuestro equipo está listo para ayudarte con cotizaciones personalizadas y asesoría técnica.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href={`mailto:${ninuContactInfo.email}`}
              className="bg-white text-ninu-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              📧 {ninuContactInfo.email}
            </a>
            <a 
              href={ninuContactInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ninu-secondary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              🌐 Visitar {ninuContactInfo.website}
            </a>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
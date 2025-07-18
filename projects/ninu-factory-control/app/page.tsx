import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Star, Truck, Shield, Award, Package, Heart, Sparkles, MessageCircle, Phone } from 'lucide-react'
import { ninuContactInfo, mockProducts, ninuCategories } from '../lib/mock-data'
import StructuredData from '../components/seo/StructuredData'
import RevolutionaryHero from '../components/landing/RevolutionaryHero'
import FloatingNavigation from '../components/landing/FloatingNavigation'
import InteractiveTestimonials from '../components/landing/InteractiveTestimonials'
import Y2KProductShowcase from '../components/landing/Y2KProductShowcase'

export default function HomePage() {
  // Featured products for the landing page
  const featuredProducts = mockProducts.slice(0, 4)
  
  // Testimonials from Mercado Libre customers
  const testimonials = [
    {
      name: "María González",
      rating: 5,
      comment: "Excelente calidad! El jabón para trastes rinde muchísimo y deja todo súper limpio.",
      product: "Jabón Líquido Para Trastes"
    },
    {
      name: "Carlos Hernández",
      rating: 5,
      comment: "Compré el sanitizante y quedé impresionado con su efectividad. Lo recomiendo 100%",
      product: "Sanitizante Multiusos"
    },
    {
      name: "Ana Martínez",
      rating: 5,
      comment: "El gel conductor es perfecto para mi consultorio. Calidad profesional a buen precio.",
      product: "Gel Conductor Ultrasonido"
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Certificación COFEPRIS',
      description: 'Todos nuestros productos cuentan con registro sanitario oficial'
    },
    {
      icon: Truck,
      title: 'Envío Rápido',
      description: 'Desde nuestra planta en Xalapa, Veracruz a todo México'
    },
    {
      icon: Award,
      title: 'Calidad Garantizada',
      description: 'Más de 1000 clientes satisfechos en Mercado Libre'
    },
    {
      icon: Heart,
      title: 'Productos Seguros',
      description: 'Fórmulas hipoalergénicas y biodegradables'
    }
  ]

  return (
    <>
      <StructuredData page="home" />
      <FloatingNavigation />
      <div className="min-h-screen bg-white">
      
      {/* Revolutionary Hero Section */}
      <RevolutionaryHero />
      
      {/* Y2K Product Showcase */}
      <Y2KProductShowcase />

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Productos de Limpieza Ecológicos Más Vendidos
          </h2>
          <p className="text-xl text-gray-600">
            <strong>Gel antibacterial, sanitizantes y jabones hipoalergénicos</strong> preferidos por las familias mexicanas en Mercado Libre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden product-card-hover">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-48 flex items-center justify-center">
                <div className="text-6xl floating-animation">
                  {ninuCategories.find(cat => cat.id === product.category)?.icon || '🧽'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.salePrice.toFixed(2)}
                  </span>
                  {product.cofepisApproval && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      COFEPRIS
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">(4.9)</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.currentStock} disponibles
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Ninu.mx para Productos de Limpieza?
            </h2>
            <p className="text-xl text-gray-600">
              <strong>La marca mexicana de confianza</strong> en productos de limpieza ecológicos y desinfectantes biodegradables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon
              return (
                <div key={benefit.title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Interactive Testimonials */}
      <InteractiveTestimonials />

      {/* Categories Preview */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Todas las categorías que necesitas
            </h2>
            <p className="text-xl text-blue-100">
              Productos de limpieza para cada área de tu vida
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {ninuCategories.map((category) => (
              <div key={category.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center category-icon-hover cursor-pointer">
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-white text-sm font-medium">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para obtener los mejores productos de limpieza?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a los miles de clientes satisfechos que ya confían en Ninu.mx
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://mercadolibre.com.mx/ninu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-yellow-400 text-black text-lg font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Comprar en Mercado Libre
            </a>
            <a
              href={`mailto:${ninuContactInfo.email}`}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Solicitar Cotización
            </a>
          </div>
        </div>
      </div>

      {/* Footer Company Info */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">{ninuContactInfo.brand}</h3>
            <p className="text-gray-300 mb-2">{ninuContactInfo.company}</p>
            <p className="text-gray-400 text-sm mb-4">{ninuContactInfo.location}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href={`mailto:${ninuContactInfo.email}`} className="text-blue-400 hover:text-blue-300">
                📧 {ninuContactInfo.email}
              </a>
              <a href={ninuContactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                🌐 {ninuContactInfo.website}
              </a>
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-300 text-sm">
                Dashboard de Producción
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
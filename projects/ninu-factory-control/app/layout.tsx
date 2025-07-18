import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import './globals.css'
import { ninuContactInfo, ninuCategories } from '../lib/mock-data'
import FloatingWhatsApp from '../components/ui/FloatingWhatsApp'
import MobileNavigationWrapper from '../components/ui/MobileNavigationWrapper'

export const metadata: Metadata = {
  title: 'Ninu.mx - Productos de Limpieza Ecológicos México | Certificados COFEPRIS | Vendedor Oficial Mercado Libre',
  description: 'Productos de limpieza y desinfección certificados COFEPRIS para toda la familia mexicana. Gel antibacterial, jabones biodegradables, sanitizantes sin alcohol. +1000 familias satisfechas. Envío gratis desde Xalapa, Veracruz.',
  keywords: 'productos limpieza ecológicos México, desinfectantes biodegradables, gel antibacterial COFEPRIS, jabón trastes concentrado, sanitizante sin alcohol, productos limpieza México, limpieza hogar ecológica, desinfectantes sales cuaternarias, jabón hipoalergénico, productos COFEPRIS México, limpieza Xalapa Veracruz, vendedor oficial Mercado Libre, productos limpieza certificados',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    title: 'Ninu.mx - Productos de Limpieza Ecológicos México | Certificados COFEPRIS',
    description: 'La marca mexicana de confianza en productos de limpieza ecológicos. Gel antibacterial, desinfectantes biodegradables y jabones hipoalergénicos certificados COFEPRIS. +1000 familias satisfechas en todo México.',
    url: 'https://ninu.mx',
    siteName: 'Ninu.mx',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: 'https://ninu.mx/images/ninu/logo.webp',
        width: 1200,
        height: 630,
        alt: 'Ninu.mx - Productos de Limpieza Ecológicos México'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ninu.mx - Productos de Limpieza Ecológicos México 🇲🇽',
    description: 'Gel antibacterial, desinfectantes biodegradables y jabones hipoalergénicos certificados COFEPRIS. Vendedor oficial Mercado Libre.',
    creator: '@ninumx',
    site: '@ninumx',
    images: ['https://ninu.mx/images/ninu/logo.webp']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ninu.mx'
  },
  category: 'productos de limpieza México',
  classification: 'Productos de Limpieza y Desinfección',
  other: {
    'geo.region': 'MX-VER',
    'geo.placename': 'Xalapa-Enríquez, Veracruz, México',
    'geo.position': '19.5389;-96.9103',
    'ICBM': '19.5389, -96.9103'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="container-responsive">
              <div className="flex justify-between items-center header-responsive">
                {/* Logo y Navegación Principal */}
                <div className="flex items-center space-x-4 sm:space-x-8">
                  <Link href="/" className="flex items-center space-x-2">
                    <Image
                      src="/images/ninu/logo.webp"
                      alt="Ninu.mx Logo"
                      width={120}
                      height={40}
                      className="h-7 sm:h-8 w-auto"
                      priority
                    />
                  </Link>
                  
                  {/* Navegación */}
                  <nav className="hidden md:flex space-x-4 lg:space-x-6">
                    <Link 
                      href="/" 
                      className="text-ninu-primary hover:text-ninu-secondary transition-colors font-medium"
                    >
                      Control
                    </Link>
                    <Link 
                      href="/productos" 
                      className="text-ninu-primary hover:text-ninu-secondary transition-colors font-medium"
                    >
                      Productos
                    </Link>
                    <Link 
                      href="/admin/productos" 
                      className="text-ninu-primary hover:text-ninu-secondary transition-colors font-medium"
                    >
                      Gestión
                    </Link>
                  </nav>
                </div>

                {/* Información de empresa */}
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-ninu-primary">
                      {ninuContactInfo.brand}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-40">
                      {ninuContactInfo.slogan}
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <MobileNavigationWrapper />
              </div>
            </div>
          </header>

          {/* Contenido Principal */}
          <main className="container-responsive spacing-responsive">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-ninu-primary text-white mt-8 sm:mt-12 lg:mt-16">
            <div className="container-responsive spacing-responsive-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Información de la empresa */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{ninuContactInfo.brand}</h3>
                  <p className="text-blue-100 mb-2">{ninuContactInfo.slogan}</p>
                  <p className="text-blue-200 text-sm">{ninuContactInfo.company}</p>
                  <p className="text-blue-200 text-sm">{ninuContactInfo.location}</p>
                </div>

                {/* Contacto */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                  <div className="space-y-2 text-blue-100">
                    <p>📧 {ninuContactInfo.email}</p>
                    <p>🌐 {ninuContactInfo.website}</p>
                    <div className="space-y-1">
                      <p>📱 Facebook: {ninuContactInfo.social.facebook}</p>
                      <p>🐦 Twitter: {ninuContactInfo.social.twitter}</p>
                      <p>📺 YouTube: {ninuContactInfo.social.youtube}</p>
                    </div>
                  </div>
                </div>

                {/* Categorías de productos */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-4">Nuestros Productos</h3>
                  <div className="grid grid-cols-2 gap-2 text-blue-100">
                    {ninuCategories.slice(0, 8).map((category) => (
                      <div key={category.id} className="flex items-center space-x-2 text-sm">
                        <span>{category.icon}</span>
                        <span className="truncate">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200 text-sm">
                <p>© 2024 {ninuContactInfo.company} - Todos los derechos reservados</p>
                <p>Sistema de Control de Producción - Productos con Registro COFEPRIS</p>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Floating WhatsApp Widget */}
        <FloatingWhatsApp phoneNumber="5222999399" />
      </body>
    </html>
  )
}
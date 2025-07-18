'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  MessageCircle, 
  Phone, 
  Package, 
  Shield, 
  Sparkles,
  Home,
  Info,
  Award,
  Truck
} from 'lucide-react'

const FloatingNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setIsScrolled(currentScrollY > 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/productos', label: 'Productos', icon: Package },
    { href: '/certificaciones', label: 'COFEPRIS', icon: Shield },
    { href: '/nosotros', label: 'Nosotros', icon: Info },
  ]

  return (
    <>
      {/* Main Navigation */}
      <nav 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
        }`}
      >
        <Card 
          className={`transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/90 backdrop-blur-md shadow-2xl border-0' 
              : 'bg-white/10 backdrop-blur-md border border-white/20'
          }`}
        >
          <div className="px-6 py-3">
            <div className="flex items-center justify-between gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div className="hidden lg:block">
                  <span className={`font-black text-lg ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                    NINU.MX
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="new" className="text-xs px-2 py-0 animate-pulse">
                      REVOLUCIONARIO
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                        isScrolled 
                          ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' 
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3">
                <Button 
                  size="sm"
                  className="hidden md:flex bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-all duration-200 rounded-xl group"
                >
                  <MessageCircle className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  WhatsApp
                </Button>
                
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:scale-105 transition-all duration-200 rounded-xl group"
                >
                  <ShoppingCart className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                  <span className="hidden sm:inline">Comprar</span>
                </Button>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`lg:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <Card className="fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
            <div className="p-6">
              <div className="space-y-4">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </Link>
                  )
                })}
                
                <div className="border-t pt-4 space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                  </Button>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Comprar en Mercado Libre
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Contact Bubble */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">En línea</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Trust Indicators Strip */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-500 ${
          isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <Card className="bg-white/95 backdrop-blur-md border-0 border-t shadow-2xl">
          <div className="px-4 py-2">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-700">COFEPRIS Certificado</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-gray-700">1000+ Familias</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-700">Envío Nacional</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

export default FloatingNavigation
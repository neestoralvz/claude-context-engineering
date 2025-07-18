'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Star, Sparkles, MessageCircle, Phone, Package, CheckCircle, Heart, Zap } from 'lucide-react'

const RevolutionaryHero = () => {
  const [currentStat, setCurrentStat] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { icon: "🏆", value: "100%", label: "Certificado COFEPRIS", subtitle: "Seguridad Garantizada", color: "green" },
    { icon: "❤️", value: "1000+", label: "Familias Satisfechas", subtitle: "En Mercado Libre", color: "blue" },
    { icon: "⭐", value: "4.9", label: "Calificación Promedio", subtitle: "Vendedor MercadoLíder", color: "yellow" },
    { icon: "🇲🇽", value: "Veracruz", label: "Hecho en México", subtitle: "Orgullo Nacional", color: "purple" }
  ]

  const urgencyMessages = [
    { text: "23 personas compraron esto hoy", icon: "🔥", variant: "trending" as const },
    { text: "Solo quedan 12 unidades", icon: "⚡", variant: "urgent" as const },
    { text: "Oferta especial del día", icon: "💥", variant: "offer" as const }
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-cyan-500/5 via-transparent to-pink-500/5 animate-pulse delay-1000"></div>
      </div>

      {/* Factory background with overlay */}
      <div className="absolute inset-0 opacity-10">
        <Image 
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&crop=center"
          alt="Ninu.mx factory background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        {/* Top badges with Y2K styling */}
        <div className={`text-center mb-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="trending" className="px-4 py-2 text-sm font-bold animate-bounce">
              🔥 TRENDING #1 EN LIMPIEZA
            </Badge>
            <Badge variant="bestseller" className="px-4 py-2 text-sm font-bold">
              🏆 BEST SELLER MERCADOLIBRE
            </Badge>
            <Badge variant="exclusive" className="px-4 py-2 text-sm font-bold">
              ⭐ CERTIFICADO COFEPRIS
            </Badge>
          </div>
        </div>

        {/* Main headline with bold typography trend */}
        <div className={`text-center mb-12 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              NINU.MX
            </span>
            <br />
            <span className="text-white text-3xl md:text-5xl lg:text-6xl font-extrabold">
              TU ALIADO ESENCIAL
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto font-medium">
            🧽 <strong>Productos de limpieza ecológicos premium</strong> que revolucionan tu hogar mexicano.
            <br />
            <span className="text-cyan-400 font-bold text-2xl">¡Más de 1000 familias ya confían en nosotros!</span>
          </p>
        </div>

        {/* Interactive CTAs with micro-animations */}
        <div className={`flex flex-col lg:flex-row gap-6 justify-center mb-12 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-lg font-bold py-6 px-8 rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 group"
          >
            <ShoppingCart className="mr-3 h-6 w-6 group-hover:animate-bounce" />
            🛒 COMPRAR EN MERCADO LIBRE
            <Sparkles className="ml-3 h-5 w-5 animate-pulse" />
          </Button>

          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-green-400 text-green-400 bg-green-400/10 backdrop-blur-sm text-lg font-bold py-6 px-8 rounded-2xl hover:bg-green-400 hover:text-black transition-all duration-300 shadow-2xl hover:shadow-green-400/25 group"
          >
            <MessageCircle className="mr-3 h-6 w-6 group-hover:animate-pulse" />
            💬 WHATSAPP AHORA
            <Zap className="ml-3 h-5 w-5 animate-bounce" />
          </Button>
        </div>

        {/* Urgency notifications with Mexican e-commerce psychology */}
        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {urgencyMessages.map((message, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-md border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-pulse">{message.icon}</span>
                  <Badge variant={message.variant} className="font-bold">
                    {message.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Animated stats with rotational effect */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto transition-all duration-1000 delay-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className={`bg-white/10 backdrop-blur-md border-0 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl ${
                index === currentStat ? 'ring-2 ring-cyan-400 scale-105' : ''
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3 animate-bounce">{stat.icon}</div>
                <div className={`text-3xl font-black mb-2 ${
                  stat.color === 'green' ? 'text-green-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  stat.color === 'yellow' ? 'text-yellow-400' :
                  'text-purple-400'
                }`}>
                  {stat.value}
                </div>
                <div className="text-white font-bold text-sm mb-1">{stat.label}</div>
                <div className="text-gray-300 text-xs">{stat.subtitle}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary actions with modern styling */}
        <div className={`flex flex-wrap justify-center gap-4 mt-12 transition-all duration-1000 delay-1200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Button variant="ghost" className="text-white border border-white/30 hover:bg-white/10 rounded-xl group">
            <Package className="mr-2 h-4 w-4 group-hover:animate-spin" />
            Ver Catálogo Completo
          </Button>
          <Button variant="ghost" className="text-white border border-white/30 hover:bg-white/10 rounded-xl group">
            <Phone className="mr-2 h-4 w-4 group-hover:animate-pulse" />
            📞 Llamar Directo
          </Button>
          <Button variant="ghost" className="text-white border border-white/30 hover:bg-white/10 rounded-xl group">
            <Heart className="mr-2 h-4 w-4 group-hover:animate-bounce" />
            Factory Tour Virtual
          </Button>
        </div>

        {/* AI-powered personalization hint */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="bg-gradient-to-r from-pink-500/10 to-violet-500/10 backdrop-blur-md border-0 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 text-white">
                <Sparkles className="h-5 w-5 animate-pulse text-pink-400" />
                <span className="text-sm font-medium">
                  💡 Productos recomendados para tu hogar mexicano
                </span>
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll indicator with Y2K style */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default RevolutionaryHero
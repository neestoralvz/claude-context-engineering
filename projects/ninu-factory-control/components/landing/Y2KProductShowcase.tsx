'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Sparkles, 
  Star, 
  ShoppingCart, 
  Zap, 
  TrendingUp, 
  Award, 
  Shield,
  Beaker,
  Leaf,
  Heart
} from 'lucide-react'

const Y2KProductShowcase = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [rotatingIndex, setRotatingIndex] = useState(0)

  const products = [
    {
      id: 1,
      name: "GEL ANTIBACTERIAL XTREME",
      category: "🧽 Limpieza",
      price: 299.99,
      originalPrice: 399.99,
      description: "Fórmula revolucionaria con 70% alcohol etílico",
      image: "🧴",
      badges: ["bestseller", "trending", "cofepris"],
      stats: {
        sold: "2.5K vendidos",
        rating: 4.9,
        reviews: 834
      },
      features: ["70% Alcohol", "Aroma Fresh", "No Reseca", "5L Rendidor"],
      urgency: "Solo quedan 8 unidades",
      discount: 25,
      color: "from-blue-500 to-cyan-400"
    },
    {
      id: 2,
      name: "SANITIZANTE MEGA POWER",
      category: "🦠 Desinfección",
      price: 189.99,
      originalPrice: 249.99,
      description: "Elimina 99.9% bacterias y virus",
      image: "🧪",
      badges: ["new", "exclusive", "recommended"],
      stats: {
        sold: "1.8K vendidos",
        rating: 4.8,
        reviews: 567
      },
      features: ["Acción Rápida", "Biodegradable", "Sin Químicos", "Aroma Neutro"],
      urgency: "¡Oferta del día!",
      discount: 24,
      color: "from-purple-500 to-pink-400"
    },
    {
      id: 3,
      name: "JABÓN ULTRA CLEAN",
      category: "🍽️ Trastes",
      price: 149.99,
      originalPrice: 199.99,
      description: "Concentrado que rinde hasta 3 meses",
      image: "🫧",
      badges: ["urgent", "offer", "bestseller"],
      stats: {
        sold: "3.2K vendidos",
        rating: 5.0,
        reviews: 1203
      },
      features: ["Súper Concentrado", "Corta Grasa", "Aroma Limón", "Eco-Friendly"],
      urgency: "23 personas lo compraron hoy",
      discount: 25,
      color: "from-green-500 to-teal-400"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % products.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [products.length])

  const renderBadge = (badgeType: string) => {
    const badgeMap = {
      bestseller: { variant: "bestseller" as const, text: "🏆 BEST SELLER", animation: "animate-pulse" },
      trending: { variant: "trending" as const, text: "🔥 TRENDING", animation: "animate-bounce" },
      cofepris: { variant: "cofepris" as const, text: "✅ COFEPRIS", animation: "" },
      new: { variant: "new" as const, text: "⭐ NUEVO", animation: "animate-pulse" },
      exclusive: { variant: "exclusive" as const, text: "💎 EXCLUSIVO", animation: "" },
      recommended: { variant: "recommended" as const, text: "👍 RECOMENDADO", animation: "" },
      urgent: { variant: "urgent" as const, text: "⚡ URGENTE", animation: "animate-ping" },
      offer: { variant: "offer" as const, text: "💥 OFERTA", animation: "animate-bounce" }
    }

    const badge = badgeMap[badgeType as keyof typeof badgeMap]
    if (!badge) return null

    return (
      <Badge 
        variant={badge.variant} 
        className={`text-xs font-bold px-2 py-1 ${badge.animation}`}
      >
        {badge.text}
      </Badge>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-20 relative overflow-hidden">
      {/* Y2K Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="grid grid-cols-8 gap-4 h-full">
            {[...Array(64)].map((_, i) => (
              <div 
                key={i} 
                className={`bg-gradient-to-br ${i % 3 === 0 ? 'from-cyan-400 to-blue-500' : i % 3 === 1 ? 'from-pink-400 to-purple-500' : 'from-yellow-400 to-orange-500'} animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${2 + (i % 3)}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Y2K styling */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge variant="trending" className="px-6 py-3 text-lg font-black animate-bounce">
              🚀 PRODUCTOS Y2K REVOLUTION 2025 🚀
            </Badge>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-6 animate-pulse">
            NINU XTREME
          </h2>
          
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-bold">
            🔥 La revolución de la limpieza ha llegado 🔥
            <br />
            <span className="text-cyan-400 text-2xl">¡PRODUCTOS QUE EXPLOTAN DE PODER!</span>
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`bg-black/20 backdrop-blur-md border-2 border-white/20 overflow-hidden transition-all duration-500 hover:scale-105 hover:border-white/40 cursor-pointer ${
                index === rotatingIndex ? 'ring-4 ring-cyan-400 scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <CardHeader className="relative">
                {/* Product badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.badges.map((badge, idx) => (
                    <div key={idx}>
                      {renderBadge(badge)}
                    </div>
                  ))}
                </div>

                {/* Product visual */}
                <div className={`relative h-32 bg-gradient-to-br ${product.color} rounded-xl flex items-center justify-center mb-4 overflow-hidden`}>
                  <div className="text-6xl animate-bounce">{product.image}</div>
                  {hoveredProduct === product.id && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-white font-black text-lg animate-pulse">
                        ¡CLICK PARA COMPRAR!
                      </div>
                    </div>
                  )}
                  
                  {/* Discount badge */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full animate-pulse">
                    -{product.discount}%
                  </div>
                </div>

                {/* Category */}
                <Badge variant="secondary" className="mb-2 w-fit">
                  {product.category}
                </Badge>

                <h3 className="text-xl font-black text-white mb-2">
                  {product.name}
                </h3>
                
                <p className="text-white/80 text-sm mb-4">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-green-400">
                    ${product.price}
                  </span>
                  <span className="text-lg text-white/60 line-through">
                    ${product.originalPrice}
                  </span>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  {product.features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center text-white text-xs font-bold"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-bold">{product.stats.rating}</span>
                    <span>({product.stats.reviews})</span>
                  </div>
                  <div className="font-bold text-cyan-400">
                    {product.stats.sold}
                  </div>
                </div>

                {/* Urgency message */}
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-2 text-center">
                  <div className="text-red-300 text-sm font-bold animate-pulse">
                    🚨 {product.urgency}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-lg py-3 rounded-xl hover:scale-105 transition-all duration-200 group"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                    COMPRAR AHORA
                    <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-cyan-400 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400 hover:text-black font-bold rounded-xl group"
                  >
                    <Zap className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                    VER DETALLES
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom stats with Y2K styling */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: TrendingUp, value: "7.5K+", label: "Productos Vendidos", color: "text-green-400" },
            { icon: Award, value: "4.9⭐", label: "Rating Promedio", color: "text-yellow-400" },
            { icon: Shield, value: "100%", label: "COFEPRIS Certified", color: "text-blue-400" },
            { icon: Heart, value: "95%", label: "Clientes Regresan", color: "text-pink-400" }
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="bg-black/30 backdrop-blur-md border border-white/20 text-center">
                <CardContent className="p-6">
                  <IconComponent className={`h-8 w-8 mx-auto mb-3 ${stat.color} animate-pulse`} />
                  <div className={`text-2xl font-black mb-1 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm font-bold">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-black text-xl px-12 py-6 rounded-2xl hover:scale-110 transition-all duration-300 shadow-2xl animate-pulse"
          >
            🚀 ¡REVOLUCIÓN COMPLETA AHORA! 🚀
          </Button>
          
          <p className="text-white/80 mt-4 font-bold">
            🔥 No te quedes atrás en la revolución de la limpieza 🔥
          </p>
        </div>
      </div>
    </div>
  )
}

export default Y2KProductShowcase
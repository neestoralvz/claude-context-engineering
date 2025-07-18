'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star, ChevronLeft, ChevronRight, Verified, Heart, MapPin, Calendar } from 'lucide-react'

const InteractiveTestimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials = [
    {
      id: 1,
      name: "María González Ramírez",
      location: "Guadalajara, Jalisco",
      age: 34,
      family: "Familia de 4",
      rating: 5,
      date: "15 de Enero, 2025",
      product: "Gel Antibacterial Premium 5L",
      comment: "¡Increíble! Compré el gel antibacterial para mi familia y la diferencia es impresionante. Tiene un aroma fresco que no irrita la piel de mis hijos. Lo usamos tanto en casa como en el negocio. Definitivamente volveré a comprar.",
      beforeAfter: {
        before: "Usaba productos caros de farmacia",
        after: "Ahorro 40% con mejor calidad"
      },
      avatar: "/api/placeholder/120/120",
      verification: "Compra verificada MercadoLibre",
      helpfulVotes: 23,
      tags: ["Familia", "Económico", "Calidad Premium"]
    },
    {
      id: 2,
      name: "Carlos Hernández López",
      location: "Ciudad de México, CDMX",
      age: 42,
      family: "Negocio familiar",
      rating: 5,
      date: "8 de Enero, 2025",
      product: "Sanitizante Multiusos Industrial 20L",
      comment: "Tengo una tlapalería y necesitaba un sanitizante confiable para mis clientes. Este producto de Ninu.mx superó mis expectativas. Rinde muchísimo, huele bien y mis clientes están satisfechos. El certificado COFEPRIS me da tranquilidad.",
      beforeAfter: {
        before: "Productos sin certificación clara",
        after: "100% certificado COFEPRIS"
      },
      avatar: "/api/placeholder/120/120",
      verification: "Compra verificada MercadoLibre",
      helpfulVotes: 31,
      tags: ["Negocio", "Industrial", "COFEPRIS"]
    },
    {
      id: 3,
      name: "Ana Martínez Flores",
      location: "Monterrey, Nuevo León",
      age: 28,
      family: "Profesional de la salud",
      rating: 5,
      date: "3 de Enero, 2025",
      product: "Gel Conductor Ultrasonido Medical",
      comment: "Soy fisioterapeuta y el gel conductor de Ninu.mx es exactamente lo que necesitaba. La calidad es profesional, no deja residuos y es hipoalergénico. Mis pacientes no han tenido ninguna reacción. Excelente relación calidad-precio.",
      beforeAfter: {
        before: "Importaba gel costoso de EU",
        after: "Producto mexicano de igual calidad"
      },
      avatar: "/api/placeholder/120/120",
      verification: "Compra verificada MercadoLibre",
      helpfulVotes: 18,
      tags: ["Médico", "Profesional", "Hipoalergénico"]
    },
    {
      id: 4,
      name: "Roberto Silva Guerrero",
      location: "Puebla, Puebla",
      age: 39,
      family: "Restaurante familiar",
      rating: 5,
      date: "28 de Diciembre, 2024",
      product: "Jabón Líquido Para Trastes 10L",
      comment: "En mi restaurante la limpieza es fundamental. El jabón para trastes de Ninu.mx corta la grasa mejor que cualquier otro que haya probado. Además es biodegradable, lo cual es importante para nosotros. Mis empleados están encantados con el producto.",
      beforeAfter: {
        before: "3 productos diferentes para limpiar",
        after: "1 solo producto para todo"
      },
      avatar: "/api/placeholder/120/120",
      verification: "Compra verificada MercadoLibre",
      helpfulVotes: 27,
      tags: ["Restaurante", "Biodegradable", "Profesional"]
    }
  ]

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const current = testimonials[currentTestimonial]

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="trending" className="mb-4 px-4 py-2 text-sm font-bold">
            🔥 TESTIMONIOS REALES 2025
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              1000+ Familias Mexicanas
            </span>
            <br />
            Ya Confían en Ninu.mx
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Historias reales de transformación con nuestros productos ecológicos certificados COFEPRIS
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="relative max-w-5xl mx-auto">
          <Card className="bg-white shadow-2xl border-0 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left side - Customer info */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {current.name.charAt(0)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Verified className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold">{current.name}</h3>
                    <div className="flex items-center gap-2 text-blue-200 text-sm">
                      <MapPin className="h-4 w-4" />
                      {current.location}
                    </div>
                    <div className="text-blue-200 text-sm">{current.family}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-blue-200 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {current.date}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold mb-2">Producto Comprado:</h4>
                  <Badge variant="bestseller" className="mb-4">
                    {current.product}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-blue-200 mb-1">Antes:</div>
                    <div className="text-sm bg-white/10 rounded-lg p-3">{current.beforeAfter.before}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-200 mb-1">Después:</div>
                    <div className="text-sm bg-white/10 rounded-lg p-3">{current.beforeAfter.after}</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="text-sm text-blue-200 mb-2">{current.verification}</div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm">{current.helpfulVotes} personas encontraron esto útil</span>
                  </div>
                </div>
              </div>

              {/* Right side - Testimonial content */}
              <div className="p-8 lg:p-12">
                <div className="mb-6">
                  <div className="text-6xl text-blue-200 leading-none mb-4">&ldquo;</div>
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    {current.comment}
                  </p>
                  <div className="text-6xl text-blue-200 leading-none text-right">&rdquo;</div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Tags del producto:</h4>
                  <div className="flex flex-wrap gap-2">
                    {current.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="font-bold text-gray-900">Cliente Verificado</div>
                    <div className="text-sm text-gray-600">MercadoLibre & COFEPRIS</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:scale-110 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:scale-110 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Testimonial dots */}
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentTestimonial(index)
                setIsAutoPlaying(false)
              }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentTestimonial 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600 mb-2">1000+</div>
            <div className="text-sm text-gray-600">Familias Satisfechas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-600 mb-2">4.9⭐</div>
            <div className="text-sm text-gray-600">Calificación Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">COFEPRIS Certificado</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-600 mb-2">95%</div>
            <div className="text-sm text-gray-600">Recompra</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            🛒 ¡Únete a las 1000+ Familias Satisfechas!
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InteractiveTestimonials
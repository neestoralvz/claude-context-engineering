import { Clock, TrendingUp, Users, Star, Zap, Award, Gift, AlertTriangle, Activity } from 'lucide-react'

interface UrgencyBadgeProps {
  type: 'stock' | 'popular' | 'offer' | 'new' | 'bestseller' | 'trending' | 'exclusive' | 'recommended' | 'limited_time'
  value?: string | number
  className?: string
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical'
}

export function UrgencyBadge({ type, value, className = '', urgencyLevel = 'medium' }: UrgencyBadgeProps) {
  const urgencyConfig = {
    stock: {
      icon: AlertTriangle,
      color: urgencyLevel === 'critical' 
        ? 'bg-red-600 text-white border border-red-700' 
        : urgencyLevel === 'high'
        ? 'bg-red-500 text-white'
        : 'bg-orange-500 text-white',
      text: `¡Solo quedan ${value} unidades!`,
      animation: urgencyLevel === 'critical' ? 'animate-pulse' : ''
    },
    popular: {
      icon: Users,
      color: 'bg-green-500 text-white shadow-lg',
      text: `${value} personas compraron esto hoy`,
      animation: 'hover:scale-105 transition-transform'
    },
    offer: {
      icon: Gift,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
      text: value ? `¡${value}% de descuento!` : '¡Oferta especial!',
      animation: 'animate-bounce'
    },
    new: {
      icon: Star,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
      text: '¡Nuevo producto!',
      animation: 'hover:scale-105 transition-transform'
    },
    bestseller: {
      icon: Award,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg',
      text: '🏆 Más vendido',
      animation: 'hover:scale-105 transition-transform'
    },
    trending: {
      icon: Activity,
      color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg',
      text: '🔥 Tendencia',
      animation: 'hover:scale-105 transition-transform'
    },
    exclusive: {
      icon: Zap,
      color: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg',
      text: '⭐ Exclusivo Ninu',
      animation: 'hover:scale-105 transition-transform'
    },
    recommended: {
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg',
      text: '👍 Recomendado',
      animation: 'hover:scale-105 transition-transform'
    },
    limited_time: {
      icon: Clock,
      color: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg',
      text: value ? `⏰ Termina en ${value}` : '⏰ Tiempo limitado',
      animation: 'animate-pulse'
    }
  }

  const config = urgencyConfig[type]
  const IconComponent = config.icon

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transform ${config.color} ${config.animation} ${className}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      <span>{config.text}</span>
    </div>
  )
}

export default UrgencyBadge
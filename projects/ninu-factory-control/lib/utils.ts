import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida'
  }
  
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function getStatusColor(status: string): string {
  const colors = {
    idle: 'text-gray-500 bg-gray-100',
    running: 'text-green-600 bg-green-100',
    mixing: 'text-blue-600 bg-blue-100',
    heating: 'text-orange-600 bg-orange-100',
    cooling: 'text-cyan-600 bg-cyan-100',
    completed: 'text-green-600 bg-green-100',
    error: 'text-red-600 bg-red-100',
    maintenance: 'text-yellow-600 bg-yellow-100',
    warning: 'text-yellow-600 bg-yellow-100',
    critical: 'text-red-600 bg-red-100'
  }
  
  return colors[status as keyof typeof colors] || 'text-gray-500 bg-gray-100'
}

export function calculateEfficiency(actual: number, target: number): number {
  return Math.round((actual / target) * 100)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isWithinRange(value: number, range: [number, number]): boolean {
  return value >= range[0] && value <= range[1]
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export function getAlertSeverityColor(severity: string): string {
  const colors = {
    low: 'text-blue-600 bg-blue-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100'
  }
  
  return colors[severity as keyof typeof colors] || 'text-gray-500 bg-gray-100'
}

// Customer Management Utilities
export function getCustomerStatusColor(status: string): string {
  const colors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    vip: 'text-purple-600 bg-purple-100',
    suspended: 'text-red-600 bg-red-100'
  }
  
  return colors[status as keyof typeof colors] || 'text-gray-500 bg-gray-100'
}

export function getCustomerTypeColor(type: string): string {
  const colors = {
    individual: 'text-blue-600 bg-blue-100',
    business: 'text-green-600 bg-green-100',
    distributor: 'text-purple-600 bg-purple-100',
    government: 'text-orange-600 bg-orange-100'
  }
  
  return colors[type as keyof typeof colors] || 'text-gray-500 bg-gray-100'
}

export function getPaymentStatusColor(status: string): string {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-100',
    partial: 'text-orange-600 bg-orange-100',
    paid: 'text-green-600 bg-green-100',
    overdue: 'text-red-600 bg-red-100'
  }
  
  return colors[status as keyof typeof colors] || 'text-gray-500 bg-gray-100'
}

export function calculateCustomerScore(metrics: any): number {
  // Weighted score calculation for customer value
  const weights = {
    lifetime_value: 0.3,
    payment_punctuality: 0.25,
    order_frequency: 0.2,
    last_activity: 0.15,
    satisfaction: 0.1
  }
  
  const normalizedValues = {
    lifetime_value: Math.min(100, (metrics.lifetime_value / 100000) * 100), // Normalize to 100k
    payment_punctuality: metrics.payment_punctuality,
    order_frequency: Math.max(0, 100 - (metrics.order_frequency_days / 30) * 100), // More frequent = higher score
    last_activity: metrics.last_activity_score,
    satisfaction: (metrics.satisfaction_rating || 3) * 20 // Convert 1-5 to 0-100
  }
  
  return Math.round(
    normalizedValues.lifetime_value * weights.lifetime_value +
    normalizedValues.payment_punctuality * weights.payment_punctuality +
    normalizedValues.order_frequency * weights.order_frequency +
    normalizedValues.last_activity * weights.last_activity +
    normalizedValues.satisfaction * weights.satisfaction
  )
}

export function getActivityLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Muy Activo', color: 'text-green-600 bg-green-100' }
  if (score >= 60) return { label: 'Activo', color: 'text-blue-600 bg-blue-100' }
  if (score >= 40) return { label: 'Moderado', color: 'text-yellow-600 bg-yellow-100' }
  if (score >= 20) return { label: 'Bajo', color: 'text-orange-600 bg-orange-100' }
  return { label: 'Inactivo', color: 'text-red-600 bg-red-100' }
}

export function formatCustomerType(type: string): string {
  const types = {
    individual: 'Persona Física',
    business: 'Empresa',
    distributor: 'Distribuidor',
    government: 'Gobierno'
  }
  
  return types[type as keyof typeof types] || type
}

export function daysSinceLastOrder(lastOrderDate?: string): number {
  if (!lastOrderDate) return Infinity
  
  const lastOrder = new Date(lastOrderDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastOrder.getTime())
  
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
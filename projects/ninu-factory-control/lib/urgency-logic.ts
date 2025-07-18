import { Product, UrgencyIndicators } from '../types'

export interface UrgencyBadgeData {
  type: 'stock' | 'popular' | 'offer' | 'new' | 'bestseller' | 'trending' | 'exclusive' | 'recommended' | 'limited_time'
  value?: string | number
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical'
  priority: number // Higher numbers show first
}

/**
 * Mexican E-commerce Psychology:
 * - Stock scarcity is HIGHLY effective (Mexican consumers fear missing out)
 * - Social proof is important ("X personas compraron")
 * - Time-limited offers create urgency
 * - "Nuevo" and "Recomendado" badges build trust
 * - Best seller badges follow Mercado Libre patterns
 */
export function calculateUrgencyBadges(product: Product): UrgencyBadgeData[] {
  const badges: UrgencyBadgeData[] = []
  const indicators = product.urgencyIndicators

  if (!indicators) return badges

  // 1. CRITICAL STOCK URGENCY (Highest Priority)
  if (indicators.showLowStockWarning && indicators.lowStockThreshold) {
    if (product.currentStock <= indicators.lowStockThreshold) {
      let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
      
      if (product.currentStock <= 3) urgencyLevel = 'critical'
      else if (product.currentStock <= 5) urgencyLevel = 'high'
      else if (product.currentStock <= 10) urgencyLevel = 'medium'
      
      badges.push({
        type: 'stock',
        value: product.currentStock,
        urgencyLevel,
        priority: urgencyLevel === 'critical' ? 100 : urgencyLevel === 'high' ? 90 : 80
      })
    }
  }

  // 2. PROMOTIONAL OFFERS (High Priority)
  if (indicators.isOnSale && indicators.salePercentage) {
    badges.push({
      type: 'offer',
      value: indicators.salePercentage,
      urgencyLevel: 'high',
      priority: 85
    })
  }

  // 3. LIMITED TIME OFFERS (High Priority)
  if (indicators.limitedTimeOffer && indicators.offerEndDate) {
    const endDate = new Date(indicators.offerEndDate)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft > 0 && daysLeft <= 7) {
      badges.push({
        type: 'limited_time',
        value: `${daysLeft} días`,
        urgencyLevel: daysLeft <= 2 ? 'critical' : daysLeft <= 4 ? 'high' : 'medium',
        priority: daysLeft <= 2 ? 95 : 75
      })
    }
  }

  // 4. BEST SELLER (Medium-High Priority)
  if (indicators.bestSeller) {
    badges.push({
      type: 'bestseller',
      urgencyLevel: 'medium',
      priority: 70
    })
  }

  // 5. TRENDING PRODUCT (Medium-High Priority)
  if (indicators.trendingProduct) {
    badges.push({
      type: 'trending',
      urgencyLevel: 'medium',
      priority: 68
    })
  }

  // 6. POPULARITY INDICATORS (Medium Priority)
  if (indicators.showPopularityBadge && indicators.dailyPurchases && indicators.dailyPurchases > 0) {
    badges.push({
      type: 'popular',
      value: indicators.dailyPurchases,
      urgencyLevel: indicators.dailyPurchases > 30 ? 'high' : indicators.dailyPurchases > 15 ? 'medium' : 'low',
      priority: 60
    })
  }

  // 7. EXCLUSIVE NINU OFFER (Medium Priority)
  if (indicators.exclusiveOffer) {
    badges.push({
      type: 'exclusive',
      urgencyLevel: 'medium',
      priority: 55
    })
  }

  // 8. RECOMMENDED PRODUCT (Medium Priority)
  if (indicators.recommendedProduct) {
    badges.push({
      type: 'recommended',
      urgencyLevel: 'medium',
      priority: 50
    })
  }

  // 9. NEW PRODUCT (Lower Priority)
  if (indicators.isNewProduct && indicators.showNewBadge) {
    // Only show "new" for products launched within last 60 days
    if (indicators.launchDate) {
      const launchDate = new Date(indicators.launchDate)
      const now = new Date()
      const daysOld = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysOld <= 60) {
        badges.push({
          type: 'new',
          urgencyLevel: 'medium',
          priority: 40
        })
      }
    }
  }

  // Sort by priority (highest first) and return max 3 badges for clean UI
  return badges
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
}

/**
 * Calculate urgency level for the entire product (for sorting/filtering)
 */
export function calculateProductUrgencyScore(product: Product): number {
  const badges = calculateUrgencyBadges(product)
  
  if (badges.length === 0) return 0
  
  // Weight urgency levels
  const urgencyWeights = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  }
  
  // Sum weighted scores with priority multiplier
  return badges.reduce((score, badge) => {
    const urgencyWeight = urgencyWeights[badge.urgencyLevel || 'low']
    const priorityMultiplier = badge.priority / 100
    return score + (urgencyWeight * priorityMultiplier)
  }, 0)
}

/**
 * Mexican-specific urgency messages for better conversion
 */
export function getUrgencyMessage(badgeType: string, value?: string | number): string {
  const messages = {
    stock: `¡Solo quedan ${value} unidades!`,
    popular: `${value} personas compraron esto hoy`,
    offer: value ? `¡${value}% de descuento!` : '¡Oferta especial!',
    new: '¡Nuevo producto!',
    bestseller: '🏆 Más vendido',
    trending: '🔥 Tendencia',
    exclusive: '⭐ Exclusivo Ninu',
    recommended: '👍 Recomendado',
    limited_time: value ? `⏰ Termina en ${value}` : '⏰ Tiempo limitado'
  }
  
  return messages[badgeType as keyof typeof messages] || ''
}

/**
 * Determine if product should be featured prominently based on urgency
 */
export function shouldHighlightProduct(product: Product): boolean {
  const urgencyScore = calculateProductUrgencyScore(product)
  return urgencyScore >= 150 // High urgency threshold
}

/**
 * Sort products by urgency for optimal conversion
 */
export function sortProductsByUrgency(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const scoreA = calculateProductUrgencyScore(a)
    const scoreB = calculateProductUrgencyScore(b)
    return scoreB - scoreA // Highest urgency first
  })
}
import { calculateUrgencyBadges, calculateProductUrgencyScore, shouldHighlightProduct } from '../lib/urgency-logic'
import { Product } from '../types'

describe('Urgency Logic for Mexican E-commerce', () => {
  const mockBaseProduct: Product = {
    id: 'test-001',
    name: 'Test Product',
    category: 'limpieza',
    description: 'Test description',
    size: 1,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Test ingredient'],
    useCase: ['Test use'],
    shelfLife: 24,
    currentStock: 100,
    minStock: 20,
    productionCost: 50,
    salePrice: 100
  }

  describe('calculateUrgencyBadges', () => {
    it('should return empty array when no urgency indicators', () => {
      const badges = calculateUrgencyBadges(mockBaseProduct)
      expect(badges).toEqual([])
    })

    it('should return critical stock warning for very low stock', () => {
      const product: Product = {
        ...mockBaseProduct,
        currentStock: 2,
        urgencyIndicators: {
          lowStockThreshold: 10,
          showLowStockWarning: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges).toHaveLength(1)
      expect(badges[0].type).toBe('stock')
      expect(badges[0].urgencyLevel).toBe('critical')
      expect(badges[0].value).toBe(2)
    })

    it('should return best seller badge', () => {
      const product: Product = {
        ...mockBaseProduct,
        urgencyIndicators: {
          bestSeller: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges).toHaveLength(1)
      expect(badges[0].type).toBe('bestseller')
    })

    it('should return popular badge with daily purchases', () => {
      const product: Product = {
        ...mockBaseProduct,
        urgencyIndicators: {
          dailyPurchases: 45,
          showPopularityBadge: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges).toHaveLength(1)
      expect(badges[0].type).toBe('popular')
      expect(badges[0].value).toBe(45)
      expect(badges[0].urgencyLevel).toBe('high')
    })

    it('should return sale offer badge', () => {
      const product: Product = {
        ...mockBaseProduct,
        urgencyIndicators: {
          isOnSale: true,
          salePercentage: 25
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges).toHaveLength(1)
      expect(badges[0].type).toBe('offer')
      expect(badges[0].value).toBe(25)
    })

    it('should prioritize badges correctly (stock > sale > bestseller)', () => {
      const product: Product = {
        ...mockBaseProduct,
        currentStock: 3,
        urgencyIndicators: {
          lowStockThreshold: 10,
          showLowStockWarning: true,
          isOnSale: true,
          salePercentage: 20,
          bestSeller: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges).toHaveLength(3)
      expect(badges[0].type).toBe('stock') // Highest priority
      expect(badges[1].type).toBe('offer') // Second priority
      expect(badges[2].type).toBe('bestseller') // Third priority
    })
  })

  describe('calculateProductUrgencyScore', () => {
    it('should return 0 for product with no urgency indicators', () => {
      const score = calculateProductUrgencyScore(mockBaseProduct)
      expect(score).toBe(0)
    })

    it('should return high score for critical stock product', () => {
      const product: Product = {
        ...mockBaseProduct,
        currentStock: 1,
        urgencyIndicators: {
          lowStockThreshold: 10,
          showLowStockWarning: true
        }
      }

      const score = calculateProductUrgencyScore(product)
      expect(score).toBeGreaterThanOrEqual(100)
    })
  })

  describe('shouldHighlightProduct', () => {
    it('should return false for product with no urgency indicators', () => {
      const shouldHighlight = shouldHighlightProduct(mockBaseProduct)
      expect(shouldHighlight).toBe(false)
    })

    it('should return true for high urgency product', () => {
      const product: Product = {
        ...mockBaseProduct,
        currentStock: 2,
        urgencyIndicators: {
          lowStockThreshold: 10,
          showLowStockWarning: true,
          isOnSale: true,
          salePercentage: 30,
          bestSeller: true
        }
      }

      const shouldHighlight = shouldHighlightProduct(product)
      expect(shouldHighlight).toBe(true)
    })
  })

  describe('Mexican E-commerce Psychology Features', () => {
    it('should handle "Solo quedan X unidades" messaging', () => {
      const product: Product = {
        ...mockBaseProduct,
        currentStock: 5,
        urgencyIndicators: {
          lowStockThreshold: 10,
          showLowStockWarning: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges[0].value).toBe(5) // Should show exact count
    })

    it('should handle "X personas compraron esto hoy" messaging', () => {
      const product: Product = {
        ...mockBaseProduct,
        urgencyIndicators: {
          dailyPurchases: 67,
          showPopularityBadge: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges[0].value).toBe(67) // Should show exact purchase count
    })

    it('should handle trending product in Mercado Libre style', () => {
      const product: Product = {
        ...mockBaseProduct,
        urgencyIndicators: {
          trendingProduct: true
        }
      }

      const badges = calculateUrgencyBadges(product)
      expect(badges[0].type).toBe('trending')
    })
  })
})
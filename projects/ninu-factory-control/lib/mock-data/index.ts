/**
 * Mock Data Hub - Central Export Index
 * 
 * This hub re-exports all mock data from specialized modules following Principle #58.
 * Each module maintains ≤500 lines while preserving full functionality and TypeScript types.
 * 
 * @fileoverview Central mock data hub with domain-specific modularization
 * @module MockDataHub
 */

// System and Company Data
export { 
  ninuCategories,
  ninuContactInfo
} from './system-data'

// Product Data
import { primaryProducts } from './product-data-primary'
import { secondaryProducts } from './product-data-secondary'

export { 
  primaryProducts 
} from './product-data-primary'
export { 
  secondaryProducts 
} from './product-data-secondary'

// Combined products export for compatibility
export const mockProducts = [
  ...primaryProducts,
  ...secondaryProducts
]

// Production Data
export { 
  mockReactors,
  mockStations,
  mockAlerts,
  mockProductionMetrics,
  mockMetrics,
  generateResourceUtilization,
  generateTrendData
} from './production-data'

// Supplier Data
export { 
  mockSuppliers 
} from './supplier-data'

// Inventory Data
export { 
  mockAdvancedRawMaterials,
  mockAdvancedInventoryItems,
  mockInventoryMovements
} from './inventory-data'

// Analytics Data
export { 
  mockSmartInventoryAlerts
} from './analytics-data'

// Re-export types for compatibility
export type * from '../types'
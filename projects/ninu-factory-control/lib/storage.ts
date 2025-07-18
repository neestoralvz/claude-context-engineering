// Local Storage utilities for production data persistence
import { ProductionOrder } from '../types'

const STORAGE_KEYS = {
  PRODUCTION_ORDERS: 'ninu_production_orders',
  REACTOR_SETTINGS: 'ninu_reactor_settings',
  STATION_SETTINGS: 'ninu_station_settings',
  DASHBOARD_CONFIG: 'ninu_dashboard_config'
} as const

// Production Orders Storage
export const productionOrderStorage = {
  get: (): ProductionOrder[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTION_ORDERS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading production orders from storage:', error)
      return []
    }
  },

  set: (orders: ProductionOrder[]): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTION_ORDERS, JSON.stringify(orders))
    } catch (error) {
      console.error('Error saving production orders to storage:', error)
    }
  },

  add: (order: ProductionOrder): void => {
    const orders = productionOrderStorage.get()
    orders.push(order)
    productionOrderStorage.set(orders)
  },

  update: (orderId: string, updates: Partial<ProductionOrder>): void => {
    const orders = productionOrderStorage.get()
    const index = orders.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates }
      productionOrderStorage.set(orders)
    }
  },

  remove: (orderId: string): void => {
    const orders = productionOrderStorage.get()
    const filtered = orders.filter(o => o.id !== orderId)
    productionOrderStorage.set(filtered)
  },

  clear: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTION_ORDERS)
    }
  }
}

// Reactor Settings Storage
export interface ReactorSettings {
  id: string
  temperature: number
  pressure: number
  mixingSpeed: number
  autoMode: boolean
  safetyLimits: {
    maxTemperature: number
    maxPressure: number
    maxSpeed: number
  }
}

export const reactorSettingsStorage = {
  get: (reactorId: string): ReactorSettings | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.REACTOR_SETTINGS}_${reactorId}`)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error reading reactor settings from storage:', error)
      return null
    }
  },

  set: (settings: ReactorSettings): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`${STORAGE_KEYS.REACTOR_SETTINGS}_${settings.id}`, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving reactor settings to storage:', error)
    }
  },

  getAll: (): ReactorSettings[] => {
    if (typeof window === 'undefined') return []
    const settings: ReactorSettings[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEYS.REACTOR_SETTINGS)) {
          const stored = localStorage.getItem(key)
          if (stored) {
            settings.push(JSON.parse(stored))
          }
        }
      }
    } catch (error) {
      console.error('Error reading all reactor settings:', error)
    }
    return settings
  }
}

// Station Settings Storage
export interface StationSettings {
  id: string
  efficiencyTarget: number
  autoQueue: boolean
  maintenanceSchedule: string[]
  qualityChecks: boolean
}

export const stationSettingsStorage = {
  get: (stationId: string): StationSettings | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.STATION_SETTINGS}_${stationId}`)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error reading station settings from storage:', error)
      return null
    }
  },

  set: (settings: StationSettings): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`${STORAGE_KEYS.STATION_SETTINGS}_${settings.id}`, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving station settings to storage:', error)
    }
  },

  getAll: (): StationSettings[] => {
    if (typeof window === 'undefined') return []
    const settings: StationSettings[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEYS.STATION_SETTINGS)) {
          const stored = localStorage.getItem(key)
          if (stored) {
            settings.push(JSON.parse(stored))
          }
        }
      }
    } catch (error) {
      console.error('Error reading all station settings:', error)
    }
    return settings
  }
}

// Dashboard Configuration Storage
export interface DashboardConfig {
  autoRefresh: boolean
  refreshInterval: number
  showTrends: boolean
  showResourceUtilization: boolean
  compactMode: boolean
  theme: 'light' | 'dark'
  notifications: boolean
  soundAlerts: boolean
}

export const dashboardConfigStorage = {
  get: (): DashboardConfig => {
    if (typeof window === 'undefined') {
      return {
        autoRefresh: true,
        refreshInterval: 5000,
        showTrends: true,
        showResourceUtilization: true,
        compactMode: false,
        theme: 'light',
        notifications: true,
        soundAlerts: false
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_CONFIG)
      if (stored) {
        const config = JSON.parse(stored)
        // Merge with defaults in case new properties were added
        return {
          autoRefresh: true,
          refreshInterval: 5000,
          showTrends: true,
          showResourceUtilization: true,
          compactMode: false,
          theme: 'light',
          notifications: true,
          soundAlerts: false,
          ...config
        }
      }
    } catch (error) {
      console.error('Error reading dashboard config from storage:', error)
    }

    // Return defaults
    return {
      autoRefresh: true,
      refreshInterval: 5000,
      showTrends: true,
      showResourceUtilization: true,
      compactMode: false,
      theme: 'light',
      notifications: true,
      soundAlerts: false
    }
  },

  set: (config: DashboardConfig): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_CONFIG, JSON.stringify(config))
    } catch (error) {
      console.error('Error saving dashboard config to storage:', error)
    }
  },

  update: (updates: Partial<DashboardConfig>): void => {
    const current = dashboardConfigStorage.get()
    const updated = { ...current, ...updates }
    dashboardConfigStorage.set(updated)
  }
}

// Utility functions
export const storage = {
  // Clear all Ninu factory data
  clearAll: (): void => {
    if (typeof window === 'undefined') return
    
    const keys = Object.values(STORAGE_KEYS)
    keys.forEach(key => {
      // Remove exact matches
      localStorage.removeItem(key)
      
      // Remove prefixed keys (like reactor/station settings)
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const storageKey = localStorage.key(i)
        if (storageKey?.startsWith(key)) {
          localStorage.removeItem(storageKey)
        }
      }
    })
  },

  // Get storage usage information
  getUsage: (): { used: number; total: number; percentage: number } => {
    if (typeof window === 'undefined') {
      return { used: 0, total: 0, percentage: 0 }
    }

    let used = 0
    try {
      // Calculate approximate storage used by Ninu data
      const keys = Object.values(STORAGE_KEYS)
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && keys.some(ninuKey => key.startsWith(ninuKey))) {
          const value = localStorage.getItem(key)
          if (value) {
            used += key.length + value.length
          }
        }
      }

      // Rough estimate of localStorage quota (usually 5-10MB)
      const total = 5 * 1024 * 1024 // 5MB estimate
      const percentage = (used / total) * 100

      return { used, total, percentage }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return { used: 0, total: 0, percentage: 0 }
    }
  },

  // Export all data for backup
  exportData: (): string => {
    if (typeof window === 'undefined') return '{}'

    const data: Record<string, any> = {}
    
    try {
      const keys = Object.values(STORAGE_KEYS)
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && keys.some(ninuKey => key.startsWith(ninuKey))) {
          const value = localStorage.getItem(key)
          if (value) {
            data[key] = value
          }
        }
      }

      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Error exporting data:', error)
      return '{}'
    }
  },

  // Import data from backup
  importData: (jsonData: string): boolean => {
    if (typeof window === 'undefined') return false

    try {
      const data = JSON.parse(jsonData)
      
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string') {
          localStorage.setItem(key, value)
        }
      })

      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

// Hook for easy access in React components
export const useStorage = () => {
  return {
    productionOrders: productionOrderStorage,
    reactorSettings: reactorSettingsStorage,
    stationSettings: stationSettingsStorage,
    dashboardConfig: dashboardConfigStorage,
    utils: storage
  }
}
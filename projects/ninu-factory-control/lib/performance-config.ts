/**
 * Performance Configuration for Mexican Infrastructure
 * Optimized for typical Mexican internet speeds and device capabilities
 */

// Mexican connection profiles with realistic speeds
export const MEXICAN_CONNECTION_PROFILES = {
  urban: {
    name: 'Urbano (CDMX, GDL, MTY)',
    downloadMbps: 25,
    uploadMbps: 5,
    latencyMs: 35,
    reliability: 0.95,
    dataLimitGB: null, // Unlimited fiber/cable
  },
  semiUrban: {
    name: 'Semi-urbano',
    downloadMbps: 15,
    uploadMbps: 3,
    latencyMs: 60,
    reliability: 0.90,
    dataLimitGB: null,
  },
  rural: {
    name: 'Rural',
    downloadMbps: 5,
    uploadMbps: 1,
    latencyMs: 120,
    reliability: 0.80,
    dataLimitGB: null,
  },
  mobile4g: {
    name: 'Móvil 4G (Telcel/Movistar)',
    downloadMbps: 10,
    uploadMbps: 2,
    latencyMs: 80,
    reliability: 0.85,
    dataLimitGB: 5, // Typical data plan
  },
  mobile3g: {
    name: 'Móvil 3G',
    downloadMbps: 2,
    uploadMbps: 0.5,
    latencyMs: 200,
    reliability: 0.75,
    dataLimitGB: 2,
  }
} as const

// Performance thresholds optimized for Mexican infrastructure
export const MEXICAN_PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals adapted for Mexican connections
  coreWebVitals: {
    lcp: { good: 3500, acceptable: 6000 }, // Largest Contentful Paint
    fid: { good: 150, acceptable: 300 },   // First Input Delay
    cls: { good: 0.15, acceptable: 0.25 }, // Cumulative Layout Shift
    fcp: { good: 2500, acceptable: 4500 }, // First Contentful Paint
    ttfb: { good: 1000, acceptable: 2000 }, // Time to First Byte
  },
  
  // Bundle size limits for data-conscious users
  bundleSizes: {
    initial: { good: 200, acceptable: 500 }, // KB for initial bundle
    total: { good: 1000, acceptable: 2000 }, // KB for total bundle
    images: { good: 300, acceptable: 800 },  // KB for images per page
  },
  
  // Network timeouts for Mexican connections
  timeouts: {
    api: { fast: 3000, slow: 8000 },       // API request timeouts
    assets: { fast: 5000, slow: 15000 },   // Asset loading timeouts
    pageLoad: { fast: 5000, slow: 12000 }, // Full page load timeouts
  }
} as const

// Device capabilities common in Mexican market
export const MEXICAN_DEVICE_PROFILES = {
  budget: {
    name: 'Dispositivo Básico',
    ram: 2, // GB
    cpu: 'low-end',
    screen: { width: 360, height: 640 },
    marketShare: 0.45, // 45% of Mexican market
  },
  midRange: {
    name: 'Dispositivo Medio',
    ram: 4, // GB
    cpu: 'mid-range',
    screen: { width: 375, height: 812 },
    marketShare: 0.35,
  },
  premium: {
    name: 'Dispositivo Premium',
    ram: 8, // GB
    cpu: 'high-end',
    screen: { width: 414, height: 896 },
    marketShare: 0.20,
  }
} as const

// Progressive loading configuration
export const PROGRESSIVE_LOADING_CONFIG = {
  // Skeleton loading for slow connections
  skeletonDelays: {
    cards: 100,      // Show card skeletons after 100ms
    lists: 200,      // Show list skeletons after 200ms
    charts: 500,     // Show chart skeletons after 500ms
  },
  
  // Lazy loading intersection observer config
  lazyLoading: {
    rootMargin: '200px',  // Load content 200px before it enters viewport
    threshold: 0.1,       // Trigger when 10% of element is visible
  },
  
  // Image loading priorities for Mexican bandwidth
  imageLoading: {
    critical: 'eager',    // Above-the-fold images
    important: 'lazy',    // Important but below-the-fold
    optional: 'lazy',     // Optional decorative images
  },
  
  // Adaptive timeouts based on connection
  adaptiveTimeouts: {
    '4g': { multiplier: 1.0, base: 5000 },
    '3g': { multiplier: 2.0, base: 5000 },
    'slow-2g': { multiplier: 4.0, base: 5000 },
    'offline': { multiplier: 0, base: 1000 },
  }
} as const

// Caching strategy for Mexican infrastructure
export const MEXICAN_CACHE_STRATEGY = {
  // Service Worker cache configuration
  serviceWorker: {
    version: '1.0.0',
    staticAssets: {
      maxAge: 86400 * 30,   // 30 days for static assets
      strategy: 'CacheFirst',
    },
    apiResponses: {
      maxAge: 86400,        // 1 day for API responses
      strategy: 'NetworkFirst',
    },
    images: {
      maxAge: 86400 * 7,    // 7 days for images
      strategy: 'CacheFirst',
    }
  },
  
  // Browser cache headers
  browserCache: {
    static: 'public, max-age=31536000, immutable',  // 1 year
    dynamic: 'public, max-age=86400',               // 1 day
    api: 'public, max-age=300',                     // 5 minutes
  }
} as const

// Monitoring configuration for Mexican performance
export const MEXICAN_MONITORING_CONFIG = {
  // Real User Monitoring (RUM) thresholds
  rum: {
    sampleRate: 0.1,      // 10% sampling to reduce data usage
    bufferSize: 50,       // Buffer 50 events before sending
    flushInterval: 30000, // Send data every 30 seconds
  },
  
  // Core metrics to track
  metrics: [
    'lcp', 'fid', 'cls', 'fcp', 'ttfb',
    'bundle-size', 'cache-hit-rate', 'network-type',
    'device-memory', 'connection-rtt'
  ],
  
  // Performance budgets for CI/CD
  budgets: {
    lcp: 4000,          // 4 seconds for LCP
    fcp: 3000,          // 3 seconds for FCP
    bundleSize: 500,    // 500KB initial bundle
    imageSize: 800,     // 800KB total images
  }
} as const

// Optimization strategies by connection type
export const CONNECTION_OPTIMIZATION_STRATEGIES = {
  '4g': {
    imageQuality: 0.85,     // High quality images
    prefetch: true,         // Prefetch next pages
    backgroundSync: true,   // Background data sync
    realTimeUpdates: true,  // Real-time WebSocket updates
  },
  
  '3g': {
    imageQuality: 0.70,     // Medium quality images  
    prefetch: false,        // No prefetching
    backgroundSync: false,  // No background sync
    realTimeUpdates: true,  // Keep real-time for factory control
  },
  
  'slow-2g': {
    imageQuality: 0.50,     // Lower quality images
    prefetch: false,        // No prefetching
    backgroundSync: false,  // No background sync
    realTimeUpdates: false, // Polling instead of WebSocket
  },
  
  'offline': {
    imageQuality: 0.30,     // Minimal images
    prefetch: false,        // No prefetching
    backgroundSync: false,  // No background sync
    realTimeUpdates: false, // Cached data only
  }
} as const

// Feature flags for Mexican market
export const MEXICAN_FEATURE_FLAGS = {
  // Data saving features
  dataSaver: {
    enabled: true,
    autoDetect: true,      // Auto-detect limited data plans
    userConfigurable: true, // Allow user to toggle
  },
  
  // Offline-first features
  offlineMode: {
    enabled: true,
    cacheStrategy: 'essential', // Cache only essential data
    syncWhenOnline: true,
  },
  
  // Mexican-specific optimizations
  mexicanOptimizations: {
    cdnPreference: 'cloudflare-mexico', // Prefer Mexican CDN POPs
    currencyLocalization: 'MXN',
    dateLocalization: 'es-MX',
    measurementUnits: 'metric',
  }
} as const

// Helper functions for performance optimization
export const PerformanceUtils = {
  // Detect connection type
  getConnectionType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection
    
    return connection?.effectiveType || 'unknown'
  },
  
  // Get optimization strategy for current connection
  getOptimizationStrategy() {
    const connectionType = this.getConnectionType()
    return CONNECTION_OPTIMIZATION_STRATEGIES[connectionType as keyof typeof CONNECTION_OPTIMIZATION_STRATEGIES] ||
           CONNECTION_OPTIMIZATION_STRATEGIES['3g'] // Default to 3G strategy
  },
  
  // Check if connection is metered (has data limits)
  isMeteredConnection(): boolean {
    const connection = (navigator as any).connection
    return connection?.saveData === true || connection?.type === 'cellular'
  },
  
  // Adaptive timeout based on connection
  getAdaptiveTimeout(baseTimeout: number = 5000): number {
    const connectionType = this.getConnectionType()
    const config = PROGRESSIVE_LOADING_CONFIG.adaptiveTimeouts[connectionType as keyof typeof PROGRESSIVE_LOADING_CONFIG.adaptiveTimeouts]
    
    if (!config) return baseTimeout * 2 // Default fallback
    
    return config.base * config.multiplier
  },
  
  // Check if device has low memory (budget device)
  isLowMemoryDevice(): boolean {
    const deviceMemory = (navigator as any).deviceMemory
    return deviceMemory ? deviceMemory <= 2 : false // Assume low memory if unknown
  },
  
  // Get recommended image quality based on connection
  getRecommendedImageQuality(): number {
    const strategy = this.getOptimizationStrategy()
    return strategy.imageQuality
  }
} as const

const performanceConfig = {
  MEXICAN_CONNECTION_PROFILES,
  MEXICAN_PERFORMANCE_THRESHOLDS,
  MEXICAN_DEVICE_PROFILES,
  PROGRESSIVE_LOADING_CONFIG,
  MEXICAN_CACHE_STRATEGY,
  MEXICAN_MONITORING_CONFIG,
  CONNECTION_OPTIMIZATION_STRATEGIES,
  MEXICAN_FEATURE_FLAGS,
  PerformanceUtils
}

export default performanceConfig
import React, { useState, useEffect } from 'react'
import { Loader2, Wifi, WifiOff } from 'lucide-react'

interface ProgressiveLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  timeout?: number // Mexican connections may need longer timeouts
  showNetworkStatus?: boolean
}

interface NetworkStatus {
  isOnline: boolean
  effectiveType: string | undefined
  downlink: number | undefined
  rtt: number | undefined
}

export function ProgressiveLoader({ 
  isLoading, 
  children, 
  fallback,
  timeout = 8000, // 8 second timeout for Mexican connections
  showNetworkStatus = true 
}: ProgressiveLoaderProps) {
  const [showTimeout, setShowTimeout] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    effectiveType: undefined,
    downlink: undefined,
    rtt: undefined
  })

  // Monitor network status for Mexican connection types
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt
      })
    }

    updateNetworkStatus()
    
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    // Listen for connection changes (mobile network switching)
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  // Timeout handler for slow Mexican connections
  useEffect(() => {
    if (!isLoading) {
      setShowTimeout(false)
      return
    }

    const timer = setTimeout(() => {
      setShowTimeout(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [isLoading, timeout])

  // Determine connection quality for Mexican context
  const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
    if (!networkStatus.isOnline) return 'offline'
    
    const { effectiveType, downlink, rtt } = networkStatus
    
    // Mexican connection quality mapping
    if (effectiveType === '4g' && (downlink || 0) > 10) return 'excellent'
    if (effectiveType === '4g' && (downlink || 0) > 5) return 'good'
    if (effectiveType === '3g' || (downlink || 0) > 1) return 'fair'
    return 'poor'
  }

  const connectionQuality = getConnectionQuality()

  // Get appropriate message for Mexican users
  const getLoadingMessage = () => {
    if (!networkStatus.isOnline) {
      return 'Sin conexión a internet'
    }
    
    switch (connectionQuality) {
      case 'poor':
        return 'Conexión lenta detectada, cargando...'
      case 'fair':
        return 'Optimizando para tu conexión...'
      case 'good':
        return 'Cargando datos...'
      case 'excellent':
        return 'Cargando...'
      default:
        return 'Cargando...'
    }
  }

  const getTimeoutMessage = () => {
    if (!networkStatus.isOnline) {
      return {
        title: 'Sin Conexión',
        message: 'Verifica tu conexión a internet y vuelve a intentar.',
        action: 'Reintentar'
      }
    }

    switch (connectionQuality) {
      case 'poor':
        return {
          title: 'Conexión Muy Lenta',
          message: 'Tu conexión es muy lenta. La aplicación puede tardar más en cargar.',
          action: 'Continuar Esperando'
        }
      case 'fair':
        return {
          title: 'Conexión Lenta',
          message: 'Detectamos una conexión lenta. Los datos se están cargando.',
          action: 'Seguir Cargando'
        }
      default:
        return {
          title: 'Carga Demorada',
          message: 'La carga está tomando más tiempo del esperado.',
          action: 'Reintentar'
        }
    }
  }

  if (!isLoading) {
    return <>{children}</>
  }

  if (showTimeout) {
    const timeoutInfo = getTimeoutMessage()
    
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            {networkStatus.isOnline ? (
              <Wifi className="h-16 w-16 text-yellow-500" />
            ) : (
              <WifiOff className="h-16 w-16 text-red-500" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {timeoutInfo.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {timeoutInfo.message}
            </p>
            
            {showNetworkStatus && networkStatus.effectiveType && (
              <div className="text-sm text-gray-500 mb-4">
                Conexión: {networkStatus.effectiveType.toUpperCase()}
                {networkStatus.downlink && ` • ${networkStatus.downlink.toFixed(1)} Mbps`}
                {networkStatus.rtt && ` • ${networkStatus.rtt}ms`}
              </div>
            )}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {timeoutInfo.action}
          </button>
          
          <div className="text-xs text-gray-400">
            Para mejor rendimiento, conéctate a WiFi
          </div>
        </div>
      </div>
    )
  }

  // Show fallback or default loading state
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getLoadingMessage()}
          </h3>
          
          {showNetworkStatus && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                {networkStatus.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {networkStatus.effectiveType ? 
                    `${networkStatus.effectiveType.toUpperCase()}` : 
                    'Detectando conexión...'
                  }
                </span>
              </div>
              
              {connectionQuality === 'poor' && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-2">
                  💡 Consejo: Para mejor rendimiento, conéctate a WiFi
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress indicator for very slow connections */}
        {(connectionQuality === 'poor' || connectionQuality === 'fair') && (
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{
                width: '60%',
                animation: 'progress 3s ease-in-out infinite'
              }}></div>
            </div>
            <style jsx>{`
              @keyframes progress {
                0% { width: 20%; }
                50% { width: 80%; }
                100% { width: 20%; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for network-aware loading states
export function useNetworkAwareLoading(baseTimeout: number = 5000) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    effectiveType: undefined,
    downlink: undefined,
    rtt: undefined
  })

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    const updateStatus = () => {
      setNetworkStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt
      })
    }

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    
    if (connection) {
      connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if (connection) {
        connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  // Adaptive timeout based on Mexican connection types
  const adaptiveTimeout = () => {
    if (!networkStatus.isOnline) return baseTimeout * 2
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
      case '2g':
        return baseTimeout * 4 // 20 seconds for 2G
      case '3g':
        return baseTimeout * 2 // 10 seconds for 3G
      case '4g':
        return baseTimeout * 1.2 // 6 seconds for 4G
      default:
        return baseTimeout
    }
  }

  return {
    networkStatus,
    adaptiveTimeout: adaptiveTimeout(),
    isSlowConnection: ['slow-2g', '2g', '3g'].includes(networkStatus.effectiveType || ''),
    connectionQuality: networkStatus.effectiveType || 'unknown'
  }
}
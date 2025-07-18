'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '../../lib/logger'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error usando nuestro sistema de logging
    logger.critical('ErrorBoundary', 'Error capturado por Error Boundary', error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
      timestamp: new Date()
    })
    
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({
      error,
      errorInfo
    })
  }

  private handleRetry = () => {
    logger.info('ErrorBoundary', 'Usuario activó retry de error')
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI for production dashboard
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Error en el Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Ha ocurrido un error inesperado en el sistema de control de producción.
                Por favor, intenta recargar la página o contacta al soporte técnico.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-50 p-4 rounded-md">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Detalles técnicos (Solo desarrollo)
                  </summary>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto bg-white p-2 rounded border">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto bg-white p-2 rounded border">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                  variant="secondary"
                >
                  <Home className="h-4 w-4" />
                  Ir al Inicio
                </Button>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                Si el problema persiste, contacta al equipo de soporte técnico de Ninu.mx
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundary for metrics
export function MetricsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-red-800 mb-2">Error en Métricas</h3>
            <p className="text-red-600 text-sm">
              No se pudieron cargar las métricas de producción. 
              Los datos se actualizarán automáticamente cuando el servicio se restablezca.
            </p>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Specialized error boundary for reactors
export function ReactorErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold text-yellow-800 mb-2">Error en Reactores</h3>
            <p className="text-yellow-700 text-sm">
              Error al cargar el estado de los reactores. 
              Verificando conexiones del sistema...
            </p>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Specialized error boundary for stations
export function StationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-orange-800 mb-2">Error en Estaciones</h3>
            <p className="text-orange-700 text-sm">
              Error al cargar el estado de las estaciones de producción. 
              Reconectando automáticamente...
            </p>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
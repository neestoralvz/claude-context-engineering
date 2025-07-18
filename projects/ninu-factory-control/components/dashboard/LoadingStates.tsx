import React from 'react'
import { Loader2, Factory, BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/card'

// Generic loading spinner
export function LoadingSpinner({ size = 'default', className = '' }: { 
  size?: 'small' | 'default' | 'large'
  className?: string 
}) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8'
  }

  return (
    <Loader2 
      className={`animate-spin text-ninu-primary ${sizeClasses[size]} ${className}`} 
    />
  )
}

// Loading skeleton for metric cards
export function MetricCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 rounded-lg bg-gray-200">
            <div className="h-5 w-5 bg-gray-300 rounded" />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton for metrics overview
export function MetricsOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>

      {/* Summary Card Skeleton */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading skeleton for reactor cards
export function ReactorCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>

          {/* Status and metrics */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-14" />
                <div className="h-4 bg-gray-200 rounded w-10" />
              </div>
            </div>
          </div>

          {/* Batch info */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-28" />
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-2 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton for station cards
export function StationCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-12" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          </div>

          {/* Current product */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>

          {/* Queue */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Complete dashboard loading state
export function DashboardLoadingState() {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="gradient-ninu text-white rounded-lg p-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-10 bg-white/20 rounded w-96" />
            <div className="h-6 bg-white/20 rounded w-80" />
            <div className="h-5 bg-white/20 rounded w-72" />
          </div>
          <div className="hidden md:flex flex-col items-center space-y-2">
            <Factory className="h-16 w-16 text-white opacity-60" />
            <div className="h-4 bg-white/20 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Navigation Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-gray-200">
                <div className="h-6 w-6 bg-gray-300 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Metrics Loading */}
      <MetricsOverviewSkeleton />

      {/* Reactors Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="flex items-center space-x-2">
            <Factory className="h-5 w-5 text-gray-300" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <ReactorCardSkeleton key={index} />
          ))}
        </div>
      </section>

      {/* Stations Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-56 animate-pulse" />
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-300" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <StationCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  )
}

// Loading state with branded message
export function BrandedLoadingState({ message = "Cargando sistema de control..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <div className="gradient-ninu p-8 rounded-2xl inline-block">
          <Factory className="h-16 w-16 text-white mx-auto mb-4" />
          <LoadingSpinner size="large" className="text-white" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-ninu-primary">Ninu.mx</h2>
          <p className="text-gray-600">{message}</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span>Sistema de Control de Producción</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Connection status indicator
export function ConnectionStatus({ isConnected = true, isLoading = false }: {
  isConnected?: boolean
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600 text-sm">
        <LoadingSpinner size="small" />
        <span>Conectando...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${
      isConnected ? 'text-green-600' : 'text-red-600'
    }`}>
      <div className={`h-2 w-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } ${isConnected ? 'animate-pulse' : ''}`} />
      <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
    </div>
  )
}

// Unified LoadingStates interface
export const LoadingStates = {
  Dashboard: DashboardLoadingState,
  MetricsOverview: MetricsOverviewSkeleton,
  ReactorCard: ReactorCardSkeleton,
  StationCard: StationCardSkeleton,
  MetricCard: MetricCardSkeleton,
  Branded: BrandedLoadingState,
  Spinner: LoadingSpinner,
  Connection: ConnectionStatus
}

// Grid loading state
export function GridLoadingState({ count = 6, CardComponent = MetricCardSkeleton }: {
  count?: number
  CardComponent?: React.ComponentType
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardComponent key={index} />
      ))}
    </div>
  )
}
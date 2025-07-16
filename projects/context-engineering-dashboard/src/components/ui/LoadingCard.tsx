import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingCardProps {
  className?: string
  lines?: number
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="principle-card">
        <div className="principle-card-header">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="principle-card-content space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className={cn(
                'h-4 bg-slate-200 dark:bg-slate-700 rounded',
                i === lines - 1 ? 'w-2/3' : 'w-full'
              )}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={cn(
      'loading-spinner',
      sizeClasses[size],
      className
    )} />
  )
}

export interface ProgressBarProps {
  progress: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ progress, className, showLabel = true }: ProgressBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">Loading Progress</span>
          <span className="text-primary-600 dark:text-primary-400">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
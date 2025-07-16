import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Academic theme utilities
export function getAcademicColorClass(type: 'primary' | 'secondary' | 'accent' | 'mathematical', variant?: string) {
  const baseClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400', 
    accent: 'text-accent-600 dark:text-accent-500',
    mathematical: 'text-mathematical-600 dark:text-mathematical-700'
  }
  
  return variant ? `${baseClasses[type]} ${variant}` : baseClasses[type]
}

export function getAcademicBgClass(type: 'primary' | 'secondary' | 'accent' | 'mathematical', variant?: string) {
  const baseClasses = {
    primary: 'bg-primary-600 dark:bg-primary-700',
    secondary: 'bg-secondary-100 dark:bg-secondary-800',
    accent: 'bg-accent-600 dark:bg-accent-700', 
    mathematical: 'bg-mathematical-100 dark:bg-mathematical-900'
  }
  
  return variant ? `${baseClasses[type]} ${variant}` : baseClasses[type]
}
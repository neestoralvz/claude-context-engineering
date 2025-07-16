'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn('w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800', className)} />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'relative w-9 h-9 rounded-md border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'transition-colors duration-200',
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          className={cn(
            'absolute w-4 h-4 transition-all duration-300',
            theme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        
        <svg
          className={cn(
            'absolute w-4 h-4 transition-all duration-300',
            theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </button>
  )
}
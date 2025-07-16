'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Badge } from '@/components/ui/Badge'
import { useProgressiveLoading } from '@/components/providers/ProgressiveLoadingProvider'

const navigationItems = [
  {
    label: 'Centro de Contexto',
    href: '/',
    description: 'Mapa Inteligente de Contexto',
    icon: '🏠'
  },
  {
    label: 'Interactivo',
    href: '/interactive',
    description: 'Funciones y Demos Interactivos',
    icon: '⚡'
  },
  {
    label: 'Principios',
    href: '/principles',
    description: 'Sistema de 56 Principios',
    icon: '📋'
  },
  {
    label: 'Comandos',
    href: '/commands', 
    description: 'Ecosistema de 62 Comandos',
    icon: '⌨️'
  },
  {
    label: 'Herramientas',
    href: '/tools',
    description: 'Integración MCP',
    icon: '🔧'
  },
  {
    label: 'Métricas',
    href: '/metrics',
    description: 'Panel de Rendimiento',
    icon: '📊'
  }
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { loadingState } = useProgressiveLoading()

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-3 group transition-all duration-200"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <span className="text-white text-lg sm:text-xl font-bold tracking-normal">IC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg sm:text-xl lg:text-2xl text-slate-900 dark:text-slate-100 tracking-normal">
                  Ingeniería de Contexto
                </span>
                <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium tracking-normal">
                  Sistema Cognitivo Avanzado
                </span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tracking-normal">
                  ACTIVO: {loadingState.contextLevel.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-primary-600 text-white border border-primary-600' 
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 border border-transparent'
                  )}
                  title={item.description}
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Context Level Indicator */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Cargado:</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {loadingState.loadedSections.size}
                </span>
              </div>
            </div>
            
            {/* Progressive Loading Progress */}
            {loadingState.isLoading && (
              <div className="hidden sm:block">
                <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${loadingState.loadingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-3 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className={cn('w-5 h-5 transform transition-transform', isOpen && 'rotate-90')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="space-y-3">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive 
                        ? 'bg-primary-600 text-white border border-primary-600' 
                        : 'text-secondary-700 dark:text-secondary-300 hover:bg-white dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 border border-transparent'
                    )}
                  >
                    <div>
                      <div className="flex items-center space-x-2 font-medium">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 ml-6">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export function Breadcrumb({ 
  items 
}: { 
  items: Array<{ label: string; href?: string }> 
}) {
  return (
    <nav className="breadcrumb py-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="breadcrumb-separator">/</span>
          )}
          {item.href ? (
            <Link 
              href={item.href}
              className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
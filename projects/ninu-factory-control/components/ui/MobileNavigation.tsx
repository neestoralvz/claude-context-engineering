'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export interface NavigationItem {
  href: string
  label: string
  icon: string
}

export interface MobileNavigationProps {
  isOpen: boolean
  onToggle: () => void
  navigationItems: NavigationItem[]
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  navigationItems = []
}) => {
  const menuRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle body scroll prevention when menu is open
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Prevent body scroll
      document.body.classList.add('overflow-hidden')
      
      // Focus first focusable element in menu
      const firstFocusable = menuRef.current?.querySelector(
        'a, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusable?.focus()
    } else {
      // Restore body scroll
      document.body.classList.remove('overflow-hidden')
      
      // Restore focus to hamburger button
      if (buttonRef.current) {
        buttonRef.current.focus()
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onToggle()
      }

      // Focus trap - keep focus within menu
      if (event.key === 'Tab') {
        const focusableElements = menuRef.current?.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (event.shiftKey) {
            // Shift+Tab - move to last element if at first
            if (document.activeElement === firstElement) {
              event.preventDefault()
              lastElement.focus()
            }
          } else {
            // Tab - move to first element if at last
            if (document.activeElement === lastElement) {
              event.preventDefault()
              firstElement.focus()
            }
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onToggle])

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault()
    handleToggle()
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the menu itself
    if (event.target === event.currentTarget) {
      handleToggle()
    }
  }

  return (
    <div data-testid="mobile-navigation-container" className="md:hidden">
      {/* Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        onTouchEnd={handleTouchEnd}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        className="w-11 h-11 flex items-center justify-center rounded-md text-ninu-primary hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ninu-primary focus:ring-opacity-50"
        type="button"
      >
        {isOpen ? (
          <X 
            data-testid="close-icon"
            className="w-6 h-6" 
            aria-hidden="true"
          />
        ) : (
          <Menu 
            data-testid="hamburger-icon"
            className="w-6 h-6" 
            aria-hidden="true"
          />
        )}
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          data-testid="mobile-nav-backdrop"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Navigation Menu */}
      <div
        role="dialog"
        aria-modal={isOpen ? 'true' : 'false'}
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <nav
          ref={menuRef}
          id="mobile-navigation-menu"
          aria-label="Navegación móvil"
        >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-ninu-primary">
            Navegación
          </h2>
          <button
            onClick={handleToggle}
            aria-label="Cerrar menú de navegación"
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-500 hover:text-ninu-primary hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ninu-primary focus:ring-opacity-50"
            type="button"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-6">
          {navigationItems.length > 0 ? (
            <ul className="space-y-2 px-4">
              {navigationItems.map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link
                    href={item.href}
                    onClick={handleToggle}
                    className="flex items-center py-4 px-4 rounded-lg text-ninu-primary hover:text-ninu-secondary hover:bg-gray-50 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-ninu-primary focus:ring-opacity-50"
                    tabIndex={0}
                  >
                    <span className="text-2xl mr-4" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="text-lg">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No hay elementos de navegación disponibles</p>
            </div>
          )}
        </div>

        {/* Footer with Company Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-medium text-ninu-primary mb-1">
              Ninu.mx
            </p>
            <p className="text-xs text-gray-500">
              Tu aliado esencial
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Sistema de Control de Producción
            </p>
          </div>
        </div>
        </nav>
      </div>
    </div>
  )
}

export default MobileNavigation
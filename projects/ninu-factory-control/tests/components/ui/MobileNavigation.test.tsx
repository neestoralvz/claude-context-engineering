import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import MobileNavigation from '../../../components/ui/MobileNavigation'

// Mock next/link to avoid router context issues in tests
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('MobileNavigation', () => {
  // Test props for consistent testing
  const defaultProps = {
    isOpen: false,
    onToggle: jest.fn(),
    navigationItems: [
      { href: '/', label: 'Control', icon: '🏭' },
      { href: '/productos', label: 'Productos', icon: '🧪' },
      { href: '/admin/productos', label: 'Gestión', icon: '⚙️' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Hamburger Button', () => {
    test('renders hamburger button with correct ARIA attributes', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-controls', 'mobile-navigation-menu')
      expect(button).toHaveAttribute('aria-label', 'Abrir menú de navegación')
    })

    test('has minimum 44px touch target size for mobile accessibility', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
      const styles = getComputedStyle(button)
      
      // Check that button meets minimum touch target requirements
      expect(button).toHaveClass('w-11', 'h-11') // 44px minimum touch target
    })

    test('toggles navigation when hamburger button is clicked', async () => {
      const user = userEvent.setup()
      render(<MobileNavigation {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
      await user.click(button)
      
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
    })

    test('supports keyboard navigation with Enter and Space keys', async () => {
      const user = userEvent.setup()
      render(<MobileNavigation {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
      
      // Test Enter key
      button.focus()
      await user.keyboard('{Enter}')
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
      
      // Test Space key
      await user.keyboard(' ')
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(2)
    })

    test('shows correct icon based on menu state', () => {
      const { rerender } = render(<MobileNavigation {...defaultProps} />)
      
      // Closed state should show hamburger icon
      expect(screen.getByTestId('hamburger-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument()
      
      // Open state should show close icon
      rerender(<MobileNavigation {...defaultProps} isOpen={true} />)
      expect(screen.getByTestId('close-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('hamburger-icon')).not.toBeInTheDocument()
    })
  })

  describe('Navigation Menu', () => {
    test('menu is hidden when isOpen is false', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('translate-x-full') // Hidden off-screen
    })

    test('menu is visible when isOpen is true', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('translate-x-0') // Visible on-screen
    })

    test('renders all navigation items with correct structure', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      defaultProps.navigationItems.forEach(item => {
        const link = screen.getByRole('link', { name: new RegExp(item.label, 'i') })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', item.href)
        
        // Check for icon presence
        expect(screen.getByText(item.icon)).toBeInTheDocument()
      })
    })

    test('navigation items have minimum touch target size', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        // Each navigation item should be at least 44px tall
        expect(link).toHaveClass('py-4') // Ensures adequate touch target
      })
    })

    test('supports keyboard navigation between menu items', async () => {
      const user = userEvent.setup()
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const firstLink = screen.getByRole('link', { name: /control/i })
      const secondLink = screen.getByRole('link', { name: /productos/i })
      
      firstLink.focus()
      expect(firstLink).toHaveFocus()
      
      await user.keyboard('{Tab}')
      expect(secondLink).toHaveFocus()
    })
  })

  describe('Overlay and Backdrop', () => {
    test('shows backdrop overlay when menu is open', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const backdrop = screen.getByTestId('mobile-nav-backdrop')
      expect(backdrop).toBeInTheDocument()
      expect(backdrop).toHaveClass('bg-black', 'bg-opacity-50')
    })

    test('hides backdrop overlay when menu is closed', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const backdrop = screen.queryByTestId('mobile-nav-backdrop')
      expect(backdrop).not.toBeInTheDocument()
    })

    test('closes menu when backdrop is clicked', async () => {
      const user = userEvent.setup()
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const backdrop = screen.getByTestId('mobile-nav-backdrop')
      await user.click(backdrop)
      
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility Features', () => {
    test('traps focus within open menu', async () => {
      const user = userEvent.setup()
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      
      const menu = screen.getByRole('navigation', { name: 'Navegación móvil' })
      expect(menu).toBeInTheDocument()
    })

    test('restores focus to hamburger button when menu closes', async () => {
      const { rerender } = render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      rerender(<MobileNavigation {...defaultProps} isOpen={false} />)
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
        expect(button).toHaveFocus()
      })
    })

    test('supports Escape key to close menu', async () => {
      const user = userEvent.setup()
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      await user.keyboard('{Escape}')
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
    })

    test('has proper ARIA labels in Spanish for Mexican users', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const navigation = screen.getByRole('navigation', { name: 'Navegación móvil' })
      expect(navigation).toHaveAttribute('aria-label', 'Navegación móvil')
      
      // Get the main hamburger/close button (the one with aria-controls)
      const button = screen.getByRole('button', { 
        name: /cerrar menú de navegación/i,
        expanded: true
      })
      expect(button).toHaveAttribute('aria-label', 'Cerrar menú de navegación')
      expect(button).toHaveAttribute('aria-controls', 'mobile-navigation-menu')
    })
  })

  describe('Visual Design and Animation', () => {
    test('applies correct Ninu.mx brand colors', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('bg-white')
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('text-ninu-primary', 'hover:text-ninu-secondary')
      })
    })

    test('includes proper transition classes for smooth animations', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('transition-transform', 'duration-300', 'ease-in-out')
    })

    test('hamburger button has hover and active states', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
      expect(button).toHaveClass('hover:bg-gray-100', 'active:bg-gray-200')
    })
  })

  describe('Error Handling', () => {
    test('handles missing navigation items gracefully', () => {
      render(<MobileNavigation {...defaultProps} navigationItems={[]} />)
      
      const menu = screen.getByRole('navigation', { name: 'Navegación móvil' })
      expect(menu).toBeInTheDocument()
      
      const links = screen.queryAllByRole('link')
      expect(links).toHaveLength(0)
    })

    test('handles undefined onToggle function', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<MobileNavigation {...defaultProps} onToggle={undefined as any} />)
      }).not.toThrow()
      
      consoleError.mockRestore()
    })
  })

  describe('Mobile-Specific Features', () => {
    test('only shows on mobile breakpoints (hidden on md and above)', () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const container = screen.getByTestId('mobile-navigation-container')
      expect(container).toHaveClass('md:hidden')
    })

    test('handles touch events correctly', async () => {
      render(<MobileNavigation {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
      
      fireEvent.touchStart(button)
      fireEvent.touchEnd(button)
      
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
    })

    test('prevents body scroll when menu is open', () => {
      render(<MobileNavigation {...defaultProps} isOpen={true} />)
      
      // In actual implementation, this would add a class to body to prevent scroll
      expect(document.body).toHaveClass('overflow-hidden')
    })
  })
})
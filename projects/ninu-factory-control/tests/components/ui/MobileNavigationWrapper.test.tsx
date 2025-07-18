import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import MobileNavigationWrapper from '../../../components/ui/MobileNavigationWrapper'

// Mock next/link to avoid router context issues in tests
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('MobileNavigationWrapper', () => {
  test('renders mobile navigation with correct navigation items', () => {
    render(<MobileNavigationWrapper />)
    
    // Check that the hamburger button is present
    const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
    expect(button).toBeInTheDocument()
  })

  test('can toggle mobile navigation menu', async () => {
    const user = userEvent.setup()
    render(<MobileNavigationWrapper />)
    
    const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
    
    // Menu should be closed initially
    expect(button).toHaveAttribute('aria-expanded', 'false')
    
    // Open menu
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    
    // Check that navigation items are visible
    expect(screen.getByRole('link', { name: /control/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /productos/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /gestión/i })).toBeInTheDocument()
  })

  test('contains correct navigation items with proper hrefs', async () => {
    const user = userEvent.setup()
    render(<MobileNavigationWrapper />)
    
    const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
    await user.click(button)
    
    // Check navigation items
    const controlLink = screen.getByRole('link', { name: /control/i })
    const productosLink = screen.getByRole('link', { name: /productos/i })
    const gestionLink = screen.getByRole('link', { name: /gestión/i })
    
    expect(controlLink).toHaveAttribute('href', '/')
    expect(productosLink).toHaveAttribute('href', '/productos')
    expect(gestionLink).toHaveAttribute('href', '/admin/productos')
  })

  test('shows correct icons for each navigation item', async () => {
    const user = userEvent.setup()
    render(<MobileNavigationWrapper />)
    
    const button = screen.getByRole('button', { name: /abrir menú de navegación/i })
    await user.click(button)
    
    // Check for icons
    expect(screen.getByText('🏭')).toBeInTheDocument() // Control
    expect(screen.getByText('🧪')).toBeInTheDocument() // Productos
    expect(screen.getByText('⚙️')).toBeInTheDocument() // Gestión
  })

  test('only displays on mobile (hidden on md and above)', () => {
    render(<MobileNavigationWrapper />)
    
    const container = screen.getByTestId('mobile-navigation-container')
    expect(container).toHaveClass('md:hidden')
  })
})
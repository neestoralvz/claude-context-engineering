import { render, screen } from '@testing-library/react'
import { Badge } from '../../../components/ui/badge'

describe('Badge Component', () => {
  describe('Default variant', () => {
    it('renders with default styling', () => {
      render(<Badge>Default Badge</Badge>)
      
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>)
      
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('renders children content', () => {
      render(
        <Badge>
          <span>Custom Content</span>
        </Badge>
      )
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })
  })

  describe('Status variant', () => {
    it('renders with status styling for running status', () => {
      render(
        <Badge variant="status" status="running">
          Running
        </Badge>
      )
      
      const badge = screen.getByText('Running')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-green-100', 'text-green-600')
    })

    it('renders with status styling for idle status', () => {
      render(
        <Badge variant="status" status="idle">
          Idle
        </Badge>
      )
      
      const badge = screen.getByText('Idle')
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-500')
    })

    it('renders with status styling for maintenance status', () => {
      render(
        <Badge variant="status" status="maintenance">
          Maintenance
        </Badge>
      )
      
      const badge = screen.getByText('Maintenance')
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-600')
    })

    it('renders with status styling for error status', () => {
      render(
        <Badge variant="status" status="error">
          Error
        </Badge>
      )
      
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('bg-red-100', 'text-red-600')
    })

    it('renders without status classes when status is not provided', () => {
      render(
        <Badge variant="status">
          No Status
        </Badge>
      )
      
      const badge = screen.getByText('No Status')
      expect(badge).toBeInTheDocument()
      expect(badge).not.toHaveClass('bg-green-100', 'bg-gray-100', 'bg-yellow-100', 'bg-red-100')
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<Badge>Accessible Badge</Badge>)
      
      const badge = screen.getByText('Accessible Badge')
      expect(badge).toBeInTheDocument()
      expect(badge.tagName).toBe('DIV')
    })

    it('supports aria-label', () => {
      render(
        <Badge aria-label="Status indicator">
          Active
        </Badge>
      )
      
      const badge = screen.getByText('Active')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('aria-label', 'Status indicator')
    })
  })

  describe('Style consistency', () => {
    it('always includes base classes', () => {
      render(<Badge>Test</Badge>)
      
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold',
        'transition-colors'
      )
    })

    it('combines variant and status classes correctly', () => {
      render(
        <Badge variant="status" status="running" className="extra-class">
          Combined
        </Badge>
      )
      
      const badge = screen.getByText('Combined')
      expect(badge).toHaveClass('bg-green-100', 'text-green-600', 'extra-class')
    })
  })
})
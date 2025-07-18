import { render, screen } from '../../utils/test-utils'
import { Button } from '../../../components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders button with children', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
    })

    it('renders with primary variant by default', () => {
      render(<Button>Primary Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600')
    })
  })

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<Button variant="default">Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600', 'text-white')
    })

    it('renders secondary variant correctly', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-200', 'text-gray-900')
    })

    it('renders danger variant correctly', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600', 'text-white')
    })

    it('renders outline variant correctly', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-gray-300', 'text-gray-700')
    })
  })

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('renders medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
    })

    it('renders large size correctly', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3', 'text-base')
    })
  })

  describe('Behavior', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      const { user } = render(<Button onClick={handleClick}>Clickable</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn()
      const { user } = render(<Button disabled onClick={handleClick}>Disabled</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Button>Focus Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
    })

    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('passes through button attributes', () => {
      render(<Button type="submit" data-testid="submit-btn">Submit</Button>)
      const button = screen.getByTestId('submit-btn')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Factory Production Context', () => {
    it('renders action buttons for reactor controls', () => {
      render(<Button variant="danger">Parar Reactor</Button>)
      expect(screen.getByRole('button', { name: 'Parar Reactor' })).toBeInTheDocument()
    })

    it('renders status buttons for production stations', () => {
      render(<Button variant="secondary">Mantenimiento</Button>)
      expect(screen.getByRole('button', { name: 'Mantenimiento' })).toBeInTheDocument()
    })

    it('renders outline buttons for secondary actions', () => {
      render(<Button variant="outline">Ver Detalles</Button>)
      const button = screen.getByRole('button', { name: 'Ver Detalles' })
      expect(button).toHaveClass('border', 'text-gray-700')
    })
  })
})
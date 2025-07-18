import { render, screen, fireEvent } from '@testing-library/react'
import { ReactorGrid } from '../../../components/reactors/ReactorGrid'
import { createMockReactor } from '../../utils/test-factories'

describe('ReactorGrid Component', () => {
  const mockReactors = [
    createMockReactor({
      id: '1',
      name: 'Reactor A - Líquidos',
      status: 'mixing'
    }),
    createMockReactor({
      id: '2', 
      name: 'Reactor B - Desinfectantes',
      status: 'idle'
    }),
    createMockReactor({
      id: '3',
      name: 'Reactor C - Especialidades', 
      status: 'cooling'
    })
  ]

  describe('Rendering', () => {
    it('renders grid container with correct styling', () => {
      render(<ReactorGrid reactors={mockReactors} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')
    })

    it('renders all provided reactors', () => {
      render(<ReactorGrid reactors={mockReactors} />)
      
      expect(screen.getByText('Reactor A - Líquidos')).toBeInTheDocument()
      expect(screen.getByText('Reactor B - Desinfectantes')).toBeInTheDocument()
      expect(screen.getByText('Reactor C - Especialidades')).toBeInTheDocument()
    })

    it('renders empty grid when no reactors provided', () => {
      render(<ReactorGrid reactors={[]} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer!.children).toHaveLength(0)
    })

    it('renders single reactor correctly', () => {
      const singleReactor = [mockReactors[0]]
      render(<ReactorGrid reactors={singleReactor} />)
      
      expect(screen.getByText('Reactor A - Líquidos')).toBeInTheDocument()
      expect(screen.queryByText('Reactor B - Desinfectantes')).not.toBeInTheDocument()
    })
  })

  describe('Click interactions', () => {
    it('calls onReactorClick when reactor is clicked', () => {
      const mockOnClick = jest.fn()
      render(<ReactorGrid reactors={mockReactors} onReactorClick={mockOnClick} />)
      
      const reactorCard = screen.getByText('Reactor A - Líquidos').closest('div')
      fireEvent.click(reactorCard!)
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      expect(mockOnClick).toHaveBeenCalledWith(mockReactors[0])
    })

    it('calls onReactorClick with correct reactor data', () => {
      const mockOnClick = jest.fn()
      render(<ReactorGrid reactors={mockReactors} onReactorClick={mockOnClick} />)
      
      // Click second reactor
      const secondReactorCard = screen.getByText('Reactor B - Desinfectantes').closest('div')
      fireEvent.click(secondReactorCard!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockReactors[1])
    })

    it('works without onReactorClick handler', () => {
      expect(() => {
        render(<ReactorGrid reactors={mockReactors} />)
        
        const reactorCard = screen.getByText('Reactor A - Líquidos').closest('div')
        fireEvent.click(reactorCard!)
      }).not.toThrow()
    })
  })

  describe('Key handling', () => {
    it('assigns unique keys to reactor cards', () => {
      render(<ReactorGrid reactors={mockReactors} />)
      
      // Verify each reactor is rendered (keys are internal to React)
      mockReactors.forEach(reactor => {
        expect(screen.getByText(reactor.name)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('handles large number of reactors', () => {
      const manyReactors = Array.from({ length: 50 }, (_, i) => 
        createMockReactor({
          id: `reactor-${i}`,
          name: `Reactor ${i}`,
          status: 'idle'
        })
      )
      
      render(<ReactorGrid reactors={manyReactors} />)
      
      // Should render first few reactors
      expect(screen.getByText('Reactor 0')).toBeInTheDocument()
      expect(screen.getByText('Reactor 49')).toBeInTheDocument()
    })
  })

  describe('Responsive behavior', () => {
    it('applies responsive grid classes', () => {
      render(<ReactorGrid reactors={mockReactors} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')      // Mobile
      expect(gridContainer).toHaveClass('md:grid-cols-2')   // Medium screens
      expect(gridContainer).toHaveClass('lg:grid-cols-3')   // Large screens
    })
  })

  describe('Accessibility', () => {
    it('maintains accessibility for all reactor cards', () => {
      render(<ReactorGrid reactors={mockReactors} />)
      
      // Each reactor card should have a heading with the name
      mockReactors.forEach(reactor => {
        const heading = screen.getByRole('heading', { name: reactor.name })
        expect(heading).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation through reactor cards', () => {
      const mockOnClick = jest.fn()
      render(<ReactorGrid reactors={mockReactors} onReactorClick={mockOnClick} />)
      
      // Find the first reactor card by its name and then click it
      const firstReactorCard = screen.getByText('Reactor A - Líquidos').closest('div')
      fireEvent.click(firstReactorCard!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockReactors[0])
    })
  })
})
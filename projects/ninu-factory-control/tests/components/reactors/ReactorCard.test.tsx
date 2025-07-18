import React from 'react'
import { render, screen, fireEvent } from '../../utils/test-utils'
import { ReactorCard } from '../../../components/reactors/ReactorCard'
import { createMockReactor } from '../../utils/test-utils'

describe('ReactorCard', () => {
  const mockReactor = createMockReactor()

  describe('Basic rendering', () => {
    it('should render reactor name', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.getByText(mockReactor.name)).toBeInTheDocument()
    })

    it('should render reactor status badge', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.getByText('Inactivo')).toBeInTheDocument()
    })

    it('should render reactor parameters', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.getByText('25°C')).toBeInTheDocument()
      expect(screen.getByText('1 bar')).toBeInTheDocument()
      expect(screen.getByText('0 rpm')).toBeInTheDocument()
    })

    it('should render capacity information', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.getByText('1,000 L')).toBeInTheDocument()
    })
  })

  describe('Status rendering', () => {
    it('should render correct status text for different statuses', () => {
      const reactorRunning = createMockReactor({ status: 'mixing' })
      render(<ReactorCard reactor={reactorRunning} />)
      expect(screen.getByText('Mezclando')).toBeInTheDocument()
    })

    it('should render error status correctly', () => {
      const reactorError = createMockReactor({ status: 'error' })
      render(<ReactorCard reactor={reactorError} />)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should render maintenance status correctly', () => {
      const reactorMaintenance = createMockReactor({ status: 'maintenance' })
      render(<ReactorCard reactor={reactorMaintenance} />)
      expect(screen.getByText('Mantenimiento')).toBeInTheDocument()
    })
  })

  describe('Current batch information', () => {
    it('should not render batch info when no current batch', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.queryByText('Lote Actual')).not.toBeInTheDocument()
    })

    it('should render batch info when current batch exists', () => {
      const reactorWithBatch = createMockReactor({
        currentBatch: {
          id: 'batch-001',
          productId: 'prod-001',
          quantity: 500,
          status: 'in_progress',
          startTime: new Date('2024-01-01T10:00:00'),
          estimatedCompletion: new Date('2024-01-01T12:00:00'),
          recipe: {} as any,
          qualityMetrics: []
        }
      })
      render(<ReactorCard reactor={reactorWithBatch} />)
      
      expect(screen.getByText('Lote Actual')).toBeInTheDocument()
      expect(screen.getByText('batch-001')).toBeInTheDocument()
      expect(screen.getByText('500 L')).toBeInTheDocument()
    })
  })

  describe('Utilization calculation', () => {
    it('should calculate utilization percentage correctly', () => {
      const reactorWithBatch = createMockReactor({
        capacity: 1000,
        currentBatch: {
          id: 'batch-001',
          productId: 'prod-001',
          quantity: 800,
          status: 'in_progress',
          startTime: new Date(),
          estimatedCompletion: new Date(),
          recipe: {} as any,
          qualityMetrics: []
        }
      })
      render(<ReactorCard reactor={reactorWithBatch} />)
      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should show 0% utilization when no batch', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('Capacity progress bar', () => {
    it('should render capacity progress bar', () => {
      const reactorWithBatch = createMockReactor({
        capacity: 1000,
        currentBatch: {
          id: 'batch-001',
          productId: 'prod-001', 
          quantity: 600,
          status: 'in_progress',
          startTime: new Date(),
          estimatedCompletion: new Date(),
          recipe: {} as any,
          qualityMetrics: []
        }
      })
      render(<ReactorCard reactor={reactorWithBatch} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveStyle('width: 60%')
    })
  })

  describe('Maintenance information', () => {
    it('should render maintenance dates', () => {
      render(<ReactorCard reactor={mockReactor} />)
      expect(screen.getByText(/Último mant:/)).toBeInTheDocument()
      expect(screen.getByText(/Próximo:/)).toBeInTheDocument()
    })
  })

  describe('Click interaction', () => {
    it('should call onClick when card is clicked', () => {
      const onClickMock = jest.fn()
      render(<ReactorCard reactor={mockReactor} onClick={onClickMock} />)
      
      const card = screen.getByText(mockReactor.name).closest('.cursor-pointer')
      fireEvent.click(card!)
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should not throw error when onClick is not provided', () => {
      expect(() => {
        render(<ReactorCard reactor={mockReactor} />)
        fireEvent.click(screen.getByText(mockReactor.name))
      }).not.toThrow()
    })
  })

  describe('Hover effects', () => {
    it('should have hover class for shadow effect', () => {
      render(<ReactorCard reactor={mockReactor} />)
      const card = screen.getByText(mockReactor.name).closest('.cursor-pointer')
      expect(card).toHaveClass('hover:shadow-md')
    })
  })
})
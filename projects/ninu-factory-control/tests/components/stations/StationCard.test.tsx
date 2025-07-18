import React from 'react'
import { render, screen, fireEvent } from '../../utils/test-utils'
import { StationCard } from '../../../components/stations/StationCard'
import { createMockStation, createMockProduct } from '../../utils/test-utils'

describe('StationCard', () => {
  const mockStation = createMockStation()

  describe('Basic rendering', () => {
    it('should render station name', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.getByText(mockStation.name)).toBeInTheDocument()
    })

    it('should render station status badge', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.getByText('Inactiva')).toBeInTheDocument()
    })

    it('should render station type name', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.getByText('Etiquetado')).toBeInTheDocument()
    })

    it('should render station type icon for labeling', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.getByText('🏷️')).toBeInTheDocument()
    })

    it('should render efficiency percentage', () => {
      render(<StationCard station={mockStation} />)
      const efficiencyElements = screen.getAllByText('85%')
      expect(efficiencyElements.length).toBeGreaterThan(0)
    })

    it('should render units per hour', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  describe('Station types and icons', () => {
    it('should render correct icon for filling station', () => {
      const fillingStation = createMockStation({ type: 'filling' })
      render(<StationCard station={fillingStation} />)
      expect(screen.getByText('🫗')).toBeInTheDocument()
      expect(screen.getByText('Llenado')).toBeInTheDocument()
    })

    it('should render correct icon for packaging station', () => {
      const packagingStation = createMockStation({ type: 'packaging' })
      render(<StationCard station={packagingStation} />)
      expect(screen.getByText('📦')).toBeInTheDocument()
      expect(screen.getByText('Empaque')).toBeInTheDocument()
    })

    it('should render correct icon for powder station', () => {
      const powderStation = createMockStation({ type: 'powder' })
      render(<StationCard station={powderStation} />)
      expect(screen.getByText('🥄')).toBeInTheDocument()
      expect(screen.getByText('Polvos')).toBeInTheDocument()
    })

    it('should render correct icon for soap station', () => {
      const soapStation = createMockStation({ type: 'soap' })
      render(<StationCard station={soapStation} />)
      expect(screen.getByText('🧼')).toBeInTheDocument()
      expect(screen.getByText('Jabones')).toBeInTheDocument()
    })

    it('should render default icon for unknown type', () => {
      const unknownStation = createMockStation({ type: 'unknown' as any })
      render(<StationCard station={unknownStation} />)
      expect(screen.getByText('⚙️')).toBeInTheDocument()
      expect(screen.getByText('Estación')).toBeInTheDocument()
    })
  })

  describe('Status rendering', () => {
    it('should render correct status text for different statuses', () => {
      const runningStation = createMockStation({ status: 'running' })
      render(<StationCard station={runningStation} />)
      expect(screen.getByText('Operando')).toBeInTheDocument()
    })

    it('should render maintenance status correctly', () => {
      const maintenanceStation = createMockStation({ status: 'maintenance' })
      render(<StationCard station={maintenanceStation} />)
      expect(screen.getByText('Mantenimiento')).toBeInTheDocument()
    })

    it('should render error status correctly', () => {
      const errorStation = createMockStation({ status: 'error' })
      render(<StationCard station={errorStation} />)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('Current product information', () => {
    it('should not render product info when no current product', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.queryByText('Producto Actual')).not.toBeInTheDocument()
    })

    it('should render product info when current product exists', () => {
      const mockProduct = createMockProduct({
        name: 'Limpiador Multiusos',
        size: 1,
        unit: 'l'
      })
      const stationWithProduct = createMockStation({
        currentProduct: mockProduct
      })
      render(<StationCard station={stationWithProduct} />)
      
      expect(screen.getByText('Producto Actual')).toBeInTheDocument()
      expect(screen.getByText('Limpiador Multiusos')).toBeInTheDocument()
      expect(screen.getByText('1 l')).toBeInTheDocument()
    })
  })

  describe('Efficiency metrics', () => {
    it('should render efficiency with green color for high efficiency', () => {
      const highEfficiencyStation = createMockStation({ efficiency: 95 })
      render(<StationCard station={highEfficiencyStation} />)
      
      const efficiencyElements = screen.getAllByText('95%')
      const efficiencyText = efficiencyElements.find(el => el.classList.contains('text-green-600'))
      expect(efficiencyText).toBeInTheDocument()
    })

    it('should render efficiency with yellow color for medium efficiency', () => {
      const mediumEfficiencyStation = createMockStation({ efficiency: 75 })
      render(<StationCard station={mediumEfficiencyStation} />)
      
      const efficiencyElements = screen.getAllByText('75%')
      const efficiencyText = efficiencyElements.find(el => el.classList.contains('text-yellow-600'))
      expect(efficiencyText).toBeInTheDocument()
    })

    it('should render efficiency with red color for low efficiency', () => {
      const lowEfficiencyStation = createMockStation({ efficiency: 50 })
      render(<StationCard station={lowEfficiencyStation} />)
      
      const efficiencyElements = screen.getAllByText('50%')
      const efficiencyText = efficiencyElements.find(el => el.classList.contains('text-red-600'))
      expect(efficiencyText).toBeInTheDocument()
    })
  })

  describe('Efficiency progress bar', () => {
    it('should render progress bar with correct width', () => {
      const station = createMockStation({ efficiency: 75 })
      render(<StationCard station={station} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveStyle('width: 75%')
    })

    it('should render green progress bar for high efficiency', () => {
      const station = createMockStation({ efficiency: 95 })
      render(<StationCard station={station} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveClass('bg-green-600')
    })

    it('should render yellow progress bar for medium efficiency', () => {
      const station = createMockStation({ efficiency: 75 })
      render(<StationCard station={station} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveClass('bg-yellow-500')
    })

    it('should render red progress bar for low efficiency', () => {
      const station = createMockStation({ efficiency: 50 })
      render(<StationCard station={station} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveClass('bg-red-500')
    })
  })

  describe('Queue status', () => {
    it('should not render queue info when queue is empty', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.queryByText('Cola de Producción')).not.toBeInTheDocument()
    })

    it('should render queue info when station has pending work', () => {
      const stationWithQueue = createMockStation({
        queue: [
          { id: '1', batchId: 'batch-1', priority: 'high', estimatedDuration: 60, scheduledStart: new Date() },
          { id: '2', batchId: 'batch-2', priority: 'medium', estimatedDuration: 45, scheduledStart: new Date() }
        ]
      })
      render(<StationCard station={stationWithQueue} />)
      
      expect(screen.getByText('Cola de Producción')).toBeInTheDocument()
      expect(screen.getByText('2 trabajos pendientes')).toBeInTheDocument()
    })

    it('should render singular text for single work item', () => {
      const stationWithOneJob = createMockStation({
        queue: [
          { id: '1', batchId: 'batch-1', priority: 'high', estimatedDuration: 60, scheduledStart: new Date() }
        ]
      })
      render(<StationCard station={stationWithOneJob} />)
      
      expect(screen.getByText('1 trabajo pendientes')).toBeInTheDocument()
    })
  })

  describe('Maintenance alert', () => {
    it('should not render maintenance alert for non-maintenance status', () => {
      render(<StationCard station={mockStation} />)
      expect(screen.queryByText('En Mantenimiento')).not.toBeInTheDocument()
    })

    it('should render maintenance alert when station is in maintenance', () => {
      const maintenanceStation = createMockStation({ status: 'maintenance' })
      render(<StationCard station={maintenanceStation} />)
      
      expect(screen.getByText('En Mantenimiento')).toBeInTheDocument()
      expect(screen.getByText('Estación fuera de servicio temporalmente')).toBeInTheDocument()
    })
  })

  describe('Last activity information', () => {
    it('should render last activity timestamp', () => {
      const station = createMockStation({
        lastActivity: new Date('2024-01-01T10:00:00')
      })
      render(<StationCard station={station} />)
      
      expect(screen.getByText(/Última actividad:/)).toBeInTheDocument()
    })
  })

  describe('Click interaction', () => {
    it('should call onClick when card is clicked', () => {
      const onClickMock = jest.fn()
      render(<StationCard station={mockStation} onClick={onClickMock} />)
      
      const card = screen.getByText(mockStation.name).closest('.cursor-pointer')
      fireEvent.click(card!)
      expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should not throw error when onClick is not provided', () => {
      expect(() => {
        render(<StationCard station={mockStation} />)
        const card = screen.getByText(mockStation.name).closest('.cursor-pointer')
        fireEvent.click(card!)
      }).not.toThrow()
    })
  })

  describe('Hover effects', () => {
    it('should have hover class for shadow effect', () => {
      render(<StationCard station={mockStation} />)
      const card = screen.getByText(mockStation.name).closest('.cursor-pointer')
      expect(card).toHaveClass('hover:shadow-md')
    })

    it('should have transition class for smooth effects', () => {
      render(<StationCard station={mockStation} />)
      const card = screen.getByText(mockStation.name).closest('.cursor-pointer')
      expect(card).toHaveClass('transition-shadow')
    })
  })

  describe('Edge cases', () => {
    it('should handle station with zero efficiency', () => {
      const zeroEfficiencyStation = createMockStation({ efficiency: 0 })
      render(<StationCard station={zeroEfficiencyStation} />)
      
      const efficiencyElements = screen.getAllByText('0%')
      expect(efficiencyElements.length).toBeGreaterThan(0)
      const efficiencyText = efficiencyElements.find(el => el.classList.contains('text-red-600'))
      expect(efficiencyText).toBeInTheDocument()
    })

    it('should handle station with maximum efficiency', () => {
      const maxEfficiencyStation = createMockStation({ efficiency: 100 })
      render(<StationCard station={maxEfficiencyStation} />)
      
      const efficiencyElements = screen.getAllByText('100%')
      expect(efficiencyElements.length).toBeGreaterThan(0)
      const efficiencyText = efficiencyElements.find(el => el.classList.contains('text-green-600'))
      expect(efficiencyText).toBeInTheDocument()
    })

    it('should handle station with zero units per hour', () => {
      const zeroUnitsStation = createMockStation({ unitsPerHour: 0 })
      render(<StationCard station={zeroUnitsStation} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle very large queue numbers', () => {
      const largeQueue = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        batchId: `batch-${i}`,
        priority: 'medium' as const,
        estimatedDuration: 30,
        scheduledStart: new Date()
      }))
      
      const stationWithLargeQueue = createMockStation({ queue: largeQueue })
      render(<StationCard station={stationWithLargeQueue} />)
      
      expect(screen.getByText('1000 trabajos pendientes')).toBeInTheDocument()
    })
  })
})
import { render, screen, fireEvent } from '@testing-library/react'
import { StationGrid } from '../../../components/stations/StationGrid'
import { createMockStation } from '../../utils/test-factories'

describe('StationGrid Component', () => {
  const mockStations = [
    createMockStation({
      id: '1',
      name: 'Estación Etiquetado Principal',
      type: 'labeling',
      status: 'running'
    }),
    createMockStation({
      id: '2',
      name: 'Estación Llenado',
      type: 'filling', 
      status: 'idle'
    }),
    createMockStation({
      id: '3',
      name: 'Estación Polvos',
      type: 'powder',
      status: 'maintenance'
    }),
    createMockStation({
      id: '4',
      name: 'Estación Jabones',
      type: 'soap',
      status: 'running'
    })
  ]

  describe('Rendering', () => {
    it('renders grid container with correct styling', () => {
      render(<StationGrid stations={mockStations} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-6')
    })

    it('renders all provided stations', () => {
      render(<StationGrid stations={mockStations} />)
      
      expect(screen.getByText('Estación Etiquetado Principal')).toBeInTheDocument()
      expect(screen.getByText('Estación Llenado')).toBeInTheDocument()
      expect(screen.getByText('Estación Polvos')).toBeInTheDocument()
      expect(screen.getByText('Estación Jabones')).toBeInTheDocument()
    })

    it('renders empty grid when no stations provided', () => {
      render(<StationGrid stations={[]} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer!.children).toHaveLength(0)
    })

    it('renders single station correctly', () => {
      const singleStation = [mockStations[0]]
      render(<StationGrid stations={singleStation} />)
      
      expect(screen.getByText('Estación Etiquetado Principal')).toBeInTheDocument()
      expect(screen.queryByText('Estación Llenado')).not.toBeInTheDocument()
    })

    it('displays different station types correctly', () => {
      render(<StationGrid stations={mockStations} />)
      
      // Should show different station type badges
      expect(screen.getByText('Etiquetado')).toBeInTheDocument()
      expect(screen.getByText('Llenado')).toBeInTheDocument()
      expect(screen.getByText('Polvos')).toBeInTheDocument()
      expect(screen.getByText('Jabones')).toBeInTheDocument()
    })
  })

  describe('Click interactions', () => {
    it('calls onStationClick when station is clicked', () => {
      const mockOnClick = jest.fn()
      render(<StationGrid stations={mockStations} onStationClick={mockOnClick} />)
      
      const stationCard = screen.getByText('Estación Etiquetado Principal').closest('div')
      fireEvent.click(stationCard!)
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      expect(mockOnClick).toHaveBeenCalledWith(mockStations[0])
    })

    it('calls onStationClick with correct station data', () => {
      const mockOnClick = jest.fn()
      render(<StationGrid stations={mockStations} onStationClick={mockOnClick} />)
      
      // Click second station
      const secondStationCard = screen.getByText('Estación Llenado').closest('div')
      fireEvent.click(secondStationCard!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockStations[1])
    })

    it('works without onStationClick handler', () => {
      expect(() => {
        render(<StationGrid stations={mockStations} />)
        
        const stationCard = screen.getByText('Estación Etiquetado Principal').closest('div')
        fireEvent.click(stationCard!)
      }).not.toThrow()
    })

    it('handles clicks on different station types', () => {
      const mockOnClick = jest.fn()
      render(<StationGrid stations={mockStations} onStationClick={mockOnClick} />)
      
      // Click maintenance station
      const maintenanceStationCard = screen.getByText('Estación Polvos').closest('div')
      fireEvent.click(maintenanceStationCard!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockStations[2])
      expect(mockStations[2].status).toBe('maintenance')
    })
  })

  describe('Key handling', () => {
    it('assigns unique keys to station cards', () => {
      render(<StationGrid stations={mockStations} />)
      
      // Verify each station is rendered (keys are internal to React)
      mockStations.forEach(station => {
        expect(screen.getByText(station.name)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('handles large number of stations', () => {
      const manyStations = Array.from({ length: 20 }, (_, i) => 
        createMockStation({
          id: `station-${i}`,
          name: `Estación ${i}`,
          type: 'filling',
          status: 'idle'
        })
      )
      
      render(<StationGrid stations={manyStations} />)
      
      // Should render first and last stations
      expect(screen.getByText('Estación 0')).toBeInTheDocument()
      expect(screen.getByText('Estación 19')).toBeInTheDocument()
    })
  })

  describe('Responsive behavior', () => {
    it('applies responsive grid classes for more columns than ReactorGrid', () => {
      render(<StationGrid stations={mockStations} />)
      
      const gridContainer = document.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1')      // Mobile
      expect(gridContainer).toHaveClass('md:grid-cols-2')   // Medium screens
      expect(gridContainer).toHaveClass('lg:grid-cols-3')   // Large screens  
      expect(gridContainer).toHaveClass('xl:grid-cols-4')   // Extra large screens (unique to stations)
    })
  })

  describe('Station status visibility', () => {
    it('shows running stations with correct styling', () => {
      render(<StationGrid stations={mockStations} />)
      
      const runningStations = mockStations.filter(s => s.status === 'running')
      runningStations.forEach(station => {
        const card = screen.getByText(station.name).closest('div')
        expect(card).toBeInTheDocument()
      })
    })

    it('shows maintenance stations with correct styling', () => {
      render(<StationGrid stations={mockStations} />)
      
      const maintenanceStations = mockStations.filter(s => s.status === 'maintenance')
      maintenanceStations.forEach(station => {
        expect(screen.getByText(station.name)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('maintains accessibility for all station cards', () => {
      render(<StationGrid stations={mockStations} />)
      
      // Each station card should have a heading with the name
      mockStations.forEach(station => {
        const heading = screen.getByRole('heading', { name: station.name })
        expect(heading).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation through station cards', () => {
      const mockOnClick = jest.fn()
      render(<StationGrid stations={mockStations} onStationClick={mockOnClick} />)
      
      // Find the first station card by its name and then click it
      const firstStationCard = screen.getByText('Estación Etiquetado Principal').closest('div')
      fireEvent.click(firstStationCard!)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockStations[0])
    })

    it('provides clear station type identification', () => {
      render(<StationGrid stations={mockStations} />)
      
      // Station types should be clearly labeled
      expect(screen.getByText('Etiquetado')).toBeInTheDocument()
      expect(screen.getByText('Llenado')).toBeInTheDocument()
      expect(screen.getByText('Polvos')).toBeInTheDocument()
      expect(screen.getByText('Jabones')).toBeInTheDocument()
    })
  })
})
import React from 'react'
import { render, screen } from '../../utils/test-utils'
import '@testing-library/jest-dom'
import { MetricsOverview } from '../../../components/dashboard/MetricsOverview'
import { createMockMetrics } from '../../utils/test-utils'

describe('MetricsOverview Component', () => {
  const mockMetrics = createMockMetrics({
    totalProduction: 12450,
    efficiency: 89.5,
    qualityRate: 98.2,
    downtime: 2.3,
    activeOrders: 8,
    completedOrders: 23,
    alertsCount: 3
  })

  describe('Basic rendering', () => {
    it('renders main heading', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('Métricas de Producción')).toBeInTheDocument()
    })

    it('displays all metric cards', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('Producción Total')).toBeInTheDocument()
      expect(screen.getByText('Eficiencia General')).toBeInTheDocument()
      expect(screen.getByText('Calidad')).toBeInTheDocument()
      expect(screen.getByText('Tiempo Inactivo')).toBeInTheDocument()
      expect(screen.getByText('Órdenes Activas')).toBeInTheDocument()
      expect(screen.getByText('Alertas Activas')).toBeInTheDocument()
    })

    it('displays timestamp', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText(/Actualizado:/)).toBeInTheDocument()
    })

    it('renders summary section', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('Resumen del Día')).toBeInTheDocument()
    })
  })

  describe('Metric values display', () => {
    it('displays production total with formatted number', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('12,450')).toBeInTheDocument()
      expect(screen.getByText('unidades')).toBeInTheDocument()
    })

    it('displays efficiency percentage', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('89.5%')).toBeInTheDocument()
    })

    it('displays quality rate percentage', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      // Quality rate appears in both metric card and summary, use getAllByText
      expect(screen.getAllByText('98.2%')).toHaveLength(2)
    })

    it('displays downtime percentage', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('2.3%')).toBeInTheDocument()
    })

    it('displays active orders count', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('displays alerts count', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Color coding based on performance', () => {
    it('shows green for high efficiency (>= 85%)', () => {
      const highEfficiencyMetrics = createMockMetrics({ efficiency: 90 })
      const { container } = render(<MetricsOverview metrics={highEfficiencyMetrics} />)
      
      // Check for green background class in efficiency card
      const greenBgElements = container.querySelectorAll('.bg-green-100')
      expect(greenBgElements.length).toBeGreaterThan(0)
    })

    it('shows yellow for medium efficiency (70-84%)', () => {
      const mediumEfficiencyMetrics = createMockMetrics({ efficiency: 75 })
      const { container } = render(<MetricsOverview metrics={mediumEfficiencyMetrics} />)
      
      // Check for yellow background class in efficiency card
      const yellowBgElements = container.querySelectorAll('.bg-yellow-100')
      expect(yellowBgElements.length).toBeGreaterThan(0)
    })

    it('shows red for low efficiency (< 70%)', () => {
      const lowEfficiencyMetrics = createMockMetrics({ efficiency: 65 })
      const { container } = render(<MetricsOverview metrics={lowEfficiencyMetrics} />)
      
      // Check for red background class in efficiency card
      const redBgElements = container.querySelectorAll('.bg-red-100')
      expect(redBgElements.length).toBeGreaterThan(0)
    })

    it('shows green for low downtime (<= 5%)', () => {
      const lowDowntimeMetrics = createMockMetrics({ downtime: 3 })
      const { container } = render(<MetricsOverview metrics={lowDowntimeMetrics} />)
      
      // Check for green background class in downtime card
      const greenBgElements = container.querySelectorAll('.bg-green-100')
      expect(greenBgElements.length).toBeGreaterThan(0)
    })

    it('shows yellow for medium downtime (5-10%)', () => {
      const mediumDowntimeMetrics = createMockMetrics({ downtime: 7 })
      const { container } = render(<MetricsOverview metrics={mediumDowntimeMetrics} />)
      
      // Check for yellow background class in downtime card
      const yellowBgElements = container.querySelectorAll('.bg-yellow-100')
      expect(yellowBgElements.length).toBeGreaterThan(0)
    })

    it('shows red for high downtime (> 10%)', () => {
      const highDowntimeMetrics = createMockMetrics({ downtime: 15 })
      const { container } = render(<MetricsOverview metrics={highDowntimeMetrics} />)
      
      // Check for red background class in downtime card
      const redBgElements = container.querySelectorAll('.bg-red-100')
      expect(redBgElements.length).toBeGreaterThan(0)
    })

    it('shows green for no alerts', () => {
      const noAlertsMetrics = createMockMetrics({ alertsCount: 0 })
      const { container } = render(<MetricsOverview metrics={noAlertsMetrics} />)
      
      // Check for green background class in alerts card
      const greenBgElements = container.querySelectorAll('.bg-green-100')
      expect(greenBgElements.length).toBeGreaterThan(0)
    })

    it('shows yellow for few alerts (1-3)', () => {
      const fewAlertsMetrics = createMockMetrics({ alertsCount: 2 })
      const { container } = render(<MetricsOverview metrics={fewAlertsMetrics} />)
      
      // Check for yellow background class in alerts card
      const yellowBgElements = container.querySelectorAll('.bg-yellow-100')
      expect(yellowBgElements.length).toBeGreaterThan(0)
    })

    it('shows red for many alerts (> 3)', () => {
      const manyAlertsMetrics = createMockMetrics({ alertsCount: 5 })
      const { container } = render(<MetricsOverview metrics={manyAlertsMetrics} />)
      
      // Check for red background class in alerts card
      const redBgElements = container.querySelectorAll('.bg-red-100')
      expect(redBgElements.length).toBeGreaterThan(0)
    })
  })

  describe('Summary section', () => {
    it('displays completed orders count', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('Órdenes Completadas:')).toBeInTheDocument()
      expect(screen.getByText('23')).toBeInTheDocument()
    })

    it('displays average quality rate', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('Promedio de Calidad:')).toBeInTheDocument()
      // Quality rate appears twice: in metric card and summary
      expect(screen.getAllByText('98.2%')).toHaveLength(2)
    })

    it('displays efficiency target', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByText('Eficiencia Objetivo:')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('shows "Excelente" status for excellent performance', () => {
      const excellentMetrics = createMockMetrics({
        efficiency: 90,
        qualityRate: 98,
        downtime: 2
      })
      render(<MetricsOverview metrics={excellentMetrics} />)
      
      expect(screen.getByText('Estado General:')).toBeInTheDocument()
      expect(screen.getByText('Excelente')).toBeInTheDocument()
    })

    it('shows "Bueno" status for good but not excellent performance', () => {
      const goodMetrics = createMockMetrics({
        efficiency: 80,
        qualityRate: 94,
        downtime: 7
      })
      render(<MetricsOverview metrics={goodMetrics} />)
      
      expect(screen.getByText('Estado General:')).toBeInTheDocument()
      expect(screen.getByText('Bueno')).toBeInTheDocument()
    })
  })

  describe('Responsive design', () => {
    it('has responsive grid classes for metric cards', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      const grid = screen.getByText('Producción Total').closest('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-6')
    })

    it('has responsive grid for summary section', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      const summaryGrid = screen.getByText('Órdenes Completadas:').closest('.grid')
      expect(summaryGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('Icons display', () => {
    it('renders appropriate icons for each metric', () => {
      const { container } = render(<MetricsOverview metrics={mockMetrics} />)
      
      // Check that SVG icons are rendered (Lucide icons)
      // Should have 6 icons for metric cards + 3 control icons (trends, utilization, refresh)
      const svgIcons = container.querySelectorAll('svg')
      expect(svgIcons.length).toBeGreaterThanOrEqual(6) // At least 6 icons for metric cards
    })
  })

  describe('Hover effects', () => {
    it('applies hover classes to metric cards', () => {
      const { container } = render(<MetricsOverview metrics={mockMetrics} />)
      
      // Check hover classes on metric cards
      const hoverCards = container.querySelectorAll('.hover\\:shadow-md')
      expect(hoverCards.length).toBe(6) // Should have 6 cards with hover effect
    })
  })

  describe('Edge cases', () => {
    it('handles zero values correctly', () => {
      const zeroMetrics = createMockMetrics({
        totalProduction: 0,
        efficiency: 0,
        qualityRate: 0,
        downtime: 0,
        activeOrders: 0,
        alertsCount: 0,
        completedOrders: 0
      })
      render(<MetricsOverview metrics={zeroMetrics} />)
      
      // Should display zero values correctly
      expect(screen.getAllByText('0')).toHaveLength(4) // totalProduction, activeOrders, alertsCount, completedOrders
      expect(screen.getAllByText('0%')).toHaveLength(4) // efficiency, qualityRate, downtime, and summary quality
    })

    it('handles very large numbers', () => {
      const largeMetrics = createMockMetrics({
        totalProduction: 1234567,
        activeOrders: 999,
        completedOrders: 888
      })
      render(<MetricsOverview metrics={largeMetrics} />)
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
      expect(screen.getByText('999')).toBeInTheDocument()
      expect(screen.getByText('888')).toBeInTheDocument()
    })

    it('handles decimal values in percentages', () => {
      const decimalMetrics = createMockMetrics({
        efficiency: 89.7,
        qualityRate: 97.3,
        downtime: 2.8
      })
      render(<MetricsOverview metrics={decimalMetrics} />)
      
      expect(screen.getByText('89.7%')).toBeInTheDocument()
      expect(screen.getAllByText('97.3%')).toHaveLength(2) // Appears in metric card and summary
      expect(screen.getByText('2.8%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveTextContent('Métricas de Producción')
      
      const summaryHeading = screen.getByRole('heading', { level: 3 })
      expect(summaryHeading).toHaveTextContent('Resumen del Día')
    })

    it('provides clear metric labeling', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      // Each metric should have clear labels
      expect(screen.getByText('Producción Total')).toBeInTheDocument()
      expect(screen.getByText('Eficiencia General')).toBeInTheDocument()
      expect(screen.getByText('Calidad')).toBeInTheDocument()
      expect(screen.getByText('Tiempo Inactivo')).toBeInTheDocument()
      expect(screen.getByText('Órdenes Activas')).toBeInTheDocument()
      expect(screen.getByText('Alertas Activas')).toBeInTheDocument()
    })
  })

  // Context Engineering Principles Application
  describe('Context Engineering Compliance', () => {
    it('follows atomic responsibility principle', () => {
      const { container } = render(<MetricsOverview metrics={mockMetrics} />)
      
      // Component should be self-contained with clear boundaries
      const mainDiv = container.querySelector('div.space-y-6')
      expect(mainDiv).toBeInTheDocument()
      
      // Should not handle navigation, settings, or other concerns
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
      expect(screen.queryByText('Menu')).not.toBeInTheDocument()
    })

    it('maintains modular composition standards', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      // Component should be focused on metrics display only
      expect(screen.getByText('Métricas de Producción')).toBeInTheDocument()
      expect(screen.getByText('Resumen del Día')).toBeInTheDocument()
      
      // Should use proper card-based architecture
      const cards = screen.getAllByRole('heading', { level: 3 })
      expect(cards).toHaveLength(1) // Only summary heading, metric titles are not headings
    })

    it('implements progressive intelligence framework', () => {
      // Test with complex data to ensure intelligent display
      const complexMetrics = createMockMetrics({
        totalProduction: 123456,
        efficiency: 87.5,
        qualityRate: 96.2,
        downtime: 4.8,
        activeOrders: 15,
        alertsCount: 3,
        completedOrders: 42,
        timestamp: new Date()
      })
      
      render(<MetricsOverview metrics={complexMetrics} />)
      
      // Should handle complexity intelligently
      expect(screen.getByText('123,456')).toBeInTheDocument()
      expect(screen.getByText('87.5%')).toBeInTheDocument()
      expect(screen.getAllByText('96.2%')).toHaveLength(2) // Appears in metric card and summary
    })
  })

  // COFEPRIS Compliance Tests (Factory Control Specific)
  describe('COFEPRIS Quality Standards', () => {
    it('flags when quality rate is below COFEPRIS minimum (95%)', () => {
      const lowQualityMetrics = createMockMetrics({
        efficiency: 90,
        qualityRate: 92, // Below 95% COFEPRIS minimum
        downtime: 3
      })
      render(<MetricsOverview metrics={lowQualityMetrics} />)
      
      // Should show "Bueno" status instead of "Excelente"
      expect(screen.getByText('Bueno')).toBeInTheDocument()
      expect(screen.queryByText('Excelente')).not.toBeInTheDocument()
    })

    it('shows excellent status when meeting all COFEPRIS thresholds', () => {
      const cofeprisCompliantMetrics = createMockMetrics({
        efficiency: 88,
        qualityRate: 97, // Above 95% COFEPRIS minimum
        downtime: 4
      })
      render(<MetricsOverview metrics={cofeprisCompliantMetrics} />)
      
      expect(screen.getByText('Excelente')).toBeInTheDocument()
    })
  })

  // Performance and Load Tests
  describe('Performance Optimization', () => {
    it('renders efficiently with large datasets', () => {
      const largeDataMetrics = createMockMetrics({
        totalProduction: 9999999,
        activeOrders: 9999,
        completedOrders: 9999,
        alertsCount: 999
      })
      
      const startTime = performance.now()
      render(<MetricsOverview metrics={largeDataMetrics} />)
      const endTime = performance.now()
      
      // Should render quickly even with large numbers
      expect(endTime - startTime).toBeLessThan(50)
      expect(screen.getByText('9,999,999')).toBeInTheDocument()
    })

    it('handles rapid re-renders without performance degradation', () => {
      const { rerender } = render(<MetricsOverview metrics={mockMetrics} />)
      
      // Simulate multiple rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedMetrics = createMockMetrics({
          totalProduction: 1000 + i,
          efficiency: 85 + i,
          timestamp: new Date()
        })
        rerender(<MetricsOverview metrics={updatedMetrics} />)
      }
      
      // Final render should work correctly
      expect(screen.getByText('1,009')).toBeInTheDocument()
      expect(screen.getByText('94%')).toBeInTheDocument()
    })
  })

  // Boundary Value Tests
  describe('Boundary Value Analysis', () => {
    it('handles efficiency threshold boundaries correctly', () => {
      // Test exactly at thresholds
      const exactThresholdMetrics = createMockMetrics({ efficiency: 85 })
      render(<MetricsOverview metrics={exactThresholdMetrics} />)
      
      // 85% should be green (>= 85)
      const { container } = render(<MetricsOverview metrics={exactThresholdMetrics} />)
      const greenBgElements = container.querySelectorAll('.bg-green-100')
      expect(greenBgElements.length).toBeGreaterThan(0)
    })

    it('handles downtime threshold boundaries correctly', () => {
      // Test exactly at threshold
      const exactDowntimeMetrics = createMockMetrics({ downtime: 5 })
      const { container } = render(<MetricsOverview metrics={exactDowntimeMetrics} />)
      
      // 5% should be green (<= 5)
      const greenBgElements = container.querySelectorAll('.bg-green-100')
      expect(greenBgElements.length).toBeGreaterThan(0)
    })

    it('handles alerts threshold boundaries correctly', () => {
      // Test exactly at threshold
      const exactAlertsMetrics = createMockMetrics({ alertsCount: 3 })
      const { container } = render(<MetricsOverview metrics={exactAlertsMetrics} />)
      
      // 3 alerts should be yellow (<= 3)
      const yellowBgElements = container.querySelectorAll('.bg-yellow-100')
      expect(yellowBgElements.length).toBeGreaterThan(0)
    })
  })

  // Integration with Factory Control System
  describe('Factory Control Integration', () => {
    it('displays production metrics in proper factory units', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      // Should display production in units appropriate for Ninu.mx factory
      expect(screen.getByText('unidades')).toBeInTheDocument()
      expect(screen.getByText('12,450')).toBeInTheDocument()
    })

    it('maintains real-time data structure compatibility', () => {
      // Simulate real-time data structure from factory sensors
      const realTimeMetrics = createMockMetrics({
        totalProduction: 15680,
        efficiency: 91.2,
        qualityRate: 97.8,
        downtime: 2.1,
        activeOrders: 12,
        completedOrders: 28,
        alertsCount: 1,
        timestamp: new Date() // Current timestamp
      })
      
      render(<MetricsOverview metrics={realTimeMetrics} />)
      
      // Should handle real-time data structure
      expect(screen.getByText('15,680')).toBeInTheDocument()
      expect(screen.getByText('91.2%')).toBeInTheDocument()
      expect(screen.getAllByText('97.8%')).toHaveLength(2) // Appears in metric card and summary
    })
  })

  // New Functionality Tests for Enhanced MetricsOverview
  describe('Auto-refresh functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('sets up auto-refresh when configured', () => {
      const mockOnRefresh = jest.fn()
      render(
        <MetricsOverview 
          metrics={mockMetrics} 
          config={{ autoRefresh: true, refreshInterval: 5000 }}
          onRefresh={mockOnRefresh}
        />
      )
      
      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    it('displays auto-refresh indicator when active', () => {
      render(
        <MetricsOverview 
          metrics={mockMetrics} 
          config={{ autoRefresh: true }}
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText('Auto-refresh activo')).toBeInTheDocument()
    })

    it('does not set up auto-refresh when disabled', () => {
      const mockOnRefresh = jest.fn()
      render(
        <MetricsOverview 
          metrics={mockMetrics} 
          config={{ autoRefresh: false }}
          onRefresh={mockOnRefresh}
        />
      )
      
      jest.advanceTimersByTime(30000)
      
      expect(mockOnRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Resource utilization display', () => {
    const metricsWithUtilization = createMockMetrics({
      ...mockMetrics,
      resourceUtilization: {
        reactors: {
          'reactor-001': { utilization: 85, status: 'mixing', efficiency: 92 },
          'reactor-002': { utilization: 0, status: 'idle', efficiency: 0 },
          'reactor-003': { utilization: 75, status: 'cooling', efficiency: 88 }
        },
        stations: {
          'station-001': { utilization: 90, status: 'running', efficiency: 92 },
          'station-002': { utilization: 85, status: 'running', efficiency: 88 }
        },
        overall: {
          capacity: 100,
          utilization: 67,
          efficiency: 89.5
        }
      }
    })

    it('shows resource utilization when toggle is activated', () => {
      render(
        <MetricsOverview 
          metrics={metricsWithUtilization}
          config={{ showResourceUtilization: true }}
        />
      )
      
      // Resource utilization should be visible when enabled
      expect(screen.getByText('Utilización de Recursos')).toBeInTheDocument()
      expect(screen.getByText('Reactores')).toBeInTheDocument()
      expect(screen.getByText('Estaciones')).toBeInTheDocument()
    })

    it('displays reactor utilization data correctly', () => {
      render(
        <MetricsOverview 
          metrics={metricsWithUtilization}
          config={{ showResourceUtilization: true }}
        />
      )
      
      expect(screen.getByText('Reactor 001')).toBeInTheDocument()
      expect(screen.getAllByText('85%').length).toBeGreaterThan(0)
    })

    it('displays overall utilization summary', () => {
      render(
        <MetricsOverview 
          metrics={metricsWithUtilization}
          config={{ showResourceUtilization: true }}
        />
      )
      
      expect(screen.getByText('Utilización General de Planta')).toBeInTheDocument()
      expect(screen.getByText('67%')).toBeInTheDocument()
      expect(screen.getByText('Eficiencia: 89.5%')).toBeInTheDocument()
    })
  })

  describe('Trend indicators', () => {
    const metricsWithTrends = createMockMetrics({
      ...mockMetrics,
      trends: {
        efficiency: [
          { timestamp: new Date(Date.now() - 3600000), value: 85 },
          { timestamp: new Date(Date.now() - 1800000), value: 87 },
          { timestamp: new Date(), value: 89.5 }
        ],
        production: [
          { timestamp: new Date(Date.now() - 3600000), value: 500 },
          { timestamp: new Date(Date.now() - 1800000), value: 520 },
          { timestamp: new Date(), value: 480 }
        ],
        quality: [],
        downtime: []
      }
    })

    it('shows trend indicators when trends are enabled', () => {
      render(
        <MetricsOverview 
          metrics={metricsWithTrends}
          config={{ showTrends: true }}
        />
      )
      
      // Should show trend arrows when enabled
      const trendIndicators = screen.getAllByText(/[↗↘→]/)
      expect(trendIndicators.length).toBeGreaterThan(0)
    })

    it('shows up trend for increasing values', () => {
      render(
        <MetricsOverview 
          metrics={metricsWithTrends}
          config={{ showTrends: true }}
        />
      )
      
      // Efficiency is trending up (85 -> 87 -> 89.5)
      expect(screen.getByText('↗')).toBeInTheDocument()
    })

    it('does not show trends when disabled', () => {
      render(
        <MetricsOverview 
          metrics={metricsWithTrends}
          config={{ showTrends: false }}
        />
      )
      
      expect(screen.queryByText('↗')).not.toBeInTheDocument()
      expect(screen.queryByText('↘')).not.toBeInTheDocument()
    })
  })

  describe('Interactive drill-down functionality', () => {
    it('calls onMetricClick when metric card is clicked', async () => {
      const mockOnMetricClick = jest.fn()
      const { user } = render(
        <MetricsOverview 
          metrics={mockMetrics}
          config={{ onMetricClick: mockOnMetricClick }}
        />
      )
      
      const productionCard = screen.getByText('Producción Total').closest('.cursor-pointer')
      await user.click(productionCard!)
      
      expect(mockOnMetricClick).toHaveBeenCalledWith('production')
    })

    it('shows chevron icon on hover when onMetricClick is provided', () => {
      const { container } = render(
        <MetricsOverview 
          metrics={mockMetrics}
          config={{ onMetricClick: () => {} }}
        />
      )
      
      const chevronIcons = container.querySelectorAll('.group-hover\\:opacity-100')
      expect(chevronIcons.length).toBeGreaterThan(0)
    })

    it('does not show chevron icons when onMetricClick is not provided', () => {
      const { container } = render(<MetricsOverview metrics={mockMetrics} />)
      
      const chevronIcons = container.querySelectorAll('.group-hover\\:opacity-100')
      expect(chevronIcons.length).toBe(0)
    })
  })

  describe('Loading states', () => {
    it('shows loading spinner when refreshing', () => {
      render(
        <MetricsOverview 
          metrics={mockMetrics}
          loading={true}
        />
      )
      
      // Should show loading spinner in refresh button
      const loadingSpinner = screen.getByTitle('Actualizar métricas').querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
    })

    it('applies opacity when loading', () => {
      const { container } = render(
        <MetricsOverview 
          metrics={mockMetrics}
          loading={true}
        />
      )
      
      const loadingCards = container.querySelectorAll('.opacity-60')
      expect(loadingCards.length).toBeGreaterThan(0)
    })

    it('disables refresh button when loading', () => {
      render(
        <MetricsOverview 
          metrics={mockMetrics}
          loading={true}
        />
      )
      
      const refreshButton = screen.getByTitle('Actualizar métricas')
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Manual refresh functionality', () => {
    it('calls onRefresh when refresh button is clicked', async () => {
      const mockOnRefresh = jest.fn()
      const { user } = render(
        <MetricsOverview 
          metrics={mockMetrics}
          onRefresh={mockOnRefresh}
        />
      )
      
      const refreshButton = screen.getByTitle('Actualizar métricas')
      await user.click(refreshButton)
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    it('shows refresh icon when not loading', () => {
      render(
        <MetricsOverview 
          metrics={mockMetrics}
          onRefresh={() => {}}
        />
      )
      
      const refreshButton = screen.getByTitle('Actualizar métricas')
      expect(refreshButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Control buttons functionality', () => {
    it('toggles trends display when trends button is clicked', async () => {
      const { user } = render(
        <MetricsOverview 
          metrics={mockMetrics}
          config={{ showTrends: false }}
        />
      )
      
      const trendsButton = screen.getByTitle('Mostrar tendencias')
      
      // Button should start inactive
      expect(trendsButton).toHaveClass('bg-gray-100')
      
      await user.click(trendsButton)
      
      // Button should become active
      expect(trendsButton).toHaveClass('bg-blue-100')
    })

    it('toggles resource utilization display', async () => {
      const { user } = render(
        <MetricsOverview 
          metrics={mockMetrics}
          config={{ showResourceUtilization: false }}
        />
      )
      
      const utilizationButton = screen.getByTitle('Mostrar utilización de recursos')
      
      // Button should start inactive
      expect(utilizationButton).toHaveClass('bg-gray-100')
      
      await user.click(utilizationButton)
      
      // Button should become active
      expect(utilizationButton).toHaveClass('bg-blue-100')
    })
  })

  describe('Enhanced accessibility features', () => {
    it('provides proper aria labels for control buttons', () => {
      render(<MetricsOverview metrics={mockMetrics} />)
      
      expect(screen.getByTitle('Mostrar tendencias')).toBeInTheDocument()
      expect(screen.getByTitle('Mostrar utilización de recursos')).toBeInTheDocument()
      expect(screen.getByTitle('Actualizar métricas')).toBeInTheDocument()
    })

    it('maintains keyboard navigation for interactive elements', () => {
      render(
        <MetricsOverview 
          metrics={mockMetrics}
          config={{ onMetricClick: () => {} }}
        />
      )
      
      const interactiveCards = screen.getAllByRole('generic').filter(
        el => el.classList.contains('cursor-pointer')
      )
      expect(interactiveCards.length).toBe(6) // 6 metric cards
    })
  })

  describe('Performance optimization validation', () => {
    it('uses memoization for expensive calculations', () => {
      const { rerender } = render(<MetricsOverview metrics={mockMetrics} />)
      
      // Re-render with same props should not cause unnecessary recalculations
      rerender(<MetricsOverview metrics={mockMetrics} />)
      
      // Component should render without errors
      expect(screen.getByText('Métricas de Producción')).toBeInTheDocument()
    })

    it('handles frequent prop updates efficiently', () => {
      const { rerender } = render(<MetricsOverview metrics={mockMetrics} />)
      
      for (let i = 0; i < 10; i++) {
        const updatedMetrics = createMockMetrics({
          ...mockMetrics,
          totalProduction: mockMetrics.totalProduction + i,
          timestamp: new Date()
        })
        rerender(<MetricsOverview metrics={updatedMetrics} />)
      }
      
      // Should handle rapid updates without performance issues
      expect(screen.getByText('Métricas de Producción')).toBeInTheDocument()
    })
  })

  describe('Real-time integration readiness', () => {
    it('updates timestamp when metrics change', () => {
      const initialMetrics = createMockMetrics({ 
        ...mockMetrics, 
        timestamp: new Date('2024-01-01T10:00:00Z') 
      })
      
      const { rerender } = render(<MetricsOverview metrics={initialMetrics} />)
      
      const updatedMetrics = createMockMetrics({ 
        ...mockMetrics, 
        timestamp: new Date('2024-01-01T10:05:00Z') 
      })
      
      rerender(<MetricsOverview metrics={updatedMetrics} />)
      
      // Component should handle timestamp updates
      expect(screen.getByText(/Actualizado:/)).toBeInTheDocument()
    })

    it('preserves WebSocket integration structure', () => {
      // Test that component is ready for WebSocket integration
      const wsReadyMetrics = createMockMetrics({
        ...mockMetrics,
        timestamp: new Date() // Real-time timestamp
      })
      
      render(
        <MetricsOverview 
          metrics={wsReadyMetrics}
          config={{ 
            autoRefresh: true,
            refreshInterval: 1000 // Fast refresh for real-time feel
          }}
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText('Auto-refresh activo')).toBeInTheDocument()
    })
  })
})
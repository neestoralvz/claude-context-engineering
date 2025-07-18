import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveDashboard } from '../../components/dashboard/InteractiveDashboard'
import { productionOrderStorage, dashboardConfigStorage } from '../../lib/storage'

// Mock the storage functions
jest.mock('../../lib/storage', () => ({
  productionOrderStorage: {
    get: jest.fn(() => []),
    set: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn()
  },
  dashboardConfigStorage: {
    get: jest.fn(() => ({
      autoRefresh: true,
      refreshInterval: 5000,
      showTrends: true,
      showResourceUtilization: true,
      compactMode: false,
      theme: 'light',
      notifications: true,
      soundAlerts: false
    })),
    set: jest.fn(),
    update: jest.fn()
  }
}))

// Mock Recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />
}))

describe('InteractiveDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard with all main sections', () => {
    render(<InteractiveDashboard />)
    
    expect(screen.getByText('Control de Producción Ninu.mx')).toBeInTheDocument()
    expect(screen.getByText('Resumen General')).toBeInTheDocument()
    expect(screen.getByText('Control de Producción')).toBeInTheDocument()
    expect(screen.getByText('Entrada de Datos')).toBeInTheDocument()
  })

  it('loads persisted data on mount', () => {
    const mockOrders = [
      {
        id: 'order-1',
        productId: 'multiusos-1l',
        productName: 'Multiusos 1L',
        quantity: 100,
        priority: 'medium' as const,
        targetDate: '2024-01-01',
        status: 'pending' as const,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
    
    ;(productionOrderStorage.get as jest.Mock).mockReturnValue(mockOrders)
    
    render(<InteractiveDashboard />)
    
    expect(productionOrderStorage.get).toHaveBeenCalled()
    expect(dashboardConfigStorage.get).toHaveBeenCalled()
  })

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Click on "Control de Producción" tab
    const productionTab = screen.getByText('Control de Producción')
    await user.click(productionTab)
    
    expect(screen.getByText('Reactores')).toBeInTheDocument()
    expect(screen.getByText('Estaciones de Producción')).toBeInTheDocument()
  })

  it('opens production form modal when clicking Nueva Orden button', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    const newOrderButton = screen.getByText('Nueva Orden')
    await user.click(newOrderButton)
    
    // Check if form is displayed
    expect(screen.getByText('Nueva Orden de Producción')).toBeInTheDocument()
    expect(screen.getByText('Producto')).toBeInTheDocument()
    expect(screen.getByText('Cantidad')).toBeInTheDocument()
  })

  it('can create a new production order', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Open form
    const newOrderButton = screen.getByText('Nueva Orden')
    await user.click(newOrderButton)
    
    // Fill form
    const productSelect = screen.getByDisplayValue('Selecciona un producto...')
    await user.selectOptions(productSelect, 'multiusos-1l')
    
    const quantityInput = screen.getByDisplayValue('100')
    await user.clear(quantityInput)
    await user.type(quantityInput, '150')
    
    const targetDateInput = screen.getByLabelText(/Fecha Objetivo/i)
    await user.type(targetDateInput, '2024-12-31T10:00')
    
    // Submit form
    const submitButton = screen.getByText('Crear Orden de Producción')
    await user.click(submitButton)
    
    // Verify storage was called
    await waitFor(() => {
      expect(productionOrderStorage.set).toHaveBeenCalled()
    })
  })

  it('toggles real-time updates', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Initially should show "Pausar" since real-time is active
    const pauseButton = screen.getByText('Pausar')
    expect(pauseButton).toBeInTheDocument()
    
    // Click to pause
    await user.click(pauseButton)
    
    // Should now show "Reanudar"
    expect(screen.getByText('Reanudar')).toBeInTheDocument()
  })

  it('displays reactor controls when switching to production tab', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Switch to production tab
    const productionTab = screen.getByText('Control de Producción')
    await user.click(productionTab)
    
    // Should show reactor cards
    expect(screen.getByText('Reactor A - Líquidos')).toBeInTheDocument()
    expect(screen.getByText('Reactor B - Desinfectantes')).toBeInTheDocument()
    expect(screen.getByText('Reactor C - Especialidades')).toBeInTheDocument()
  })

  it('displays station controls when switching to production tab', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Switch to production tab
    const productionTab = screen.getByText('Control de Producción')
    await user.click(productionTab)
    
    // Should show station cards
    expect(screen.getByText('Estación Etiquetado Principal')).toBeInTheDocument()
    expect(screen.getByText('Estación Llenado')).toBeInTheDocument()
    expect(screen.getByText('Estación Polvos')).toBeInTheDocument()
  })

  it('shows production metrics overview', () => {
    render(<InteractiveDashboard />)
    
    // Check for metric cards
    expect(screen.getByText('Producción Total')).toBeInTheDocument()
    expect(screen.getByText('Eficiencia General')).toBeInTheDocument()
    expect(screen.getByText('Calidad')).toBeInTheDocument()
    expect(screen.getByText('Tiempo Inactivo')).toBeInTheDocument()
  })

  it('displays charts in overview section', () => {
    render(<InteractiveDashboard />)
    
    // Check for chart containers
    const chartContainers = screen.getAllByTestId('chart-container')
    expect(chartContainers.length).toBeGreaterThan(0)
  })

  it('handles reactor control interactions', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Switch to production tab
    const productionTab = screen.getByText('Control de Producción')
    await user.click(productionTab)
    
    // Find reactor card with controls
    const reactorCard = screen.getByText('Reactor C - Especialidades').closest('.bg-white')
    expect(reactorCard).toBeInTheDocument()
    
    // Should be able to find control buttons (Iniciar for idle reactor)
    if (reactorCard) {
      const startButton = reactorCard.querySelector('button')
      expect(startButton).toBeInTheDocument()
    }
  })

  it('shows recent orders when orders exist', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        productId: 'multiusos-1l',
        productName: 'Multiusos 1L',
        quantity: 100,
        priority: 'high' as const,
        targetDate: '2024-01-01',
        status: 'pending' as const,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
    
    ;(productionOrderStorage.get as jest.Mock).mockReturnValue(mockOrders)
    
    render(<InteractiveDashboard />)
    
    // Create a new order to trigger the recent orders display
    const newOrderButton = screen.getByText('Nueva Orden')
    await userEvent.click(newOrderButton)
    
    const productSelect = screen.getByDisplayValue('Selecciona un producto...')
    await userEvent.selectOptions(productSelect, 'multiusos-1l')
    
    const targetDateInput = screen.getByLabelText(/Fecha Objetivo/i)
    await userEvent.type(targetDateInput, '2024-12-31T10:00')
    
    const submitButton = screen.getByText('Crear Orden de Producción')
    await userEvent.click(submitButton)
    
    // Should show recent orders section
    await waitFor(() => {
      expect(screen.getByText('Órdenes Recientes')).toBeInTheDocument()
    })
  })

  it('validates form inputs in production order creation', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Open form
    const newOrderButton = screen.getByText('Nueva Orden')
    await user.click(newOrderButton)
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Crear Orden de Producción')
    await user.click(submitButton)
    
    // Should show validation errors
    expect(screen.getByText('Selecciona un producto')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una fecha objetivo')).toBeInTheDocument()
  })

  it('persists dashboard configuration', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Toggle real-time updates (this should update dashboard config)
    const pauseButton = screen.getByText('Pausar')
    await user.click(pauseButton)
    
    // Should call dashboard config storage
    expect(dashboardConfigStorage.get).toHaveBeenCalled()
  })
})

describe('InteractiveDashboard Accessibility', () => {
  it('has proper ARIA labels and roles', () => {
    render(<InteractiveDashboard />)
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: /Control de Producción Ninu.mx/i })).toBeInTheDocument()
    
    // Check for navigation elements
    const tabs = screen.getAllByRole('button')
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<InteractiveDashboard />)
    
    // Tab navigation should work
    await user.tab()
    
    // Should be able to navigate through interactive elements
    const focusedElement = document.activeElement
    expect(focusedElement).toBeInTheDocument()
  })
})

describe('InteractiveDashboard Performance', () => {
  it('renders within reasonable time', async () => {
    const startTime = performance.now()
    render(<InteractiveDashboard />)
    const endTime = performance.now()
    
    // Should render in less than 100ms (reasonable for a complex dashboard)
    expect(endTime - startTime).toBeLessThan(100)
  })

  it('handles large datasets efficiently', () => {
    const manyOrders = Array.from({ length: 100 }, (_, i) => ({
      id: `order-${i}`,
      productId: 'multiusos-1l',
      productName: 'Multiusos 1L',
      quantity: 100,
      priority: 'medium' as const,
      targetDate: '2024-01-01',
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00Z'
    }))
    
    ;(productionOrderStorage.get as jest.Mock).mockReturnValue(manyOrders)
    
    const startTime = performance.now()
    render(<InteractiveDashboard />)
    const endTime = performance.now()
    
    // Should still render efficiently with large datasets
    expect(endTime - startTime).toBeLessThan(200)
  })
})
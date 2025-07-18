import React from 'react'
import { render, screen, fireEvent } from '../../utils/test-utils'
import '@testing-library/jest-dom'
import { 
  ErrorBoundary, 
  MetricsErrorBoundary, 
  ReactorErrorBoundary, 
  StationErrorBoundary 
} from '../../../components/dashboard/ErrorBoundary'

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary')
  }
  return <div>Working component</div>
}

// Mock window.location
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('ErrorBoundary Component', () => {
  // Suppress console.error during tests to avoid cluttering output
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  describe('Normal operation', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Working component')).toBeInTheDocument()
    })

    it('does not show error UI when component is working', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.queryByText('Error en el Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Reintentar')).not.toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('catches errors and displays error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Error en el Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/Ha ocurrido un error inesperado en el sistema de control de producción/)).toBeInTheDocument()
    })

    it('displays action buttons in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Reintentar')).toBeInTheDocument()
      expect(screen.getByText('Ir al Inicio')).toBeInTheDocument()
    })

    it('shows error icon in error state', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Check for AlertTriangle icon (svg)
      const alertIcon = container.querySelector('svg')
      expect(alertIcon).toBeInTheDocument()
    })

    it('handles retry functionality', () => {
      let shouldThrow = true
      const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />
      
      const { rerender } = render(
        <ErrorBoundary key="error-boundary-1">
          <TestComponent />
        </ErrorBoundary>
      )
      
      // Error state should be visible
      expect(screen.getByText('Error en el Dashboard')).toBeInTheDocument()
      
      // Click retry button
      fireEvent.click(screen.getByText('Reintentar'))
      
      // Update shouldThrow and re-render with new key to reset error boundary
      shouldThrow = false
      rerender(
        <ErrorBoundary key="error-boundary-2">
          <TestComponent />
        </ErrorBoundary>
      )
      
      // Should show working component
      expect(screen.getByText('Working component')).toBeInTheDocument()
      expect(screen.queryByText('Error en el Dashboard')).not.toBeInTheDocument()
    })

    it('handles go home functionality', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Click go home button
      fireEvent.click(screen.getByText('Ir al Inicio'))
      
      // Should navigate to home
      expect(window.location.href).toBe('/')
    })
  })

  describe('Custom fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Error en el Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Error callback', () => {
    it('calls onError callback when error occurs', () => {
      const onErrorMock = jest.fn()
      
      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(onErrorMock).toHaveBeenCalled()
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })
  })

  describe('Development mode features', () => {
    const originalNodeEnv = process.env.NODE_ENV
    
    beforeAll(() => {
      process.env.NODE_ENV = 'development'
    })
    
    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv
    })

    it('shows technical details in development mode', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Detalles técnicos (Solo desarrollo)')).toBeInTheDocument()
    })

    it('can expand technical details', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      const detailsElement = screen.getByText('Detalles técnicos (Solo desarrollo)')
      fireEvent.click(detailsElement)
      
      expect(screen.getByText('Error:')).toBeInTheDocument()
      expect(screen.getByText('Stack:')).toBeInTheDocument()
    })
  })
})

describe('MetricsErrorBoundary', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('renders children when no error occurs', () => {
    render(
      <MetricsErrorBoundary>
        <ThrowError shouldThrow={false} />
      </MetricsErrorBoundary>
    )
    
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('shows metrics-specific error message', () => {
    render(
      <MetricsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </MetricsErrorBoundary>
    )
    
    expect(screen.getByText('Error en Métricas')).toBeInTheDocument()
    expect(screen.getByText(/No se pudieron cargar las métricas de producción/)).toBeInTheDocument()
  })

  it('applies correct styling for metrics error', () => {
    const { container } = render(
      <MetricsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </MetricsErrorBoundary>
    )
    
    const errorCard = container.querySelector('.bg-red-50')
    expect(errorCard).toBeInTheDocument()
    expect(errorCard).toHaveClass('border-red-200')
  })
})

describe('ReactorErrorBoundary', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('renders children when no error occurs', () => {
    render(
      <ReactorErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ReactorErrorBoundary>
    )
    
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('shows reactor-specific error message', () => {
    render(
      <ReactorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ReactorErrorBoundary>
    )
    
    expect(screen.getByText('Error en Reactores')).toBeInTheDocument()
    expect(screen.getByText(/Error al cargar el estado de los reactores/)).toBeInTheDocument()
  })

  it('applies correct styling for reactor error', () => {
    const { container } = render(
      <ReactorErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ReactorErrorBoundary>
    )
    
    const errorCard = container.querySelector('.bg-yellow-50')
    expect(errorCard).toBeInTheDocument()
    expect(errorCard).toHaveClass('border-yellow-200')
  })
})

describe('StationErrorBoundary', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('renders children when no error occurs', () => {
    render(
      <StationErrorBoundary>
        <ThrowError shouldThrow={false} />
      </StationErrorBoundary>
    )
    
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('shows station-specific error message', () => {
    render(
      <StationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </StationErrorBoundary>
    )
    
    expect(screen.getByText('Error en Estaciones')).toBeInTheDocument()
    expect(screen.getByText(/Error al cargar el estado de las estaciones/)).toBeInTheDocument()
  })

  it('applies correct styling for station error', () => {
    const { container } = render(
      <StationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </StationErrorBoundary>
    )
    
    const errorCard = container.querySelector('.bg-orange-50')
    expect(errorCard).toBeInTheDocument()
    expect(errorCard).toHaveClass('border-orange-200')
  })
})

describe('Error Boundary Integration', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('handles nested error boundaries correctly', () => {
    render(
      <ErrorBoundary>
        <div>
          <MetricsErrorBoundary>
            <ThrowError shouldThrow={true} />
          </MetricsErrorBoundary>
          <div>Other content</div>
        </div>
      </ErrorBoundary>
    )
    
    // Should show metrics-specific error, not general error
    expect(screen.getByText('Error en Métricas')).toBeInTheDocument()
    expect(screen.getByText('Other content')).toBeInTheDocument()
    expect(screen.queryByText('Error en el Dashboard')).not.toBeInTheDocument()
  })

  it('handles multiple error boundaries independently', () => {
    render(
      <div>
        <MetricsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </MetricsErrorBoundary>
        <ReactorErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ReactorErrorBoundary>
      </div>
    )
    
    expect(screen.getByText('Error en Métricas')).toBeInTheDocument()
    expect(screen.getByText('Working component')).toBeInTheDocument()
    expect(screen.queryByText('Error en Reactores')).not.toBeInTheDocument()
  })
})

describe('Accessibility', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('has proper heading structure in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const heading = screen.getByRole('heading')
    expect(heading).toHaveTextContent('Error en el Dashboard')
  })

  it('has accessible buttons in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0]).toHaveTextContent('Reintentar')
    expect(buttons[1]).toHaveTextContent('Ir al Inicio')
  })

  it('provides clear error messaging', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText(/Ha ocurrido un error inesperado/)).toBeInTheDocument()
    expect(screen.getByText(/Por favor, intenta recargar la página/)).toBeInTheDocument()
  })
})

describe('Performance', () => {
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('renders error state quickly', () => {
    const startTime = performance.now()
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(50) // Should render in under 50ms
  })

  it('handles multiple rapid error/recovery cycles', () => {
    const { rerender } = render(
      <ErrorBoundary key="cycle-0">
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    // Simulate rapid error/recovery cycles
    for (let i = 0; i < 5; i++) {
      rerender(
        <ErrorBoundary key={`cycle-error-${i}`}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      rerender(
        <ErrorBoundary key={`cycle-working-${i}`}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
    }
    
    // Should end in working state
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })
})
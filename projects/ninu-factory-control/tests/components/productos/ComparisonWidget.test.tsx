import { render, screen, fireEvent } from '@testing-library/react'
import { ComparisonWidget } from '../../../components/productos/ComparisonWidget'
import { ProductComparisonState, Product } from '../../../types'

// Mock products para testing
const mockProduct1: Product = {
  id: 'multiusos-1l',
  name: 'Limpiador Multiusos Ninu 1L',
  category: 'limpieza',
  description: 'Limpiador multiusos concentrado',
  size: 1,
  unit: 'l',
  packaging: 'bottle',
  cofepisApproval: true,
  ingredients: ['Tensioactivos'],
  useCase: ['Cocina', 'Baño'],
  shelfLife: 24,
  currentStock: 150,
  minStock: 50,
  productionCost: 25.00,
  salePrice: 49.90
}

const mockProduct2: Product = {
  id: 'sanitizante-1l',
  name: 'Sanitizante Antibacterial Ninu 1L',
  category: 'desinfeccion',
  description: 'Sanitizante antibacterial certificado',
  size: 1,
  unit: 'l',
  packaging: 'bottle',
  cofepisApproval: true,
  ingredients: ['Sales cuaternarias'],
  useCase: ['Desinfección'],
  shelfLife: 36,
  currentStock: 200,
  minStock: 75,
  productionCost: 35.00,
  salePrice: 69.90
}

const mockProduct3: Product = {
  id: 'detergente-2kg',
  name: 'Detergente en Polvo Ninu 2kg',
  category: 'limpieza',
  description: 'Detergente en polvo con enzimas',
  size: 2,
  unit: 'kg',
  packaging: 'bag',
  cofepisApproval: true,
  ingredients: ['Tensioactivos aniónicos'],
  useCase: ['Ropa'],
  shelfLife: 48,
  currentStock: 300,
  minStock: 100,
  productionCost: 45.00,
  salePrice: 89.90
}

describe('ComparisonWidget', () => {
  const mockOnToggleWidget = jest.fn()
  const mockOnRemoveProduct = jest.fn()
  const mockOnClearComparison = jest.fn()
  const mockOnViewComparison = jest.fn()

  const defaultProps = {
    onToggleWidget: mockOnToggleWidget,
    onRemoveProduct: mockOnRemoveProduct,
    onClearComparison: mockOnClearComparison,
    onViewComparison: mockOnViewComparison,
    position: 'bottom-right' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Widget oculto (sin productos)', () => {
    const emptyState: ProductComparisonState = {
      products: [],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('no debe renderizar cuando no hay productos', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={emptyState} />)
      
      expect(screen.queryByTestId('comparison-widget')).not.toBeInTheDocument()
    })

    it('debe estar oculto cuando isOpen es false y no hay productos', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={emptyState} />)
      
      expect(screen.queryByText('Comparar Productos')).not.toBeInTheDocument()
    })
  })

  describe('Widget con un producto', () => {
    const oneProductState: ProductComparisonState = {
      products: [mockProduct1],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe mostrar indicador con 1 producto', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={oneProductState} />)
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('producto en comparación')).toBeInTheDocument()
    })

    it('debe mostrar el widget minimizado', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={oneProductState} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('bottom-4', 'right-4')
      expect(widget).not.toHaveClass('expanded')
    })

    it('debe mostrar mensaje para agregar más productos', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={oneProductState} />)
      
      fireEvent.click(screen.getByTestId('comparison-widget'))
      
      expect(screen.getByText('Agrega más productos para comparar')).toBeInTheDocument()
    })
  })

  describe('Widget con múltiples productos', () => {
    const multipleProductsState: ProductComparisonState = {
      products: [mockProduct1, mockProduct2],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe mostrar indicador con cantidad correcta de productos', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={multipleProductsState} />)
      
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('productos en comparación')).toBeInTheDocument()
    })

    it('debe mostrar nombres de productos cuando está expandido', () => {
      const expandedState = { ...multipleProductsState, isOpen: true }
      render(<ComparisonWidget {...defaultProps} comparisonState={expandedState} />)
      
      expect(screen.getByText('Limpiador Multiusos Ninu 1L')).toBeInTheDocument()
      expect(screen.getByText('Sanitizante Antibacterial Ninu 1L')).toBeInTheDocument()
    })

    it('debe habilitar el botón "Comparar Ahora"', () => {
      const expandedState = { ...multipleProductsState, isOpen: true }
      render(<ComparisonWidget {...defaultProps} comparisonState={expandedState} />)
      
      const compareButton = screen.getByText('Comparar Ahora')
      expect(compareButton).toBeInTheDocument()
      expect(compareButton).not.toBeDisabled()
    })

    it('debe mostrar precios de productos en el widget expandido', () => {
      const expandedState = { ...multipleProductsState, isOpen: true }
      render(<ComparisonWidget {...defaultProps} comparisonState={expandedState} />)
      
      expect(screen.getByText('$49.90')).toBeInTheDocument()
      expect(screen.getByText('$69.90')).toBeInTheDocument()
    })
  })

  describe('Widget con 3 productos (máximo)', () => {
    const maxProductsState: ProductComparisonState = {
      products: [mockProduct1, mockProduct2, mockProduct3],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe mostrar indicador de máximo alcanzado', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={maxProductsState} />)
      
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Máximo alcanzado')).toBeInTheDocument()
    })

    it('debe mostrar todos los productos cuando está expandido', () => {
      const expandedState = { ...maxProductsState, isOpen: true }
      render(<ComparisonWidget {...defaultProps} comparisonState={expandedState} />)
      
      expect(screen.getByText('Limpiador Multiusos Ninu 1L')).toBeInTheDocument()
      expect(screen.getByText('Sanitizante Antibacterial Ninu 1L')).toBeInTheDocument()
      expect(screen.getByText('Detergente en Polvo Ninu 2kg')).toBeInTheDocument()
    })

    it('debe resaltar visualmente que está al máximo', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={maxProductsState} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('ring-2', 'ring-ninu-primary')
    })
  })

  describe('Funcionalidad de interacción', () => {
    const activeState: ProductComparisonState = {
      products: [mockProduct1, mockProduct2],
      maxProducts: 3,
      isOpen: true,
      lastUpdated: new Date()
    }

    it('debe alternar el estado del widget al hacer clic', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={activeState} />)
      
      const toggleButton = screen.getByTestId('widget-toggle')
      fireEvent.click(toggleButton)
      
      expect(mockOnToggleWidget).toHaveBeenCalledTimes(1)
    })

    it('debe permitir remover productos individuales', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={activeState} />)
      
      const removeButtons = screen.getAllByLabelText(/Quitar producto/)
      fireEvent.click(removeButtons[0])
      
      expect(mockOnRemoveProduct).toHaveBeenCalledWith('multiusos-1l')
    })

    it('debe permitir limpiar toda la comparación', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={activeState} />)
      
      const clearButton = screen.getByText('Limpiar Todo')
      fireEvent.click(clearButton)
      
      expect(mockOnClearComparison).toHaveBeenCalledTimes(1)
    })

    it('debe navegar a la página de comparación completa', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={activeState} />)
      
      const compareButton = screen.getByText('Comparar Ahora')
      fireEvent.click(compareButton)
      
      expect(mockOnViewComparison).toHaveBeenCalledTimes(1)
    })

    it('debe cerrar el widget al presionar Escape', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={activeState} />)
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      
      expect(mockOnToggleWidget).toHaveBeenCalledTimes(1)
    })
  })

  describe('Posicionamiento del widget', () => {
    const state: ProductComparisonState = {
      products: [mockProduct1],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe posicionarse en bottom-right por defecto', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} position="bottom-right" />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('bottom-4', 'right-4')
    })

    it('debe posicionarse en bottom-left cuando se especifica', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} position="bottom-left" />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('bottom-4', 'left-4')
    })

    it('debe posicionarse en top-right cuando se especifica', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} position="top-right" />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('top-4', 'right-4')
    })

    it('debe posicionarse en top-left cuando se especifica', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} position="top-left" />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('top-4', 'left-4')
    })
  })

  describe('Responsive design para móvil', () => {
    const state: ProductComparisonState = {
      products: [mockProduct1, mockProduct2],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe usar posición móvil en bottom cuando se especifica', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} mobilePosition="bottom" />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('md:bottom-4', 'bottom-0', 'left-0', 'right-0')
    })

    it('debe usar posición flotante en móvil', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} mobilePosition="floating" />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('fixed', 'md:absolute')
    })

    it('debe mostrar versión compacta en móvil', () => {
      // Simular viewport móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })

      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const mobileCompactView = screen.getByTestId('mobile-compact-widget')
      expect(mobileCompactView).toBeInTheDocument()
    })
  })

  describe('Animaciones y transiciones', () => {
    const state: ProductComparisonState = {
      products: [mockProduct1, mockProduct2],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe aplicar clases de transición CSS', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
    })

    it('debe tener animación de hover', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('hover:scale-105', 'hover:shadow-lg')
    })

    it('debe expandirse suavemente cuando se abre', () => {
      const expandedState = { ...state, isOpen: true }
      render(<ComparisonWidget {...defaultProps} comparisonState={expandedState} />)
      
      const expandedContent = screen.getByTestId('expanded-content')
      expect(expandedContent).toHaveClass('animate-slide-down')
    })
  })

  describe('Indicadores visuales mexicanos', () => {
    const mexicanState: ProductComparisonState = {
      products: [mockProduct1, mockProduct2],
      maxProducts: 3,
      isOpen: true,
      lastUpdated: new Date()
    }

    it('debe mostrar íconos de certificación COFEPRIS', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={mexicanState} />)
      
      const cofepisIcons = screen.getAllByLabelText('Certificado COFEPRIS')
      expect(cofepisIcons).toHaveLength(2)
    })

    it('debe mostrar precios en pesos mexicanos', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={mexicanState} />)
      
      expect(screen.getByText('$49.90 MXN')).toBeInTheDocument()
      expect(screen.getByText('$69.90 MXN')).toBeInTheDocument()
    })

    it('debe usar colores y tipografía de marca Ninu', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={mexicanState} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('bg-white', 'border-ninu-secondary')
      
      const title = screen.getByText('Comparar Productos')
      expect(title).toHaveClass('text-ninu-primary')
    })

    it('debe mostrar texto en español', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={mexicanState} />)
      
      expect(screen.getByText('productos en comparación')).toBeInTheDocument()
      expect(screen.getByText('Comparar Ahora')).toBeInTheDocument()
      expect(screen.getByText('Limpiar Todo')).toBeInTheDocument()
    })
  })

  describe('Accesibilidad', () => {
    const state: ProductComparisonState = {
      products: [mockProduct1, mockProduct2],
      maxProducts: 3,
      isOpen: false,
      lastUpdated: new Date()
    }

    it('debe tener atributos ARIA correctos', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveAttribute('role', 'dialog')
      expect(widget).toHaveAttribute('aria-label', 'Widget de comparación de productos')
    })

    it('debe ser navegable por teclado', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const toggleButton = screen.getByTestId('widget-toggle')
      expect(toggleButton).toHaveAttribute('tabIndex', '0')
      
      // Simular navegación por teclado
      fireEvent.keyDown(toggleButton, { key: 'Enter' })
      expect(mockOnToggleWidget).toHaveBeenCalledTimes(1)
      
      fireEvent.keyDown(toggleButton, { key: ' ' })
      expect(mockOnToggleWidget).toHaveBeenCalledTimes(2)
    })

    it('debe anunciar cambios de estado a lectores de pantalla', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const statusRegion = screen.getByRole('status')
      expect(statusRegion).toHaveTextContent('2 productos en comparación')
    })

    it('debe tener contraste de color adecuado', () => {
      render(<ComparisonWidget {...defaultProps} comparisonState={state} />)
      
      const widget = screen.getByTestId('comparison-widget')
      expect(widget).toHaveClass('text-gray-900', 'bg-white')
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:ring-2', 'focus:ring-ninu-primary')
      })
    })
  })
})
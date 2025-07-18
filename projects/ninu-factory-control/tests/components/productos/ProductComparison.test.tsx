import { render, screen, fireEvent } from '@testing-library/react'
import { ProductComparison } from '../../../components/productos/ProductComparison'
import { ProductComparisonData, Product } from '../../../types'

// Mock products para testing - productos Ninu específicos para mercado mexicano
const mockProduct1: Product = {
  id: 'multiusos-1l',
  name: 'Limpiador Multiusos Ninu 1L',
  category: 'limpieza',
  description: 'Limpiador multiusos concentrado con poder desengrasante superior para toda la casa',
  size: 1,
  unit: 'l',
  packaging: 'bottle',
  cofepisApproval: true,
  cofepisRegistration: 'COFEPRIS-001-2024',
  ingredients: ['Tensioactivos biodegradables', 'Agentes desengrasantes', 'Fragrancia limón'],
  useCase: ['Cocina', 'Baño', 'Pisos', 'Superficies'],
  shelfLife: 24,
  currentStock: 150,
  minStock: 50,
  productionCost: 25.00,
  salePrice: 49.90,
  alcoholContent: 70
}

const mockProduct2: Product = {
  id: 'sanitizante-1l',
  name: 'Sanitizante Antibacterial Ninu 1L',
  category: 'desinfeccion',
  description: 'Sanitizante antibacterial certificado COFEPRIS con 99.9% de efectividad',
  size: 1,
  unit: 'l',
  packaging: 'bottle',
  cofepisApproval: true,
  cofepisRegistration: 'COFEPRIS-002-2024',
  ingredients: ['Sales cuaternarias de amonio', 'Alcohol etílico', 'Agua purificada'],
  useCase: ['Desinfección', 'Oficinas', 'Hospitales', 'Escuelas'],
  shelfLife: 36,
  currentStock: 200,
  minStock: 75,
  productionCost: 35.00,
  salePrice: 69.90,
  quaternaryAmmoniumContent: 0.5
}

const mockProduct3: Product = {
  id: 'detergente-2kg',
  name: 'Detergente en Polvo Ninu 2kg',
  category: 'limpieza',
  description: 'Detergente en polvo con enzimas activas para ropa blanca y de color',
  size: 2,
  unit: 'kg',
  packaging: 'bag',
  cofepisApproval: true,
  cofepisRegistration: 'COFEPRIS-003-2024',
  ingredients: ['Tensioactivos aniónicos', 'Enzimas', 'Blanqueadores ópticos'],
  useCase: ['Ropa blanca', 'Ropa de color', 'Lavado a mano', 'Lavadora'],
  shelfLife: 48,
  currentStock: 300,
  minStock: 100,
  productionCost: 45.00,
  salePrice: 89.90
}

// Mock comparison data con características mexicanas
const mockComparisonData1: ProductComparisonData = {
  product: mockProduct1,
  value_per_liter: 49.90,
  cofepris_status: {
    is_certified: true,
    registration_number: 'COFEPRIS-001-2024',
    certification_date: '2024-01-15',
    certificate_type: 'cleaning',
    compliance_level: 'full',
    safety_warnings: ['Mantener fuera del alcance de los niños'],
    usage_restrictions: ['No mezclar con otros productos']
  },
  family_safety_score: 9,
  effectiveness_rating: 4.5,
  use_cases_mexican: ['Limpieza diaria familiar', 'Desengrase cocina mexicana', 'Pisos de casa'],
  dilution_ratios: [
    {
      use_case: 'Limpieza general',
      ratio: '1:10',
      final_cost_per_use: 4.99,
      coverage_area: '50m²',
      contact_time_minutes: 2
    }
  ],
  packaging_efficiency: {
    container_type: 'bottle',
    recyclable: true,
    space_efficiency: 8,
    handle_design: 'ergonomic',
    pour_control: 'excellent',
    storage_requirements: [
      {
        condition: 'room_temperature',
        importance: 'recommended',
        mexican_climate_consideration: 'Ideal para clima cálido mexicano'
      }
    ]
  },
  market_position: {
    price_tier: 'medio',
    target_market: 'familiar',
    brand_recognition: 8,
    availability_score: 9,
    customer_loyalty: 7
  },
  availability: {
    in_stock: true,
    stock_level: 'high',
    regional_availability: [
      {
        state: 'Veracruz',
        availability: 'available',
        local_distributor: 'Distribuidora Central',
        delivery_time_days: 1,
        additional_shipping_cost: 0
      }
    ],
    shipping_options: [
      {
        method: 'standard',
        cost: 50,
        estimated_days: 2,
        available_in_region: ['Veracruz', 'CDMX'],
        minimum_order: 500
      }
    ],
    bulk_discounts: [
      {
        quantity_from: 10,
        discount_percentage: 10,
        total_savings: 49.90,
        recommended_for: 'family'
      }
    ]
  },
  regional_preferences: [
    {
      region: 'centro',
      preference_score: 8,
      cultural_factors: ['Preferencia por productos familiares'],
      climate_considerations: ['Resistente a humedad'],
      economic_factors: [
        {
          factor: 'precio',
          weight: 4,
          regional_variation: 0
        }
      ]
    }
  ]
}

const mockComparisonData2: ProductComparisonData = {
  product: mockProduct2,
  value_per_liter: 69.90,
  cofepris_status: {
    is_certified: true,
    registration_number: 'COFEPRIS-002-2024',
    certification_date: '2024-02-01',
    certificate_type: 'sanitizer',
    compliance_level: 'full',
    safety_warnings: ['Uso externo solamente', 'Evitar contacto con ojos'],
    usage_restrictions: ['No ingerir']
  },
  family_safety_score: 10,
  effectiveness_rating: 5,
  use_cases_mexican: ['Desinfección COVID-19', 'Centros de salud', 'Escuelas públicas'],
  dilution_ratios: [
    {
      use_case: 'Desinfección superficies',
      ratio: '1:5',
      final_cost_per_use: 11.65,
      coverage_area: '25m²',
      contact_time_minutes: 5
    }
  ],
  packaging_efficiency: {
    container_type: 'bottle',
    recyclable: true,
    space_efficiency: 7,
    handle_design: 'standard',
    pour_control: 'good',
    storage_requirements: [
      {
        condition: 'cool_dry',
        importance: 'critical',
        mexican_climate_consideration: 'Proteger del calor extremo'
      }
    ]
  },
  market_position: {
    price_tier: 'medio',
    target_market: 'comercial',
    brand_recognition: 9,
    availability_score: 8,
    customer_loyalty: 8
  },
  availability: {
    in_stock: true,
    stock_level: 'high',
    regional_availability: [
      {
        state: 'Veracruz',
        availability: 'available',
        local_distributor: 'Distribuidora Médica',
        delivery_time_days: 1,
        additional_shipping_cost: 25
      }
    ],
    shipping_options: [
      {
        method: 'express',
        cost: 75,
        estimated_days: 1,
        available_in_region: ['Veracruz'],
        minimum_order: 1000
      }
    ],
    bulk_discounts: [
      {
        quantity_from: 20,
        discount_percentage: 15,
        total_savings: 209.70,
        recommended_for: 'commercial'
      }
    ]
  },
  regional_preferences: [
    {
      region: 'centro',
      preference_score: 9,
      cultural_factors: ['Alta demanda post-pandemia'],
      climate_considerations: ['Estable en clima húmedo'],
      economic_factors: [
        {
          factor: 'efectividad',
          weight: 5,
          regional_variation: 1
        }
      ]
    }
  ]
}

describe('ProductComparison', () => {
  const defaultProps = {
    products: [mockComparisonData1, mockComparisonData2],
    onRemoveProduct: jest.fn(),
    comparisonMode: 'basic' as const,
    targetAudience: 'consumer' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('debe renderizar el componente de comparación', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('Comparar Productos')).toBeInTheDocument()
    })

    it('debe mostrar los nombres de los productos a comparar', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('Limpiador Multiusos Ninu 1L')).toBeInTheDocument()
      expect(screen.getByText('Sanitizante Antibacterial Ninu 1L')).toBeInTheDocument()
    })

    it('debe mostrar los precios en pesos mexicanos', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('$49.90 MXN')).toBeInTheDocument()
      expect(screen.getByText('$69.90 MXN')).toBeInTheDocument()
    })

    it('debe renderizar máximo 3 productos', () => {
      const threeProducts = [...defaultProps.products, {
        ...mockComparisonData1,
        product: mockProduct3
      }]
      
      render(<ProductComparison {...defaultProps} products={threeProducts} />)
      
      expect(screen.getByText('Limpiador Multiusos Ninu 1L')).toBeInTheDocument()
      expect(screen.getByText('Sanitizante Antibacterial Ninu 1L')).toBeInTheDocument()
      expect(screen.getByText('Detergente en Polvo Ninu 2kg')).toBeInTheDocument()
    })
  })

  describe('Certificación COFEPRIS', () => {
    it('debe mostrar el estado de certificación COFEPRIS', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('COFEPRIS-001-2024')).toBeInTheDocument()
      expect(screen.getByText('COFEPRIS-002-2024')).toBeInTheDocument()
    })

    it('debe mostrar el tipo de certificado', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('Limpieza')).toBeInTheDocument()
      expect(screen.getByText('Sanitizante')).toBeInTheDocument()
    })

    it('debe mostrar advertencias de seguridad', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('Mantener fuera del alcance de los niños')).toBeInTheDocument()
      expect(screen.getByText('Uso externo solamente')).toBeInTheDocument()
    })

    it('debe mostrar indicador visual de certificación completa', () => {
      render(<ProductComparison {...defaultProps} />)
      
      const certificationBadges = screen.getAllByText('Certificado COFEPRIS')
      expect(certificationBadges).toHaveLength(2)
    })
  })

  describe('Valor por litro y economía familiar', () => {
    it('debe mostrar el valor por litro', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('$49.90/L')).toBeInTheDocument()
      expect(screen.getByText('$69.90/L')).toBeInTheDocument()
    })

    it('debe resaltar el mejor valor económico', () => {
      render(<ProductComparison {...defaultProps} />)
      
      // El producto más económico debe tener un indicador visual
      const bestValueIndicator = screen.getByText('Mejor Precio')
      expect(bestValueIndicator).toBeInTheDocument()
    })

    it('debe mostrar información de dilución para economía familiar', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('1:10')).toBeInTheDocument()
      expect(screen.getByText('$4.99 por uso')).toBeInTheDocument()
      expect(screen.getByText('50m² cobertura')).toBeInTheDocument()
    })

    it('debe mostrar descuentos por volumen para familias', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('10% descuento desde 10 unidades')).toBeInTheDocument()
      expect(screen.getByText('15% descuento desde 20 unidades')).toBeInTheDocument()
    })
  })

  describe('Puntuación de seguridad familiar', () => {
    it('debe mostrar la puntuación de seguridad familiar', () => {
      render(<ProductComparison {...defaultProps} />)
      
      expect(screen.getByText('9/10')).toBeInTheDocument() // Multiusos
      expect(screen.getByText('10/10')).toBeInTheDocument() // Sanitizante
    })

    it('debe mostrar indicadores visuales de seguridad', () => {
      render(<ProductComparison {...defaultProps} />)
      
      const safetyScores = screen.getAllByText(/Seguridad Familiar/)
      expect(safetyScores.length).toBeGreaterThan(0)
    })

    it('debe resaltar el producto más seguro para familias', () => {
      render(<ProductComparison {...defaultProps} />)
      
      const maxSafetyBadge = screen.getByText('Máxima Seguridad')
      expect(maxSafetyBadge).toBeInTheDocument()
    })
  })

  describe('Características específicas mexicanas', () => {
    it('debe mostrar casos de uso específicos para México', () => {
      render(<ProductComparison {...defaultProps} showMexicanFeatures={true} />)
      
      expect(screen.getByText('Desengrase cocina mexicana')).toBeInTheDocument()
      expect(screen.getByText('Desinfección COVID-19')).toBeInTheDocument()
    })

    it('debe mostrar consideraciones climáticas mexicanas', () => {
      render(<ProductComparison {...defaultProps} showMexicanFeatures={true} />)
      
      expect(screen.getByText('Ideal para clima cálido mexicano')).toBeInTheDocument()
      expect(screen.getByText('Proteger del calor extremo')).toBeInTheDocument()
    })

    it('debe mostrar disponibilidad regional', () => {
      render(<ProductComparison {...defaultProps} showMexicanFeatures={true} />)
      
      expect(screen.getByText('Veracruz')).toBeInTheDocument()
      expect(screen.getByText('Entrega: 1 día')).toBeInTheDocument()
    })

    it('debe mostrar distribuidores locales', () => {
      render(<ProductComparison {...defaultProps} showMexicanFeatures={true} />)
      
      expect(screen.getByText('Distribuidora Central')).toBeInTheDocument()
      expect(screen.getByText('Distribuidora Médica')).toBeInTheDocument()
    })
  })

  describe('Interactividad y funciones', () => {
    it('debe permitir remover productos de la comparación', () => {
      const mockOnRemove = jest.fn()
      render(<ProductComparison {...defaultProps} onRemoveProduct={mockOnRemove} />)
      
      const removeButtons = screen.getAllByText('Quitar')
      fireEvent.click(removeButtons[0])
      
      expect(mockOnRemove).toHaveBeenCalledWith('multiusos-1l')
    })

    it('debe llamar onAddToCart cuando se hace clic en "Agregar al Carrito"', () => {
      const mockOnAddToCart = jest.fn()
      render(<ProductComparison {...defaultProps} onAddToCart={mockOnAddToCart} />)
      
      const addToCartButtons = screen.getAllByText('Agregar al Carrito')
      fireEvent.click(addToCartButtons[0])
      
      expect(mockOnAddToCart).toHaveBeenCalledWith('multiusos-1l', 1)
    })

    it('debe llamar onRequestQuote para cotización de múltiples productos', () => {
      const mockOnRequestQuote = jest.fn()
      render(<ProductComparison {...defaultProps} onRequestQuote={mockOnRequestQuote} />)
      
      const quoteButton = screen.getByText('Solicitar Cotización')
      fireEvent.click(quoteButton)
      
      expect(mockOnRequestQuote).toHaveBeenCalledWith(['multiusos-1l', 'sanitizante-1l'])
    })
  })

  describe('Modo de comparación detallada', () => {
    it('debe mostrar información técnica en modo detallado', () => {
      render(<ProductComparison {...defaultProps} comparisonMode="detailed" />)
      
      expect(screen.getByText('Información Técnica')).toBeInTheDocument()
      expect(screen.getByText('70% alcohol')).toBeInTheDocument()
      expect(screen.getByText('0.5% sales cuaternarias')).toBeInTheDocument()
    })

    it('debe mostrar ingredientes completos en modo detallado', () => {
      render(<ProductComparison {...defaultProps} comparisonMode="detailed" />)
      
      expect(screen.getByText('Tensioactivos biodegradables')).toBeInTheDocument()
      expect(screen.getByText('Sales cuaternarias de amonio')).toBeInTheDocument()
    })

    it('debe mostrar eficiencia de empaque en modo detallado', () => {
      render(<ProductComparison {...defaultProps} comparisonMode="detailed" />)
      
      expect(screen.getByText('Diseño ergonómico')).toBeInTheDocument()
      expect(screen.getByText('Control excelente')).toBeInTheDocument()
      expect(screen.getByText('Reciclable')).toBeInTheDocument()
    })
  })

  describe('Audiencia objetivo', () => {
    it('debe adaptar el contenido para consumidores', () => {
      render(<ProductComparison {...defaultProps} targetAudience="consumer" />)
      
      expect(screen.getByText('Para uso familiar')).toBeInTheDocument()
      expect(screen.getByText('Recomendado para el hogar')).toBeInTheDocument()
    })

    it('debe adaptar el contenido para negocios', () => {
      render(<ProductComparison {...defaultProps} targetAudience="business" />)
      
      expect(screen.getByText('Para uso comercial')).toBeInTheDocument()
      expect(screen.getByText('Pedido mínimo: $1,000')).toBeInTheDocument()
    })

    it('debe mostrar precios especiales para distribuidores', () => {
      render(<ProductComparison {...defaultProps} targetAudience="distributor" />)
      
      expect(screen.getByText('Precio distribuidor')).toBeInTheDocument()
      expect(screen.getByText('Descuentos por volumen')).toBeInTheDocument()
    })
  })

  describe('Responsive design', () => {
    it('debe aplicar clases CSS responsive', () => {
      render(<ProductComparison {...defaultProps} />)
      
      const comparisonContainer = screen.getByTestId('product-comparison')
      expect(comparisonContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })

    it('debe mostrar layout apropiado para móvil', () => {
      // Simular viewport móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })

      render(<ProductComparison {...defaultProps} />)
      
      const mobileLayout = screen.getByTestId('mobile-comparison')
      expect(mobileLayout).toBeInTheDocument()
    })
  })

  describe('Vacío y estados de error', () => {
    it('debe mostrar mensaje cuando no hay productos para comparar', () => {
      render(<ProductComparison {...defaultProps} products={[]} />)
      
      expect(screen.getByText('No hay productos para comparar')).toBeInTheDocument()
      expect(screen.getByText('Agrega productos para comenzar la comparación')).toBeInTheDocument()
    })

    it('debe mostrar mensaje cuando solo hay un producto', () => {
      render(<ProductComparison {...defaultProps} products={[mockComparisonData1]} />)
      
      expect(screen.getByText('Agrega más productos para comparar')).toBeInTheDocument()
    })
  })
})
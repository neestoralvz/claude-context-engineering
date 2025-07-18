import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '../../../components/productos/ProductCard'
import { Product } from '../../../types'

// Mock product para testing
const mockProduct: Product = {
  id: 'prod-001',
  name: 'Jabón Líquido Para Trastes Ninu',
  category: 'limpieza',
  description: 'Jabón líquido concentrado para trastes con poder desengrasante superior',
  size: 4,
  unit: 'l',
  packaging: 'bottle',
  cofepisApproval: true,
  ingredients: ['Tensioactivos biodegradables', 'Agentes desengrasantes', 'Fragrancia cítrica'],
  useCase: ['Cocina', 'Trastes', 'Utensilios', 'Cristalería'],
  shelfLife: 24,
  currentStock: 250,
  minStock: 80,
  productionCost: 45.00,
  salePrice: 89.90
}

const mockProductLowStock: Product = {
  ...mockProduct,
  id: 'prod-002',
  name: 'Producto Stock Bajo',
  currentStock: 10,
  minStock: 50
}

describe('ProductCard', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar el nombre del producto correctamente', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Jabón Líquido Para Trastes Ninu')).toBeInTheDocument()
    })

    it('debe renderizar la descripción del producto', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText(/Jabón líquido concentrado para trastes/)).toBeInTheDocument()
    })

    it('debe mostrar el precio de venta', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('$89.90 MXN')).toBeInTheDocument()
    })

    it('debe mostrar el tamaño y unidad del producto', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('4 l • bottle')).toBeInTheDocument()
    })
  })

  describe('Categorías e iconos', () => {
    it('debe mostrar el icono correcto para categoría limpieza', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('🧽 limpieza')).toBeInTheDocument()
    })

    it('debe mostrar categoría desinfección con icono correcto', () => {
      const desinfectantProduct = { ...mockProduct, category: 'desinfeccion' as const }
      render(<ProductCard product={desinfectantProduct} />)
      
      expect(screen.getByText('🦠 desinfeccion')).toBeInTheDocument()
    })

    it('debe mostrar categoría salud-bienestar con icono correcto', () => {
      const healthProduct = { ...mockProduct, category: 'salud-bienestar' as const }
      render(<ProductCard product={healthProduct} />)
      
      expect(screen.getByText('💊 salud bienestar')).toBeInTheDocument()
    })
  })

  describe('Estados de stock', () => {
    it('debe mostrar "Stock Alto" para productos con stock suficiente', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Stock Alto')).toBeInTheDocument()
    })

    it('debe mostrar "Stock Bajo" para productos con stock insuficiente', () => {
      render(<ProductCard product={mockProductLowStock} />)
      
      expect(screen.getByText('Stock Bajo')).toBeInTheDocument()
    })

    it('debe mostrar "Stock Medio" para productos con stock intermedio', () => {
      const mediumStockProduct = { ...mockProduct, currentStock: 100, minStock: 80 }
      render(<ProductCard product={mediumStockProduct} />)
      
      expect(screen.getByText('Stock Medio')).toBeInTheDocument()
    })

    it('debe mostrar el stock actual', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Stock actual:')).toBeInTheDocument()
      expect(screen.getByText('250')).toBeInTheDocument()
    })
  })

  describe('Certificación COFEPRIS', () => {
    it('debe mostrar certificación COFEPRIS cuando está aprobado', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('COFEPRIS')).toBeInTheDocument()
    })

    it('no debe mostrar certificación COFEPRIS cuando no está aprobado', () => {
      const nonApprovedProduct = { ...mockProduct, cofepisApproval: false }
      render(<ProductCard product={nonApprovedProduct} />)
      
      expect(screen.queryByText('COFEPRIS')).not.toBeInTheDocument()
    })
  })

  describe('Vida útil y costos', () => {
    it('debe mostrar la vida útil en meses', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Vida útil: 24 meses')).toBeInTheDocument()
    })

    it('debe mostrar el costo de producción', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Costo: $45.00')).toBeInTheDocument()
    })
  })

  describe('Usos del producto', () => {
    it('debe mostrar los primeros 3 usos', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('Cocina')).toBeInTheDocument()
      expect(screen.getByText('Trastes')).toBeInTheDocument()
      expect(screen.getByText('Utensilios')).toBeInTheDocument()
    })

    it('debe mostrar "+1" cuando hay más de 3 usos', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.getByText('+1')).toBeInTheDocument()
    })
  })

  describe('Interactividad', () => {
    it('debe llamar onClick cuando se hace clic en la tarjeta', () => {
      const mockOnClick = jest.fn()
      render(<ProductCard product={mockProduct} onClick={mockOnClick} />)
      
      const card = screen.getByRole('button', { name: /Ver detalles de Jabón Líquido Para Trastes Ninu/ })
      fireEvent.click(card)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockProduct)
    })

    it('no debe ser clickeable cuando no se proporciona onClick', () => {
      render(<ProductCard product={mockProduct} />)
      
      const card = screen.getByText('Jabón Líquido Para Trastes Ninu').closest('div')
      expect(card).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Acciones opcionales', () => {
    it('debe mostrar botones de acción cuando showActions es true', () => {
      render(<ProductCard product={mockProduct} showActions={true} />)
      
      expect(screen.getByText('Ver Detalles')).toBeInTheDocument()
      expect(screen.getByText('Gestionar')).toBeInTheDocument()
    })

    it('no debe mostrar botones de acción por defecto', () => {
      render(<ProductCard product={mockProduct} />)
      
      expect(screen.queryByText('Ver Detalles')).not.toBeInTheDocument()
      expect(screen.queryByText('Gestionar')).not.toBeInTheDocument()
    })
  })

  describe('Clases CSS y estilos', () => {
    it('debe aplicar clases de Ninu correctamente', () => {
      render(<ProductCard product={mockProduct} />)
      
      const productName = screen.getByText('Jabón Líquido Para Trastes Ninu')
      expect(productName).toHaveClass('text-ninu-primary')
    })

    it('debe aplicar clases de truncamiento de texto', () => {
      render(<ProductCard product={mockProduct} />)
      
      const productName = screen.getByText('Jabón Líquido Para Trastes Ninu')
      expect(productName).toHaveClass('line-clamp-2')
      
      const description = screen.getByText(/Jabón líquido concentrado/)
      expect(description).toHaveClass('line-clamp-3')
    })

    it('debe tener border izquierdo con color Ninu', () => {
      render(<ProductCard product={mockProduct} />)
      
      // Buscar el div principal del card que tiene las clases de borde
      const cardContainer = screen.getByText('Jabón Líquido Para Trastes Ninu').closest('.border-l-ninu-secondary')
      expect(cardContainer).toBeInTheDocument()
      expect(cardContainer).toHaveClass('border-l-4', 'border-l-ninu-secondary')
    })
  })
})
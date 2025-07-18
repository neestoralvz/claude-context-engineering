import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGrid } from '../../../components/productos/ProductGrid'
import { Product } from '../../../types'

// Mock products para testing
const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Jabón Líquido Para Trastes Ninu',
    category: 'limpieza',
    description: 'Jabón líquido concentrado para trastes',
    size: 4,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Tensioactivos biodegradables'],
    useCase: ['Cocina', 'Trastes'],
    shelfLife: 24,
    currentStock: 250,
    minStock: 80,
    productionCost: 45.00,
    salePrice: 89.90
  },
  {
    id: 'prod-002',
    name: 'Sanitizante Multiusos Ninu Premium',
    category: 'desinfeccion',
    description: 'Sanitizante multiusos con amplio espectro antimicrobiano',
    size: 1,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Compuestos de amonio cuaternario'],
    useCase: ['Superficies', 'Ambientes'],
    shelfLife: 24,
    currentStock: 320,
    minStock: 100,
    productionCost: 38.00,
    salePrice: 79.90
  },
  {
    id: 'prod-003',
    name: 'Gel Conductor Ultrasonido Ninu',
    category: 'salud-bienestar',
    description: 'Gel conductor profesional para equipos de ultrasonido',
    size: 1,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Glicerina', 'Carboximetilcelulosa'],
    useCase: ['Ultrasonido', 'Fisioterapia'],
    shelfLife: 24,
    currentStock: 120,
    minStock: 40,
    productionCost: 95.00,
    salePrice: 169.90
  }
]

describe('ProductGrid', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar todos los productos proporcionados', () => {
      render(<ProductGrid products={mockProducts} />)
      
      expect(screen.getByText('Jabón Líquido Para Trastes Ninu')).toBeInTheDocument()
      expect(screen.getByText('Sanitizante Multiusos Ninu Premium')).toBeInTheDocument()
      expect(screen.getByText('Gel Conductor Ultrasonido Ninu')).toBeInTheDocument()
    })

    it('debe mostrar el contador de productos', () => {
      render(<ProductGrid products={mockProducts} />)
      
      expect(screen.getByText('3 de 3 productos')).toBeInTheDocument()
    })

    it('debe renderizar el mensaje de no productos cuando la lista está vacía', () => {
      render(<ProductGrid products={[]} />)
      
      expect(screen.getByText('No se encontraron productos')).toBeInTheDocument()
      expect(screen.getByText('📦')).toBeInTheDocument()
    })
  })

  describe('Filtros y búsqueda', () => {
    it('debe mostrar los filtros cuando showFilters es true (por defecto)', () => {
      render(<ProductGrid products={mockProducts} />)
      
      expect(screen.getByPlaceholderText('Buscar productos...')).toBeInTheDocument()
      expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
      expect(screen.getByText('Ordenar por:')).toBeInTheDocument()
    })

    it('no debe mostrar filtros cuando showFilters es false', () => {
      render(<ProductGrid products={mockProducts} showFilters={false} />)
      
      expect(screen.queryByPlaceholderText('Buscar productos...')).not.toBeInTheDocument()
      expect(screen.queryByText('Todas las categorías')).not.toBeInTheDocument()
    })

    it('debe filtrar productos por búsqueda de texto', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'trastes')
      
      await waitFor(() => {
        expect(screen.getByText('Jabón Líquido Para Trastes Ninu')).toBeInTheDocument()
        expect(screen.queryByText('Sanitizante Multiusos Ninu Premium')).not.toBeInTheDocument()
        expect(screen.getByText('1 de 3 productos')).toBeInTheDocument()
      })
    })

    it('debe filtrar productos por categoría', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const categorySelect = screen.getByDisplayValue('Todas las categorías')
      await user.selectOptions(categorySelect, 'desinfeccion')
      
      await waitFor(() => {
        expect(screen.queryByText('Jabón Líquido Para Trastes Ninu')).not.toBeInTheDocument()
        expect(screen.getByText('Sanitizante Multiusos Ninu Premium')).toBeInTheDocument()
        expect(screen.getByText('1 de 3 productos')).toBeInTheDocument()
      })
    })

    it('debe mostrar botón para limpiar búsqueda cuando hay texto', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'trastes')
      
      await waitFor(() => {
        expect(screen.getByText('Limpiar búsqueda')).toBeInTheDocument()
      })
    })

    it('debe limpiar la búsqueda al hacer clic en "Limpiar búsqueda"', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'trastes')
      
      await waitFor(() => {
        expect(screen.getByText('1 de 3 productos')).toBeInTheDocument()
      })
      
      const clearButton = screen.getByText('Limpiar búsqueda')
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(screen.getByText('3 de 3 productos')).toBeInTheDocument()
        expect(searchInput).toHaveValue('')
      })
    })
  })

  describe('Ordenamiento', () => {
    it('debe ordenar productos por nombre por defecto', () => {
      render(<ProductGrid products={mockProducts} />)
      
      const productCards = screen.getAllByText(/Ninu/)
      expect(productCards[0]).toHaveTextContent('Gel Conductor Ultrasonido Ninu')
      expect(productCards[1]).toHaveTextContent('Jabón Líquido Para Trastes Ninu')
      expect(productCards[2]).toHaveTextContent('Sanitizante Multiusos Ninu Premium')
    })

    it('debe ordenar productos por precio cuando se selecciona', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const sortSelect = screen.getByDisplayValue('Nombre')
      await user.selectOptions(sortSelect, 'price')
      
      await waitFor(() => {
        const productCards = screen.getAllByText(/Ninu/)
        expect(productCards[0]).toHaveTextContent('Sanitizante Multiusos Ninu Premium') // $79.90
        expect(productCards[1]).toHaveTextContent('Jabón Líquido Para Trastes Ninu') // $89.90
        expect(productCards[2]).toHaveTextContent('Gel Conductor Ultrasonido Ninu') // $169.90
      })
    })

    it('debe ordenar productos por stock cuando se selecciona', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const sortSelect = screen.getByDisplayValue('Nombre')
      await user.selectOptions(sortSelect, 'stock')
      
      await waitFor(() => {
        const productCards = screen.getAllByText(/Ninu/)
        expect(productCards[0]).toHaveTextContent('Sanitizante Multiusos Ninu Premium') // 320 stock
        expect(productCards[1]).toHaveTextContent('Jabón Líquido Para Trastes Ninu') // 250 stock
        expect(productCards[2]).toHaveTextContent('Gel Conductor Ultrasonido Ninu') // 120 stock
      })
    })
  })

  describe('Interactividad de productos', () => {
    it('debe llamar onProductClick cuando se hace clic en un producto', async () => {
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} onProductClick={mockOnClick} />)
      
      const productCard = screen.getByText('Jabón Líquido Para Trastes Ninu')
      await user.click(productCard)
      
      expect(mockOnClick).toHaveBeenCalledWith(mockProducts[0])
    })

    it('debe pasar showActions a los ProductCard cuando se especifica', () => {
      render(<ProductGrid products={mockProducts} showActions={true} />)
      
      expect(screen.getAllByText('Ver Detalles')).toHaveLength(3)
      expect(screen.getAllByText('Gestionar')).toHaveLength(3)
    })
  })

  describe('Resumen de categorías', () => {
    it('debe mostrar el resumen de categorías cuando showFilters es true', () => {
      render(<ProductGrid products={mockProducts} />)
      
      expect(screen.getByText('Resumen por Categorías')).toBeInTheDocument()
    })

    it('debe mostrar conteos correctos para cada categoría', () => {
      render(<ProductGrid products={mockProducts} />)
      
      expect(screen.getByText('🧽')).toBeInTheDocument() // limpieza
      expect(screen.getByText('🦠')).toBeInTheDocument() // desinfeccion
      expect(screen.getByText('💊')).toBeInTheDocument() // salud-bienestar
      
      // Verificar que hay 3 elementos con "1 productos" (uno por cada categoría)
      const productCounts = screen.getAllByText('1 productos')
      expect(productCounts).toHaveLength(3)
    })

    it('debe filtrar por categoría al hacer clic en una categoría del resumen', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const desinfeccionCategory = screen.getByText('🦠').closest('div')
      if (desinfeccionCategory) {
        await user.click(desinfeccionCategory)
        
        await waitFor(() => {
          expect(screen.getByText('Sanitizante Multiusos Ninu Premium')).toBeInTheDocument()
          expect(screen.queryByText('Jabón Líquido Para Trastes Ninu')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Estados de error y vacíos', () => {
    it('debe mostrar mensaje correcto cuando no hay coincidencias en búsqueda', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'producto inexistente')
      
      await waitFor(() => {
        expect(screen.getByText('No se encontraron productos')).toBeInTheDocument()
        expect(screen.getByText('No hay productos que coincidan con "producto inexistente"')).toBeInTheDocument()
      })
    })

    it('debe mostrar botón "Ver todos los productos" cuando hay filtros activos sin resultados', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'inexistente')
      
      await waitFor(() => {
        expect(screen.getByText('Ver todos los productos')).toBeInTheDocument()
      })
    })

    it('debe limpiar todos los filtros al hacer clic en "Ver todos los productos"', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'inexistente')
      
      await waitFor(() => {
        const showAllButton = screen.getByText('Ver todos los productos')
        user.click(showAllButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('3 de 3 productos')).toBeInTheDocument()
        expect(searchInput).toHaveValue('')
      })
    })
  })

  describe('Clases CSS y estilos', () => {
    it('debe aplicar clases de Ninu correctamente en títulos', () => {
      render(<ProductGrid products={mockProducts} />)
      
      const categoryTitle = screen.getByText('Resumen por Categorías')
      expect(categoryTitle).toHaveClass('text-ninu-primary')
    })

    it('debe aplicar estilos de hover y transiciones a categorías', () => {
      render(<ProductGrid products={mockProducts} />)
      
      // Buscar el div clickeable de la categoría que tiene las clases de cursor y transición
      const categorySection = screen.getByText('🧽').closest('.cursor-pointer')
      expect(categorySection).toBeInTheDocument()
      expect(categorySection).toHaveClass('cursor-pointer', 'transition-colors')
    })

    it('debe aplicar clases de Ninu a botones y enlaces', async () => {
      const user = userEvent.setup()
      render(<ProductGrid products={mockProducts} />)
      
      // Primero escribir algo en el buscador para que aparezca el botón "Limpiar búsqueda"
      const searchInput = screen.getByPlaceholderText('Buscar productos...')
      await user.type(searchInput, 'test')
      
      await waitFor(() => {
        const clearSearchButton = screen.getByText('Limpiar búsqueda')
        expect(clearSearchButton).toHaveClass('text-ninu-secondary')
      })
    })
  })
})
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { RawMaterialForm } from '../../../components/raw-materials/RawMaterialForm'
import { createMockRawMaterial, createMockSupplier } from '../../utils/test-factories'

describe('RawMaterialForm Component', () => {
  const mockSuppliers = [
    createMockSupplier({
      id: 'sup-001',
      name: 'Proveedor Químicos S.A.',
      code: 'PQSA'
    }),
    createMockSupplier({
      id: 'sup-002', 
      name: 'Envases Industriales S.A.',
      code: 'EISA'
    })
  ]

  const defaultProps = {
    suppliers: mockSuppliers,
    onSubmit: jest.fn(),
    onCancel: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders form title correctly for new material', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByText('Nueva Materia Prima')).toBeInTheDocument()
    })

    it('renders form title correctly for editing material', () => {
      const material = createMockRawMaterial()
      render(<RawMaterialForm {...defaultProps} material={material} />)
      
      expect(screen.getByText('Editar Materia Prima')).toBeInTheDocument()
    })

    it('renders all required form fields', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Código SKU *')).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre *')).toBeInTheDocument()
      expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
      expect(screen.getByLabelText('Categoría *')).toBeInTheDocument()
      expect(screen.getByLabelText('Unidad de Medida *')).toBeInTheDocument()
      expect(screen.getByLabelText('Stock Mínimo *')).toBeInTheDocument()
      expect(screen.getByLabelText('Stock Máximo *')).toBeInTheDocument()
      expect(screen.getByLabelText('Costo Unitario *')).toBeInTheDocument()
      expect(screen.getByLabelText('Proveedor *')).toBeInTheDocument()
    })

    it('renders action buttons correctly', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByText('Cancelar')).toBeInTheDocument()
      expect(screen.getByText('Guardar')).toBeInTheDocument()
    })

    it('shows loading state when isLoading is true', () => {
      render(<RawMaterialForm {...defaultProps} isLoading={true} />)
      
      expect(screen.getByText('Guardando...')).toBeInTheDocument()
      expect(screen.getByText('Guardando...')).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('shows required field validation errors', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      const submitButton = screen.getByText('Guardar')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('El código SKU es requerido')).toBeInTheDocument()
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
        expect(screen.getByText('La categoría es requerida')).toBeInTheDocument()
        expect(screen.getByText('La unidad de medida es requerida')).toBeInTheDocument()
        expect(screen.getByText('El stock mínimo es requerido')).toBeInTheDocument()
        expect(screen.getByText('El stock máximo es requerido')).toBeInTheDocument()
        expect(screen.getByText('El costo unitario es requerido')).toBeInTheDocument()
        expect(screen.getByText('El proveedor es requerido')).toBeInTheDocument()
      })
    })

    it('validates that stock maximum is greater than minimum', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      await user.type(screen.getByLabelText('Stock Mínimo *'), '100')
      await user.type(screen.getByLabelText('Stock Máximo *'), '50')
      await user.click(screen.getByText('Guardar'))
      
      await waitFor(() => {
        expect(screen.getByText('El stock máximo debe ser mayor al mínimo')).toBeInTheDocument()
      })
    })

    it('validates positive numbers for stock and cost fields', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      // Fill all required fields first
      await user.type(screen.getByLabelText('Código SKU *'), 'TEST-001')
      await user.type(screen.getByLabelText('Nombre *'), 'Test Material')
      await user.selectOptions(screen.getByLabelText('Categoría *'), 'surfactants')
      await user.type(screen.getByLabelText('Unidad de Medida *'), 'kg')
      await user.selectOptions(screen.getByLabelText('Proveedor *'), 'sup-001')
      
      // Set invalid values (zero)
      await user.type(screen.getByLabelText('Stock Mínimo *'), '0')
      await user.type(screen.getByLabelText('Stock Máximo *'), '0')
      await user.type(screen.getByLabelText('Costo Unitario *'), '0')
      
      await user.click(screen.getByText('Guardar'))
      
      await waitFor(() => {
        expect(screen.getByText('El stock mínimo debe ser mayor a 0')).toBeInTheDocument()
        expect(screen.getByText('El stock máximo debe ser mayor a 0')).toBeInTheDocument()
        expect(screen.getByText('El costo unitario debe ser mayor a 0')).toBeInTheDocument()
      })
    })

    it('validates code format (alphanumeric, 3-20 characters)', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      await user.type(screen.getByLabelText('Código SKU *'), 'AB')
      await user.click(screen.getByText('Guardar'))
      
      await waitFor(() => {
        expect(screen.getByText('El código debe tener entre 3 y 20 caracteres')).toBeInTheDocument()
      })
    })
  })

  describe('Form Population', () => {
    it('populates form when editing existing material', () => {
      const material = createMockRawMaterial({
        code: 'MAT-001',
        name: 'Tensioactivo Aniónico',
        description: 'Surfactante primario para limpiadores',
        category: 'surfactants',
        unit_of_measure: 'kg',
        minimum_stock: 50,
        maximum_stock: 200,
        unit_cost: 45.50,
        supplier_id: 'sup-001'
      })
      
      render(<RawMaterialForm {...defaultProps} material={material} />)
      
      expect(screen.getByDisplayValue('MAT-001')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Tensioactivo Aniónico')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Surfactante primario para limpiadores')).toBeInTheDocument()
      expect(screen.getByDisplayValue('50')).toBeInTheDocument()
      expect(screen.getByDisplayValue('200')).toBeInTheDocument()
      expect(screen.getByDisplayValue('45.5')).toBeInTheDocument()
    })

    it('selects correct category when editing', () => {
      const material = createMockRawMaterial({
        category: 'surfactants'
      })
      
      render(<RawMaterialForm {...defaultProps} material={material} />)
      
      const categorySelect = screen.getByLabelText('Categoría *')
      expect(categorySelect).toHaveValue('surfactants')
    })

    it('selects correct supplier when editing', () => {
      const material = createMockRawMaterial({
        supplier_id: 'sup-002'
      })
      
      render(<RawMaterialForm {...defaultProps} material={material} />)
      
      const supplierSelect = screen.getByLabelText('Proveedor *')
      expect(supplierSelect).toHaveValue('sup-002')
    })
  })

  describe('Category Options', () => {
    it('renders all material category options', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      const categorySelect = screen.getByLabelText('Categoría *')
      
      expect(screen.getByText('Tensioactivos')).toBeInTheDocument()
      expect(screen.getByText('Fragancias')).toBeInTheDocument()
      expect(screen.getByText('Conservadores')).toBeInTheDocument()
      expect(screen.getByText('Colorantes')).toBeInTheDocument()
      expect(screen.getByText('Ácidos')).toBeInTheDocument()
      expect(screen.getByText('Bases')).toBeInTheDocument()
      expect(screen.getByText('Envases y Empaques')).toBeInTheDocument()
      expect(screen.getByText('Etiquetas')).toBeInTheDocument()
      expect(screen.getByText('Otros')).toBeInTheDocument()
    })
  })

  describe('Supplier Selection', () => {
    it('renders supplier options correctly', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByText('Proveedor Químicos S.A. (PQSA)')).toBeInTheDocument()
      expect(screen.getByText('Envases Industriales S.A. (EISA)')).toBeInTheDocument()
    })

    it('shows empty state when no suppliers provided', () => {
      render(<RawMaterialForm {...defaultProps} suppliers={[]} />)
      
      const supplierSelect = screen.getByLabelText('Proveedor *')
      expect(supplierSelect.children).toHaveLength(1) // Only placeholder option
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit with correct data for new material', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      await user.type(screen.getByLabelText('Código SKU *'), 'MAT-TEST')
      await user.type(screen.getByLabelText('Nombre *'), 'Material de Prueba')
      await user.type(screen.getByLabelText('Descripción'), 'Descripción de prueba')
      await user.selectOptions(screen.getByLabelText('Categoría *'), 'surfactants')
      await user.type(screen.getByLabelText('Unidad de Medida *'), 'kg')
      await user.type(screen.getByLabelText('Stock Mínimo *'), '10')
      await user.type(screen.getByLabelText('Stock Máximo *'), '100')
      await user.type(screen.getByLabelText('Costo Unitario *'), '25.50')
      await user.selectOptions(screen.getByLabelText('Proveedor *'), 'sup-001')
      
      await user.click(screen.getByText('Guardar'))
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
          code: 'MAT-TEST',
          name: 'Material de Prueba',
          description: 'Descripción de prueba',
          category: 'surfactants',
          unit_of_measure: 'kg',
          minimum_stock: 10,
          maximum_stock: 100,
          unit_cost: 25.50,
          supplier_id: 'sup-001',
          expiration_tracking: false
        })
      })
    })

    it('includes material ID when editing existing material', async () => {
      const material = createMockRawMaterial({ id: 'mat-123' })
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} material={material} />)
      
      await user.clear(screen.getByLabelText('Nombre *'))
      await user.type(screen.getByLabelText('Nombre *'), 'Material Actualizado')
      await user.click(screen.getByText('Guardar'))
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'mat-123',
            name: 'Material Actualizado'
          })
        )
      })
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      await user.click(screen.getByText('Cancelar'))
      
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Expiration Tracking', () => {
    it('renders expiration tracking checkbox', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Requiere seguimiento de caducidad')).toBeInTheDocument()
    })

    it('toggles expiration tracking value', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      const checkbox = screen.getByLabelText('Requiere seguimiento de caducidad')
      expect(checkbox).not.toBeChecked()
      
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('includes expiration tracking in form submission', async () => {
      const user = userEvent.setup()
      render(<RawMaterialForm {...defaultProps} />)
      
      // Fill required fields
      await user.type(screen.getByLabelText('Código SKU *'), 'MAT-EXP')
      await user.type(screen.getByLabelText('Nombre *'), 'Material con Caducidad')
      await user.selectOptions(screen.getByLabelText('Categoría *'), 'preservatives')
      await user.type(screen.getByLabelText('Unidad de Medida *'), 'L')
      await user.type(screen.getByLabelText('Stock Mínimo *'), '5')
      await user.type(screen.getByLabelText('Stock Máximo *'), '50')
      await user.type(screen.getByLabelText('Costo Unitario *'), '75.00')
      await user.selectOptions(screen.getByLabelText('Proveedor *'), 'sup-001')
      
      // Enable expiration tracking
      await user.click(screen.getByLabelText('Requiere seguimiento de caducidad'))
      
      await user.click(screen.getByText('Guardar'))
      
      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            expiration_tracking: true
          })
        )
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByRole('form')).toBeInTheDocument()
      
      // All inputs should have proper labels
      const requiredFields = [
        'Código SKU *',
        'Nombre *', 
        'Categoría *',
        'Unidad de Medida *',
        'Stock Mínimo *',
        'Stock Máximo *',
        'Costo Unitario *',
        'Proveedor *'
      ]
      
      requiredFields.forEach(label => {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      })
    })

    it('maintains proper heading hierarchy', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Nueva Materia Prima')
    })

    it('has proper button roles and labels', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' })
      const submitButton = screen.getByRole('button', { name: 'Guardar' })
      
      expect(cancelButton).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('shows form-level error when provided', () => {
      render(<RawMaterialForm {...defaultProps} error="Error del servidor" />)
      
      expect(screen.getByText('Error del servidor')).toBeInTheDocument()
      expect(screen.getByText('Error del servidor').closest('div')).toHaveClass('text-red-600')
    })

    it('clears error when form is modified', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<RawMaterialForm {...defaultProps} error="Error del servidor" />)
      
      expect(screen.getByText('Error del servidor')).toBeInTheDocument()
      
      // Simulate error clearing by parent component
      rerender(<RawMaterialForm {...defaultProps} error="" />)
      
      expect(screen.queryByText('Error del servidor')).not.toBeInTheDocument()
    })
  })

  describe('Integration with Factory Standards', () => {
    it('follows Ninu.mx naming conventions in labels', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      expect(screen.getByText('Nueva Materia Prima')).toBeInTheDocument()
      expect(screen.getByLabelText('Código SKU *')).toBeInTheDocument()
      expect(screen.getByText('Requiere seguimiento de caducidad')).toBeInTheDocument()
    })

    it('uses proper currency formatting hints', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      const costInput = screen.getByLabelText('Costo Unitario *')
      expect(costInput).toHaveAttribute('placeholder', '0.00')
      expect(costInput).toHaveAttribute('step', '0.01')
    })

    it('applies Ninu brand colors to form elements', () => {
      render(<RawMaterialForm {...defaultProps} />)
      
      const submitButton = screen.getByText('Guardar')
      expect(submitButton).toHaveClass('bg-ninu-primary')
    })
  })
})
'use client'

import React, { useState, useEffect } from 'react'
import { RawMaterial, Supplier, MaterialCategory } from '../../types'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

interface RawMaterialFormData {
  id?: string
  code: string
  name: string
  description: string
  category: string
  unit_of_measure: string
  minimum_stock: number | ''
  maximum_stock: number | ''
  unit_cost: number | ''
  supplier_id: string
  expiration_tracking: boolean
}

interface RawMaterialFormProps {
  material?: RawMaterial
  suppliers: Supplier[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
  error?: string
}

interface FormErrors {
  code?: string
  name?: string
  category?: string
  unit_of_measure?: string
  minimum_stock?: string
  maximum_stock?: string
  unit_cost?: string
  supplier_id?: string
}

const MATERIAL_CATEGORIES = [
  { value: 'surfactants', label: 'Tensioactivos' },
  { value: 'fragrances', label: 'Fragancias' },
  { value: 'preservatives', label: 'Conservadores' },
  { value: 'colorants', label: 'Colorantes' },
  { value: 'acids', label: 'Ácidos' },
  { value: 'bases', label: 'Bases' },
  { value: 'packaging', label: 'Envases y Empaques' },
  { value: 'labels', label: 'Etiquetas' },
  { value: 'other', label: 'Otros' }
] as const

export function RawMaterialForm({ 
  material, 
  suppliers, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  error = ''
}: RawMaterialFormProps) {
  const [formData, setFormData] = useState<RawMaterialFormData>({
    code: '',
    name: '',
    description: '',
    category: '',
    unit_of_measure: '',
    minimum_stock: '',
    maximum_stock: '',
    unit_cost: '',
    supplier_id: '',
    expiration_tracking: false
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Populate form when editing existing material
  useEffect(() => {
    if (material) {
      setFormData({
        id: material.id,
        code: material.code,
        name: material.name,
        description: material.description || '',
        category: material.category,
        unit_of_measure: material.unit_of_measure,
        minimum_stock: material.minimum_stock,
        maximum_stock: material.maximum_stock,
        unit_cost: material.unit_cost,
        supplier_id: material.supplier_id,
        expiration_tracking: material.expiration_tracking
      })
    }
  }, [material])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required field validations
    if (!formData.code.trim()) {
      newErrors.code = 'El código SKU es requerido'
    } else if (formData.code.length < 3 || formData.code.length > 20) {
      newErrors.code = 'El código debe tener entre 3 y 20 caracteres'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    if (!formData.unit_of_measure.trim()) {
      newErrors.unit_of_measure = 'La unidad de medida es requerida'
    }

    if (formData.minimum_stock === '' || formData.minimum_stock === null) {
      newErrors.minimum_stock = 'El stock mínimo es requerido'
    } else if (Number(formData.minimum_stock) <= 0) {
      newErrors.minimum_stock = 'El stock mínimo debe ser mayor a 0'
    }

    if (formData.maximum_stock === '' || formData.maximum_stock === null) {
      newErrors.maximum_stock = 'El stock máximo es requerido'
    } else if (Number(formData.maximum_stock) <= 0) {
      newErrors.maximum_stock = 'El stock máximo debe ser mayor a 0'
    }

    if (formData.unit_cost === '' || formData.unit_cost === null) {
      newErrors.unit_cost = 'El costo unitario es requerido'
    } else if (Number(formData.unit_cost) <= 0) {
      newErrors.unit_cost = 'El costo unitario debe ser mayor a 0'
    }

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'El proveedor es requerido'
    }

    // Stock validation - maximum must be greater than minimum (only if both are positive)
    if (
      formData.minimum_stock !== '' && 
      formData.maximum_stock !== '' &&
      Number(formData.minimum_stock) > 0 &&
      Number(formData.maximum_stock) > 0 &&
      Number(formData.maximum_stock) <= Number(formData.minimum_stock)
    ) {
      newErrors.maximum_stock = 'El stock máximo debe ser mayor al mínimo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const submitData = {
        ...(material?.id && { id: material.id }),
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        unit_of_measure: formData.unit_of_measure.trim(),
        minimum_stock: Number(formData.minimum_stock),
        maximum_stock: Number(formData.maximum_stock),
        unit_cost: Number(formData.unit_cost),
        supplier_id: formData.supplier_id,
        expiration_tracking: formData.expiration_tracking
      }
      
      onSubmit(submitData)
    }
  }

  const handleInputChange = (field: keyof RawMaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form role="form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-ninu-primary mb-6">
            {material ? 'Editar Materia Prima' : 'Nueva Materia Prima'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código SKU */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código SKU *
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="MAT-001"
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre del material"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent"
            placeholder="Descripción del material"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar categoría</option>
              {MATERIAL_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Unidad de Medida */}
          <div>
            <label htmlFor="unit_of_measure" className="block text-sm font-medium text-gray-700 mb-2">
              Unidad de Medida *
            </label>
            <input
              type="text"
              id="unit_of_measure"
              value={formData.unit_of_measure}
              onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.unit_of_measure ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="kg, L, unidades"
            />
            {errors.unit_of_measure && <p className="text-red-500 text-sm mt-1">{errors.unit_of_measure}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock Mínimo */}
          <div>
            <label htmlFor="minimum_stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo *
            </label>
            <input
              type="number"
              id="minimum_stock"
              value={formData.minimum_stock}
              onChange={(e) => handleInputChange('minimum_stock', e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.minimum_stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="1"
            />
            {errors.minimum_stock && <p className="text-red-500 text-sm mt-1">{errors.minimum_stock}</p>}
          </div>

          {/* Stock Máximo */}
          <div>
            <label htmlFor="maximum_stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Máximo *
            </label>
            <input
              type="number"
              id="maximum_stock"
              value={formData.maximum_stock}
              onChange={(e) => handleInputChange('maximum_stock', e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.maximum_stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="1"
            />
            {errors.maximum_stock && <p className="text-red-500 text-sm mt-1">{errors.maximum_stock}</p>}
          </div>

          {/* Costo Unitario */}
          <div>
            <label htmlFor="unit_cost" className="block text-sm font-medium text-gray-700 mb-2">
              Costo Unitario *
            </label>
            <input
              type="number"
              id="unit_cost"
              value={formData.unit_cost}
              onChange={(e) => handleInputChange('unit_cost', e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
                errors.unit_cost ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.unit_cost && <p className="text-red-500 text-sm mt-1">{errors.unit_cost}</p>}
          </div>
        </div>

        {/* Proveedor */}
        <div>
          <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-2">
            Proveedor *
          </label>
          <select
            id="supplier_id"
            value={formData.supplier_id}
            onChange={(e) => handleInputChange('supplier_id', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ninu-primary focus:border-transparent ${
              errors.supplier_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name} ({supplier.code})
              </option>
            ))}
          </select>
          {errors.supplier_id && <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>}
        </div>

        {/* Seguimiento de Caducidad */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.expiration_tracking}
              onChange={(e) => handleInputChange('expiration_tracking', e.target.checked)}
              className="h-4 w-4 text-ninu-primary focus:ring-ninu-primary border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Requiere seguimiento de caducidad
            </span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            className="w-full sm:w-auto bg-ninu-primary"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
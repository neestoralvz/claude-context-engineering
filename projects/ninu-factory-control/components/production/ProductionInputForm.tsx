import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Package, Target, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { ProductionOrder } from '../../types'

interface ProductionInputFormProps {
  onSubmit: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'status'>) => void
  onCancel?: () => void
  availableProducts?: Array<{ id: string; name: string; unit: string }>
  availableReactors?: Array<{ id: string; name: string; available: boolean }>
  availableStations?: Array<{ id: string; name: string; available: boolean }>
}

const ninuProducts = [
  { id: 'multiusos-1l', name: 'Multiusos 1L', unit: 'unidades' },
  { id: 'sanitizante-1l', name: 'Sanitizante 1L', unit: 'unidades' },
  { id: 'detergente-2kg', name: 'Detergente 2kg', unit: 'unidades' },
  { id: 'jabon-500ml', name: 'Jabón 500ml', unit: 'unidades' },
  { id: 'kit-alberca-3pzas', name: 'Kit Alberca 3pzas', unit: 'kits' }
]

export function ProductionInputForm({ 
  onSubmit, 
  onCancel,
  availableProducts = ninuProducts,
  availableReactors,
  availableStations
}: ProductionInputFormProps) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 100,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    targetDate: '',
    assignedReactor: '',
    assignedStation: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.productId) {
      newErrors.productId = 'Selecciona un producto'
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0'
    }
    if (!formData.targetDate) {
      newErrors.targetDate = 'Selecciona una fecha objetivo'
    } else {
      const targetDate = new Date(formData.targetDate)
      const now = new Date()
      if (targetDate < now) {
        newErrors.targetDate = 'La fecha objetivo debe ser futura'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const selectedProduct = availableProducts.find(p => p.id === formData.productId)
      
      await onSubmit({
        productId: formData.productId,
        quantity: formData.quantity,
        priority: formData.priority,
        requestedDate: new Date(formData.targetDate)
      })

      // Reset form
      setFormData({
        productId: '',
        quantity: 100,
        priority: 'medium',
        targetDate: '',
        assignedReactor: '',
        assignedStation: ''
      })
    } catch (error) {
      console.error('Error submitting production order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-gray-900">
          <Plus className="h-5 w-5 mr-2 text-blue-600" />
          Nueva Orden de Producción
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Producto
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.productId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un producto...</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.productId}
              </p>
            )}
          </div>

          {/* Quantity and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline h-4 w-4 mr-1" />
                Cantidad
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
                max="10000"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha Objetivo
            </label>
            <input
              type="datetime-local"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.targetDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.targetDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.targetDate}
              </p>
            )}
          </div>

          {/* Resource Assignment (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableReactors && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reactor Asignado (Opcional)
                </label>
                <select
                  value={formData.assignedReactor}
                  onChange={(e) => setFormData({ ...formData, assignedReactor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Asignar automáticamente</option>
                  {availableReactors.map((reactor) => (
                    <option key={reactor.id} value={reactor.id} disabled={!reactor.available}>
                      {reactor.name} {!reactor.available && '(No disponible)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {availableStations && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estación Asignada (Opcional)
                </label>
                <select
                  value={formData.assignedStation}
                  onChange={(e) => setFormData({ ...formData, assignedStation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Asignar automáticamente</option>
                  {availableStations.map((station) => (
                    <option key={station.id} value={station.id} disabled={!station.available}>
                      {station.name} {!station.available && '(No disponible)'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Priority Preview */}
          {formData.priority && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Prioridad seleccionada:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                  {formData.priority === 'urgent' && 'Urgente'}
                  {formData.priority === 'high' && 'Alta'}
                  {formData.priority === 'medium' && 'Media'}
                  {formData.priority === 'low' && 'Baja'}
                </span>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border border-white mr-2"></div>
                  Creando orden...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-2" />
                  Crear Orden de Producción
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
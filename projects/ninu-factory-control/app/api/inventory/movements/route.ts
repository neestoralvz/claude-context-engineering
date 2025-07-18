import { NextRequest, NextResponse } from 'next/server'
import { mockInventoryMovements, mockAdvancedRawMaterials, mockAdvancedInventoryItems } from '@/lib/mock-data'
import { InventoryMovement } from '@/types'

/**
 * Inventory Movements API
 * 
 * Comprehensive tracking of all inventory movements with full traceability
 * Supports receipts, consumption, transfers, adjustments, waste, and production movements
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemType = searchParams.get('item_type')
    const itemId = searchParams.get('item_id')
    const movementType = searchParams.get('movement_type')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const batchId = searchParams.get('batch_id')
    const createdBy = searchParams.get('created_by')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeDetails = searchParams.get('include_details') === 'true'

    let filteredMovements = [...mockInventoryMovements]

    // Apply filters
    if (itemType) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.item_type === itemType
      )
    }

    if (itemId) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.item_id === itemId
      )
    }

    if (movementType) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.movement_type === movementType
      )
    }

    if (batchId) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.batch_id === batchId
      )
    }

    if (createdBy) {
      filteredMovements = filteredMovements.filter(movement => 
        movement.created_by.toLowerCase().includes(createdBy.toLowerCase())
      )
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filteredMovements = filteredMovements.filter(movement => 
        new Date(movement.created_at) >= fromDate
      )
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      filteredMovements = filteredMovements.filter(movement => 
        new Date(movement.created_at) <= toDate
      )
    }

    // Sort by date (most recent first)
    filteredMovements.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMovements = filteredMovements.slice(startIndex, endIndex)

    // Include additional details if requested
    let movementsWithDetails = paginatedMovements
    
    if (includeDetails) {
      movementsWithDetails = paginatedMovements.map(movement => {
        let itemDetails = null
        
        if (movement.item_type === 'raw_material') {
          itemDetails = mockAdvancedRawMaterials.find(item => item.id === movement.item_id)
        } else if (movement.item_type === 'finished_product') {
          itemDetails = mockAdvancedInventoryItems.find(item => item.id === movement.item_id)
        }

        return {
          ...movement,
          itemDetails: itemDetails ? {
            id: itemDetails.id,
            name: itemDetails.name,
            category: 'category' in itemDetails ? itemDetails.category : 'finished_product',
            unit: movement.item_type === 'raw_material' 
              ? (itemDetails as any).unit_of_measure 
              : (itemDetails as any).unit,
            currentStock: movement.item_type === 'raw_material'
              ? (itemDetails as any).current_stock
              : (itemDetails as any).currentStock
          } : null
        }
      })
    }

    // Calculate summary statistics
    const totalMovements = filteredMovements.length
    const totalValue = filteredMovements.reduce((sum, movement) => 
      sum + ((movement.unit_cost || 0) * Math.abs(movement.quantity)), 0
    )

    const movementsByType = filteredMovements.reduce((acc, movement) => {
      acc[movement.movement_type] = (acc[movement.movement_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const movementsByItem = filteredMovements.reduce((acc, movement) => {
      acc[movement.item_type] = (acc[movement.item_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate daily activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentMovements = filteredMovements.filter(movement => 
      new Date(movement.created_at) >= sevenDaysAgo
    )

    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayMovements = recentMovements.filter(movement => {
        const movementDate = new Date(movement.created_at)
        return movementDate >= dayStart && movementDate <= dayEnd
      })

      return {
        date: dayStart.toISOString().split('T')[0],
        movements: dayMovements.length,
        receipts: dayMovements.filter(m => m.movement_type === 'receipt').length,
        consumption: dayMovements.filter(m => m.movement_type === 'consumption').length,
        transfers: dayMovements.filter(m => m.movement_type === 'transfer').length,
        totalValue: dayMovements.reduce((sum, m) => sum + ((m.unit_cost || 0) * Math.abs(m.quantity)), 0)
      }
    }).reverse()

    return NextResponse.json({
      success: true,
      data: {
        movements: movementsWithDetails,
        pagination: {
          page,
          limit,
          total: filteredMovements.length,
          totalPages: Math.ceil(filteredMovements.length / limit),
          hasNext: endIndex < filteredMovements.length,
          hasPrev: page > 1
        },
        summary: {
          totalMovements,
          totalValue: Math.round(totalValue * 100) / 100,
          movementsByType,
          movementsByItem,
          uniqueItems: [...new Set(filteredMovements.map(m => m.item_id))].length,
          uniqueOperators: [...new Set(filteredMovements.map(m => m.created_by))].length,
          dateRange: {
            from: filteredMovements.length > 0 ? 
              filteredMovements[filteredMovements.length - 1].created_at : null,
            to: filteredMovements.length > 0 ? 
              filteredMovements[0].created_at : null
          }
        },
        analytics: {
          dailyActivity,
          topMovementTypes: Object.entries(movementsByType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count })),
          topOperators: Object.entries(
            filteredMovements.reduce((acc, movement) => {
              acc[movement.created_by] = (acc[movement.created_by] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          )
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([operator, count]) => ({ operator, count }))
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Inventory Movements API] Error fetching movements:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'MOVEMENTS_FETCH_ERROR',
        message: 'Error al obtener movimientos de inventario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const movementData: Partial<InventoryMovement> = await request.json()

    // Validate required fields
    const requiredFields = ['item_type', 'item_id', 'movement_type', 'quantity', 'reason', 'created_by']
    const missingFields = requiredFields.filter(field => !movementData[field as keyof typeof movementData])
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Campos requeridos faltantes',
          details: `Campos faltantes: ${missingFields.join(', ')}`
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Validate movement type
    const validMovementTypes = ['receipt', 'consumption', 'transfer', 'adjustment', 'waste', 'production']
    if (!validMovementTypes.includes(movementData.movement_type!)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_MOVEMENT_TYPE',
          message: 'Tipo de movimiento inválido',
          details: `Tipos válidos: ${validMovementTypes.join(', ')}`
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Validate item exists
    let itemExists = false
    let currentStock = 0
    
    if (movementData.item_type === 'raw_material') {
      const material = mockAdvancedRawMaterials.find(m => m.id === movementData.item_id)
      if (material) {
        itemExists = true
        currentStock = material.current_stock
      }
    } else if (movementData.item_type === 'finished_product') {
      const product = mockAdvancedInventoryItems.find(p => p.id === movementData.item_id)
      if (product) {
        itemExists = true
        currentStock = product.currentStock
      }
    }

    if (!itemExists) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Artículo no encontrado',
          details: `${movementData.item_type}: ${movementData.item_id}`
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Validate stock for consumption/transfer movements
    if (['consumption', 'transfer', 'waste'].includes(movementData.movement_type!) && movementData.quantity! > 0) {
      if (currentStock < movementData.quantity!) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: 'Stock insuficiente',
            details: `Stock actual: ${currentStock}, Cantidad solicitada: ${movementData.quantity}`
          },
          timestamp: new Date().toISOString()
        }, { status: 400 })
      }
    }

    // Generate movement ID
    const movementId = `mov-${String(mockInventoryMovements.length + 1).padStart(3, '0')}`

    // Create new movement
    const newMovement: InventoryMovement = {
      id: movementId,
      item_type: movementData.item_type!,
      item_id: movementData.item_id!,
      batch_id: movementData.batch_id,
      movement_type: movementData.movement_type!,
      quantity: ['consumption', 'transfer', 'waste'].includes(movementData.movement_type!) && movementData.quantity! > 0 
        ? -Math.abs(movementData.quantity!) 
        : Math.abs(movementData.quantity!),
      unit_cost: movementData.unit_cost,
      reason: movementData.reason!,
      reference_document: movementData.reference_document,
      from_location: movementData.from_location,
      to_location: movementData.to_location,
      created_by: movementData.created_by!,
      created_at: new Date().toISOString()
    }

    // Add to movements
    mockInventoryMovements.unshift(newMovement) // Add to beginning for recent-first order

    // Update stock in source data
    if (movementData.item_type === 'raw_material') {
      const materialIndex = mockAdvancedRawMaterials.findIndex(m => m.id === movementData.item_id)
      if (materialIndex !== -1) {
        mockAdvancedRawMaterials[materialIndex].current_stock += newMovement.quantity
        mockAdvancedRawMaterials[materialIndex].updated_at = new Date().toISOString()
        
        // Add to usage history
        mockAdvancedRawMaterials[materialIndex].traceability.usageHistory.push({
          usageDate: new Date(),
          batchId: newMovement.batch_id || 'N/A',
          quantityUsed: Math.abs(newMovement.quantity),
          purpose: newMovement.reason,
          operatorId: newMovement.created_by,
          qualityCheckRequired: newMovement.movement_type === 'receipt',
          qualityStatus: newMovement.movement_type === 'receipt' ? 'pending' : undefined
        })
      }
    } else if (movementData.item_type === 'finished_product') {
      const productIndex = mockAdvancedInventoryItems.findIndex(p => p.id === movementData.item_id)
      if (productIndex !== -1) {
        mockAdvancedInventoryItems[productIndex].currentStock += newMovement.quantity
        mockAdvancedInventoryItems[productIndex].lastRestocked = new Date()
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        movement: newMovement,
        message: 'Movimiento de inventario registrado exitosamente',
        updatedStock: movementData.item_type === 'raw_material' 
          ? mockAdvancedRawMaterials.find(m => m.id === movementData.item_id)?.current_stock
          : mockAdvancedInventoryItems.find(p => p.id === movementData.item_id)?.currentStock
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('[Inventory Movements API] Error creating movement:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'MOVEMENT_CREATE_ERROR',
        message: 'Error al registrar movimiento de inventario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const movementId = searchParams.get('id')
    const reason = searchParams.get('reason')
    const authorizedBy = searchParams.get('authorized_by')
    
    if (!movementId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_MOVEMENT_ID',
          message: 'ID de movimiento requerido'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    if (!reason || !authorizedBy) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_AUTHORIZATION',
          message: 'Razón y autorización requeridas para reversar movimientos'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const movementIndex = mockInventoryMovements.findIndex(m => m.id === movementId)
    
    if (movementIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MOVEMENT_NOT_FOUND',
          message: 'Movimiento no encontrado'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    const movement = mockInventoryMovements[movementIndex]
    
    // Check if movement is recent enough to reverse (within 24 hours)
    const movementDate = new Date(movement.created_at)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    if (movementDate < oneDayAgo) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MOVEMENT_TOO_OLD',
          message: 'Solo se pueden reversar movimientos de las últimas 24 horas',
          details: `Movimiento creado: ${movement.created_at}`
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Create reversal movement
    const reversalMovement: InventoryMovement = {
      id: `mov-${String(mockInventoryMovements.length + 1).padStart(3, '0')}`,
      item_type: movement.item_type,
      item_id: movement.item_id,
      batch_id: movement.batch_id,
      movement_type: 'adjustment',
      quantity: -movement.quantity, // Reverse the quantity
      unit_cost: movement.unit_cost,
      reason: `REVERSAL: ${reason} (Original: ${movement.id})`,
      reference_document: `REVERSAL-${movement.id}`,
      from_location: movement.to_location,
      to_location: movement.from_location,
      created_by: authorizedBy,
      created_at: new Date().toISOString()
    }

    // Add reversal movement
    mockInventoryMovements.unshift(reversalMovement)

    // Update stock
    if (movement.item_type === 'raw_material') {
      const materialIndex = mockAdvancedRawMaterials.findIndex(m => m.id === movement.item_id)
      if (materialIndex !== -1) {
        mockAdvancedRawMaterials[materialIndex].current_stock += reversalMovement.quantity
        mockAdvancedRawMaterials[materialIndex].updated_at = new Date().toISOString()
      }
    } else if (movement.item_type === 'finished_product') {
      const productIndex = mockAdvancedInventoryItems.findIndex(p => p.id === movement.item_id)
      if (productIndex !== -1) {
        mockAdvancedInventoryItems[productIndex].currentStock += reversalMovement.quantity
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        originalMovement: movement,
        reversalMovement: reversalMovement,
        message: 'Movimiento reversado exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Inventory Movements API] Error reversing movement:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'MOVEMENT_REVERSAL_ERROR',
        message: 'Error al reversar movimiento',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
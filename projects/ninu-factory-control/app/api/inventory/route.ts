import { NextRequest, NextResponse } from 'next/server'
import { InventoryService } from '@/lib/services/inventory-service'

/**
 * Inventory Management API
 * 
 * Core CRUD operations for inventory management
 * Supports filtering, pagination, and real-time updates
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const lowStock = searchParams.get('lowStock') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Initialize inventory table if needed
    await InventoryService.initializeInventoryTable()

    // Get inventory with filters
    const result = await InventoryService.getInventory({
      category: category || undefined,
      status: status || undefined,
      lowStock: lowStock || undefined,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Inventory API] Error fetching inventory:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVENTORY_FETCH_ERROR',
        message: 'Error al obtener inventario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const itemData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'category', 'stock', 'minStock', 'price']
    const missingFields = requiredFields.filter(field => !itemData[field])
    
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

    // Initialize inventory table if needed
    await InventoryService.initializeInventoryTable()

    // Create new inventory item
    const newItem = await InventoryService.createInventoryItem({
      name: itemData.name,
      category: itemData.category,
      stock: itemData.stock,
      minStock: itemData.minStock,
      price: itemData.price,
      unit: itemData.unit || 'unidad',
      location: itemData.location || 'A1-001',
      status: itemData.status || 'active',
      supplier: itemData.supplier || 'Proveedor General',
      description: itemData.description || ''
    })

    return NextResponse.json({
      success: true,
      data: {
        item: newItem,
        message: 'Producto añadido al inventario exitosamente'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('[Inventory API] Error creating item:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVENTORY_CREATE_ERROR',
        message: 'Error al crear producto en inventario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')
    
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_ITEM_ID',
          message: 'ID de producto requerido'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const updateData = await request.json()
    
    // Update item in database
    const updatedItem = await InventoryService.updateInventoryItem(itemId, updateData)
    
    if (!updatedItem) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Producto no encontrado'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        item: updatedItem,
        message: 'Producto actualizado exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Inventory API] Error updating item:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVENTORY_UPDATE_ERROR',
        message: 'Error al actualizar producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')
    
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_ITEM_ID',
          message: 'ID de producto requerido'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Get item before deletion for response
    const item = await InventoryService.getInventoryById(itemId)
    
    if (!item) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Producto no encontrado'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Delete item from database
    const deleted = await InventoryService.deleteInventoryItem(itemId)

    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ITEM_DELETE_FAILED',
          message: 'Error al eliminar producto'
        },
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        item: item,
        message: 'Producto eliminado exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Inventory API] Error deleting item:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVENTORY_DELETE_ERROR',
        message: 'Error al eliminar producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
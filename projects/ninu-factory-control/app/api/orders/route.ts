import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock production orders data
    const orders = [
      {
        id: 'ORDER-2024-001',
        productId: 'multiusos-1l',
        productName: 'Multiusos 1L',
        quantity: 500,
        completed: 375,
        status: 'in_progress',
        priority: 'high',
        startTime: '2024-01-15T09:00:00Z',
        estimatedCompletion: '2024-01-15T15:00:00Z',
        assignedStation: 'station-001',
        batch: 'BATCH-2024-001',
        customer: 'Distribuidor A',
        notes: 'Entrega urgente para cliente preferencial'
      },
      {
        id: 'ORDER-2024-002',
        productId: 'sanitizante-1l',
        productName: 'Sanitizante 1L',
        quantity: 300,
        completed: 280,
        status: 'in_progress',
        priority: 'medium',
        startTime: '2024-01-15T07:00:00Z',
        estimatedCompletion: '2024-01-15T13:00:00Z',
        assignedStation: 'station-002',
        batch: 'BATCH-2024-002',
        customer: 'Distribuidor B',
        notes: 'Orden regular de stock'
      },
      {
        id: 'ORDER-2024-003',
        productId: 'detergente-2kg',
        productName: 'Detergente 2kg',
        quantity: 200,
        completed: 150,
        status: 'in_progress',
        priority: 'medium',
        startTime: '2024-01-15T08:30:00Z',
        estimatedCompletion: '2024-01-15T16:30:00Z',
        assignedStation: 'station-004',
        batch: 'BATCH-2024-003',
        customer: 'Distribuidor C',
        notes: 'Formulación especial para mercado regional'
      },
      {
        id: 'ORDER-2024-004',
        productId: 'jabon-500ml',
        productName: 'Jabón 500ml',
        quantity: 150,
        completed: 150,
        status: 'completed',
        priority: 'low',
        startTime: '2024-01-14T10:00:00Z',
        estimatedCompletion: '2024-01-14T16:00:00Z',
        completedTime: '2024-01-14T15:45:00Z',
        assignedStation: 'station-005',
        batch: 'BATCH-2024-004',
        customer: 'Distribuidor D',
        notes: 'Orden completada sin incidencias'
      },
      {
        id: 'ORDER-2024-005',
        productId: 'kit-alberca',
        productName: 'Kit Alberca 3pzas',
        quantity: 100,
        completed: 0,
        status: 'pending',
        priority: 'low',
        scheduledStart: '2024-01-16T08:00:00Z',
        estimatedCompletion: '2024-01-16T18:00:00Z',
        assignedStation: null,
        batch: null,
        customer: 'Distribuidor E',
        notes: 'Pendiente de liberación de materias primas'
      },
      {
        id: 'ORDER-2024-006',
        productId: 'multiusos-1l',
        productName: 'Multiusos 1L',
        quantity: 800,
        completed: 0,
        status: 'scheduled',
        priority: 'high',
        scheduledStart: '2024-01-15T16:00:00Z',
        estimatedCompletion: '2024-01-16T08:00:00Z',
        assignedStation: 'station-001',
        batch: null,
        customer: 'Distribuidor F',
        notes: 'Orden grande programada para turno nocturno'
      },
      {
        id: 'ORDER-2024-007',
        productId: 'sanitizante-1l',
        productName: 'Sanitizante 1L',
        quantity: 250,
        completed: 250,
        status: 'completed',
        priority: 'medium',
        startTime: '2024-01-13T14:00:00Z',
        estimatedCompletion: '2024-01-13T20:00:00Z',
        completedTime: '2024-01-13T19:30:00Z',
        assignedStation: 'station-002',
        batch: 'BATCH-2024-005',
        customer: 'Distribuidor G',
        notes: 'Orden completada con 30 minutos de adelanto'
      },
      {
        id: 'ORDER-2024-008',
        productId: 'detergente-2kg',
        productName: 'Detergente 2kg',
        quantity: 300,
        completed: 0,
        status: 'on_hold',
        priority: 'medium',
        scheduledStart: '2024-01-17T09:00:00Z',
        estimatedCompletion: '2024-01-17T17:00:00Z',
        assignedStation: 'station-004',
        batch: null,
        customer: 'Distribuidor H',
        notes: 'En espera por mantenimiento de equipo'
      }
    ]

    // Summary statistics
    const summary = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      scheduled: orders.filter(o => o.status === 'scheduled').length,
      in_progress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      on_hold: orders.filter(o => o.status === 'on_hold').length,
      total_quantity: orders.reduce((sum, o) => sum + o.quantity, 0),
      completed_quantity: orders.reduce((sum, o) => sum + o.completed, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        orders,
        summary
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'ORDERS_FETCH_ERROR',
        message: 'Error al obtener órdenes de producción'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, quantity, priority, customer, notes, scheduledStart } = body

    // Basic validation
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ORDER_DATA',
          message: 'Datos de orden inválidos: productId y quantity son requeridos'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Mock order creation
    const newOrder = {
      id: `ORDER-2024-${Date.now().toString().slice(-3)}`,
      productId,
      quantity,
      completed: 0,
      status: 'pending',
      priority: priority || 'medium',
      customer: customer || 'Cliente Sin Nombre',
      notes: notes || '',
      scheduledStart: scheduledStart || new Date(Date.now() + 3600000).toISOString(), // +1 hour
      estimatedCompletion: null,
      assignedStation: null,
      batch: null,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newOrder,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'ORDER_CREATE_ERROR',
        message: 'Error al crear orden de producción'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
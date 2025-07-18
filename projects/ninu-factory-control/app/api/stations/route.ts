import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock station data based on the factory system
    const stations = [
      {
        id: 'station-001',
        name: 'Etiquetado Principal',
        type: 'labeling',
        status: 'running',
        currentOrder: {
          id: 'ORDER-2024-001',
          product: 'Multiusos 1L',
          quantity: 500,
          completed: 375,
          startTime: '2024-01-15T09:00:00Z',
          estimatedCompletion: '2024-01-15T15:00:00Z'
        },
        performance: {
          efficiency: 94.2,
          speed: 125, // units per hour
          quality: 98.5,
          uptime: 96.8
        },
        lastMaintenance: '2024-01-10T18:00:00Z',
        nextMaintenance: '2024-01-24T18:00:00Z'
      },
      {
        id: 'station-002',
        name: 'Llenado Automático',
        type: 'filling',
        status: 'running',
        currentOrder: {
          id: 'ORDER-2024-002',
          product: 'Sanitizante 1L',
          quantity: 300,
          completed: 280,
          startTime: '2024-01-15T07:00:00Z',
          estimatedCompletion: '2024-01-15T13:00:00Z'
        },
        performance: {
          efficiency: 91.7,
          speed: 150, // units per hour
          quality: 99.2,
          uptime: 98.1
        },
        lastMaintenance: '2024-01-09T12:00:00Z',
        nextMaintenance: '2024-01-23T12:00:00Z'
      },
      {
        id: 'station-003',
        name: 'Etiquetado Secundario',
        type: 'secondary_labeling',
        status: 'maintenance',
        currentOrder: null,
        performance: {
          efficiency: 0,
          speed: 0,
          quality: 97.8,
          uptime: 85.3
        },
        lastMaintenance: '2024-01-15T10:00:00Z',
        nextMaintenance: '2024-01-29T10:00:00Z'
      },
      {
        id: 'station-004',
        name: 'Empaque Polvos',
        type: 'powder_packaging',
        status: 'running',
        currentOrder: {
          id: 'ORDER-2024-003',
          product: 'Detergente 2kg',
          quantity: 200,
          completed: 150,
          startTime: '2024-01-15T08:30:00Z',
          estimatedCompletion: '2024-01-15T16:30:00Z'
        },
        performance: {
          efficiency: 89.4,
          speed: 80, // units per hour
          quality: 96.7,
          uptime: 93.2
        },
        lastMaintenance: '2024-01-11T14:00:00Z',
        nextMaintenance: '2024-01-25T14:00:00Z'
      },
      {
        id: 'station-005',
        name: 'Línea Jabones',
        type: 'soap_production',
        status: 'idle',
        currentOrder: null,
        performance: {
          efficiency: 0,
          speed: 0,
          quality: 95.1,
          uptime: 88.7
        },
        lastMaintenance: '2024-01-13T16:00:00Z',
        nextMaintenance: '2024-01-27T16:00:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      data: stations,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching stations:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'STATION_FETCH_ERROR',
        message: 'Error al obtener datos de estaciones'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stationId, action, orderData } = body

    const validActions = ['start_order', 'stop_order', 'pause_order', 'maintenance_mode']
    
    if (!validActions.includes(action)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Acción no válida para la estación'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Simulate action processing
    const result = {
      stationId,
      action,
      status: 'completed',
      timestamp: new Date().toISOString(),
      orderData: orderData || null
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing station action:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'STATION_ACTION_ERROR',
        message: 'Error al procesar acción de la estación'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
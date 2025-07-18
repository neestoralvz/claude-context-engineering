import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock reactor data based on the factory system
    const reactors = [
      {
        id: 'reactor-001',
        name: 'Reactor A - Líquidos',
        type: 'liquid',
        capacity: 5000, // liters
        status: 'mixing',
        currentBatch: {
          id: 'BATCH-2024-001',
          product: 'Multiusos 1L',
          startTime: '2024-01-15T08:00:00Z',
          expectedEndTime: '2024-01-15T12:00:00Z',
          progress: 75
        },
        parameters: {
          temperature: 25.5, // °C
          pressure: 1.2, // bar
          mixingSpeed: 120, // rpm
          pH: 7.2
        },
        efficiency: 92.5,
        lastMaintenance: '2024-01-10T14:00:00Z',
        nextMaintenance: '2024-01-25T14:00:00Z'
      },
      {
        id: 'reactor-002',
        name: 'Reactor B - Desinfectantes',
        type: 'disinfectant',
        capacity: 3000, // liters
        status: 'cooling',
        currentBatch: {
          id: 'BATCH-2024-002',
          product: 'Sanitizante 1L',
          startTime: '2024-01-15T06:00:00Z',
          expectedEndTime: '2024-01-15T11:00:00Z',
          progress: 95
        },
        parameters: {
          temperature: 18.2, // °C
          pressure: 1.0, // bar
          mixingSpeed: 0, // rpm (stopped for cooling)
          pH: 6.8
        },
        efficiency: 88.3,
        lastMaintenance: '2024-01-08T10:00:00Z',
        nextMaintenance: '2024-01-22T10:00:00Z'
      },
      {
        id: 'reactor-003',
        name: 'Reactor C - Especialidades',
        type: 'specialty',
        capacity: 2000, // liters
        status: 'idle',
        currentBatch: null,
        parameters: {
          temperature: 20.0, // °C
          pressure: 1.0, // bar
          mixingSpeed: 0, // rpm
          pH: 7.0
        },
        efficiency: 0,
        lastMaintenance: '2024-01-12T16:00:00Z',
        nextMaintenance: '2024-01-26T16:00:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      data: reactors,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching reactors:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'REACTOR_FETCH_ERROR',
        message: 'Error al obtener datos de reactores'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reactorId, action, parameters } = body

    // Mock reactor action processing
    const validActions = ['start', 'stop', 'pause', 'update_parameters']
    
    if (!validActions.includes(action)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Acción no válida para el reactor'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Simulate action processing
    const result = {
      reactorId,
      action,
      status: 'completed',
      timestamp: new Date().toISOString(),
      parameters: parameters || {}
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing reactor action:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'REACTOR_ACTION_ERROR',
        message: 'Error al procesar acción del reactor'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
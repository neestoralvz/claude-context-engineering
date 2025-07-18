import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock production metrics data
    const currentTime = new Date()
    const metrics = {
      totalProduction: 12450,
      efficiency: 89.5,
      qualityRate: 98.2,
      downtime: 2.3,
      activeOrders: 8,
      completedOrders: 23,
      alertsCount: 3,
      timestamp: currentTime.toISOString(),
      
      // Resource utilization
      resourceUtilization: {
        reactors: {
          'reactor-001': { utilization: 85, status: 'mixing', efficiency: 92 },
          'reactor-002': { utilization: 95, status: 'cooling', efficiency: 88 },
          'reactor-003': { utilization: 0, status: 'idle', efficiency: 0 }
        },
        stations: {
          'station-001': { utilization: 90, status: 'running', efficiency: 94 },
          'station-002': { utilization: 85, status: 'running', efficiency: 92 },
          'station-003': { utilization: 0, status: 'maintenance', efficiency: 0 },
          'station-004': { utilization: 75, status: 'running', efficiency: 89 },
          'station-005': { utilization: 0, status: 'idle', efficiency: 0 }
        },
        overall: {
          capacity: 100,
          utilization: 67,
          efficiency: 89.5
        }
      },

      // Trend data
      trends: {
        production: [
          { timestamp: new Date(Date.now() - 3600000), value: 11800 },
          { timestamp: new Date(Date.now() - 1800000), value: 12100 },
          { timestamp: currentTime, value: 12450 }
        ],
        efficiency: [
          { timestamp: new Date(Date.now() - 3600000), value: 85 },
          { timestamp: new Date(Date.now() - 1800000), value: 87 },
          { timestamp: currentTime, value: 89.5 }
        ],
        quality: [
          { timestamp: new Date(Date.now() - 3600000), value: 97.8 },
          { timestamp: new Date(Date.now() - 1800000), value: 98.0 },
          { timestamp: currentTime, value: 98.2 }
        ],
        downtime: [
          { timestamp: new Date(Date.now() - 3600000), value: 3.2 },
          { timestamp: new Date(Date.now() - 1800000), value: 2.8 },
          { timestamp: currentTime, value: 2.3 }
        ]
      },

      // Product breakdown
      productionByProduct: [
        {
          id: 'multiusos-1l',
          name: 'Multiusos 1L',
          produced: 5200,
          target: 5000,
          efficiency: 104.0
        },
        {
          id: 'sanitizante-1l',
          name: 'Sanitizante 1L',
          produced: 3100,
          target: 3200,
          efficiency: 96.9
        },
        {
          id: 'detergente-2kg',
          name: 'Detergente 2kg',
          produced: 2800,
          target: 2700,
          efficiency: 103.7
        },
        {
          id: 'jabon-500ml',
          name: 'Jabón 500ml',
          produced: 1200,
          target: 1300,
          efficiency: 92.3
        },
        {
          id: 'kit-alberca',
          name: 'Kit Alberca 3pzas',
          produced: 150,
          target: 200,
          efficiency: 75.0
        }
      ],

      // Alerts
      alerts: [
        {
          id: 'alert-001',
          type: 'warning',
          message: 'Estación 003 en mantenimiento programado',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-002',
          type: 'info',
          message: 'Stock bajo de etiquetas para Multiusos 1L',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-003',
          type: 'warning',
          message: 'Temperatura alta en Reactor B',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: true
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'METRICS_FETCH_ERROR',
        message: 'Error al obtener métricas de producción'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dateRange, filters } = body

    // Mock filtered metrics based on request
    const filteredMetrics = {
      message: 'Métricas filtradas generadas exitosamente',
      filters: filters || {},
      dateRange: dateRange || { start: new Date().toISOString(), end: new Date().toISOString() },
      generated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: filteredMetrics,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating filtered metrics:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'METRICS_FILTER_ERROR',
        message: 'Error al generar métricas filtradas'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
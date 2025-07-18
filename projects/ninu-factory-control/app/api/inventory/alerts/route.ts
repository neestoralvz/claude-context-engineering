import { NextRequest, NextResponse } from 'next/server'
import { mockSmartInventoryAlerts, mockAdvancedRawMaterials, mockAdvancedInventoryItems } from '@/lib/mock-data'
import { SmartInventoryAlert, AlertAction } from '@/types'

/**
 * Smart Inventory Alerts API
 * 
 * Advanced alert system with predictive analytics, automatic escalation,
 * and intelligent action recommendations for inventory optimization
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const alertType = searchParams.get('alert_type')
    const itemType = searchParams.get('item_type')
    const acknowledged = searchParams.get('acknowledged')
    const autoResolvable = searchParams.get('auto_resolvable')
    const includeRecommendations = searchParams.get('include_recommendations') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    let filteredAlerts = [...mockSmartInventoryAlerts]

    // Apply filters
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }

    if (alertType) {
      filteredAlerts = filteredAlerts.filter(alert => alert.alert_type === alertType)
    }

    if (itemType) {
      filteredAlerts = filteredAlerts.filter(alert => alert.item_type === itemType)
    }

    if (acknowledged !== null) {
      const isAcknowledged = acknowledged === 'true'
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === isAcknowledged)
    }

    if (autoResolvable !== null) {
      const canAutoResolve = autoResolvable === 'true'
      filteredAlerts = filteredAlerts.filter(alert => alert.autoResolutionAvailable === canAutoResolve)
    }

    // Sort by severity and creation date
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
    filteredAlerts.sort((a, b) => {
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      if (severityDiff !== 0) return severityDiff
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex)

    // Include detailed recommendations if requested
    let alertsWithDetails = paginatedAlerts
    
    if (includeRecommendations) {
      alertsWithDetails = paginatedAlerts.map(alert => {
        // Get item details
        let itemDetails = null
        if (alert.item_type === 'raw_material') {
          itemDetails = mockAdvancedRawMaterials.find(item => item.id === alert.item_id)
        } else if (alert.item_type === 'finished_product') {
          itemDetails = mockAdvancedInventoryItems.find(item => item.id === alert.item_id)
        }

        // Calculate enhanced recommendations
        const enhancedActions = alert.recommendedActions.map(action => ({
          ...action,
          feasibilityScore: calculateFeasibilityScore(action, itemDetails),
          impactScore: calculateImpactScore(action, alert),
          urgencyScore: calculateUrgencyScore(alert, itemDetails)
        }))

        return {
          ...alert,
          itemDetails: itemDetails ? {
            id: itemDetails.id,
            name: itemDetails.name,
            currentStock: alert.item_type === 'raw_material'
              ? (itemDetails as any).current_stock
              : (itemDetails as any).currentStock,
            minStock: alert.item_type === 'raw_material'
              ? (itemDetails as any).minimum_stock
              : (itemDetails as any).minStock
          } : null,
          enhancedActions: enhancedActions.sort((a, b) => 
            (b.feasibilityScore + b.impactScore + b.urgencyScore) - 
            (a.feasibilityScore + a.impactScore + a.urgencyScore)
          )
        }
      })
    }

    // Calculate summary statistics
    const alertsByType = filteredAlerts.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const alertsBySeverity = filteredAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const alertsByItem = filteredAlerts.reduce((acc, alert) => {
      acc[alert.item_type] = (acc[alert.item_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate business impact summary
    const totalFinancialImpact = filteredAlerts.reduce((sum, alert) => 
      sum + alert.businessImpact.financialImpact.totalImpact, 0
    )

    const totalAffectedOrders = filteredAlerts.reduce((sum, alert) => 
      sum + alert.businessImpact.customerImpact.affectedOrders, 0
    )

    // Generate system recommendations
    const systemRecommendations = generateSystemRecommendations(filteredAlerts)

    return NextResponse.json({
      success: true,
      data: {
        alerts: alertsWithDetails,
        pagination: {
          page,
          limit,
          total: filteredAlerts.length,
          totalPages: Math.ceil(filteredAlerts.length / limit),
          hasNext: endIndex < filteredAlerts.length,
          hasPrev: page > 1
        },
        summary: {
          totalAlerts: filteredAlerts.length,
          unacknowledged: filteredAlerts.filter(a => !a.acknowledged).length,
          criticalAlerts: filteredAlerts.filter(a => a.severity === 'critical').length,
          autoResolvable: filteredAlerts.filter(a => a.autoResolutionAvailable).length,
          alertsByType,
          alertsBySeverity,
          alertsByItem,
          avgRiskScore: filteredAlerts.length > 0 
            ? Math.round(filteredAlerts.reduce((sum, a) => sum + a.businessImpact.overallRiskScore, 0) / filteredAlerts.length)
            : 0
        },
        businessImpact: {
          totalFinancialImpact: Math.round(totalFinancialImpact * 100) / 100,
          totalAffectedOrders,
          highRiskItems: filteredAlerts
            .filter(a => a.businessImpact.overallRiskScore >= 75)
            .length,
          immediateActionRequired: filteredAlerts
            .filter(a => a.severity === 'critical' && !a.acknowledged)
            .length
        },
        systemRecommendations
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Smart Alerts API] Error fetching alerts:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'ALERTS_FETCH_ERROR',
        message: 'Error al obtener alertas inteligentes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, alertId, acknowledgment, resolution } = await request.json()

    if (action === 'acknowledge') {
      if (!alertId || !acknowledgment) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'MISSING_ACKNOWLEDGE_DATA',
            message: 'ID de alerta y datos de reconocimiento requeridos'
          },
          timestamp: new Date().toISOString()
        }, { status: 400 })
      }

      const alertIndex = mockSmartInventoryAlerts.findIndex(a => a.id === alertId)
      
      if (alertIndex === -1) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'ALERT_NOT_FOUND',
            message: 'Alerta no encontrada'
          },
          timestamp: new Date().toISOString()
        }, { status: 404 })
      }

      // Acknowledge alert
      mockSmartInventoryAlerts[alertIndex].acknowledged = true
      mockSmartInventoryAlerts[alertIndex].acknowledged_by = acknowledgment.acknowledged_by
      mockSmartInventoryAlerts[alertIndex].acknowledged_at = new Date().toISOString()

      return NextResponse.json({
        success: true,
        data: {
          alert: mockSmartInventoryAlerts[alertIndex],
          message: 'Alerta reconocida exitosamente'
        },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'execute_action') {
      if (!alertId || !resolution) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'MISSING_RESOLUTION_DATA',
            message: 'ID de alerta y datos de resolución requeridos'
          },
          timestamp: new Date().toISOString()
        }, { status: 400 })
      }

      const alertIndex = mockSmartInventoryAlerts.findIndex(a => a.id === alertId)
      
      if (alertIndex === -1) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'ALERT_NOT_FOUND',
            message: 'Alerta no encontrada'
          },
          timestamp: new Date().toISOString()
        }, { status: 404 })
      }

      const alert = mockSmartInventoryAlerts[alertIndex]
      const actionToExecute = alert.recommendedActions.find(a => a.id === resolution.action_id)

      if (!actionToExecute) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'ACTION_NOT_FOUND',
            message: 'Acción recomendada no encontrada'
          },
          timestamp: new Date().toISOString()
        }, { status: 404 })
      }

      // Simulate action execution
      const executionResult = await executeAlertAction(alert, actionToExecute, resolution)

      return NextResponse.json({
        success: true,
        data: {
          alert,
          action: actionToExecute,
          executionResult,
          message: 'Acción ejecutada exitosamente'
        },
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'auto_resolve') {
      const autoResolvableAlerts = mockSmartInventoryAlerts.filter(a => 
        a.autoResolutionAvailable && !a.acknowledged
      )

      const resolutionResults = []

      for (const alert of autoResolvableAlerts) {
        const autoAction = alert.recommendedActions.find(a => a.canAutoExecute)
        if (autoAction) {
          const result = await executeAlertAction(alert, autoAction, { 
            action_id: autoAction.id, 
            executed_by: 'system',
            notes: 'Auto-resolución del sistema'
          })
          resolutionResults.push({ alertId: alert.id, result })
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          resolvedAlerts: resolutionResults.length,
          results: resolutionResults,
          message: `${resolutionResults.length} alertas auto-resueltas`
        },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_ACTION',
        message: 'Acción no válida',
        details: 'Acciones válidas: acknowledge, execute_action, auto_resolve'
      },
      timestamp: new Date().toISOString()
    }, { status: 400 })

  } catch (error) {
    console.error('[Smart Alerts API] Error processing alert action:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'ALERT_ACTION_ERROR',
        message: 'Error al procesar acción de alerta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper Functions

function calculateFeasibilityScore(action: AlertAction, itemDetails: any): number {
  let score = 50 // Base score

  // Adjust based on action type
  switch (action.type) {
    case 'reorder':
      score += itemDetails ? 20 : -10
      break
    case 'substitute':
      score += 30 // Usually easier to implement
      break
    case 'transfer':
      score += 25
      break
    case 'expedite':
      score -= 10 // More complex
      break
    default:
      score += 10
  }

  // Adjust based on cost
  if (action.estimatedCost && action.estimatedCost > 10000) score -= 15
  if (action.estimatedCost && action.estimatedCost < 1000) score += 15

  // Adjust based on time
  if (action.estimatedTimeHours > 48) score -= 10
  if (action.estimatedTimeHours < 8) score += 10

  // Adjust based on auto-execution capability
  if (action.canAutoExecute) score += 20

  return Math.max(0, Math.min(100, score))
}

function calculateImpactScore(action: AlertAction, alert: SmartInventoryAlert): number {
  let score = 50 // Base score

  // Adjust based on risk reduction
  if (action.riskIfNotTaken === 'critical') score += 30
  if (action.riskIfNotTaken === 'high') score += 20
  if (action.riskIfNotTaken === 'medium') score += 10

  // Adjust based on alert severity
  if (alert.severity === 'critical') score += 25
  if (alert.severity === 'high') score += 15

  // Adjust based on business impact
  if (alert.businessImpact.overallRiskScore > 80) score += 20
  if (alert.businessImpact.financialImpact.totalImpact > 15000) score += 15

  return Math.max(0, Math.min(100, score))
}

function calculateUrgencyScore(alert: SmartInventoryAlert, itemDetails: any): number {
  let score = 50 // Base score

  // Adjust based on time to stock out
  if (alert.predictions.timeToStockOut < 24) score += 30
  if (alert.predictions.timeToStockOut < 72) score += 20
  if (alert.predictions.timeToStockOut < 168) score += 10

  // Adjust based on probability of stock out
  score += alert.predictions.probabilityOfStockOut * 30

  // Adjust based on demand spike
  if (alert.predictions.demandSpike) score += 15

  // Adjust based on seasonal factor
  if (alert.predictions.seasonalFactor > 1.2) score += 10

  return Math.max(0, Math.min(100, score))
}

async function executeAlertAction(alert: SmartInventoryAlert, action: AlertAction, resolution: any) {
  // Simulate action execution based on type
  const result = {
    success: true,
    executedAt: new Date().toISOString(),
    executedBy: resolution.executed_by || 'unknown',
    actionType: action.type,
    estimatedCompletion: new Date(Date.now() + action.estimatedTimeHours * 60 * 60 * 1000).toISOString(),
    notes: resolution.notes || '',
    nextSteps: [] as string[]
  }

  switch (action.type) {
    case 'reorder':
      result.nextSteps = [
        'Orden de compra generada',
        'Confirmación de proveedor pendiente',
        'Fecha estimada de entrega calculada'
      ]
      break
    case 'substitute':
      result.nextSteps = [
        'Producto alternativo identificado',
        'Notificación a ventas enviada',
        'Actualización de disponibilidad en sistema'
      ]
      break
    case 'expedite':
      result.nextSteps = [
        'Prioridad de producción aumentada',
        'Recursos adicionales asignados',
        'Supervisión continua activada'
      ]
      break
    case 'transfer':
      result.nextSteps = [
        'Transferencia iniciada',
        'Documentación generada',
        'Tracking activado'
      ]
      break
    default:
      result.nextSteps = ['Acción personalizada ejecutada']
  }

  // Mark alert as acknowledged if action is executed
  const alertIndex = mockSmartInventoryAlerts.findIndex(a => a.id === alert.id)
  if (alertIndex !== -1) {
    mockSmartInventoryAlerts[alertIndex].acknowledged = true
    mockSmartInventoryAlerts[alertIndex].acknowledged_by = resolution.executed_by
    mockSmartInventoryAlerts[alertIndex].acknowledged_at = new Date().toISOString()
  }

  return result
}

function generateSystemRecommendations(alerts: SmartInventoryAlert[]): any[] {
  const recommendations = []

  // Check for patterns in alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  if (criticalAlerts.length > 3) {
    recommendations.push({
      type: 'system_optimization',
      priority: 'high',
      title: 'Múltiples alertas críticas detectadas',
      description: 'Se recomienda revisar los umbrales de stock mínimo y procesos de reabastecimiento',
      actions: ['Auditar configuración de stock', 'Revisar lead times', 'Optimizar procesos de compra']
    })
  }

  // Check for recurring patterns
  const recurringAlerts = alerts.filter(a => a.patternAnalysis.patternType === 'recurring')
  if (recurringAlerts.length > 2) {
    recommendations.push({
      type: 'process_improvement',
      priority: 'medium',
      title: 'Patrones recurrentes identificados',
      description: 'Varios items muestran patrones repetitivos que pueden optimizarse',
      actions: ['Implementar reorden automático', 'Ajustar forecasting', 'Revisar seasonalidad']
    })
  }

  // Check for high financial impact
  const highImpactAlerts = alerts.filter(a => a.businessImpact.financialImpact.totalImpact > 10000)
  if (highImpactAlerts.length > 1) {
    recommendations.push({
      type: 'financial_optimization',
      priority: 'high',
      title: 'Alto impacto financiero detectado',
      description: 'Múltiples alertas con impacto financiero significativo requieren atención',
      actions: ['Priorizar resolución por impacto', 'Revisar presupuesto de inventario', 'Optimizar capital de trabajo']
    })
  }

  return recommendations
}
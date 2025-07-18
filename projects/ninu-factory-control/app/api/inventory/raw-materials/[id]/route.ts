import { NextRequest, NextResponse } from 'next/server'
import { mockAdvancedRawMaterials } from '@/lib/mock-data'

/**
 * Raw Material Detail API
 * 
 * Provides detailed information for a specific raw material
 * including full traceability, chemical properties, and usage history
 */

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const material = mockAdvancedRawMaterials.find(m => m.id === id)
    
    if (!material) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MATERIAL_NOT_FOUND',
          message: 'Materia prima no encontrada'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Calculate additional insights for the material
    const insights = {
      utilizationRate: material.current_stock > 0 ? 
        ((material.maximum_stock - material.current_stock) / material.maximum_stock * 100).toFixed(1) : 0,
      daysUntilMinimum: material.current_stock > material.minimum_stock ? 
        Math.floor((material.current_stock - material.minimum_stock) / 10) : 0, // Estimated consumption rate
      totalValue: (material.current_stock * material.unit_cost).toFixed(2),
      lastUsageDate: material.traceability.usageHistory.length > 0 ? 
        material.traceability.usageHistory[material.traceability.usageHistory.length - 1].usageDate : null,
      qualityScore: material.traceability.qualityTestResults.length > 0 ? 
        material.traceability.qualityTestResults.filter(test => test.status === 'pass').length / 
        material.traceability.qualityTestResults.length * 100 : null,
      storageCompliance: {
        temperatureOk: true, // Would be calculated from actual conditions
        humidityOk: true,
        lastCheck: material.traceability.currentLocation.environmentalConditions.lastChecked
      },
      certificationStatus: {
        total: material.qualityCertificates.length,
        valid: material.qualityCertificates.filter(cert => cert.status === 'valid').length,
        expiringSoon: material.qualityCertificates.filter(cert => {
          if (!cert.expirationDate) return false
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          return cert.expirationDate <= thirtyDaysFromNow
        }).length
      },
      compatibilityCount: material.compatibilityMatrix.length,
      safetyRating: calculateSafetyRating(material),
      environmentalScore: material.environmentalImpact?.sustainabilityScore || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        material,
        insights,
        relatedMaterials: mockAdvancedRawMaterials
          .filter(m => m.id !== id && m.category === material.category)
          .slice(0, 3)
          .map(m => ({
            id: m.id,
            name: m.name,
            category: m.category,
            current_stock: m.current_stock,
            unit_of_measure: m.unit_of_measure,
            compatibility: material.compatibilityMatrix.find(comp => comp.materialId === m.id)?.compatibilityLevel || 'unknown'
          }))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Raw Material Detail API] Error fetching material:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'MATERIAL_DETAIL_FETCH_ERROR',
        message: 'Error al obtener detalles de materia prima',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const updateData = await request.json()

    const materialIndex = mockAdvancedRawMaterials.findIndex(m => m.id === id)
    
    if (materialIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MATERIAL_NOT_FOUND',
          message: 'Materia prima no encontrada'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Handle specific update operations
    const currentMaterial = mockAdvancedRawMaterials[materialIndex]
    
    // Stock adjustment with traceability
    if (updateData.stockAdjustment) {
      const { quantity, reason, reference, operator } = updateData.stockAdjustment
      
      if (typeof quantity !== 'number') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_STOCK_ADJUSTMENT',
            message: 'Cantidad de ajuste debe ser un número'
          },
          timestamp: new Date().toISOString()
        }, { status: 400 })
      }

      const newStock = currentMaterial.current_stock + quantity
      
      if (newStock < 0) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: 'Stock insuficiente para el ajuste solicitado',
            details: `Stock actual: ${currentMaterial.current_stock}, Ajuste: ${quantity}`
          },
          timestamp: new Date().toISOString()
        }, { status: 400 })
      }

      // Update stock and add usage/receipt record
      currentMaterial.current_stock = newStock
      currentMaterial.updated_at = new Date().toISOString()
      
      // Add traceability record
      currentMaterial.traceability.usageHistory.push({
        usageDate: new Date(),
        batchId: currentMaterial.traceability.batchId,
        quantityUsed: Math.abs(quantity),
        purpose: reason || (quantity > 0 ? 'Ajuste de inventario - Recepción' : 'Ajuste de inventario - Consumo'),
        operatorId: operator || 'system',
        qualityCheckRequired: quantity > 0, // Require quality check for receipts
        qualityStatus: 'pending'
      })
    }

    // Location update
    if (updateData.locationUpdate) {
      const { zone, aisle, shelf, position, movedBy } = updateData.locationUpdate
      
      currentMaterial.traceability.currentLocation = {
        ...currentMaterial.traceability.currentLocation,
        zone: zone || currentMaterial.traceability.currentLocation.zone,
        aisle: aisle || currentMaterial.traceability.currentLocation.aisle,
        shelf: shelf || currentMaterial.traceability.currentLocation.shelf,
        position: position || currentMaterial.traceability.currentLocation.position,
        lastMoved: new Date(),
        movedBy: movedBy || 'system'
      }
      
      currentMaterial.updated_at = new Date().toISOString()
    }

    // Quality test result
    if (updateData.qualityTest) {
      const { parameter, measuredValue, unit, specification, status, method, instrument, inspector } = updateData.qualityTest
      
      currentMaterial.traceability.qualityTestResults.push({
        parameter,
        measuredValue,
        unit,
        specification,
        status,
        method,
        instrument
      })
      
      currentMaterial.updated_at = new Date().toISOString()
    }

    // General field updates
    if (updateData.fields) {
      Object.assign(currentMaterial, updateData.fields)
      currentMaterial.updated_at = new Date().toISOString()
    }

    mockAdvancedRawMaterials[materialIndex] = currentMaterial

    return NextResponse.json({
      success: true,
      data: {
        material: currentMaterial,
        message: 'Materia prima actualizada exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Raw Material Detail API] Error updating material:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'MATERIAL_UPDATE_ERROR',
        message: 'Error al actualizar materia prima',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper function to calculate safety rating
function calculateSafetyRating(material: any): number {
  let score = 100

  // Reduce score based on hazard level
  if (material.safetyClassification.nfpaRating.health > 2) score -= 20
  if (material.safetyClassification.nfpaRating.flammability > 2) score -= 20
  if (material.safetyClassification.nfpaRating.instability > 2) score -= 20
  
  // Reduce score for missing safety data
  if (!material.chemicalProperties.safetyDataSheet.documentUrl) score -= 10
  if (material.safetyClassification.ppeRequired.length === 0) score -= 10
  if (material.safetyClassification.emergencyProcedures.length === 0) score -= 10

  // Increase score for good environmental properties
  if (material.chemicalProperties.environmentalProperties.biodegradability === 'readily') score += 5
  if (!material.chemicalProperties.environmentalProperties.bioaccumulation) score += 5

  return Math.max(0, Math.min(100, score))
}
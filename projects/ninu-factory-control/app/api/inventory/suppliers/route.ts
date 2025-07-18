import { NextRequest, NextResponse } from 'next/server'
import { mockSuppliers, mockAdvancedRawMaterials } from '@/lib/mock-data'
import { SupplierData } from '@/types'

/**
 * Supplier Management API
 * 
 * Comprehensive supplier performance tracking, quality metrics,
 * delivery analytics, and certification management for procurement optimization
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferredOnly = searchParams.get('preferred_only') === 'true'
    const financialRating = searchParams.get('financial_rating')
    const minQualityScore = parseInt(searchParams.get('min_quality_score') || '0')
    const certificationRequired = searchParams.get('certification_required')
    const includeMetrics = searchParams.get('include_metrics') === 'true'
    const includeProducts = searchParams.get('include_products') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredSuppliers = [...mockSuppliers]

    // Apply filters
    if (preferredOnly) {
      filteredSuppliers = filteredSuppliers.filter(supplier => supplier.preferredSupplier)
    }

    if (financialRating) {
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.financialRating === financialRating
      )
    }

    if (minQualityScore > 0) {
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.qualityMetrics.qualityScore >= minQualityScore
      )
    }

    if (certificationRequired) {
      filteredSuppliers = filteredSuppliers.filter(supplier => 
        supplier.certifications.some(cert => 
          cert.type.toLowerCase().includes(certificationRequired.toLowerCase()) && 
          cert.status === 'valid'
        )
      )
    }

    // Sort by quality score and preferred status
    filteredSuppliers.sort((a, b) => {
      if (a.preferredSupplier !== b.preferredSupplier) {
        return a.preferredSupplier ? -1 : 1
      }
      return b.qualityMetrics.qualityScore - a.qualityMetrics.qualityScore
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex)

    // Enhanced supplier data with additional metrics
    const enhancedSuppliers = paginatedSuppliers.map(supplier => {
      // Get materials supplied by this supplier
      const suppliedMaterials = mockAdvancedRawMaterials.filter(material => 
        material.supplier_id === supplier.id
      )

      // Calculate additional metrics
      const totalMaterialsValue = suppliedMaterials.reduce((sum, material) => 
        sum + (material.current_stock * material.unit_cost), 0
      )

      const activeMaterials = suppliedMaterials.filter(material => 
        material.status === 'active'
      ).length

      const lowStockMaterials = suppliedMaterials.filter(material => 
        material.current_stock <= material.minimum_stock
      ).length

      // Calculate performance score
      const performanceScore = calculateSupplierPerformanceScore(supplier)

      // Calculate upcoming certificate expirations
      const upcomingExpirations = supplier.certifications.filter(cert => {
        if (!cert.expirationDate) return false
        const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        return cert.expirationDate <= sixtyDaysFromNow && cert.status === 'valid'
      })

      const enhancedSupplier = {
        ...supplier,
        suppliedMaterials: includeProducts ? suppliedMaterials.map(material => ({
          id: material.id,
          name: material.name,
          category: material.category,
          current_stock: material.current_stock,
          minimum_stock: material.minimum_stock,
          unit_cost: material.unit_cost,
          unit_of_measure: material.unit_of_measure,
          status: material.status,
          last_purchase_date: material.last_purchase_date
        })) : undefined,
        analytics: includeMetrics ? {
          totalMaterialsValue: Math.round(totalMaterialsValue * 100) / 100,
          activeMaterials,
          lowStockMaterials,
          performanceScore,
          upcomingExpirations: upcomingExpirations.length,
          nextExpirationDate: upcomingExpirations.length > 0 ? 
            upcomingExpirations.sort((a, b) => 
              a.expirationDate!.getTime() - b.expirationDate!.getTime()
            )[0].expirationDate : null,
          lastDeliveryPerformance: generateRecentDeliveryMetrics(supplier),
          trendAnalysis: {
            qualityTrend: supplier.qualityMetrics.qualityTrend,
            deliveryTrend: calculateDeliveryTrend(supplier),
            costTrend: calculateCostTrend(supplier, suppliedMaterials)
          }
        } : undefined
      }

      return enhancedSupplier
    })

    // Calculate summary statistics
    const avgQualityScore = filteredSuppliers.length > 0 
      ? Math.round(filteredSuppliers.reduce((sum, s) => sum + s.qualityMetrics.qualityScore, 0) / filteredSuppliers.length)
      : 0

    const avgDeliveryPerformance = filteredSuppliers.length > 0
      ? Math.round(filteredSuppliers.reduce((sum, s) => sum + s.deliveryMetrics.onTimeDeliveryRate, 0) / filteredSuppliers.length * 10) / 10
      : 0

    const suppliersByRating = filteredSuppliers.reduce((acc, supplier) => {
      acc[supplier.financialRating] = (acc[supplier.financialRating] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalSuppliersValue = enhancedSuppliers.reduce((sum, supplier) => 
      sum + (supplier.analytics?.totalMaterialsValue || 0), 0
    )

    // Risk assessment summary
    const highRiskSuppliers = filteredSuppliers.filter(s => s.riskScore > 60).length
    const upcomingCertExpirations = filteredSuppliers.reduce((sum, supplier) => 
      sum + supplier.certifications.filter(cert => {
        if (!cert.expirationDate) return false
        const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        return cert.expirationDate <= sixtyDaysFromNow && cert.status === 'valid'
      }).length, 0
    )

    return NextResponse.json({
      success: true,
      data: {
        suppliers: enhancedSuppliers,
        pagination: {
          page,
          limit,
          total: filteredSuppliers.length,
          totalPages: Math.ceil(filteredSuppliers.length / limit),
          hasNext: endIndex < filteredSuppliers.length,
          hasPrev: page > 1
        },
        summary: {
          totalSuppliers: filteredSuppliers.length,
          preferredSuppliers: filteredSuppliers.filter(s => s.preferredSupplier).length,
          avgQualityScore,
          avgDeliveryPerformance,
          suppliersByRating,
          totalSuppliersValue: Math.round(totalSuppliersValue * 100) / 100,
          uniqueCountries: [...new Set(filteredSuppliers.map(s => s.contactInfo.address.country))].length,
          totalCertifications: filteredSuppliers.reduce((sum, s) => sum + s.certifications.length, 0)
        },
        riskAssessment: {
          highRiskSuppliers,
          upcomingCertExpirations,
          lowPerformanceSuppliers: filteredSuppliers.filter(s => 
            s.qualityMetrics.qualityScore < 85 || s.deliveryMetrics.onTimeDeliveryRate < 90
          ).length,
          singleSourceItems: calculateSingleSourceRisk()
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Suppliers API] Error fetching suppliers:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SUPPLIERS_FETCH_ERROR',
        message: 'Error al obtener proveedores',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supplierData: Partial<SupplierData> = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'contactInfo']
    const missingFields = requiredFields.filter(field => !supplierData[field as keyof typeof supplierData])
    
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

    // Validate contact info structure
    if (!supplierData.contactInfo?.primaryContact || !supplierData.contactInfo?.email) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CONTACT_INFO',
          message: 'Información de contacto incompleta',
          details: 'Se requiere contacto principal y email'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Generate new supplier ID
    const supplierId = `supplier-${String(mockSuppliers.length + 1).padStart(3, '0')}`

    // Create new supplier with default values
    const newSupplier: SupplierData = {
      id: supplierId,
      name: supplierData.name!,
      contactInfo: {
        primaryContact: supplierData.contactInfo!.primaryContact!,
        phone: supplierData.contactInfo!.phone || '',
        email: supplierData.contactInfo!.email!,
        emergencyContact: supplierData.contactInfo!.emergencyContact,
        emergencyPhone: supplierData.contactInfo!.emergencyPhone,
        address: {
          street: supplierData.contactInfo!.address?.street || '',
          city: supplierData.contactInfo!.address?.city || '',
          state: supplierData.contactInfo!.address?.state || '',
          postalCode: supplierData.contactInfo!.address?.postalCode || '',
          country: supplierData.contactInfo!.address?.country || 'México'
        }
      },
      qualityMetrics: supplierData.qualityMetrics || {
        defectRate: 0,
        onTimeDelivery: 100,
        qualityScore: 95,
        certificationCompliance: 100,
        correctiveActions: 0,
        qualityTrend: 'stable'
      },
      deliveryMetrics: supplierData.deliveryMetrics || {
        averageLeadTime: 7,
        onTimeDeliveryRate: 100,
        earlyDeliveryRate: 0,
        lateDeliveryRate: 0,
        deliveryAccuracy: 100,
        transportationCost: 0
      },
      certifications: supplierData.certifications || [],
      riskScore: supplierData.riskScore || 25, // Low risk by default
      financialRating: supplierData.financialRating || 'B',
      preferredSupplier: supplierData.preferredSupplier || false,
      backupSuppliers: supplierData.backupSuppliers || []
    }

    // Add to suppliers list
    mockSuppliers.push(newSupplier)

    return NextResponse.json({
      success: true,
      data: {
        supplier: newSupplier,
        message: 'Proveedor creado exitosamente'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('[Suppliers API] Error creating supplier:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SUPPLIER_CREATE_ERROR',
        message: 'Error al crear proveedor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('id')
    
    if (!supplierId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_SUPPLIER_ID',
          message: 'ID de proveedor requerido'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const updateData: Partial<SupplierData> = await request.json()
    
    const supplierIndex = mockSuppliers.findIndex(s => s.id === supplierId)
    
    if (supplierIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Proveedor no encontrado'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Update supplier with merge of existing and new data
    const updatedSupplier = {
      ...mockSuppliers[supplierIndex],
      ...updateData,
      // Preserve ID
      id: supplierId
    }

    mockSuppliers[supplierIndex] = updatedSupplier

    return NextResponse.json({
      success: true,
      data: {
        supplier: updatedSupplier,
        message: 'Proveedor actualizado exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Suppliers API] Error updating supplier:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SUPPLIER_UPDATE_ERROR',
        message: 'Error al actualizar proveedor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper Functions

function calculateSupplierPerformanceScore(supplier: SupplierData): number {
  const weights = {
    quality: 0.3,
    delivery: 0.25,
    cost: 0.2,
    compliance: 0.15,
    risk: 0.1
  }

  const qualityScore = supplier.qualityMetrics.qualityScore
  const deliveryScore = supplier.deliveryMetrics.onTimeDeliveryRate
  const costScore = 100 - (supplier.deliveryMetrics.transportationCost * 10) // Normalize cost
  const complianceScore = supplier.qualityMetrics.certificationCompliance
  const riskScore = 100 - supplier.riskScore // Invert risk (lower risk = higher score)

  const totalScore = 
    qualityScore * weights.quality +
    deliveryScore * weights.delivery +
    Math.max(0, Math.min(100, costScore)) * weights.cost +
    complianceScore * weights.compliance +
    Math.max(0, Math.min(100, riskScore)) * weights.risk

  return Math.round(totalScore * 10) / 10
}

function generateRecentDeliveryMetrics(supplier: SupplierData) {
  // Generate mock recent delivery data
  const deliveries = []
  for (let i = 0; i < 5; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const onTime = Math.random() < (supplier.deliveryMetrics.onTimeDeliveryRate / 100)
    deliveries.push({
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      onTime,
      leadTime: supplier.deliveryMetrics.averageLeadTime + Math.floor(Math.random() * 4) - 2,
      accuracy: Math.random() < (supplier.deliveryMetrics.deliveryAccuracy / 100)
    })
  }
  return deliveries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function calculateDeliveryTrend(supplier: SupplierData): 'improving' | 'stable' | 'declining' {
  // Simple mock calculation based on current metrics
  if (supplier.deliveryMetrics.onTimeDeliveryRate > 95) return 'stable'
  if (supplier.deliveryMetrics.onTimeDeliveryRate > 85) return Math.random() > 0.5 ? 'improving' : 'stable'
  return 'declining'
}

function calculateCostTrend(supplier: SupplierData, materials: any[]): 'increasing' | 'stable' | 'decreasing' {
  // Mock calculation based on transportation cost and number of materials
  const costFactor = supplier.deliveryMetrics.transportationCost + (materials.length * 0.1)
  if (costFactor > 3) return 'increasing'
  if (costFactor < 2) return 'decreasing'
  return 'stable'
}

function calculateSingleSourceRisk(): number {
  // Calculate materials that have only one supplier
  const materialsBySupplier = mockAdvancedRawMaterials.reduce((acc, material) => {
    const key = `${material.category}-${material.name}`
    if (!acc[key]) acc[key] = new Set()
    acc[key].add(material.supplier_id)
    return acc
  }, {} as Record<string, Set<string>>)

  const singleSourceMaterials = Object.values(materialsBySupplier).filter(suppliers => suppliers.size === 1)
  return singleSourceMaterials.length
}
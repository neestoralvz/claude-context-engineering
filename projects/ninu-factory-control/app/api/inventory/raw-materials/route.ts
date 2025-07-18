import { NextRequest, NextResponse } from 'next/server'
import { mockAdvancedRawMaterials } from '@/lib/mock-data'
import { AdvancedRawMaterial } from '@/types'

/**
 * Advanced Raw Materials API
 * 
 * Provides comprehensive CRUD operations for raw materials management
 * including chemical properties, traceability, and safety classification
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supplier = searchParams.get('supplier')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const lowStock = searchParams.get('lowStock')
    const expiring = searchParams.get('expiring')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let filteredMaterials = [...mockAdvancedRawMaterials]

    // Apply filters
    if (supplier) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.supplier_id === supplier || 
        material.supplier_name.toLowerCase().includes(supplier.toLowerCase())
      )
    }

    if (category) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (status) {
      filteredMaterials = filteredMaterials.filter(material => 
        material.status === status
      )
    }

    if (lowStock === 'true') {
      filteredMaterials = filteredMaterials.filter(material => 
        material.current_stock <= material.minimum_stock
      )
    }

    if (expiring === 'true') {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      filteredMaterials = filteredMaterials.filter(material => {
        if (!material.expiration_tracking) return false
        // Calculate expiration based on shelf life from last purchase
        const lastPurchase = new Date(material.last_purchase_date || material.created_at)
        const expirationDate = new Date(lastPurchase.getTime() + (material.chemicalProperties.stability.shelfLife * 30 * 24 * 60 * 60 * 1000))
        return expirationDate <= thirtyDaysFromNow
      })
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex)

    // Calculate summary statistics
    const totalValue = filteredMaterials.reduce((sum, material) => 
      sum + (material.current_stock * material.unit_cost), 0
    )
    
    const lowStockCount = filteredMaterials.filter(material => 
      material.current_stock <= material.minimum_stock
    ).length

    const expiringCount = filteredMaterials.filter(material => {
      if (!material.expiration_tracking) return false
      const lastPurchase = new Date(material.last_purchase_date || material.created_at)
      const expirationDate = new Date(lastPurchase.getTime() + (material.chemicalProperties.stability.shelfLife * 30 * 24 * 60 * 60 * 1000))
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      return expirationDate <= thirtyDaysFromNow
    }).length

    return NextResponse.json({
      success: true,
      data: {
        materials: paginatedMaterials,
        pagination: {
          page,
          limit,
          total: filteredMaterials.length,
          totalPages: Math.ceil(filteredMaterials.length / limit),
          hasNext: endIndex < filteredMaterials.length,
          hasPrev: page > 1
        },
        summary: {
          totalMaterials: filteredMaterials.length,
          totalValue: Math.round(totalValue * 100) / 100,
          lowStockCount,
          expiringCount,
          categoriesCount: [...new Set(filteredMaterials.map(m => m.category))].length,
          suppliersCount: [...new Set(filteredMaterials.map(m => m.supplier_id))].length
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Raw Materials API] Error fetching materials:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'RAW_MATERIALS_FETCH_ERROR',
        message: 'Error al obtener materias primas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const materialData: Partial<AdvancedRawMaterial> = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'category', 'supplier_id', 'unit_of_measure', 'unit_cost']
    const missingFields = requiredFields.filter(field => !materialData[field as keyof typeof materialData])
    
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

    // Generate new material with default values
    const newMaterial: AdvancedRawMaterial = {
      id: `raw-${String(mockAdvancedRawMaterials.length + 1).padStart(3, '0')}`,
      code: `${materialData.category?.substring(0, 4).toUpperCase()}-${String(mockAdvancedRawMaterials.length + 1).padStart(3, '0')}`,
      name: materialData.name!,
      description: materialData.description || '',
      category: materialData.category!,
      supplier: materialData.supplier_id!,
      supplier_id: materialData.supplier_id!,
      supplier_name: materialData.supplier_name || 'Proveedor Sin Nombre',
      unit_of_measure: materialData.unit_of_measure!,
      unit_cost: materialData.unit_cost!,
      current_stock: materialData.current_stock || 0,
      minimum_stock: materialData.minimum_stock || 0,
      maximum_stock: materialData.maximum_stock || 1000,
      quality_grade: materialData.quality_grade || 'Standard',
      expiration_tracking: materialData.expiration_tracking || false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Default traceability data
      traceability: {
        batchId: `${materialData.category?.substring(0, 4).toUpperCase()}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-001`,
        lotNumber: `LOT-${Date.now()}`,
        manufacturingDate: new Date(),
        receiptDate: new Date(),
        supplier: {
          id: materialData.supplier_id!,
          name: materialData.supplier_name || 'Proveedor Sin Nombre',
          contactInfo: {
            primaryContact: '',
            phone: '',
            email: '',
            address: {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'México'
            }
          },
          qualityMetrics: {
            defectRate: 0,
            onTimeDelivery: 100,
            qualityScore: 95,
            certificationCompliance: 100,
            correctiveActions: 0,
            qualityTrend: 'stable'
          },
          deliveryMetrics: {
            averageLeadTime: 7,
            onTimeDeliveryRate: 100,
            earlyDeliveryRate: 0,
            lateDeliveryRate: 0,
            deliveryAccuracy: 100,
            transportationCost: 0
          },
          certifications: [],
          riskScore: 50,
          financialRating: 'B',
          preferredSupplier: false
        },
        currentLocation: {
          zone: 'A',
          aisle: '01',
          shelf: '1A',
          position: '01',
          lastMoved: new Date(),
          movedBy: 'system',
          environmentalConditions: {
            temperature: 20,
            humidity: 50,
            lastChecked: new Date()
          }
        },
        chainOfCustody: [],
        qualityTestResults: [],
        usageHistory: []
      },

      // Default chemical properties
      chemicalProperties: {
        composition: [],
        physicalProperties: {
          appearance: 'No especificado',
          odor: 'No especificado',
          density: 1.0,
          solubility: 'No especificado'
        },
        stability: {
          thermalStability: 'Estable bajo condiciones normales',
          lightStability: 'Estable',
          airStability: 'Estable',
          incompatibilities: [],
          degradationProducts: [],
          shelfLife: 24
        },
        reactivity: {
          reactivityLevel: 'low',
          incompatibleMaterials: [],
          hazardousReactions: [],
          polymerization: false,
          oxidizingAgent: false,
          reducingAgent: false
        },
        hazardClassification: {
          ghsCategory: ['No clasificado como peligroso'],
          hazardStatements: [],
          precautionaryStatements: ['P102: Mantener fuera del alcance de los niños'],
          signalWord: 'none',
          pictograms: []
        },
        safetyDataSheet: {
          sdsNumber: `SDS-${materialData.category?.substring(0, 4).toUpperCase()}-001-MX`,
          version: '1.0',
          issueDate: new Date(),
          language: 'Español (México)',
          supplier: materialData.supplier_name || 'Proveedor Sin Nombre',
          emergencyPhone: '',
          documentUrl: '',
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        environmentalProperties: {
          biodegradability: 'readily',
          bioaccumulation: false,
          aquaticToxicity: 'none',
          soilImpact: 'none',
          airEmissions: false,
          wasteClassification: 'No peligroso'
        }
      },

      // Default storage requirements
      storageRequirements: {
        temperature: {
          min: 15,
          max: 30,
          unit: 'celsius',
          critical: false
        },
        humidity: {
          min: 30,
          max: 70,
          unit: 'percentage',
          critical: false
        },
        lightExposure: 'ambient',
        ventilation: 'standard',
        containerRequirements: [],
        segregationRequirements: [],
        securityLevel: 'standard'
      },

      // Default safety classification
      safetyClassification: {
        ghsClassification: {
          physicalHazards: [],
          healthHazards: [],
          environmentalHazards: [],
          category: 'No clasificado',
          signalWord: 'warning'
        },
        nfpaRating: {
          health: 0,
          flammability: 0,
          instability: 0,
          specificHazards: []
        },
        ppeRequired: [],
        emergencyProcedures: [],
        firstAidMeasures: [],
        disposalRequirements: {
          method: 'Disposición municipal',
          approvedFacilities: [],
          regulations: [],
          cost: 0
        }
      },

      qualityCertificates: [],
      compatibilityMatrix: []
    }

    // Add to mock data (in real implementation, save to database)
    mockAdvancedRawMaterials.push(newMaterial)

    return NextResponse.json({
      success: true,
      data: {
        material: newMaterial,
        message: 'Materia prima creada exitosamente'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('[Raw Materials API] Error creating material:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'RAW_MATERIAL_CREATE_ERROR',
        message: 'Error al crear materia prima',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('id')
    
    if (!materialId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_MATERIAL_ID',
          message: 'ID de materia prima requerido'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const updateData: Partial<AdvancedRawMaterial> = await request.json()
    
    const materialIndex = mockAdvancedRawMaterials.findIndex(m => m.id === materialId)
    
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

    // Update material with merge of existing and new data
    const updatedMaterial = {
      ...mockAdvancedRawMaterials[materialIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }

    mockAdvancedRawMaterials[materialIndex] = updatedMaterial

    return NextResponse.json({
      success: true,
      data: {
        material: updatedMaterial,
        message: 'Materia prima actualizada exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Raw Materials API] Error updating material:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'RAW_MATERIAL_UPDATE_ERROR',
        message: 'Error al actualizar materia prima',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('id')
    
    if (!materialId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_MATERIAL_ID',
          message: 'ID de materia prima requerido'
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const materialIndex = mockAdvancedRawMaterials.findIndex(m => m.id === materialId)
    
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

    // Check if material has current stock (safety check)
    const material = mockAdvancedRawMaterials[materialIndex]
    if (material.current_stock > 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MATERIAL_HAS_STOCK',
          message: 'No se puede eliminar una materia prima con stock existente',
          details: `Stock actual: ${material.current_stock} ${material.unit_of_measure}`
        },
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    // Remove material
    const deletedMaterial = mockAdvancedRawMaterials.splice(materialIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: {
        material: deletedMaterial,
        message: 'Materia prima eliminada exitosamente'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Raw Materials API] Error deleting material:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'RAW_MATERIAL_DELETE_ERROR',
        message: 'Error al eliminar materia prima',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
/**
 * Inventory Data Module - Inventory Management
 * 
 * Contains inventory data including raw materials, advanced inventory items, and inventory movements.
 * This module provides comprehensive inventory tracking for the Ninu Factory Control system.
 * 
 * @fileoverview Inventory management and tracking data
 * @module InventoryData
 */

import { AdvancedRawMaterial, AdvancedInventoryItem, InventoryMovement } from '../types'
import { mockSuppliers } from './supplier-data'
import { primaryProducts } from './product-data-primary'
import { secondaryProducts } from './product-data-secondary'
import { ninuContactInfo } from './system-data'

// Note: This is a condensed version for Principle #58 compliance (≤500 lines)
// The full inventory data includes comprehensive raw materials with detailed traceability

// Advanced Raw Materials for Ninu.mx formulations
export const mockAdvancedRawMaterials: AdvancedRawMaterial[] = [
  {
    id: 'raw-001',
    code: 'TENS-001',
    name: 'Tensioactivo Aniónico Linear',
    description: 'Tensioactivo biodegradable de alta performance para formulaciones de limpieza',
    category: 'Tensioactivos',
    supplier: 'supplier-001',
    supplier_id: 'supplier-001',
    supplier_name: 'Química Industrial del Golfo S.A. de C.V.',
    unit_of_measure: 'kg',
    unit_cost: 45.50,
    current_stock: 2850,
    minimum_stock: 500,
    maximum_stock: 5000,
    quality_grade: 'Premium A',
    expiration_tracking: true,
    last_purchase_date: '2024-07-10',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-07-10T00:00:00Z',
    traceability: {
      batchId: 'TENS-001-240710-001',
      lotNumber: 'QIG-24070810-TENS',
      manufacturingDate: new Date('2024-07-08'),
      receiptDate: new Date('2024-07-10'),
      supplier: mockSuppliers[0],
      certificateOfAnalysis: {
        certificateNumber: 'COA-TENS-001-240710',
        issueDate: new Date('2024-07-08'),
        validUntil: new Date('2025-07-08'),
        testingLaboratory: 'Laboratorio Químico del Golfo',
        testResults: [
          {
            parameter: 'Contenido activo',
            measuredValue: 28.5,
            unit: '%',
            specification: { min: 28.0, max: 30.0, target: 29.0 },
            status: 'pass',
            method: 'ASTM D1681',
            instrument: 'Titulador automático T-950'
          },
          {
            parameter: 'pH (solución 10%)',
            measuredValue: 7.2,
            unit: 'pH',
            specification: { min: 6.5, max: 8.0, target: 7.0 },
            status: 'pass',
            method: 'ASTM D1293',
            instrument: 'pHmetro Hanna HI-2020'
          }
        ]
      }
    }
  },
  {
    id: 'raw-002',
    code: 'ALCO-001',
    name: 'Alcohol Etílico 96%',
    description: 'Alcohol etílico grado farmacéutico para desinfectantes y sanitizantes',
    category: 'Alcoholes',
    supplier: 'supplier-002',
    supplier_id: 'supplier-002',
    supplier_name: 'Productos Químicos Especializados de México S.A.',
    unit_of_measure: 'l',
    unit_cost: 18.50,
    current_stock: 8500,
    minimum_stock: 1000,
    maximum_stock: 12000,
    quality_grade: 'Farmacéutico',
    expiration_tracking: true,
    last_purchase_date: '2024-07-05',
    status: 'active',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-07-05T00:00:00Z',
    traceability: {
      batchId: 'ALCO-001-240705-001',
      lotNumber: 'PQEM-24070501-ALC',
      manufacturingDate: new Date('2024-07-03'),
      receiptDate: new Date('2024-07-05'),
      supplier: mockSuppliers[1],
      certificateOfAnalysis: {
        certificateNumber: 'COA-ALCO-001-240705',
        issueDate: new Date('2024-07-03'),
        validUntil: new Date('2025-07-03'),
        testingLaboratory: 'Laboratorio PQEM',
        testResults: [
          {
            parameter: 'Contenido etanol',
            measuredValue: 96.2,
            unit: '%',
            specification: { min: 95.5, max: 97.0, target: 96.0 },
            status: 'pass',
            method: 'GC-MS',
            instrument: 'Cromatógrafo Agilent 7890'
          }
        ]
      }
    }
  },
  {
    id: 'raw-003',
    code: 'HCLO-001',
    name: 'Hipoclorito de Sodio 12%',
    description: 'Hipoclorito de sodio grado industrial para blanqueadores y desinfectantes',
    category: 'Oxidantes',
    supplier: 'supplier-003',
    supplier_id: 'supplier-003',
    supplier_name: 'Innovación Química del Bajío S. de R.L. de C.V.',
    unit_of_measure: 'kg',
    unit_cost: 12.80,
    current_stock: 3200,
    minimum_stock: 400,
    maximum_stock: 5000,
    quality_grade: 'Industrial',
    expiration_tracking: true,
    last_purchase_date: '2024-07-12',
    status: 'active',
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-07-12T00:00:00Z',
    traceability: {
      batchId: 'HCLO-001-240712-001',
      lotNumber: 'IQB-24071201-HCL',
      manufacturingDate: new Date('2024-07-10'),
      receiptDate: new Date('2024-07-12'),
      supplier: mockSuppliers[2],
      certificateOfAnalysis: {
        certificateNumber: 'COA-HCLO-001-240712',
        issueDate: new Date('2024-07-10'),
        validUntil: new Date('2025-01-10'),
        testingLaboratory: 'Laboratorio IQB',
        testResults: [
          {
            parameter: 'Cloro activo',
            measuredValue: 12.1,
            unit: '%',
            specification: { min: 11.5, max: 13.0, target: 12.0 },
            status: 'pass',
            method: 'Titulación yodométrica',
            instrument: 'Titulador automático'
          }
        ]
      }
    }
  }
]

// Advanced Inventory Items (Finished Products with Extended Properties)
export const mockAdvancedInventoryItems: AdvancedInventoryItem[] = [
  ...primaryProducts.slice(0, 5).map((product, index) => ({
    // Base properties from existing InventoryItem
    id: product.id,
    name: product.name,
    type: 'finished_product' as const,
    currentStock: product.currentStock,
    minStock: product.minStock,
    maxStock: product.currentStock * 2,
    unit: product.unit,
    cost: product.productionCost,
    supplier: 'Ninu Factory Control',
    lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 3600000),
    expirationDate: product.shelfLife ? new Date(Date.now() + product.shelfLife * 30 * 24 * 3600000) : undefined,
    
    // Advanced properties
    barcode: `7501${String(index + 1).padStart(8, '0')}`,
    sku: `NINU-${product.id.toUpperCase()}`,
    storageLocation: `Zone-${String.fromCharCode(65 + Math.floor(index / 3))}-${String(index % 3 + 1).padStart(2, '0')}`,
    
    storageRequirements: {
      temperature: {
        min: 15,
        max: 30,
        unit: 'celsius' as const,
        critical: false
      },
      humidity: {
        min: 30,
        max: 70,
        unit: 'percentage' as const,
        critical: false
      },
      lightExposure: 'protected' as const,
      ventilation: 'standard' as const,
      containerRequirements: [
        {
          materialType: product.packaging === 'bottle' ? 'HDPE' : 'Polipropileno',
          sealType: 'Rosca hermética',
          venting: false,
          labelingRequirements: ['Etiqueta comercial', 'Fecha de caducidad', 'Lote de producción']
        }
      ],
      segregationRequirements: [],
      securityLevel: 'standard' as const
    },
    
    traceability: {
      batchId: `PROD-${product.id}-${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      lotNumber: `NINU-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
      manufacturingDate: new Date(Date.now() - Math.random() * 15 * 24 * 3600000),
      receiptDate: new Date(Date.now() - Math.random() * 10 * 24 * 3600000),
      supplier: {
        id: 'ninu-factory',
        name: 'Ninu Factory Control',
        contactInfo: ninuContactInfo as any,
        qualityMetrics: {
          defectRate: 0.2,
          onTimeDelivery: 99.5,
          qualityScore: 98,
          certificationCompliance: 100,
          correctiveActions: 0,
          qualityTrend: 'stable' as const
        },
        deliveryMetrics: {
          averageLeadTime: 1,
          onTimeDeliveryRate: 99.5,
          earlyDeliveryRate: 80.0,
          lateDeliveryRate: 0.5,
          deliveryAccuracy: 99.8,
          transportationCost: 0
        },
        certifications: [
          {
            type: 'COFEPRIS',
            issuingBody: 'COFEPRIS',
            certificationNumber: 'COFEPRIS-NINU-2024',
            issueDate: new Date('2024-01-01'),
            expirationDate: new Date('2025-12-31'),
            status: 'valid' as const,
            scope: 'Productos de limpieza y desinfección'
          }
        ],
        riskScore: 5,
        financialRating: 'A' as const,
        preferredSupplier: true
      },
      currentLocation: {
        zone: `Zone-${String.fromCharCode(65 + Math.floor(index / 3))}`,
        aisle: String(Math.floor(index / 2) + 1).padStart(2, '0'),
        shelf: `${Math.floor(index % 4) + 1}${String.fromCharCode(65 + index % 3)}`,
        position: String(index % 10 + 1).padStart(2, '0'),
        lastMoved: new Date(Date.now() - Math.random() * 7 * 24 * 3600000),
        movedBy: `OP-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
        environmentalConditions: {
          temperature: 20 + Math.random() * 8,
          humidity: 40 + Math.random() * 20,
          lastChecked: new Date(Date.now() - Math.random() * 24 * 3600000)
        }
      }
    }
  }))
]

// Inventory Movements
export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-001',
    type: 'inbound',
    inventoryItemId: 'raw-001',
    quantity: 500,
    unitCost: 45.50,
    totalCost: 22750,
    timestamp: new Date('2024-07-10T10:30:00Z'),
    source: 'supplier-001',
    destination: 'warehouse-main',
    reference: 'PO-2024-0156',
    batchLot: 'TENS-001-240710-001',
    userId: 'user-001',
    notes: 'Recepción de material según orden de compra',
    status: 'completed'
  },
  {
    id: 'mov-002',
    type: 'outbound',
    inventoryItemId: 'raw-001',
    quantity: 150,
    unitCost: 45.50,
    totalCost: 6825,
    timestamp: new Date('2024-07-11T08:15:00Z'),
    source: 'warehouse-main',
    destination: 'production-line-1',
    reference: 'PROD-2024-0089',
    batchLot: 'TENS-001-240710-001',
    userId: 'user-002',
    notes: 'Material enviado a producción para lote de jabón líquido',
    status: 'completed'
  },
  {
    id: 'mov-003',
    type: 'inbound',
    inventoryItemId: 'raw-002',
    quantity: 1000,
    unitCost: 18.50,
    totalCost: 18500,
    timestamp: new Date('2024-07-05T14:20:00Z'),
    source: 'supplier-002',
    destination: 'warehouse-chemicals',
    reference: 'PO-2024-0152',
    batchLot: 'ALCO-001-240705-001',
    userId: 'user-003',
    notes: 'Recepción de alcohol etílico para desinfectantes',
    status: 'completed'
  }
]
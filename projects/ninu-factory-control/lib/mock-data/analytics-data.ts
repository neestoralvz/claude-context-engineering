/**
 * Analytics Data Module - Smart Inventory Analytics
 * 
 * Contains smart inventory alerts with AI-powered predictions, business impact analysis,
 * and recommended actions for the Ninu Factory Control system.
 * 
 * @fileoverview Smart inventory analytics and predictive alerts
 * @module AnalyticsData
 */

import { SmartInventoryAlert } from '../types'

// Note: This is a condensed version for Principle #58 compliance (≤500 lines)
// The full analytics data includes comprehensive business impact analysis

export const mockSmartInventoryAlerts: SmartInventoryAlert[] = [
  {
    id: 'alert-smart-001',
    item_type: 'finished_product',
    item_id: 'prod-008', // Blanqueador Cloro En Gel que tiene stock muy bajo
    alert_type: 'low_stock',
    severity: 'critical',
    current_value: 8,
    threshold_value: 40,
    message: 'CRÍTICO: Stock extremadamente bajo de Blanqueador Cloro En Gel 4L - Solo 8 unidades restantes',
    acknowledged: false,
    created_at: '2024-07-15T09:30:00Z',
    predictions: {
      timeToStockOut: 18, // horas
      probabilityOfStockOut: 0.95,
      demandSpike: false,
      seasonalFactor: 1.2, // Temporada alta de limpieza
      trendDirection: 'decreasing'
    },
    recommendedActions: [
      {
        id: 'action-008-emergency',
        type: 'reorder',
        priority: 'urgent',
        description: 'PRODUCCIÓN URGENTE: Lote de emergencia Blanqueador Cloro En Gel 4L',
        estimatedCost: 58.00 * 200, // Lote mínimo viable
        estimatedTimeHours: 12,
        requiredApprovals: ['Gerente de Producción', 'Control de Calidad'],
        canAutoExecute: false,
        dependencies: ['Verificar stock hipoclorito de sodio'],
        expectedOutcome: 'Restaurar stock a 200 unidades en 12 horas',
        riskIfNotTaken: 'critical'
      },
      {
        id: 'action-008-substitute',
        type: 'substitute',
        priority: 'high',
        description: 'Ofrecer Blanqueador 10L como alternativa temporal',
        estimatedCost: 0,
        estimatedTimeHours: 1,
        requiredApprovals: ['Ventas'],
        canAutoExecute: true,
        expectedOutcome: 'Mantener satisfacción del cliente',
        riskIfNotTaken: 'medium'
      },
      {
        id: 'action-008-expedite',
        type: 'expedite',
        priority: 'high',
        description: 'Acelerar procesamiento del lote actual',
        estimatedCost: 2000, // Costo de horas extra
        estimatedTimeHours: 8,
        requiredApprovals: ['Supervisor de Turno'],
        canAutoExecute: false,
        expectedOutcome: 'Reducir tiempo de producción en 4 horas',
        riskIfNotTaken: 'high'
      }
    ],
    businessImpact: {
      productionImpact: {
        affectedProductLines: ['limpieza'],
        estimatedDowntime: 0,
        alternativeOptions: ['prod-009'], // Blanqueador 10L
        priorityLevel: 'critical',
        mitigationPossible: true
      },
      financialImpact: {
        directCost: 0,
        opportunityCost: 15000, // Ventas perdidas estimadas
        expeditingCost: 2000,
        totalImpact: 17000,
        impactCategory: 'significant'
      },
      customerImpact: {
        affectedOrders: 25,
        affectedCustomers: 20,
        reputationRisk: 'high',
        customerNotificationRequired: true,
        alternativeProducts: ['prod-009']
      },
      qualityImpact: {
        productQualityRisk: 'none',
        batchReleaseDelay: 0,
        additionalTestingRequired: false,
        qualityCompromise: false,
        regulatoryImplications: false
      },
      complianceImpact: {
        regulatoryBodies: ['COFEPRIS'],
        complianceRisk: 'low',
        reportingRequired: false,
        auditImplications: false,
        penaltyRisk: 0
      },
      overallRiskScore: 85,
      mitigationStrategies: [
        {
          strategy: 'Producción de emergencia con lote reducido',
          estimatedCost: 11600,
          timeToImplement: 12,
          effectiveness: 0.95,
          riskReduction: 80,
          feasibility: 'high'
        },
        {
          strategy: 'Sustitución temporal con producto alternativo',
          estimatedCost: 0,
          timeToImplement: 1,
          effectiveness: 0.75,
          riskReduction: 50,
          feasibility: 'very_high'
        }
      ],
      recoveryTimeObjective: 12
    },
    autoResolutionAvailable: false,
    patternAnalysis: {
      patternType: 'demand_surge',
      frequency: 3, // Cada 4 meses
      lastOccurrence: new Date('2024-03-15'),
      nextPredictedOccurrence: new Date('2024-11-15'),
      reliability: 0.85
    },
    escalationRules: [
      {
        level: 1,
        timeThreshold: 60, // 1 hora
        notificationMethod: 'sms',
        recipients: ['supervisor.produccion@ninu.mx', 'gerente.operaciones@ninu.mx'],
        conditions: ['Stock crítico sin acciones iniciadas']
      },
      {
        level: 2,
        timeThreshold: 180, // 3 horas
        notificationMethod: 'call',
        recipients: ['gerente.general@ninu.mx'],
        conditions: ['Stock crítico persiste, riesgo de quiebre']
      }
    ]
  },
  {
    id: 'alert-smart-002',
    item_type: 'raw_material',
    item_id: 'raw-002',
    alert_type: 'expiration_warning',
    severity: 'medium',
    current_value: 800, // Litros próximos a vencer
    threshold_value: 500,
    message: 'ADVERTENCIA: 800L de Alcohol Etílico vencerán en 15 días',
    acknowledged: false,
    created_at: '2024-07-16T14:20:00Z',
    predictions: {
      timeToExpiration: 360, // 15 días en horas
      probabilityOfWaste: 0.65,
      demandSpike: false,
      seasonalFactor: 1.0,
      trendDirection: 'stable'
    },
    recommendedActions: [
      {
        id: 'action-002-priority',
        type: 'prioritize',
        priority: 'medium',
        description: 'Priorizar uso de lote próximo a vencer en próximas producciones',
        estimatedCost: 0,
        estimatedTimeHours: 2,
        requiredApprovals: ['Supervisor de Producción'],
        canAutoExecute: true,
        expectedOutcome: 'Uso completo del lote antes de vencimiento',
        riskIfNotTaken: 'medium'
      },
      {
        id: 'action-002-discount',
        type: 'transfer',
        priority: 'low',
        description: 'Transferir a productos con menor vida útil requerida',
        estimatedCost: 0,
        estimatedTimeHours: 4,
        requiredApprovals: ['Control de Calidad'],
        canAutoExecute: false,
        expectedOutcome: 'Optimizar uso de material',
        riskIfNotTaken: 'low'
      }
    ],
    businessImpact: {
      productionImpact: {
        affectedProductLines: ['desinfeccion'],
        estimatedDowntime: 0,
        alternativeOptions: ['Lote más reciente disponible'],
        priorityLevel: 'medium',
        mitigationPossible: true
      },
      financialImpact: {
        directCost: 18.50 * 800, // Costo del lote completo
        opportunityCost: 0,
        totalImpact: 14800,
        impactCategory: 'moderate'
      },
      customerImpact: {
        affectedOrders: 0,
        affectedCustomers: 0,
        reputationRisk: 'low',
        customerNotificationRequired: false,
        alternativeProducts: []
      },
      qualityImpact: {
        productQualityRisk: 'low',
        batchReleaseDelay: 0,
        additionalTestingRequired: true,
        qualityCompromise: false,
        regulatoryImplications: false
      },
      complianceImpact: {
        regulatoryBodies: ['COFEPRIS'],
        complianceRisk: 'medium',
        reportingRequired: true,
        auditImplications: true,
        penaltyRisk: 5000
      },
      overallRiskScore: 45,
      mitigationStrategies: [
        {
          strategy: 'Acelerar producción de productos con alcohol',
          estimatedCost: 1000,
          timeToImplement: 48,
          effectiveness: 0.90,
          riskReduction: 70,
          feasibility: 'high'
        }
      ],
      recoveryTimeObjective: 48
    },
    autoResolutionAvailable: true,
    patternAnalysis: {
      patternType: 'seasonal',
      frequency: 2, // Cada 6 meses
      lastOccurrence: new Date('2024-01-15'),
      nextPredictedOccurrence: new Date('2025-01-15'),
      reliability: 0.75
    },
    escalationRules: [
      {
        level: 1,
        timeThreshold: 240, // 4 horas
        notificationMethod: 'email',
        recipients: ['control.calidad@ninu.mx'],
        conditions: ['Material próximo a vencer sin planificación']
      }
    ]
  }
]
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  X,
  Filter,
  Bell,
  BellOff,
  Eye,
  ThumbsUp,
  MoreVertical,
  Calendar,
  Package,
  Zap,
  Target,
  AlertOctagon,
  Info
} from 'lucide-react';
import { SmartInventoryAlert, AlertAction, BusinessImpact } from '../../types';

interface InventoryAlertsProps {
  viewMode?: 'full' | 'summary';
  maxItems?: number;
}

// Mock data para alertas inteligentes
const mockAlerts: SmartInventoryAlert[] = [
  {
    id: 'alert-001',
    item_type: 'raw_material',
    item_id: 'rm-001',
    alert_type: 'low_stock',
    severity: 'critical',
    current_value: 245,
    threshold_value: 500,
    message: 'Alcohol Etílico 96% - Stock crítico: 245L (Umbral: 500L)',
    acknowledged: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    predictions: {
      timeToStockOut: 18, // horas
      probabilityOfStockOut: 0.85,
      demandSpike: false,
      seasonalFactor: 1.1,
      trendDirection: 'decreasing'
    },
    recommendedActions: [
      {
        id: 'action-001',
        type: 'reorder',
        priority: 'urgent',
        description: 'Generar orden de compra urgente por 3,000L',
        estimatedCost: 136500,
        estimatedTimeHours: 2,
        requiredApprovals: ['manager', 'procurement'],
        canAutoExecute: false,
        expectedOutcome: 'Reabastecimiento en 7 días',
        riskIfNotTaken: 'critical'
      },
      {
        id: 'action-002',
        type: 'expedite',
        priority: 'high',
        description: 'Solicitar entrega express al proveedor preferido',
        estimatedCost: 150000,
        estimatedTimeHours: 1,
        requiredApprovals: ['manager'],
        canAutoExecute: false,
        expectedOutcome: 'Entrega en 3 días',
        riskIfNotTaken: 'high'
      }
    ],
    businessImpact: {
      productionImpact: {
        affectedProductLines: ['Desinfectantes', 'Sanitizantes'],
        estimatedDowntime: 24,
        alternativeOptions: ['Alcohol Isopropílico (limitado)'],
        priorityLevel: 'critical',
        mitigationPossible: true
      },
      financialImpact: {
        directCost: 150000,
        opportunityCost: 300000,
        expeditingCost: 13500,
        totalImpact: 463500,
        impactCategory: 'significant'
      },
      customerImpact: {
        affectedOrders: 12,
        affectedCustomers: 8,
        reputationRisk: 'high',
        customerNotificationRequired: true,
        alternativeProducts: ['Kit de limpieza alternativo']
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
          strategy: 'Activar proveedor de respaldo',
          estimatedCost: 165000,
          timeToImplement: 4,
          effectiveness: 0.9,
          riskReduction: 70,
          feasibility: 'high'
        }
      ],
      recoveryTimeObjective: 72
    },
    autoResolutionAvailable: false,
    patternAnalysis: {
      patternType: 'recurring',
      frequency: 0.3,
      lastOccurrence: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextPredictedOccurrence: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      reliability: 0.8
    },
    escalationRules: [
      {
        level: 1,
        timeThreshold: 30,
        notificationMethod: 'app',
        recipients: ['supervisor.inventario@ninu.mx'],
        conditions: ['Severity >= medium']
      },
      {
        level: 2,
        timeThreshold: 60,
        notificationMethod: 'email',
        recipients: ['gerente.operaciones@ninu.mx'],
        conditions: ['Severity >= high', 'Not acknowledged']
      }
    ],
    procurementIntegration: {
      vendorId: 'qb-001',
      preferredQuantity: 3000,
      estimatedCost: 136500,
      leadTime: 7,
      autoOrderThreshold: 300,
      requiredApprovals: ['manager', 'procurement']
    }
  },
  {
    id: 'alert-002',
    item_type: 'raw_material',
    item_id: 'rm-002',
    alert_type: 'expiring',
    severity: 'high',
    current_value: 15, // días para vencimiento
    threshold_value: 30,
    message: 'Hipoclorito de Sodio 12% - Vence en 15 días (Lote: HYP-2024-15)',
    acknowledged: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    predictions: {
      timeToStockOut: 360,
      probabilityOfStockOut: 0.95,
      demandSpike: false,
      seasonalFactor: 1.0,
      trendDirection: 'stable'
    },
    recommendedActions: [
      {
        id: 'action-003',
        type: 'expedite',
        priority: 'high',
        description: 'Priorizar uso en producción de desinfectantes',
        estimatedCost: 0,
        estimatedTimeHours: 2,
        requiredApprovals: ['production_manager'],
        canAutoExecute: true,
        expectedOutcome: 'Utilización completa antes del vencimiento',
        riskIfNotTaken: 'medium'
      }
    ],
    businessImpact: {
      productionImpact: {
        affectedProductLines: ['Desinfectantes comerciales'],
        estimatedDowntime: 0,
        alternativeOptions: ['Hipoclorito de potasio'],
        priorityLevel: 'medium',
        mitigationPossible: true
      },
      financialImpact: {
        directCost: 45000, // valor del material que se perdería
        opportunityCost: 0,
        totalImpact: 45000,
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
        additionalTestingRequired: false,
        qualityCompromise: false,
        regulatoryImplications: false
      },
      complianceImpact: {
        regulatoryBodies: ['COFEPRIS', 'SEMARNAT'],
        complianceRisk: 'medium',
        reportingRequired: true,
        auditImplications: true,
        penaltyRisk: 15000
      },
      overallRiskScore: 45,
      mitigationStrategies: [
        {
          strategy: 'Acelerar producción con este lote',
          estimatedCost: 5000,
          timeToImplement: 8,
          effectiveness: 0.95,
          riskReduction: 85,
          feasibility: 'high'
        }
      ],
      recoveryTimeObjective: 24
    },
    autoResolutionAvailable: true,
    patternAnalysis: {
      patternType: 'seasonal',
      frequency: 0.1,
      lastOccurrence: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      nextPredictedOccurrence: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      reliability: 0.7
    },
    escalationRules: [
      {
        level: 1,
        timeThreshold: 180,
        notificationMethod: 'app',
        recipients: ['calidad@ninu.mx'],
        conditions: ['Material expiring']
      }
    ]
  }
];

export function InventoryAlerts({ viewMode = 'full', maxItems }: InventoryAlertsProps) {
  const [alerts, setAlerts] = useState<SmartInventoryAlert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<SmartInventoryAlert[]>(mockAlerts);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'low_stock' | 'high_stock' | 'expiring' | 'expired'>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SmartInventoryAlert | null>(null);

  // Aplicar filtros
  useEffect(() => {
    let filtered = alerts;

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.alert_type === typeFilter);
    }

    if (!showResolved) {
      filtered = filtered.filter(alert => !alert.acknowledged);
    }

    // Ordenar por severidad y fecha
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    setFilteredAlerts(filtered);
  }, [alerts, severityFilter, typeFilter, showResolved, maxItems]);

  // Funciones de manejo de alertas
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, acknowledged_at: new Date().toISOString() }
        : alert
    ));
  };

  const executeAction = async (alertId: string, actionId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    const action = alert?.recommendedActions.find(a => a.id === actionId);
    
    if (action?.canAutoExecute) {
      // Simular ejecución automática
      console.log(`Ejecutando acción automática: ${action.description}`);
      acknowledgeAlert(alertId);
    } else {
      // Requiere aprobación manual
      console.log(`Acción requiere aprobación: ${action?.description}`);
    }
  };

  // Obtener el icono según el tipo de alerta
  const getAlertIcon = (alert: SmartInventoryAlert) => {
    switch (alert.alert_type) {
      case 'low_stock':
        return TrendingDown;
      case 'high_stock':
        return TrendingUp;
      case 'expiring':
        return Clock;
      case 'expired':
        return AlertOctagon;
      default:
        return AlertTriangle;
    }
  };

  // Obtener color según severidad
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Calcular tiempo transcurrido
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  };

  // Componente de tarjeta de alerta
  const AlertCard = ({ alert }: { alert: SmartInventoryAlert }) => {
    const IconComponent = getAlertIcon(alert);
    const severityColor = getSeverityColor(alert.severity);
    const timeAgo = getTimeAgo(alert.created_at);
    
    return (
      <Card className={`border-l-4 ${severityColor} hover:shadow-md transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${severityColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge className={`${severityColor} text-xs`}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {alert.alert_type.replace('_', ' ')}
                  </Badge>
                  {alert.autoResolutionAvailable && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Auto-resoluble
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{alert.message}</h3>
                <p className="text-sm text-gray-600">{timeAgo}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!alert.acknowledged && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Reconocer
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Predictions */}
          {alert.predictions && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Predicciones Inteligentes</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tiempo hasta agotamiento:</span>
                  <p className="font-medium">{alert.predictions.timeToStockOut}h</p>
                </div>
                <div>
                  <span className="text-gray-600">Probabilidad de falta:</span>
                  <p className="font-medium">{(alert.predictions.probabilityOfStockOut * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Tendencia:</span>
                  <p className="font-medium capitalize">{alert.predictions.trendDirection}</p>
                </div>
                <div>
                  <span className="text-gray-600">Factor estacional:</span>
                  <p className="font-medium">{alert.predictions.seasonalFactor.toFixed(1)}x</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Impact Summary */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Impacto de Negocio</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Riesgo general:</span>
                <p className="font-medium">{alert.businessImpact.overallRiskScore}/100</p>
              </div>
              <div>
                <span className="text-gray-600">Impacto financiero:</span>
                <p className="font-medium">
                  ${(alert.businessImpact.financialImpact.totalImpact / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <span className="text-gray-600">Productos afectados:</span>
                <p className="font-medium">{alert.businessImpact.productionImpact.affectedProductLines.length}</p>
              </div>
              <div>
                <span className="text-gray-600">Tiempo de recuperación:</span>
                <p className="font-medium">{alert.businessImpact.recoveryTimeObjective}h</p>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          {alert.recommendedActions.length > 0 && viewMode === 'full' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Acciones Recomendadas</h4>
              {alert.recommendedActions.map((action, index) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={`text-xs ${
                        action.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {action.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{action.description}</p>
                    <div className="text-xs text-gray-600 mt-1">
                      Costo: ${action.estimatedCost?.toLocaleString()} | 
                      Tiempo: {action.estimatedTimeHours}h | 
                      Riesgo: {action.riskIfNotTaken}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {action.canAutoExecute ? (
                      <Button
                        size="sm"
                        onClick={() => executeAction(alert.id, action.id)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Ejecutar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {viewMode === 'full' && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Alertas Inteligentes de Inventario</h2>
            <p className="text-gray-600 mt-1">
              {filteredAlerts.length} alerta{filteredAlerts.length !== 1 ? 's' : ''} activa{filteredAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Configurar Notificaciones
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {viewMode === 'full' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidad
                </label>
                <select
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                >
                  <option value="all">Todos</option>
                  <option value="low_stock">Stock bajo</option>
                  <option value="high_stock">Stock alto</option>
                  <option value="expiring">Por vencer</option>
                  <option value="expired">Vencido</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-resolved"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="show-resolved" className="text-sm text-gray-700">
                  Mostrar resueltas
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showResolved ? 'No hay alertas' : 'No hay alertas activas'}
            </h3>
            <p className="text-gray-600">
              {showResolved 
                ? 'No se encontraron alertas que coincidan con los filtros.' 
                : 'Todas las alertas han sido resueltas o reconocidas.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
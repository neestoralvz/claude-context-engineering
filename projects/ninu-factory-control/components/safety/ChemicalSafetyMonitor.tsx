import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { AlertTriangle, Shield, CheckCircle, X, Eye, Heart, Thermometer, Wind, Droplets } from 'lucide-react'

// Monitor de seguridad química para la planta de producción Ninu.mx
// Cumplimiento COFEPRIS y protocolos de emergencia
interface ChemicalSafetyData {
  id: string
  name: string
  concentration: number
  maxAllowedPPM: number
  currentPPM: number
  status: 'safe' | 'warning' | 'danger'
  lastUpdate: Date
  location: string
  cofepisLimit: number
  healthEffects: string[]
  emergencyActions: string[]
}

interface SafetyAlert {
  id: string
  type: 'chemical_exposure' | 'emergency_stop' | 'cofepis_violation' | 'equipment_failure'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  location: string
  resolved: boolean
}

interface SafetyAlertProps {
  alert: SafetyAlert
  onResolve: (alertId: string) => void
  onEscalate: (alertId: string) => void
}

function SafetyAlert({ alert, onResolve, onEscalate }: SafetyAlertProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'medium': return <Eye className="h-5 w-5 text-yellow-600" />
      case 'low': return <Shield className="h-5 w-5 text-blue-600" />
      default: return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getSeverityIcon(alert.severity)}
          <div>
            <h4 className="font-semibold">{alert.message}</h4>
            <p className="text-sm opacity-75">Ubicación: {alert.location}</p>
            <p className="text-sm opacity-75">
              {alert.timestamp.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
        
        {!alert.resolved && (
          <div className="flex space-x-2">
            <Button 
              size="sm"
              variant="default"
              onClick={() => onResolve(alert.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolver
            </Button>
            {alert.severity !== 'critical' && (
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => onEscalate(alert.id)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Escalar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ChemicalSafetyMonitor() {
  const [chemicalData, setChemicalData] = useState<ChemicalSafetyData[]>([
    {
      id: 'quaternary-ammonium',
      name: 'Sales Cuaternarias de Amonio',
      concentration: 0.18,
      maxAllowedPPM: 500,
      currentPPM: 45,
      status: 'safe',
      lastUpdate: new Date(),
      location: 'Reactor A - Línea Sanitizantes',
      cofepisLimit: 0.20,
      healthEffects: ['Irritación ocular leve', 'Posible sensibilización cutánea'],
      emergencyActions: ['Ventilación inmediata', 'Lavado con agua abundante', 'Contactar servicios médicos']
    },
    {
      id: 'isopropyl-alcohol',
      name: 'Alcohol Isopropílico',
      concentration: 70.0,
      maxAllowedPPM: 400,
      currentPPM: 180,
      status: 'warning',
      lastUpdate: new Date(),
      location: 'Estación Mezcla B',
      cofepisLimit: 75.0,
      healthEffects: ['Irritación respiratoria', 'Somnolencia', 'Irritación ocular'],
      emergencyActions: ['Aire fresco inmediato', 'No inducir vómito si se ingiere', 'Atención médica']
    },
    {
      id: 'hydrogen-peroxide',
      name: 'Peróxido de Hidrógeno',
      concentration: 3.0,
      maxAllowedPPM: 100,
      currentPPM: 25,
      status: 'safe',
      lastUpdate: new Date(),
      location: 'Reactor C - Desinfectantes',
      cofepisLimit: 5.0,
      healthEffects: ['Irritación cutánea', 'Quemaduras en concentraciones altas'],
      emergencyActions: ['Lavado inmediato con agua', 'Retirar ropa contaminada', 'Ventilación']
    }
  ])

  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([
    {
      id: '1',
      type: 'chemical_exposure',
      severity: 'medium',
      message: 'Concentración de alcohol isopropílico por encima del promedio',
      timestamp: new Date(),
      location: 'Estación Mezcla B',
      resolved: false
    },
    {
      id: '2', 
      type: 'cofepis_violation',
      severity: 'low',
      message: 'Verificación COFEPRIS programada para mañana',
      timestamp: new Date(),
      location: 'Línea de Sanitizantes',
      resolved: false
    }
  ])

  const [emergencyProtocols, setEmergencyProtocols] = useState({
    chemicalSpill: {
      name: 'Derrame Químico',
      steps: [
        'Evacuar área inmediatamente',
        'Activar sistema de ventilación de emergencia',
        'Usar equipo de protección personal (EPP)',
        'Contener derrame con materiales absorbentes',
        'Notificar a supervisor de seguridad',
        'Documentar incidente para COFEPRIS'
      ],
      lastDrill: new Date('2024-01-15'),
      nextDrill: new Date('2024-02-15')
    },
    fireEmergency: {
      name: 'Emergencia de Fuego',
      steps: [
        'Activar alarma general',
        'Cortar suministro eléctrico',
        'Usar extintores apropiados (Clase C para químicos)',
        'Evacuar siguiendo rutas de emergencia',
        'Punto de encuentro: Estacionamiento principal',
        'Esperar a brigada de bomberos'
      ],
      lastDrill: new Date('2024-01-20'),
      nextDrill: new Date('2024-02-20')
    }
  })

  const [cofepisCompliance, setCofepisCompliance] = useState({
    overallScore: 97.3,
    lastInspection: new Date('2024-01-10'),
    nextInspection: new Date('2024-04-10'),
    certificates: [
      { id: 'sanitizer-cert', name: 'Registro Sanitizante Sin Alcohol', expires: new Date('2024-12-31') },
      { id: 'cleaning-cert', name: 'Registro Productos Limpieza', expires: new Date('2024-11-30') },
      { id: 'facility-cert', name: 'Licencia Sanitaria Establecimiento', expires: new Date('2024-10-15') }
    ]
  })

  const handleResolveAlert = (alertId: string) => {
    setSafetyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    )
  }

  const handleEscalateAlert = (alertId: string) => {
    setSafetyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, severity: 'high' as const }
          : alert
      )
    )
  }

  const triggerEmergencyStop = () => {
    const confirmed = window.confirm(
      '⚠️ ¿Está seguro de activar la parada de emergencia? Esto detendrá toda la producción.'
    )
    
    if (confirmed) {
      // Simulate emergency stop
      const newAlert: SafetyAlert = {
        id: Date.now().toString(),
        type: 'emergency_stop',
        severity: 'critical',
        message: 'PARADA DE EMERGENCIA ACTIVADA - Todos los sistemas detenidos',
        timestamp: new Date(),
        location: 'Control Central',
        resolved: false
      }
      
      setSafetyAlerts(prev => [newAlert, ...prev])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'danger': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Emergency Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Controles de Emergencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button 
              variant="destructive"
              size="lg"
              onClick={triggerEmergencyStop}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="h-5 w-5 mr-2" />
              PARADA DE EMERGENCIA
            </Button>
            <div className="text-sm text-gray-600">
              <p>Detiene inmediatamente todos los procesos de producción</p>
              <p>Use solo en caso de emergencia real</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chemical Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Thermometer className="h-5 w-5 mr-2" />
            Monitoreo de Sustancias Químicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chemicalData.map((chemical) => (
              <div key={chemical.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{chemical.name}</h4>
                  <Badge className={getStatusColor(chemical.status)}>
                    {chemical.status === 'safe' ? 'Seguro' : 
                     chemical.status === 'warning' ? 'Precaución' : 'Peligro'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Concentración:</span>
                    <span className="font-medium">{chemical.concentration}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPM Actual:</span>
                    <span className="font-medium">{chemical.currentPPM}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Límite COFEPRIS:</span>
                    <span className="font-medium">{chemical.cofepisLimit}%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Ubicación: {chemical.location}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0 PPM</span>
                    <span>{chemical.maxAllowedPPM} PPM</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        chemical.status === 'safe' ? 'bg-green-600' :
                        chemical.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{
                        width: `${Math.min((chemical.currentPPM / chemical.maxAllowedPPM) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Alertas de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safetyAlerts.filter(alert => !alert.resolved).map((alert) => (
              <SafetyAlert
                key={alert.id}
                alert={alert}
                onResolve={handleResolveAlert}
                onEscalate={handleEscalateAlert}
              />
            ))}
            
            {safetyAlerts.filter(alert => !alert.resolved).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No hay alertas de seguridad activas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* COFEPRIS Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Cumplimiento COFEPRIS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Estado General</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Puntuación de Cumplimiento:</span>
                  <span className="font-bold text-green-600">{cofepisCompliance.overallScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Última Inspección:</span>
                  <span>{cofepisCompliance.lastInspection.toLocaleDateString('es-MX')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Próxima Inspección:</span>
                  <span>{cofepisCompliance.nextInspection.toLocaleDateString('es-MX')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Certificados Vigentes</h4>
              <div className="space-y-2">
                {cofepisCompliance.certificates.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-center">
                    <span className="text-sm">{cert.name}</span>
                    <Badge variant={
                      cert.expires > new Date() ? 'secondary' : 'destructive'
                    }>
                      {cert.expires.toLocaleDateString('es-MX')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Protocolos de Emergencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(emergencyProtocols).map(([key, protocol]) => (
              <div key={key} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">{protocol.name}</h4>
                <ol className="text-sm space-y-1 mb-3">
                  {protocol.steps.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="mr-2 text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Último simulacro: {protocol.lastDrill.toLocaleDateString('es-MX')}</div>
                  <div>Próximo simulacro: {protocol.nextDrill.toLocaleDateString('es-MX')}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
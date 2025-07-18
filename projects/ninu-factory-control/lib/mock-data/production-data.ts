/**
 * Production Data Module - Manufacturing Operations
 * 
 * Contains production data including reactors, stations, alerts, metrics, and utility functions
 * for the Ninu Factory Control manufacturing system.
 * 
 * @fileoverview Production operations and manufacturing data
 * @module ProductionData
 */

import { Reactor, ProductionStation, Alert, ProductionMetrics, TrendData, Recipe } from '../types'

export const mockReactors: Reactor[] = [
  {
    id: 'reactor-001',
    name: 'Reactor A - Líquidos',
    status: 'mixing',
    capacity: 5000,
    currentBatch: {
      id: 'batch-001',
      productId: 'prod-001',
      quantity: 4500,
      status: 'in_progress',
      startTime: new Date(Date.now() - 3600000),
      estimatedCompletion: new Date(Date.now() + 1800000),
      recipe: {} as Recipe,
      qualityMetrics: []
    },
    temperature: 35,
    pressure: 1.2,
    mixingSpeed: 150,
    lastMaintenance: new Date(Date.now() - 7 * 24 * 3600000),
    nextMaintenance: new Date(Date.now() + 21 * 24 * 3600000)
  },
  {
    id: 'reactor-002',
    name: 'Reactor B - Desinfectantes',
    status: 'idle',
    capacity: 3000,
    temperature: 22,
    pressure: 1.0,
    mixingSpeed: 0,
    lastMaintenance: new Date(Date.now() - 5 * 24 * 3600000),
    nextMaintenance: new Date(Date.now() + 23 * 24 * 3600000)
  },
  {
    id: 'reactor-003',
    name: 'Reactor C - Especialidades',
    status: 'cooling',
    capacity: 2000,
    currentBatch: {
      id: 'batch-002',
      productId: 'prod-002',
      quantity: 1800,
      status: 'in_progress',
      startTime: new Date(Date.now() - 7200000),
      estimatedCompletion: new Date(Date.now() + 900000),
      recipe: {} as Recipe,
      qualityMetrics: []
    },
    temperature: 28,
    pressure: 1.1,
    mixingSpeed: 75,
    lastMaintenance: new Date(Date.now() - 10 * 24 * 3600000),
    nextMaintenance: new Date(Date.now() + 18 * 24 * 3600000)
  }
]

export const mockStations: ProductionStation[] = [
  {
    id: 'station-001',
    name: 'Estación Etiquetado Principal',
    type: 'labeling',
    status: 'running',
    efficiency: 92,
    unitsPerHour: 450,
    lastActivity: new Date(Date.now() - 300000),
    queue: []
  },
  {
    id: 'station-002',
    name: 'Estación Llenado',
    type: 'filling',
    status: 'running',
    efficiency: 88,
    unitsPerHour: 380,
    lastActivity: new Date(Date.now() - 180000),
    queue: []
  },
  {
    id: 'station-003',
    name: 'Estación Etiquetado Secundario',
    type: 'labeling',
    status: 'idle',
    efficiency: 0,
    unitsPerHour: 0,
    lastActivity: new Date(Date.now() - 1800000),
    queue: []
  },
  {
    id: 'station-004',
    name: 'Estación Polvos',
    type: 'powder',
    status: 'maintenance',
    efficiency: 0,
    unitsPerHour: 0,
    lastActivity: new Date(Date.now() - 3600000),
    queue: []
  },
  {
    id: 'station-005',
    name: 'Estación Jabones y Productos Pequeños',
    type: 'soap',
    status: 'running',
    efficiency: 95,
    unitsPerHour: 520,
    lastActivity: new Date(Date.now() - 120000),
    queue: []
  }
]

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'warning',
    title: 'Mantenimiento Programado',
    message: 'Estación de Polvos requiere mantenimiento preventivo',
    source: 'station-004',
    timestamp: new Date(Date.now() - 1800000),
    acknowledged: false,
    severity: 'medium'
  },
  {
    id: 'alert-002',
    type: 'info',
    title: 'Batch Completado',
    message: 'Lote de Limpiador Multiusos completado exitosamente',
    source: 'reactor-001',
    timestamp: new Date(Date.now() - 900000),
    acknowledged: true,
    resolvedAt: new Date(Date.now() - 600000),
    severity: 'low'
  },
  {
    id: 'alert-003',
    type: 'warning',
    title: 'Inventario Bajo',
    message: 'Stock mínimo alcanzado para Kit Mantenimiento Alberca',
    source: 'inventory',
    timestamp: new Date(Date.now() - 600000),
    acknowledged: false,
    severity: 'medium'
  }
]

// Generate trend data for the last 24 hours
export const generateTrendData = (baseValue: number, variance: number, points: number = 24): TrendData[] => {
  const data: TrendData[] = []
  const now = new Date()
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)) // hourly data
    const randomVariance = (Math.random() - 0.5) * variance
    const value = Math.max(0, baseValue + randomVariance)
    data.push({ timestamp, value })
  }
  
  return data
}

// Generate resource utilization from current reactor and station data
export const generateResourceUtilization = (reactors: Reactor[], stations: ProductionStation[]) => {
  const reactorUtilization: any = {}
  const stationUtilization: any = {}
  
  reactors.forEach(reactor => {
    const baseUtilization = reactor.status === 'idle' ? 0 : 
                           reactor.status === 'mixing' ? 80 + Math.random() * 15 :
                           reactor.status === 'cooling' ? 60 + Math.random() * 20 :
                           reactor.status === 'heating' ? 85 + Math.random() * 10 : 50
    
    reactorUtilization[reactor.id] = {
      utilization: Math.round(baseUtilization),
      status: reactor.status,
      efficiency: reactor.status === 'idle' ? 0 : 85 + Math.random() * 15
    }
  })
  
  stations.forEach(station => {
    const baseUtilization = station.status === 'idle' ? 0 :
                           station.status === 'running' ? 85 + Math.random() * 15 :
                           station.status === 'maintenance' ? 0 : 50
    
    stationUtilization[station.id] = {
      utilization: Math.round(baseUtilization),
      status: station.status,
      efficiency: station.status === 'idle' || station.status === 'maintenance' ? 0 : 80 + Math.random() * 15
    }
  })
  
  // Calculate overall utilization
  const allUtilizations = [...Object.values(reactorUtilization), ...Object.values(stationUtilization)]
  const averageUtilization = allUtilizations.reduce((sum: number, item: any) => sum + item.utilization, 0) / allUtilizations.length
  const averageEfficiency = allUtilizations.filter((item: any) => item.efficiency > 0).reduce((sum: number, item: any) => sum + item.efficiency, 0) / 
                            allUtilizations.filter((item: any) => item.efficiency > 0).length
  
  return {
    reactors: reactorUtilization,
    stations: stationUtilization,
    overall: {
      capacity: 100,
      utilization: Math.round(averageUtilization),
      efficiency: Math.round(averageEfficiency || 0)
    }
  }
}

export const mockProductionMetrics: ProductionMetrics = {
  totalProduction: 12450,
  efficiency: 89.5,
  qualityRate: 98.2,
  downtime: 2.3,
  activeOrders: 8,
  completedOrders: 23,
  alertsCount: 3,
  timestamp: new Date(),
  trends: {
    efficiency: generateTrendData(89.5, 10),
    production: generateTrendData(520, 100),
    quality: generateTrendData(98.2, 3),
    downtime: generateTrendData(2.3, 2)
  },
  resourceUtilization: {
    reactors: {
      'reactor-001': { utilization: 85, status: 'mixing', efficiency: 92 },
      'reactor-002': { utilization: 0, status: 'idle', efficiency: 0 },
      'reactor-003': { utilization: 75, status: 'cooling', efficiency: 88 }
    },
    stations: {
      'station-001': { utilization: 90, status: 'running', efficiency: 92 },
      'station-002': { utilization: 85, status: 'running', efficiency: 88 },
      'station-003': { utilization: 0, status: 'idle', efficiency: 0 },
      'station-004': { utilization: 0, status: 'maintenance', efficiency: 0 },
      'station-005': { utilization: 95, status: 'running', efficiency: 95 }
    },
    overall: {
      capacity: 100,
      utilization: 67,
      efficiency: 89.5
    }
  }
}

// Legacy export for compatibility
export const mockMetrics = mockProductionMetrics
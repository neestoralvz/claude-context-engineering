'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Settings,
  RefreshCw,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { RawMaterialsManager } from './RawMaterialsManager';
import { InventoryAlerts } from './InventoryAlerts';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { SupplierPerformance } from './SupplierPerformance';
import { MovementHistory } from './MovementHistory';
import { SmartRecommendations } from './SmartRecommendations';
import {
  AdvancedInventoryItem,
  SmartInventoryAlert,
  InventoryPrediction,
  SupplierData,
  InventoryMovement
} from '../../types';

// Tipos para las métricas del dashboard
interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  totalValue: number;
  topSuppliers: number;
  monthlyMovements: number;
  qualityScore: number;
  stockAccuracy: number;
  timestamp: Date;
}

// Configuración del dashboard
interface DashboardConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  defaultView: string;
  showPredictions: boolean;
  alertThreshold: 'all' | 'medium' | 'high' | 'critical';
}

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'alerts' | 'analytics' | 'suppliers' | 'history' | 'recommendations'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [config, setConfig] = useState<DashboardConfig>({
    autoRefresh: true,
    refreshInterval: 30000,
    defaultView: 'overview',
    showPredictions: true,
    alertThreshold: 'medium'
  });

  // Mock data para demostración
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalItems: 342,
    lowStockItems: 23,
    expiringItems: 8,
    totalValue: 2847650,
    topSuppliers: 15,
    monthlyMovements: 1247,
    qualityScore: 94.7,
    stockAccuracy: 98.2,
    timestamp: new Date()
  });

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setMetrics(prev => ({
      ...prev,
      timestamp: new Date()
    }));
    setIsLoading(false);
  };

  // Auto-refresh
  useEffect(() => {
    if (!config.autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.autoRefresh, config.refreshInterval]);

  // Tabs de navegación
  const tabs = [
    { id: 'overview', name: 'Resumen General', icon: BarChart3 },
    { id: 'materials', name: 'Materias Primas', icon: Package },
    { id: 'alerts', name: 'Alertas Inteligentes', icon: AlertTriangle },
    { id: 'analytics', name: 'Análisis Predictivo', icon: TrendingUp },
    { id: 'suppliers', name: 'Proveedores', icon: Users },
    { id: 'history', name: 'Movimientos', icon: Activity },
    { id: 'recommendations', name: 'Recomendaciones', icon: Settings }
  ];

  // Métricas para las cards del overview
  const overviewCards = [
    {
      title: 'Total Items',
      value: metrics.totalItems.toLocaleString(),
      subtitle: 'materias primas activas',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Stock Bajo',
      value: metrics.lowStockItems.toString(),
      subtitle: 'requieren reabasto',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Por Vencer',
      value: metrics.expiringItems.toString(),
      subtitle: 'próximos 30 días',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Valor Total',
      value: `$${(metrics.totalValue / 1000000).toFixed(1)}M`,
      subtitle: 'inventario valorizado',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario Avanzado</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  config.autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {config.autoRefresh ? 'Actualización automática' : 'Manual'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Controles de filtro y configuración */}
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Información de última actualización */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="text-sm text-gray-500">
          Última actualización: {lastUpdate.toLocaleString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{card.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                          <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                        </div>
                        <div className={`${card.bgColor} p-3 rounded-lg`}>
                          <IconComponent className={`h-6 w-6 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Overview Components Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Alertas Críticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Alertas Críticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InventoryAlerts viewMode="summary" maxItems={5} />
                </CardContent>
              </Card>

              {/* Top Materials by Value */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Análisis Predictivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PredictiveAnalytics viewMode="summary" />
                </CardContent>
              </Card>

              {/* Supplier Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Rendimiento Proveedores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplierPerformance viewMode="summary" />
                </CardContent>
              </Card>

              {/* Recent Movements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    Movimientos Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MovementHistory viewMode="summary" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <RawMaterialsManager />
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <InventoryAlerts viewMode="full" />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <PredictiveAnalytics viewMode="full" />
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <SupplierPerformance viewMode="full" />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <MovementHistory viewMode="full" />
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <SmartRecommendations />
        )}
      </div>
    </div>
  );
}
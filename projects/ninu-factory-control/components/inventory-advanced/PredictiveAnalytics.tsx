'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  LineChart,
  Activity,
  Settings,
  Download,
  RefreshCw,
  Brain,
  Lightbulb,
  Gauge,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Filter,
  Eye,
  Zap
} from 'lucide-react';

interface PredictiveAnalyticsProps {
  viewMode?: 'full' | 'summary';
  timeRange?: '7d' | '30d' | '90d' | '1y';
  materialId?: string;
}

interface SimplePrediction {
  materialId: string;
  materialName: string;
  currentStock: number;
  predictedDemand: number;
  stockoutRisk: 'low' | 'medium' | 'high' | 'critical';
  daysUntilStockout: number;
  confidence: number;
  reorderPoint: number;
  optimalOrderQuantity: number;
}

// Mock data para análisis predictivo
const mockPredictions: SimplePrediction[] = [
  {
    materialId: 'rm-001',
    materialName: 'Alcohol Etílico 96%',
    currentStock: 245,
    predictedDemand: 420,
    stockoutRisk: 'critical',
    daysUntilStockout: 1,
    confidence: 0.87,
    reorderPoint: 350,
    optimalOrderQuantity: 3000
  },
  {
    materialId: 'rm-002',
    materialName: 'Hipoclorito de Sodio 12%',
    currentStock: 850,
    predictedDemand: 65,
    stockoutRisk: 'medium',
    daysUntilStockout: 15,
    confidence: 0.75,
    reorderPoint: 200,
    optimalOrderQuantity: 1500
  },
  {
    materialId: 'rm-003',
    materialName: 'Tensioactivo Aniónico',
    currentStock: 125,
    predictedDemand: 35,
    stockoutRisk: 'high',
    daysUntilStockout: 4,
    confidence: 0.92,
    reorderPoint: 80,
    optimalOrderQuantity: 500
  }
];

export function PredictiveAnalytics({ viewMode = 'full', timeRange = '30d', materialId }: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<SimplePrediction[]>(mockPredictions);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(materialId || null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar datos según material seleccionado
  const filteredPredictions = selectedMaterial 
    ? predictions.filter(p => p.materialId === selectedMaterial)
    : predictions;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  if (viewMode === 'summary') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Análisis Predictivo</h3>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPredictions.slice(0, 4).map((prediction) => (
            <Card key={prediction.materialId} className="hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">{prediction.materialId}</Badge>
                      <Badge variant={getRiskBadgeVariant(prediction.stockoutRisk)}>
                        {prediction.stockoutRisk.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{prediction.materialName}</p>
                    <p className="text-xs text-gray-600">
                      Stock: {prediction.currentStock} • Demanda: {prediction.predictedDemand}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{prediction.daysUntilStockout} días</p>
                    <p className="text-xs text-gray-500">hasta desabasto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPredictions.length === 0 && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay predicciones disponibles</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMaterial || ''}
            onChange={(e) => setSelectedMaterial(e.target.value || null)}
          >
            <option value="">Todos los materiales</option>
            {predictions.map((prediction) => (
              <option key={prediction.materialId} value={prediction.materialId}>
                {prediction.materialName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabla de predicciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Análisis Predictivo de Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Material</th>
                  <th className="text-left p-2">Stock Actual</th>
                  <th className="text-left p-2">Demanda Predicha</th>
                  <th className="text-left p-2">Riesgo</th>
                  <th className="text-left p-2">Días hasta Desabasto</th>
                  <th className="text-left p-2">Confianza</th>
                  <th className="text-left p-2">Recomendación</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.map((prediction) => (
                  <tr key={prediction.materialId} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <Badge variant="outline">{prediction.materialId}</Badge>
                        <p className="text-sm font-medium mt-1">{prediction.materialName}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="font-medium">{prediction.currentStock.toLocaleString()}</span>
                    </td>
                    <td className="p-2">
                      <span className="font-medium">{prediction.predictedDemand.toLocaleString()}</span>
                    </td>
                    <td className="p-2">
                      <Badge variant={getRiskBadgeVariant(prediction.stockoutRisk)}>
                        {prediction.stockoutRisk.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <span className={`font-medium ${getRiskColor(prediction.stockoutRisk)}`}>
                        {prediction.daysUntilStockout} días
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{Math.round(prediction.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <p>Reorden: {prediction.reorderPoint}</p>
                        <p>Cantidad: {prediction.optimalOrderQuantity}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPredictions.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay predicciones disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Alertas Críticas</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredPredictions.filter(p => p.stockoutRisk === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Días Promedio</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(filteredPredictions.reduce((acc, p) => acc + p.daysUntilStockout, 0) / filteredPredictions.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Confianza Promedio</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(filteredPredictions.reduce((acc, p) => acc + p.confidence, 0) / filteredPredictions.length * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
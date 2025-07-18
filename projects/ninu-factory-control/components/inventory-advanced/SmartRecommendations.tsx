'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Factory,
  Users,
  BarChart3,
  Activity,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Star,
  Award,
  Shield,
  Gauge,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Filter,
  Search,
  Calendar,
  Bell,
  MessageSquare,
  FileText,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';

interface SimpleRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'inventory' | 'cost' | 'quality' | 'operational';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  impact: 'low' | 'medium' | 'high';
  estimatedSavings?: number;
  implementationTime?: number;
  confidence: number;
}

interface SmartRecommendationsProps {
  viewMode?: 'full' | 'summary';
  category?: 'inventory' | 'cost' | 'quality' | 'operational';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// Mock data para recomendaciones inteligentes
const mockRecommendations: SimpleRecommendation[] = [
  {
    id: 'rec-001',
    category: 'inventory',
    priority: 'high',
    status: 'pending',
    title: 'Optimización de Punto de Reorden - Alcohol Etílico',
    description: 'El análisis predictivo indica que el punto de reorden actual (500L) es subóptimo. Se recomienda ajustar a 750L para reducir riesgo de falta de stock.',
    impact: 'high',
    estimatedSavings: 24500,
    implementationTime: 2,
    confidence: 0.87
  },
  {
    id: 'rec-002',
    category: 'cost',
    priority: 'medium',
    status: 'pending',
    title: 'Consolidación de Proveedores - Tensioactivos',
    description: 'Se identificaron 3 proveedores para el mismo tipo de tensioactivo. Consolidar en 2 proveedores principales puede reducir costos administrativos.',
    impact: 'medium',
    estimatedSavings: 12000,
    implementationTime: 4,
    confidence: 0.75
  },
  {
    id: 'rec-003',
    category: 'quality',
    priority: 'high',
    status: 'pending',
    title: 'Mejora en Control de Calidad - Hipoclorito',
    description: 'Los datos históricos muestran variabilidad en la concentración de hipoclorito. Implementar controles más frecuentes puede mejorar la calidad.',
    impact: 'high',
    estimatedSavings: 8500,
    implementationTime: 3,
    confidence: 0.82
  },
  {
    id: 'rec-004',
    category: 'operational',
    priority: 'medium',
    status: 'pending',
    title: 'Automatización de Reorden - Productos Críticos',
    description: 'Implementar sistema automático de reorden para productos con alta rotación puede reducir tiempos de gestión manual.',
    impact: 'medium',
    estimatedSavings: 15000,
    implementationTime: 6,
    confidence: 0.70
  }
];

export function SmartRecommendations({ viewMode = 'full', category, priority }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SimpleRecommendation[]>(mockRecommendations);
  const [filteredRecommendations, setFilteredRecommendations] = useState<SimpleRecommendation[]>(mockRecommendations);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [selectedPriority, setSelectedPriority] = useState<string>(priority || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Aplicar filtros
  React.useEffect(() => {
    let filtered = recommendations;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === selectedPriority);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(rec => rec.status === selectedStatus);
    }

    setFilteredRecommendations(filtered);
  }, [recommendations, selectedCategory, selectedPriority, selectedStatus]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'quality': return <Award className="h-4 w-4" />;
      case 'operational': return <Factory className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'text-blue-600';
      case 'cost': return 'text-green-600';
      case 'quality': return 'text-purple-600';
      case 'operational': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const refreshData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (viewMode === 'summary') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recomendaciones Inteligentes</h3>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecommendations.slice(0, 4).map((recommendation) => (
            <Card key={recommendation.id} className="hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-gray-100 ${getCategoryColor(recommendation.category)}`}>
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getPriorityBadgeVariant(recommendation.priority)}>
                        {recommendation.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">{recommendation.category}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{recommendation.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        {recommendation.estimatedSavings && formatCurrency(recommendation.estimatedSavings)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(recommendation.confidence * 100)}% confianza
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay recomendaciones disponibles</p>
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            <option value="inventory">Inventario</option>
            <option value="cost">Costos</option>
            <option value="quality">Calidad</option>
            <option value="operational">Operacional</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">Todas las prioridades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completado</option>
            <option value="dismissed">Descartado</option>
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

      {/* Lista de recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-gray-100 ${getCategoryColor(recommendation.category)}`}>
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{recommendation.category}</p>
                  </div>
                </div>
                <Badge variant={getPriorityBadgeVariant(recommendation.priority)}>
                  {recommendation.priority.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-700">{recommendation.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Ahorro estimado:</span>
                    </div>
                    <p className="text-lg font-semibold text-green-600">
                      {recommendation.estimatedSavings && formatCurrency(recommendation.estimatedSavings)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Tiempo implementación:</span>
                    </div>
                    <p className="text-lg font-semibold text-blue-600">
                      {recommendation.implementationTime} semanas
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Confianza:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${recommendation.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round(recommendation.confidence * 100)}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="default" size="sm" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Implementar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay recomendaciones que coincidan con los filtros</p>
        </div>
      )}
    </div>
  );
}
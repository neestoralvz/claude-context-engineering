'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  Download,
  RefreshCw,
  Eye,
  FileText,
  User,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Truck,
  Warehouse,
  Factory,
  ShoppingCart,
  Trash2,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  InventoryMovement,
  AdvancedRawMaterial,
  MovementType
} from '../../types';

interface MovementHistoryProps {
  viewMode?: 'full' | 'summary';
  materialId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

// Mock data para movimientos de inventario
const mockMovements: InventoryMovement[] = [
  {
    id: 'mov-001',
    item_type: 'raw_material',
    item_id: 'rm-001',
    batch_id: 'AE-2024-001',
    movement_type: 'receipt',
    quantity: 1500,
    unit_cost: 45.50,
    reason: 'Recepción de materia prima',
    reference_document: 'PO-2024-001',
    from_location: 'Proveedor QB001',
    to_location: 'Almacén A-1',
    created_by: 'operator-001',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'mov-002',
    item_type: 'raw_material',
    item_id: 'rm-001',
    batch_id: 'AE-2024-001',
    movement_type: 'consumption',
    quantity: 300,
    unit_cost: 45.50,
    reason: 'Consumo para producción',
    reference_document: 'PO-2024-001',
    from_location: 'Almacén A-1',
    to_location: 'Línea de Producción 1',
    created_by: 'operator-002',
    created_at: '2024-01-16T09:15:00Z'
  },
  {
    id: 'mov-003',
    item_type: 'raw_material',
    item_id: 'rm-002',
    batch_id: 'HYP-2024-002',
    movement_type: 'receipt',
    quantity: 800,
    unit_cost: 32.00,
    reason: 'Recepción de materia prima',
    reference_document: 'PO-2024-002',
    from_location: 'Proveedor QCG001',
    to_location: 'Almacén B-2',
    created_by: 'operator-003',
    created_at: '2024-01-17T11:45:00Z'
  }
];

// Datos para gráficos
const mockMovementTrends = [
  { date: '2024-01-15', receipts: 1500, consumption: 0, transfers: 0, adjustments: 0, waste: 0 },
  { date: '2024-01-16', receipts: 0, consumption: 300, transfers: 0, adjustments: 0, waste: 0 },
  { date: '2024-01-17', receipts: 800, consumption: 0, transfers: 0, adjustments: 0, waste: 0 },
  { date: '2024-01-18', receipts: 0, consumption: 0, transfers: 200, adjustments: 0, waste: 0 },
  { date: '2024-01-19', receipts: 0, consumption: 0, transfers: 0, adjustments: 15, waste: 0 },
  { date: '2024-01-20', receipts: 0, consumption: 150, transfers: 0, adjustments: 0, waste: 0 },
  { date: '2024-01-21', receipts: 0, consumption: 0, transfers: 0, adjustments: 0, waste: 5 }
];

const mockMovementTypes = [
  { name: 'Recepción', value: 45, color: '#10B981' },
  { name: 'Consumo', value: 35, color: '#3B82F6' },
  { name: 'Transferencia', value: 12, color: '#F59E0B' },
  { name: 'Ajuste', value: 5, color: '#EF4444' },
  { name: 'Residuo', value: 3, color: '#6B7280' }
];

export function MovementHistory({ viewMode = 'full', materialId, timeRange = '30d' }: MovementHistoryProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>(mockMovements);
  const [filteredMovements, setFilteredMovements] = useState<InventoryMovement[]>(mockMovements);
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'quantity' | 'cost'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = viewMode === 'summary' ? 5 : 10;

  // Filtros y búsqueda
  useEffect(() => {
    let filtered = movements;

    // Filtro por tipo de movimiento
    if (selectedMovementType !== 'all') {
      filtered = filtered.filter(movement => movement.movement_type === selectedMovementType);
    }

    // Filtro por material específico
    if (materialId) {
      filtered = filtered.filter(movement => movement.item_id === materialId);
    }

    // Búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.to_location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'cost':
          aValue = a.unit_cost || 0;
          bValue = b.unit_cost || 0;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMovements(filtered);
  }, [movements, selectedMovementType, materialId, searchTerm, sortBy, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovements = filteredMovements.slice(startIndex, endIndex);

  // Funciones de utilidad
  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case 'receipt': return <ArrowDown className="h-4 w-4" />;
      case 'consumption': return <ArrowUp className="h-4 w-4" />;
      case 'transfer': return <ArrowRight className="h-4 w-4" />;
      case 'adjustment': return <Edit className="h-4 w-4" />;
      case 'waste': return <Trash2 className="h-4 w-4" />;
      case 'production': return <Factory className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: MovementType) => {
    switch (type) {
      case 'receipt': return 'text-green-600';
      case 'consumption': return 'text-blue-600';
      case 'transfer': return 'text-yellow-600';
      case 'adjustment': return 'text-purple-600';
      case 'waste': return 'text-red-600';
      case 'production': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const getMovementLabel = (type: MovementType) => {
    switch (type) {
      case 'receipt': return 'Recepción';
      case 'consumption': return 'Consumo';
      case 'transfer': return 'Transferencia';
      case 'adjustment': return 'Ajuste';
      case 'waste': return 'Residuo';
      case 'production': return 'Producción';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (viewMode === 'summary') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Movimientos Recientes</h3>
          <Button variant="outline" size="sm" onClick={() => setIsLoading(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="space-y-2">
          {currentMovements.map((movement) => (
            <Card key={movement.id} className="hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${getMovementColor(movement.movement_type)}`}>
                      {getMovementIcon(movement.movement_type)}
                    </div>
                    <div>
                      <p className="font-medium">{getMovementLabel(movement.movement_type)}</p>
                      <p className="text-sm text-gray-600">
                        {movement.quantity} unidades • {formatDate(movement.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {movement.item_id}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMovements.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay movimientos que mostrar</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles y filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar movimientos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMovementType}
            onChange={(e) => setSelectedMovementType(e.target.value as MovementType | 'all')}
          >
            <option value="all">Todos los tipos</option>
            <option value="receipt">Recepción</option>
            <option value="consumption">Consumo</option>
            <option value="transfer">Transferencia</option>
            <option value="adjustment">Ajuste</option>
            <option value="waste">Residuo</option>
            <option value="production">Producción</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsLoading(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Historial de Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-left p-2">Material</th>
                  <th className="text-left p-2">Cantidad</th>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Origen</th>
                  <th className="text-left p-2">Destino</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMovements.map((movement) => (
                  <tr key={movement.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getMovementColor(movement.movement_type)}`}>
                          {getMovementIcon(movement.movement_type)}
                        </div>
                        <span className="text-sm">{getMovementLabel(movement.movement_type)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <Badge variant="outline">{movement.item_id}</Badge>
                        {movement.batch_id && (
                          <p className="text-xs text-gray-500 mt-1">Lote: {movement.batch_id}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <span className="font-medium">{movement.quantity.toLocaleString()}</span>
                        {movement.unit_cost && (
                          <p className="text-xs text-gray-500">
                            {formatCurrency(movement.unit_cost * movement.quantity)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-sm">{formatDate(movement.created_at)}</span>
                    </td>
                    <td className="p-2">
                      <span className="text-sm">{movement.from_location || '-'}</span>
                    </td>
                    <td className="p-2">
                      <span className="text-sm">{movement.to_location || '-'}</span>
                    </td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedMovement(movement)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay movimientos que mostrar</p>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredMovements.length)} de {filteredMovements.length} movimientos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
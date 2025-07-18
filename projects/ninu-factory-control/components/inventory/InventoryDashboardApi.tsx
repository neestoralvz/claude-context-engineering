// API-based inventory dashboard component for Ninu.mx Factory Control System
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  MapPin,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
  location: string;
  status: string;
  lastUpdated: string;
  supplier: string;
  description?: string;
}

interface InventoryResponse {
  success: boolean;
  data: {
    inventory: InventoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalItems: number;
      totalValue: number;
      totalStock: number;
      lowStockCount: number;
      categories: string[];
      averagePrice: number;
    };
  };
  timestamp: string;
}

// Inventory Statistics Card
function InventoryStatsCard({ 
  summary, 
  onRefresh, 
  loading 
}: { 
  summary: any; 
  onRefresh: () => void; 
  loading: boolean;
}) {
  const getStockStatus = (item: InventoryItem): 'critical' | 'low' | 'normal' => {
    if (item.stock <= item.minStock) return 'critical';
    if (item.stock <= item.minStock * 1.5) return 'low';
    return 'normal';
  };

  const criticalCount = summary?.inventory?.filter((item: InventoryItem) => getStockStatus(item) === 'critical').length || 0;
  const lowCount = summary?.inventory?.filter((item: InventoryItem) => getStockStatus(item) === 'low').length || 0;
  const normalCount = summary?.inventory?.filter((item: InventoryItem) => getStockStatus(item) === 'normal').length || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Resumen de Inventario</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summary?.totalItems || 0}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary?.categories?.length || 0}</div>
          <div className="text-sm text-gray-600">Categorías</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${summary?.totalValue?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-600">Valor Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{normalCount}</div>
          <div className="text-sm text-gray-600">Normal</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{lowCount}</div>
          <div className="text-sm text-gray-600">Stock Bajo</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          <div className="text-sm text-gray-600">Crítico</div>
        </div>
      </div>
    </Card>
  );
}

// Stock Alerts Card
function StockAlertsCard({ 
  inventory, 
  onRefresh, 
  loading 
}: { 
  inventory: InventoryItem[]; 
  onRefresh: () => void; 
  loading: boolean;
}) {
  const getStockStatus = (item: InventoryItem): 'critical' | 'low' | 'normal' => {
    if (item.stock <= item.minStock) return 'critical';
    if (item.stock <= item.minStock * 1.5) return 'low';
    return 'normal';
  };

  const alerts = inventory.filter(item => getStockStatus(item) !== 'normal');
  const criticalCount = alerts.filter(item => getStockStatus(item) === 'critical').length;
  const lowStockCount = alerts.filter(item => getStockStatus(item) === 'low').length;

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getAlertBadgeVariant = (status: string) => {
    switch (status) {
      case 'critical':
        return 'destructive';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">Alertas de Stock</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm">Crítico: {criticalCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm">Bajo: {lowStockCount}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No hay alertas de stock</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const status = getStockStatus(alert);
            return (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getAlertIcon(status)}
                  <div>
                    <div className="font-medium">{alert.name}</div>
                    <div className="text-sm text-gray-600">{alert.location}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getAlertBadgeVariant(status)}>
                    {alert.stock} {alert.unit}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    Min: {alert.minStock}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

// Inventory Summary Table
function InventorySummaryTable({ 
  inventory, 
  onRefresh, 
  loading 
}: { 
  inventory: InventoryItem[]; 
  onRefresh: () => void; 
  loading: boolean;
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStockStatus = (item: InventoryItem): 'critical' | 'low' | 'normal' => {
    if (item.stock <= item.minStock) return 'critical';
    if (item.stock <= item.minStock * 1.5) return 'low';
    return 'normal';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || getStockStatus(item) === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(inventory.map(item => item.category)));
  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.stock * item.price), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'normal':
        return 'secondary';
      case 'low':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Inventario Detallado</h3>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="low">Stock Bajo</option>
            <option value="critical">Crítico</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Items Mostrados: {filteredInventory.length}</span>
          <span className="text-sm font-medium">Valor Total: ${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Producto</th>
              <th className="text-left p-2">Categoría</th>
              <th className="text-left p-2">Ubicación</th>
              <th className="text-right p-2">Stock</th>
              <th className="text-right p-2">Precio</th>
              <th className="text-right p-2">Valor</th>
              <th className="text-center p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No hay items que coincidan con los filtros
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const status = getStockStatus(item);
                const itemValue = item.stock * item.price;
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-600">{item.supplier}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {item.location}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="font-medium">{item.stock}</div>
                      <div className="text-xs text-gray-600">{item.unit}</div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="font-medium">${item.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">por {item.unit}</div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="font-medium">${itemValue.toLocaleString()}</div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(status)}
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {status}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Main Inventory Dashboard Component
export default function InventoryDashboardApi() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data: InventoryResponse = await response.json();
      
      if (data.success) {
        setInventory(data.data.inventory);
        setSummary(data.data.summary);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading && !inventory.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Cargando datos de inventario...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 font-medium mb-2">Error al cargar inventario</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchInventory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="font-medium">Conectado al sistema de inventario</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">API activa</span>
        </div>
      </div>

      {/* Top Row - Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryStatsCard 
          summary={{ ...summary, inventory }} 
          onRefresh={fetchInventory} 
          loading={loading} 
        />
        <StockAlertsCard 
          inventory={inventory} 
          onRefresh={fetchInventory} 
          loading={loading} 
        />
      </div>

      {/* Bottom Row - Detailed Inventory */}
      <InventorySummaryTable 
        inventory={inventory} 
        onRefresh={fetchInventory} 
        loading={loading} 
      />
    </div>
  );
}
// Real-time inventory dashboard component for Ninu.mx Factory Control System
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  useInventorySocket, 
  useInventoryStats, 
  useStockAlerts, 
  useRecentTransactions,
  useInventorySummary,
  type InventoryItem,
  type StockAlert,
  type InventoryTransaction 
} from '@/lib/hooks/useInventorySocket';
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
  AlertCircle
} from 'lucide-react';

// Inventory Statistics Card
function InventoryStatsCard() {
  const { stats, refresh, isConnected } = useInventoryStats();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Resumen de Inventario</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={!isConnected}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total_materials}</div>
          <div className="text-sm text-gray-600">Materiales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.total_locations}</div>
          <div className="text-sm text-gray-600">Ubicaciones</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${stats.total_value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Valor Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.normal_items}</div>
          <div className="text-sm text-gray-600">Normal</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_items}</div>
          <div className="text-sm text-gray-600">Stock Bajo</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.critical_items}</div>
          <div className="text-sm text-gray-600">Crítico</div>
        </div>
      </div>
    </Card>
  );
}

// Stock Alerts Card
function StockAlertsCard() {
  const { alerts, refresh, isConnected, criticalCount, lowStockCount, outOfStockCount } = useStockAlerts();

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'low':
        return 'secondary';
      case 'out_of_stock':
        return 'destructive';
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
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={!isConnected}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
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
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-sm">Agotado: {outOfStockCount}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No hay alertas de stock</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getAlertIcon(alert.alert_level)}
                <div>
                  <div className="font-medium">{alert.material_name}</div>
                  <div className="text-sm text-gray-600">{alert.location_name}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getAlertBadgeVariant(alert.alert_level)}>
                  {alert.quantity_available} {alert.alert_level}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  Reorden: {alert.reorder_point}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// Recent Transactions Card
function RecentTransactionsCard() {
  const { transactions, refresh, isConnected } = useRecentTransactions(8);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'issue':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'transfer':
        return <MapPin className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'secondary';
      case 'issue':
        return 'destructive';
      case 'adjustment':
        return 'default';
      case 'transfer':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTransactionType = (type: string) => {
    const types = {
      receipt: 'Recibo',
      issue: 'Salida',
      adjustment: 'Ajuste',
      transfer: 'Transferencia',
      production: 'Producción'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={!isConnected}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <p>No hay transacciones recientes</p>
          </div>
        ) : (
          transactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction.transaction_type)}
                <div>
                  <div className="font-medium">{transaction.material_name}</div>
                  <div className="text-sm text-gray-600">{transaction.location_name}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getTransactionBadgeVariant(transaction.transaction_type)}>
                  {formatTransactionType(transaction.transaction_type)}
                </Badge>
                <div className="text-sm font-medium mt-1">
                  {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit_of_measure}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(transaction.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// Inventory Summary Table
function InventorySummaryTable() {
  const [stockFilter, setStockFilter] = useState<string>('all');
  const { inventory, refresh, isConnected, totalItems, totalValue } = useInventorySummary(
    stockFilter !== 'all' ? { stockStatus: stockFilter as any } : undefined
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
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
      case 'out_of_stock':
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
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="low">Stock Bajo</option>
            <option value="critical">Crítico</option>
            <option value="out_of_stock">Agotado</option>
          </select>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={!isConnected}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Items: {totalItems}</span>
          <span className="text-sm font-medium">Valor Total: ${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Material</th>
              <th className="text-left p-2">Ubicación</th>
              <th className="text-right p-2">Disponible</th>
              <th className="text-right p-2">Reservado</th>
              <th className="text-right p-2">Valor</th>
              <th className="text-center p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {stockFilter === 'all' ? 'No hay datos de inventario' : 'No hay items con este filtro'}
                </td>
              </tr>
            ) : (
              inventory.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{item.material_name}</div>
                      <div className="text-xs text-gray-600">{item.material_code}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {item.location_name}
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <div className="font-medium">{item.quantity_available}</div>
                    <div className="text-xs text-gray-600">{item.unit_of_measure}</div>
                  </td>
                  <td className="p-2 text-right">
                    <div className="font-medium">{item.quantity_reserved}</div>
                    <div className="text-xs text-gray-600">{item.unit_of_measure}</div>
                  </td>
                  <td className="p-2 text-right">
                    <div className="font-medium">${item.total_value?.toLocaleString() || '0'}</div>
                    <div className="text-xs text-gray-600">${item.unit_cost?.toFixed(2) || '0'}/u</div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(item.stock_status)}
                      <Badge variant={getStatusBadgeVariant(item.stock_status)}>
                        {item.stock_status}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Main Inventory Dashboard Component
export default function InventoryDashboard() {
  const { isConnected, isLoading } = useInventorySocket();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Conectando al sistema de inventario...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">
            {isConnected ? 'Conectado al sistema de inventario' : 'Desconectado del sistema'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">Tiempo real activo</span>
        </div>
      </div>

      {/* Top Row - Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryStatsCard />
        <StockAlertsCard />
      </div>

      {/* Middle Row - Recent Transactions */}
      <RecentTransactionsCard />

      {/* Bottom Row - Detailed Inventory */}
      <InventorySummaryTable />
    </div>
  );
}
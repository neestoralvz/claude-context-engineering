'use client';

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Package, AlertTriangle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryCardProps {
  inventoryItem: InventoryItem;
  onClick?: (item: InventoryItem) => void;
  showActions?: boolean;
}

export function InventoryCard({ 
  inventoryItem, 
  onClick, 
  showActions = false 
}: InventoryCardProps) {
  const getStockStatus = () => {
    const { currentStock, minStock, maxStock } = inventoryItem;
    
    if (currentStock <= minStock) {
      return { 
        label: 'Stock Crítico', 
        variant: 'status' as const,
        status: 'critical',
        icon: AlertTriangle 
      };
    } else if (currentStock <= minStock * 1.5) {
      return { 
        label: 'Stock Bajo', 
        variant: 'status' as const,
        status: 'warning',
        icon: TrendingDown 
      };
    } else if (currentStock >= maxStock * 0.9) {
      return { 
        label: 'Stock Alto', 
        variant: 'status' as const,
        status: 'secondary',
        icon: TrendingUp 
      };
    }
    return { 
      label: 'Stock Normal', 
      variant: 'default' as const,
      icon: Package 
    };
  };

  const getExpirationStatus = () => {
    if (!inventoryItem.expirationDate) return null;
    
    const daysToExpiry = Math.ceil(
      (inventoryItem.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysToExpiry <= 0) {
      return { label: 'Caducado', variant: 'destructive' as const };
    } else if (daysToExpiry <= 7) {
      return { label: 'Caduca Pronto', variant: 'destructive' as const };
    } else if (daysToExpiry <= 30) {
      return { label: 'Revise Fecha', variant: 'secondary' as const };
    }
    return { label: 'Vigente', variant: 'default' as const };
  };

  const getStockPercentage = () => {
    const { currentStock, minStock, maxStock } = inventoryItem;
    if (maxStock === minStock) return 100;
    return Math.min(100, Math.max(0, 
      ((currentStock - minStock) / (maxStock - minStock)) * 100
    ));
  };

  const getTypeIcon = () => {
    switch (inventoryItem.type) {
      case 'raw_material':
        return '🧪';
      case 'packaging':
        return '📦';
      case 'finished_product':
        return '✅';
      default:
        return '📋';
    }
  };

  const stockStatus = getStockStatus();
  const expirationStatus = getExpirationStatus();
  const stockPercentage = getStockPercentage();
  const StatusIcon = stockStatus.icon;

  return (
    <Card
      className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={() => onClick?.(inventoryItem)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon()}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{inventoryItem.name}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {inventoryItem.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <StatusIcon className="h-4 w-4" />
          <Badge variant={stockStatus.variant}>
            {stockStatus.label}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {/* Stock Information */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Stock Actual</span>
            <span className="text-sm font-bold text-gray-900">
              {inventoryItem.currentStock.toLocaleString()} {inventoryItem.unit}
            </span>
          </div>
          
          {/* Stock Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                stockPercentage <= 25 
                  ? 'bg-red-500' 
                  : stockPercentage <= 50 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Min: {inventoryItem.minStock}</span>
            <span>Max: {inventoryItem.maxStock}</span>
          </div>
        </div>

        {/* Cost and Supplier */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Costo</span>
            <p className="font-medium">${inventoryItem.cost.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-500">Proveedor</span>
            <p className="font-medium truncate">{inventoryItem.supplier}</p>
          </div>
        </div>

        {/* Expiration Status */}
        {expirationStatus && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Vencimiento</span>
            </div>
            <Badge variant={expirationStatus.variant}>
              {expirationStatus.label}
            </Badge>
          </div>
        )}

        {/* Last Restocked */}
        <div className="text-xs text-gray-500">
          Último restock: {inventoryItem.lastRestocked.toLocaleDateString('es-MX')}
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="flex-1 text-sm py-2 px-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
              Ajustar Stock
            </button>
            <button className="flex-1 text-sm py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              Ver Historial
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
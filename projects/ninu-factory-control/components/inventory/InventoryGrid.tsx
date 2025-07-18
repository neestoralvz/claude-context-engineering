'use client';

import { useState, useMemo } from 'react';
import { InventoryCard } from './InventoryCard';
import { InventoryItem } from '../../types';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface InventoryGridProps {
  inventoryItems: InventoryItem[];
  onItemClick?: (item: InventoryItem) => void;
  showActions?: boolean;
  showFilters?: boolean;
}

type SortField = 'name' | 'currentStock' | 'cost' | 'lastRestocked';
type SortOrder = 'asc' | 'desc';
type StockFilter = 'all' | 'critical' | 'low' | 'normal' | 'high';

export function InventoryGrid({
  inventoryItems,
  onItemClick,
  showActions = false,
  showFilters = true
}: InventoryGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | InventoryItem['type']>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const getStockStatus = (item: InventoryItem): StockFilter => {
    const { currentStock, minStock, maxStock } = item;
    
    if (currentStock <= minStock) return 'critical';
    if (currentStock <= minStock * 1.5) return 'low';
    if (currentStock >= maxStock * 0.9) return 'high';
    return 'normal';
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = inventoryItems.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = selectedType === 'all' || item.type === selectedType;
      
      // Stock status filter
      const stockStatus = getStockStatus(item);
      const matchesStock = stockFilter === 'all' || stockStatus === stockFilter;
      
      return matchesSearch && matchesType && matchesStock;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'currentStock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'lastRestocked':
          aValue = a.lastRestocked.getTime();
          bValue = b.lastRestocked.getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [inventoryItems, searchTerm, selectedType, stockFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const getStockFilterCounts = () => {
    const counts = {
      all: inventoryItems.length,
      critical: 0,
      low: 0,
      normal: 0,
      high: 0
    };

    inventoryItems.forEach(item => {
      const status = getStockStatus(item);
      counts[status]++;
    });

    return counts;
  };

  const stockCounts = getStockFilterCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Inventario
          </h2>
          <p className="text-sm text-gray-500">
            {filteredAndSortedItems.length} de {inventoryItems.length} elementos
          </p>
        </div>
        
        {showFilters && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filtros activos</span>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Material
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="raw_material">Materia Prima</option>
                <option value="packaging">Empaque</option>
                <option value="finished_product">Producto Terminado</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Stock
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos ({stockCounts.all})</option>
                <option value="critical">Stock Crítico ({stockCounts.critical})</option>
                <option value="low">Stock Bajo ({stockCounts.low})</option>
                <option value="normal">Stock Normal ({stockCounts.normal})</option>
                <option value="high">Stock Alto ({stockCounts.high})</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Nombre</option>
                  <option value="currentStock">Stock Actual</option>
                  <option value="cost">Costo</option>
                  <option value="lastRestocked">Último Restock</option>
                </select>
                <button
                  onClick={() => handleSort(sortField)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getSortIcon(sortField) || <SortAsc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <InventoryCard
              key={item.id}
              inventoryItem={item}
              onClick={onItemClick}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            📦
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No se encontraron elementos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedType !== 'all' || stockFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay elementos de inventario disponibles'
            }
          </p>
          {(searchTerm || selectedType !== 'all' || stockFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setStockFilter('all');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredAndSortedItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredAndSortedItems.length}
              </div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredAndSortedItems.filter(item => getStockStatus(item) === 'critical').length}
              </div>
              <div className="text-sm text-gray-500">Stock Crítico</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAndSortedItems.filter(item => getStockStatus(item) === 'low').length}
              </div>
              <div className="text-sm text-gray-500">Stock Bajo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${filteredAndSortedItems.reduce((sum, item) => sum + (item.currentStock * item.cost), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Valor Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
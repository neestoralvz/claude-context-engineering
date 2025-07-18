'use client';

import { useState, useMemo } from 'react';
import { CustomerCard } from './CustomerCard';
import { Customer } from '../../types';
import { Search, Filter, SortAsc, SortDesc, Users, Building, Package, CreditCard } from 'lucide-react';

interface CustomerGridProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
  showActions?: boolean;
  showFilters?: boolean;
}

type SortField = 'name' | 'total_spent' | 'total_orders' | 'last_order_date' | 'registration_date';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | Customer['status'];
type TypeFilter = 'all' | Customer['type'];

export function CustomerGrid({
  customers,
  onCustomerClick,
  showActions = false,
  showFilters = true
}: CustomerGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      // Search filter
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      // Type filter
      const matchesType = typeFilter === 'all' || customer.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort customers
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'total_spent':
          aValue = a.total_spent;
          bValue = b.total_spent;
          break;
        case 'total_orders':
          aValue = a.total_orders;
          bValue = b.total_orders;
          break;
        case 'last_order_date':
          aValue = a.last_order_date ? new Date(a.last_order_date).getTime() : 0;
          bValue = b.last_order_date ? new Date(b.last_order_date).getTime() : 0;
          break;
        case 'registration_date':
          aValue = new Date(a.registration_date).getTime();
          bValue = new Date(b.registration_date).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchTerm, statusFilter, typeFilter, sortField, sortOrder]);

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

  const getStatusCounts = () => {
    const counts = {
      all: customers.length,
      active: 0,
      vip: 0,
      inactive: 0,
      blocked: 0
    };

    customers.forEach(customer => {
      counts[customer.status]++;
    });

    return counts;
  };

  const getTypeCounts = () => {
    const counts = {
      all: customers.length,
      individual: 0,
      business: 0,
      distributor: 0,
      retailer: 0
    };

    customers.forEach(customer => {
      counts[customer.type]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const typeCounts = getTypeCounts();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      notation: 'compact'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Clientes Ninu.mx
          </h2>
          <p className="text-sm text-gray-500">
            {filteredAndSortedCustomers.length} de {customers.length} clientes
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
              placeholder="Buscar por nombre, email, empresa o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Cliente
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos ({statusCounts.all})</option>
                <option value="active">Activos ({statusCounts.active})</option>
                <option value="vip">VIP ({statusCounts.vip})</option>
                <option value="inactive">Inactivos ({statusCounts.inactive})</option>
                <option value="blocked">Bloqueados ({statusCounts.blocked})</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cliente
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos ({typeCounts.all})</option>
                <option value="individual">Individual ({typeCounts.individual})</option>
                <option value="business">Empresa ({typeCounts.business})</option>
                <option value="distributor">Distribuidor ({typeCounts.distributor})</option>
                <option value="retailer">Detallista ({typeCounts.retailer})</option>
              </select>
            </div>

            {/* Sort Field */}
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
                  <option value="total_spent">Total Gastado</option>
                  <option value="total_orders">Total Órdenes</option>
                  <option value="last_order_date">Última Orden</option>
                  <option value="registration_date">Fecha Registro</option>
                </select>
                <button
                  onClick={() => handleSort(sortField)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getSortIcon(sortField) || <SortAsc className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros Rápidos
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setStatusFilter('vip');
                    setSortField('total_spent');
                    setSortOrder('desc');
                  }}
                  className="px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100"
                >
                  VIP
                </button>
                <button
                  onClick={() => {
                    setSortField('last_order_date');
                    setSortOrder('desc');
                  }}
                  className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                >
                  Recientes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredAndSortedCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={onCustomerClick}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No se encontraron clientes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay clientes registrados en el sistema'
            }
          </p>
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredAndSortedCustomers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredAndSortedCustomers.length}
              </div>
              <div className="text-sm text-gray-500">Total Clientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedCustomers.filter(c => c.status === 'vip').length}
              </div>
              <div className="text-sm text-gray-500">Clientes VIP</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredAndSortedCustomers.filter(c => c.type === 'distributor').length}
              </div>
              <div className="text-sm text-gray-500">Distribuidores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(filteredAndSortedCustomers.reduce((sum, customer) => sum + customer.total_spent, 0))}
              </div>
              <div className="text-sm text-gray-500">Valor Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredAndSortedCustomers.reduce((sum, customer) => sum + customer.average_order_value, 0) / filteredAndSortedCustomers.length)}
              </div>
              <div className="text-sm text-gray-500">Orden Promedio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
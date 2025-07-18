'use client';

import { useState, useEffect } from 'react';
import { CustomerGrid } from '../../components/customers/CustomerGrid';
import { Customer } from '../../types';
import { mockCustomerData } from '../../lib/mock-customer-data';

export default function ClientesPage() {
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadCustomerData = async () => {
      setLoading(true);
      
      // In production, this would be an actual API call
      // const response = await fetch('/api/customers');
      // const data = await response.json();
      
      // For now, use mock data with a slight delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCustomerData(mockCustomerData);
      setLoading(false);
    };

    loadCustomerData();
  }, []);

  const handleCustomerClick = (customer: Customer) => {
    console.log('Customer clicked:', customer);
    // In production, this could navigate to customer detail page
    // router.push(`/clientes/${customer.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-ninu-primary">
          Gestión de Clientes Ninu.mx
        </h1>
        <p className="text-gray-600">
          Control completo de clientes: distribuidores, empresas y consumidores finales
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Clientes</p>
              <p className="text-lg font-semibold text-gray-900">{customerData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-semibold">⭐</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Clientes VIP</p>
              <p className="text-lg font-semibold text-gray-900">
                {customerData.filter(c => c.status === 'vip').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-semibold">📦</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Distribuidores</p>
              <p className="text-lg font-semibold text-gray-900">
                {customerData.filter(c => c.type === 'distributor').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  notation: 'compact'
                }).format(customerData.reduce((sum, customer) => sum + customer.total_spent, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      <CustomerGrid 
        customers={customerData}
        onCustomerClick={handleCustomerClick}
        showFilters={true}
        showActions={true}
      />
    </div>
  );
}
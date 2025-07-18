'use client';

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { User, Building, Phone, Mail, Calendar, CreditCard, TrendingUp, Package } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
  showActions?: boolean;
}

export function CustomerCard({ 
  customer, 
  onClick, 
  showActions = false 
}: CustomerCardProps) {
  const getStatusBadge = () => {
    switch (customer.status) {
      case 'active':
        return { 
          label: 'Activo', 
          variant: 'status' as const,
          status: 'success'
        };
      case 'vip':
        return { 
          label: 'VIP', 
          variant: 'status' as const,
          status: 'warning'
        };
      case 'inactive':
        return { 
          label: 'Inactivo', 
          variant: 'status' as const,
          status: 'secondary'
        };
      case 'blocked':
        return { 
          label: 'Bloqueado', 
          variant: 'status' as const,
          status: 'critical'
        };
      default:
        return { 
          label: 'Desconocido', 
          variant: 'default' as const
        };
    }
  };

  const getTypeBadge = () => {
    switch (customer.type) {
      case 'individual':
        return { label: 'Individual', icon: User };
      case 'business':
        return { label: 'Empresa', icon: Building };
      case 'distributor':
        return { label: 'Distribuidor', icon: Package };
      case 'retailer':
        return { label: 'Detallista', icon: Building };
      default:
        return { label: 'Individual', icon: User };
    }
  };

  const getPricingTierColor = () => {
    switch (customer.pricing_tier) {
      case 'vip':
        return 'text-yellow-600 bg-yellow-50';
      case 'wholesale':
        return 'text-blue-600 bg-blue-50';
      case 'custom':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const statusBadge = getStatusBadge();
  const typeBadge = getTypeBadge();
  const TypeIcon = typeBadge.icon;

  return (
    <Card
      className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={() => onClick?.(customer)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TypeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
            {customer.company && (
              <p className="text-sm text-gray-600">{customer.company}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">{typeBadge.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getPricingTierColor()}`}>
                {customer.pricing_tier.charAt(0).toUpperCase() + customer.pricing_tier.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 truncate">{customer.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{customer.phone}</span>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Gastado</span>
              <p className="font-semibold text-green-600">
                {formatCurrency(customer.total_spent)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Órdenes Totales</span>
              <p className="font-semibold text-gray-900">
                {customer.total_orders}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Valor Promedio</span>
              <p className="font-semibold text-blue-600">
                {formatCurrency(customer.average_order_value)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Límite Crédito</span>
              <p className="font-semibold text-gray-900">
                {formatCurrency(customer.credit_limit)}
              </p>
            </div>
          </div>
        </div>

        {/* Last Order Info */}
        {customer.last_order_date && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Última orden:</span>
            </div>
            <span className="text-gray-700">
              {new Date(customer.last_order_date).toLocaleDateString('es-MX')}
            </span>
          </div>
        )}

        {/* Address */}
        <div className="text-xs text-gray-500">
          <div className="flex items-start space-x-1">
            <span>📍</span>
            <span>
              {customer.address.city}, {customer.address.state}
            </span>
          </div>
        </div>

        {/* Payment Terms */}
        {customer.payment_terms > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">
              Crédito: {customer.payment_terms} días
            </span>
          </div>
        )}

        {/* Customer Value Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">Valor del Cliente</span>
          </div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => {
              const filled = customer.total_spent > (i + 1) * 10000;
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    filled ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button className="flex-1 text-sm py-2 px-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
              Ver Órdenes
            </button>
            <button className="flex-1 text-sm py-2 px-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
              Nueva Orden
            </button>
            <button className="flex-1 text-sm py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              Contactar
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
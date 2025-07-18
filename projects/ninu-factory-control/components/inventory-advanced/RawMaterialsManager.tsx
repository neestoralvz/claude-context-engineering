'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Thermometer,
  Users,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import { RawMaterial, Supplier } from '../../types';

// Interfaz para filtros
interface MaterialFilters {
  search: string;
  category: string;
  supplier: string;
  status: 'all' | 'active' | 'inactive' | 'discontinued';
  criticalityLevel: 'all' | 'low' | 'medium' | 'high' | 'critical';
}

// Datos mock para demostración
const mockMaterials: RawMaterial[] = [
  {
    id: 'rm-001',
    code: 'ALK-001',
    name: 'Alcohol Etílico 96%',
    description: 'Alcohol etílico de alta pureza para formulaciones desinfectantes',
    category: 'Solventes',
    supplier: 'Petroquímica Mexicana S.A.',
    supplier_id: 'SUP-001',
    supplier_name: 'Petroquímica Mexicana S.A.',
    unit_of_measure: 'L',
    unit_cost: 45.50,
    current_stock: 2450,
    minimum_stock: 500,
    maximum_stock: 5000,
    quality_grade: 'Técnico',
    expiration_tracking: true,
    last_purchase_date: '2024-01-15',
    status: 'active',
    created_at: '2023-01-01',
    updated_at: '2024-01-15'
  },
  {
    id: 'rm-002',
    code: 'HYP-001',
    name: 'Hipoclorito de Sodio 12%',
    description: 'Solución de hipoclorito de sodio para desinfección',
    category: 'Desinfectantes',
    supplier: 'Químicos del Golfo S.A.',
    supplier_id: 'SUP-002',
    supplier_name: 'Químicos del Golfo S.A.',
    unit_of_measure: 'L',
    unit_cost: 32.00,
    current_stock: 1800,
    minimum_stock: 300,
    maximum_stock: 3000,
    quality_grade: 'Industrial',
    expiration_tracking: true,
    last_purchase_date: '2024-01-10',
    status: 'active',
    created_at: '2023-01-01',
    updated_at: '2024-01-10'
  },
  {
    id: 'rm-003',
    code: 'TEN-001',
    name: 'Tensioactivo Aniónico',
    description: 'Tensioactivo aniónico para formulaciones de limpieza',
    category: 'Tensioactivos',
    supplier: 'Surfactantes Mexicanos S.A.',
    supplier_id: 'SUP-003',
    supplier_name: 'Surfactantes Mexicanos S.A.',
    unit_of_measure: 'kg',
    unit_cost: 85.00,
    current_stock: 450,
    minimum_stock: 100,
    maximum_stock: 800,
    quality_grade: 'Cosmético',
    expiration_tracking: false,
    last_purchase_date: '2024-01-05',
    status: 'active',
    created_at: '2023-01-01',
    updated_at: '2024-01-05'
  }
];

export function RawMaterialsManager() {
  const [materials, setMaterials] = useState<RawMaterial[]>(mockMaterials);
  const [filteredMaterials, setFilteredMaterials] = useState<RawMaterial[]>(mockMaterials);
  const [filters, setFilters] = useState<MaterialFilters>({
    search: '',
    category: '',
    supplier: '',
    status: 'all',
    criticalityLevel: 'all'
  });
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Aplicar filtros
  useEffect(() => {
    let filtered = materials;

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        material.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        material.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter(material => material.category === filters.category);
    }

    // Filtro por proveedor
    if (filters.supplier) {
      filtered = filtered.filter(material => material.supplier_name === filters.supplier);
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(material => material.status === filters.status);
    }

    setFilteredMaterials(filtered);
  }, [materials, filters]);

  // Obtener lista de categorías únicas
  const categories = [...new Set(materials.map(m => m.category))];
  const suppliers = [...new Set(materials.map(m => m.supplier_name))];

  // Función para obtener el estado del stock
  const getStockStatus = (material: RawMaterial) => {
    if (material.current_stock <= material.minimum_stock) {
      return { status: 'critical', label: 'Crítico', color: 'text-red-600' };
    } else if (material.current_stock <= material.minimum_stock * 1.5) {
      return { status: 'low', label: 'Bajo', color: 'text-orange-600' };
    } else if (material.current_stock >= material.maximum_stock * 0.9) {
      return { status: 'high', label: 'Alto', color: 'text-blue-600' };
    } else {
      return { status: 'normal', label: 'Normal', color: 'text-green-600' };
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Función para refrescar datos
  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar materiales..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          {/* Filtros */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.supplier}
            onChange={(e) => setFilters({...filters, supplier: e.target.value})}
          >
            <option value="">Todos los proveedores</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value as MaterialFilters['status']})}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="discontinued">Discontinuado</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <Package className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="default" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Material
          </Button>
        </div>
      </div>

      {/* Tabla de materiales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Gestión de Materias Primas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Código</th>
                  <th className="text-left p-2">Material</th>
                  <th className="text-left p-2">Categoría</th>
                  <th className="text-left p-2">Stock Actual</th>
                  <th className="text-left p-2">Estado Stock</th>
                  <th className="text-left p-2">Proveedor</th>
                  <th className="text-left p-2">Costo Unitario</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => {
                  const stockStatus = getStockStatus(material);
                  return (
                    <tr key={material.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Badge variant="outline">{material.code}</Badge>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-gray-600">{material.description}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{material.category}</Badge>
                      </td>
                      <td className="p-2">
                        <div>
                          <span className="font-medium">{material.current_stock.toLocaleString()}</span>
                          <span className="text-sm text-gray-500 ml-1">{material.unit_of_measure}</span>
                          <p className="text-xs text-gray-500">
                            Min: {material.minimum_stock} | Max: {material.maximum_stock}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            stockStatus.status === 'critical' ? 'bg-red-500' :
                            stockStatus.status === 'low' ? 'bg-orange-500' :
                            stockStatus.status === 'high' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`} />
                          <span className={`text-sm ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="text-sm font-medium">{material.supplier_name}</p>
                          <p className="text-xs text-gray-500">{material.supplier_id}</p>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-medium">{formatCurrency(material.unit_cost)}</span>
                        <p className="text-xs text-gray-500">por {material.unit_of_measure}</p>
                      </td>
                      <td className="p-2">
                        <Badge variant={
                          material.status === 'active' ? 'default' :
                          material.status === 'inactive' ? 'secondary' :
                          'destructive'
                        }>
                          {material.status.charAt(0).toUpperCase() + material.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedMaterial(material)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron materiales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Materiales</p>
                <p className="text-2xl font-bold text-blue-600">{filteredMaterials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Stock Crítico</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredMaterials.filter(m => getStockStatus(m).status === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Proveedores</p>
                <p className="text-2xl font-bold text-green-600">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
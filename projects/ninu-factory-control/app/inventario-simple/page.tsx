'use client';

import { useState, useEffect } from 'react';
import { InventoryGrid } from '../../components/inventory/InventoryGrid';
import { InventoryItem } from '../../types';
import { Button } from '../../components/ui/button';
import { ArrowRight, Brain } from 'lucide-react';
import Link from 'next/link';

// Mock data for development - this would come from API in production
const mockInventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Tensioactivo Premium',
    type: 'raw_material',
    currentStock: 150,
    minStock: 50,
    maxStock: 300,
    unit: 'kg',
    cost: 45.50,
    supplier: 'QuimiPro S.A.',
    lastRestocked: new Date('2024-01-15'),
    expirationDate: new Date('2024-12-31')
  },
  {
    id: '2',
    name: 'Botellas 1L Transparentes',
    type: 'packaging',
    currentStock: 30,
    minStock: 100,
    maxStock: 500,
    unit: 'pzas',
    cost: 12.00,
    supplier: 'Envases MX',
    lastRestocked: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Detergente Multiusos 1L',
    type: 'finished_product',
    currentStock: 200,
    minStock: 50,
    maxStock: 400,
    unit: 'unidades',
    cost: 25.00,
    supplier: 'Producción Ninu',
    lastRestocked: new Date('2024-01-20'),
    expirationDate: new Date('2025-01-20')
  },
  {
    id: '4',
    name: 'Fragancia Floral Concentrada',
    type: 'raw_material',
    currentStock: 500,
    minStock: 100,
    maxStock: 600,
    unit: 'ml',
    cost: 180.00,
    supplier: 'Fragancias Pro',
    lastRestocked: new Date('2024-01-12'),
  },
  {
    id: '5',
    name: 'Etiquetas Multiusos',
    type: 'packaging',
    currentStock: 75,
    minStock: 200,
    maxStock: 1000,
    unit: 'pzas',
    cost: 0.80,
    supplier: 'Etiquetas Digitales',
    lastRestocked: new Date('2024-01-08'),
  },
  {
    id: '6',
    name: 'Sanitizante Gel 1L',
    type: 'finished_product',
    currentStock: 120,
    minStock: 80,
    maxStock: 300,
    unit: 'unidades',
    cost: 28.50,
    supplier: 'Producción Ninu',
    lastRestocked: new Date('2024-01-18'),
    expirationDate: new Date('2024-11-15')
  },
  {
    id: '7',
    name: 'Ácido Cítrico',
    type: 'raw_material',
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    unit: 'kg',
    cost: 85.00,
    supplier: 'Química Industrial MX',
    lastRestocked: new Date('2024-01-05'),
    expirationDate: new Date('2025-06-30')
  },
  {
    id: '8',
    name: 'Tapas Rosca 28mm',
    type: 'packaging',
    currentStock: 180,
    minStock: 150,
    maxStock: 800,
    unit: 'pzas',
    cost: 3.20,
    supplier: 'Envases MX',
    lastRestocked: new Date('2024-01-14'),
  },
  {
    id: '9',
    name: 'Kit Alberca 3 Piezas',
    type: 'finished_product',
    currentStock: 45,
    minStock: 30,
    maxStock: 150,
    unit: 'kits',
    cost: 125.00,
    supplier: 'Producción Ninu',
    lastRestocked: new Date('2024-01-22'),
    expirationDate: new Date('2025-12-31')
  },
  {
    id: '10',
    name: 'Colorante Azul',
    type: 'raw_material',
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    unit: 'L',
    cost: 220.00,
    supplier: 'Colorantes Especializados',
    lastRestocked: new Date('2024-01-03'),
    expirationDate: new Date('2024-08-15')
  }
];

export default function InventarioSimplePage() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadInventoryData = async () => {
      setLoading(true);
      
      // In production, this would be an actual API call
      // const response = await fetch('/api/inventory');
      // const data = await response.json();
      
      // For now, use mock data with a slight delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInventoryData(mockInventoryData);
      setLoading(false);
    };

    loadInventoryData();
  }, []);

  const handleInventoryClick = (item: InventoryItem) => {
    console.log('Inventory item clicked:', item);
    // In production, this could navigate to item detail page
    // router.push(`/inventarios/${item.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ninu-primary">
              Sistema de Inventarios Ninu.mx
            </h1>
            <p className="text-gray-600">
              Control total de materias primas, empaque y productos terminados
            </p>
          </div>
          <Link href="/inventarios">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Brain className="h-5 w-5 mr-2" />
              Dashboard Avanzado
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Inventory Grid */}
      <InventoryGrid 
        inventoryItems={inventoryData}
        onItemClick={handleInventoryClick}
        showFilters={true}
        showActions={true}
      />
    </div>
  );
}
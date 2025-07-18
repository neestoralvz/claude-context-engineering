import { InventoryItem, InventoryMovement, StockAlert } from '../types';

// Mock inventory data for development
export const mockInventoryData: any[] = [
  {
    id: '1',
    name: 'Tensioactivo Premium',
    category: 'raw_material',
    stock: 150,
    minStock: 50,
    maxStock: 300,
    unit: 'kg',
    price: 45.50,
    supplier: 'QuimiPro S.A.',
    lastUpdated: new Date('2024-01-15').toISOString(),
    location: 'A1-001',
    status: 'active',
    description: 'Tensioactivo premium para formulaciones'
  },
  {
    id: '2',
    name: 'Botellas 1L Transparentes',
    category: 'packaging',
    stock: 30,
    minStock: 100,
    maxStock: 500,
    unit: 'pzas',
    price: 12.00,
    supplier: 'Envases MX',
    lastUpdated: new Date('2024-01-10').toISOString(),
    location: 'A2-005',
    status: 'active',
    description: 'Botellas transparentes de 1L para productos líquidos'
  },
  {
    id: '3',
    name: 'Detergente Multiusos 1L',
    category: 'finished_product',
    stock: 200,
    minStock: 50,
    maxStock: 400,
    unit: 'unidades',
    price: 25.00,
    supplier: 'Producción Ninu',
    lastUpdated: new Date('2024-01-20').toISOString(),
    location: 'B1-010',
    status: 'active',
    description: 'Detergente multiusos de 1L para limpieza general'
  },
  {
    id: '4',
    name: 'Fragancia Floral Concentrada',
    category: 'raw_material',
    stock: 500,
    minStock: 100,
    maxStock: 600,
    unit: 'ml',
    price: 180.00,
    supplier: 'Fragancias Pro',
    lastUpdated: new Date('2024-01-12').toISOString(),
    location: 'A1-015',
    status: 'active',
    description: 'Fragancia floral concentrada para productos de limpieza'
  },
  {
    id: '5',
    name: 'Etiquetas Multiusos',
    category: 'packaging',
    stock: 75,
    minStock: 200,
    maxStock: 1000,
    unit: 'pzas',
    price: 0.80,
    supplier: 'Etiquetas Digitales',
    lastUpdated: new Date('2024-01-08').toISOString(),
    location: 'A2-020',
    status: 'active',
    description: 'Etiquetas multiusos para productos diversos'
  },
  {
    id: '6',
    name: 'Sanitizante Gel 1L',
    category: 'finished_product',
    stock: 120,
    minStock: 80,
    maxStock: 300,
    unit: 'unidades',
    price: 28.50,
    supplier: 'Producción Ninu',
    lastUpdated: new Date('2024-01-18').toISOString(),
    location: 'B1-025',
    status: 'active',
    description: 'Sanitizante gel antibacterial de 1L'
  },
  {
    id: '7',
    name: 'Ácido Cítrico',
    category: 'raw_material',
    stock: 25,
    minStock: 50,
    maxStock: 200,
    unit: 'kg',
    price: 85.00,
    supplier: 'Química Industrial MX',
    lastUpdated: new Date('2024-01-05').toISOString(),
    location: 'A1-030',
    status: 'active',
    description: 'Ácido cítrico para formulaciones'
  },
  {
    id: '8',
    name: 'Tapas Rosca 28mm',
    category: 'packaging',
    stock: 180,
    minStock: 150,
    maxStock: 800,
    unit: 'pzas',
    price: 3.20,
    supplier: 'Envases MX',
    lastUpdated: new Date('2024-01-14').toISOString(),
    location: 'A2-035',
    status: 'active',
    description: 'Tapas rosca de 28mm para botellas'
  },
  {
    id: '9',
    name: 'Kit Alberca 3 Piezas',
    category: 'finished_product',
    stock: 45,
    minStock: 30,
    maxStock: 150,
    unit: 'kits',
    price: 125.00,
    supplier: 'Producción Ninu',
    lastUpdated: new Date('2024-01-22').toISOString(),
    location: 'B1-040',
    status: 'active',
    description: 'Kit completo para mantenimiento de albercas'
  },
  {
    id: '10',
    name: 'Colorante Azul',
    category: 'raw_material',
    stock: 8,
    minStock: 15,
    maxStock: 50,
    unit: 'L',
    price: 220.00,
    supplier: 'Colorantes Especializados',
    lastUpdated: new Date('2024-01-03').toISOString(),
    location: 'A1-045',
    status: 'active',
    description: 'Colorante azul para productos de limpieza'
  },
  {
    id: '11',
    name: 'Jabón Líquido Manos 500ml',
    category: 'finished_product',
    stock: 85,
    minStock: 60,
    maxStock: 250,
    unit: 'unidades',
    price: 18.00,
    supplier: 'Producción Ninu',
    lastUpdated: new Date('2024-01-19').toISOString(),
    location: 'B1-050',
    status: 'active',
    description: 'Jabón líquido antibacterial para manos 500ml'
  },
  {
    id: '12',
    name: 'Preservante Natural',
    category: 'raw_material',
    stock: 12,
    minStock: 25,
    maxStock: 100,
    unit: 'kg',
    price: 320.00,
    supplier: 'BioQuímica Natural',
    lastUpdated: new Date('2024-01-02').toISOString(),
    location: 'A1-055',
    status: 'active',
    description: 'Preservante natural para productos ecológicos'
  }
];

// Mock inventory movements
export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    item_type: 'raw_material',
    item_id: '1',
    movement_type: 'consumption',
    quantity: 25,
    reason: 'Producción lote ML-001',
    reference_document: 'PROD-2024-001',
    from_location: 'Almacén A1',
    to_location: 'Reactor A',
    created_by: 'operator-1',
    created_at: '2024-01-20T08:30:00Z'
  },
  {
    id: 'mov-2',
    item_type: 'packaging',
    item_id: '2',
    movement_type: 'consumption',
    quantity: 50,
    reason: 'Envasado producto multiusos',
    reference_document: 'PACK-2024-015',
    from_location: 'Almacén Empaque',
    to_location: 'Estación Llenado',
    created_by: 'operator-2',
    created_at: '2024-01-20T10:15:00Z'
  },
  {
    id: 'mov-3',
    item_type: 'finished_product',
    item_id: '3',
    movement_type: 'production',
    quantity: 100,
    reason: 'Finalización lote ML-001',
    reference_document: 'PROD-2024-001',
    to_location: 'Almacén Productos',
    created_by: 'supervisor-1',
    created_at: '2024-01-20T14:45:00Z'
  }
];

// Mock stock alerts
export const mockStockAlerts: StockAlert[] = [
  {
    id: 'alert-1',
    item_type: 'packaging',
    item_id: '2',
    alert_type: 'low_stock',
    severity: 'critical',
    current_value: 30,
    threshold_value: 100,
    message: 'Stock crítico: Botellas 1L por debajo del mínimo',
    acknowledged: false,
    created_at: '2024-01-21T09:00:00Z'
  },
  {
    id: 'alert-2',
    item_type: 'packaging',
    item_id: '5',
    alert_type: 'low_stock',
    severity: 'critical',
    current_value: 75,
    threshold_value: 200,
    message: 'Stock crítico: Etiquetas Multiusos por debajo del mínimo',
    acknowledged: false,
    created_at: '2024-01-21T09:15:00Z'
  },
  {
    id: 'alert-3',
    item_type: 'raw_material',
    item_id: '7',
    alert_type: 'low_stock',
    severity: 'critical',
    current_value: 25,
    threshold_value: 50,
    message: 'Stock crítico: Ácido Cítrico por debajo del mínimo',
    acknowledged: false,
    created_at: '2024-01-21T11:30:00Z'
  },
  {
    id: 'alert-4',
    item_type: 'raw_material',
    item_id: '10',
    alert_type: 'expiring',
    severity: 'high',
    current_value: 200, // days to expiry
    threshold_value: 180,
    message: 'Colorante Azul próximo a vencer en 6 meses',
    acknowledged: true,
    acknowledged_by: 'supervisor-1',
    acknowledged_at: '2024-01-21T12:00:00Z',
    created_at: '2024-01-21T10:00:00Z'
  },
  {
    id: 'alert-5',
    item_type: 'raw_material',
    item_id: '12',
    alert_type: 'low_stock',
    severity: 'high',
    current_value: 12,
    threshold_value: 25,
    message: 'Stock bajo: Preservante Natural necesita restock',
    acknowledged: false,
    created_at: '2024-01-21T13:45:00Z'
  }
];

// Utility functions for inventory management
export const getStockStatus = (item: InventoryItem): 'critical' | 'low' | 'normal' | 'high' => {
  const { currentStock, minStock, maxStock } = item;
  
  if (currentStock <= minStock) return 'critical';
  if (currentStock <= minStock * 1.5) return 'low';
  if (currentStock >= maxStock * 0.9) return 'high';
  return 'normal';
};

export const getExpirationStatus = (expirationDate?: Date): 'expired' | 'expiring_soon' | 'expiring_month' | 'valid' | null => {
  if (!expirationDate) return null;
  
  const daysToExpiry = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysToExpiry <= 0) return 'expired';
  if (daysToExpiry <= 7) return 'expiring_soon';
  if (daysToExpiry <= 30) return 'expiring_month';
  return 'valid';
};

export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => total + (item.currentStock * item.cost), 0);
};

export const getItemsByStatus = (items: InventoryItem[], status: 'critical' | 'low' | 'normal' | 'high'): InventoryItem[] => {
  return items.filter(item => getStockStatus(item) === status);
};

export const getExpiringItems = (items: InventoryItem[], days: number = 30): InventoryItem[] => {
  return items.filter(item => {
    if (!item.expirationDate) return false;
    const daysToExpiry = Math.ceil((item.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= days && daysToExpiry > 0;
  });
};

// Integration with production system
export const getInventoryForProduction = (productId: string, quantity: number): { materials: InventoryItem[], sufficient: boolean } => {
  // This would integrate with recipe system to determine required materials
  // For now, return mock data
  const requiredMaterials = mockInventoryData.filter(item => 
    item.type === 'raw_material' && item.currentStock > item.minStock
  );
  
  return {
    materials: requiredMaterials,
    sufficient: requiredMaterials.length > 0
  };
};

export const updateStockAfterProduction = (productionData: { 
  consumed: { itemId: string, quantity: number }[], 
  produced: { itemId: string, quantity: number }[] 
}): InventoryMovement[] => {
  // This would create inventory movements for production consumption and output
  const movements: InventoryMovement[] = [];
  
  productionData.consumed.forEach(item => {
    movements.push({
      id: `mov-${Date.now()}-${item.itemId}`,
      item_type: 'raw_material',
      item_id: item.itemId,
      movement_type: 'consumption',
      quantity: item.quantity,
      reason: 'Consumo en producción',
      created_by: 'system',
      created_at: new Date().toISOString()
    });
  });
  
  productionData.produced.forEach(item => {
    movements.push({
      id: `mov-${Date.now()}-${item.itemId}`,
      item_type: 'finished_product',
      item_id: item.itemId,
      movement_type: 'production',
      quantity: item.quantity,
      reason: 'Producción completada',
      created_by: 'system',
      created_at: new Date().toISOString()
    });
  });
  
  return movements;
};
// Tipos temporales simplificados para evitar conflictos de build

// Mock customer data for Ninu.mx
export const mockCustomerData: any[] = [
  {
    id: 'cust-001',
    name: 'Oscar Torres',
    email: 'oscar.torres@email.com',
    phone: '+52-229-229-9399',
    company: 'Distribuidora del Golfo',
    address: {
      street: 'Av. Lázaro Cárdenas',
      number: '1500',
      neighborhood: 'Centro',
      city: 'Xalapa',
      state: 'Veracruz',
      postal_code: '91000',
      country: 'México',
      is_shipping_address: true,
      is_billing_address: true
    },
    type: 'distributor',
    status: 'vip',
    pricing_tier: 'wholesale',
    credit_limit: 250000,
    payment_terms: 30, // 30 días de crédito
    preferred_products: ['sanitizante-1l', 'multiusos-1l', 'detergente-2kg'],
    total_orders: 45,
    total_spent: 875000,
    average_order_value: 19444,
    last_order_date: '2024-01-18',
    registration_date: '2023-03-15',
    sales_rep: 'María González',
    notes: 'Cliente VIP - Distribuidor principal en zona Xalapa. Pedidos regulares cada 15 días.',
    created_at: '2023-03-15T08:00:00Z',
    updated_at: '2024-01-18T14:30:00Z'
  },
  {
    id: 'cust-002',
    name: 'Elia Díaz',
    email: 'elia.diaz@negociosdiaz.com',
    phone: '+52-228-7654321',
    company: 'Supermercado Díaz',
    address: {
      street: 'Calle 16 de Septiembre',
      number: '45',
      neighborhood: 'Centro',
      city: 'Coatepec',
      state: 'Veracruz',
      postal_code: '91500',
      country: 'México',
      is_shipping_address: true,
      is_billing_address: true
    },
    type: 'retailer',
    status: 'active',
    pricing_tier: 'standard',
    credit_limit: 85000,
    payment_terms: 15, // 15 días de crédito
    preferred_products: ['sanitizante-1l', 'jabon-500ml', 'multiusos-1l'],
    total_orders: 28,
    total_spent: 320000,
    average_order_value: 11428,
    last_order_date: '2024-01-20',
    registration_date: '2023-06-10',
    sales_rep: 'Carlos Mendoza',
    notes: 'Cliente constante - Supermercado familiar en Coatepec. Enfoque en productos de limpieza doméstica.',
    created_at: '2023-06-10T10:15:00Z',
    updated_at: '2024-01-20T16:45:00Z'
  },
  {
    id: 'cust-003',
    name: 'Néstor Álvarez',
    email: 'nestor.alvarez@gmail.com',
    phone: '+52-228-9876543',
    company: undefined,
    address: {
      street: 'Fraccionamiento Las Flores',
      number: '234',
      neighborhood: 'Las Flores',
      city: 'Xalapa',
      state: 'Veracruz',
      postal_code: '91020',
      country: 'México',
      is_shipping_address: true,
      is_billing_address: true
    },
    type: 'individual',
    status: 'active',
    pricing_tier: 'standard',
    credit_limit: 15000,
    payment_terms: 0, // Pago de contado
    preferred_products: ['sanitizante-1l', 'kit-alberca', 'multiusos-1l'],
    total_orders: 12,
    total_spent: 48000,
    average_order_value: 4000,
    last_order_date: '2024-01-15',
    registration_date: '2023-09-22',
    sales_rep: 'Ana López',
    notes: 'Cliente individual - Propietario de alberca. Compras estacionales principalmente en verano.',
    created_at: '2023-09-22T14:20:00Z',
    updated_at: '2024-01-15T11:10:00Z'
  },
  {
    id: 'cust-004',
    name: 'Hotel Plaza Veracruz',
    email: 'compras@hotelplaza.com',
    phone: '+52-229-1122334',
    company: 'Hotel Plaza Veracruz S.A.',
    address: {
      street: 'Boulevard Ávila Camacho',
      number: '2500',
      neighborhood: 'Zona Industrial',
      city: 'Veracruz',
      state: 'Veracruz',
      postal_code: '91900',
      country: 'México',
      is_shipping_address: true,
      is_billing_address: false
    },
    type: 'business',
    status: 'active',
    pricing_tier: 'custom',
    credit_limit: 180000,
    payment_terms: 30,
    preferred_products: ['sanitizante-1l', 'multiusos-1l', 'jabon-500ml', 'detergente-2kg'],
    total_orders: 22,
    total_spent: 450000,
    average_order_value: 20454,
    last_order_date: '2024-01-22',
    registration_date: '2023-05-08',
    sales_rep: 'Roberto Silva',
    notes: 'Hotel de 4 estrellas - Pedidos grandes mensuales. Productos para limpieza de habitaciones y áreas comunes.',
    created_at: '2023-05-08T09:30:00Z',
    updated_at: '2024-01-22T13:20:00Z'
  },
  {
    id: 'cust-005',
    name: 'Restaurante La Parroquia',
    email: 'gerencia@laparroquia.mx',
    phone: '+52-228-5566778',
    company: 'La Parroquia de Veracruz',
    address: {
      street: 'Av. Independencia',
      number: '1187',
      neighborhood: 'Centro Histórico',
      city: 'Veracruz',
      state: 'Veracruz',
      postal_code: '91700',
      country: 'México',
      is_shipping_address: true,
      is_billing_address: true
    },
    type: 'business',
    status: 'active',
    pricing_tier: 'wholesale',
    credit_limit: 75000,
    payment_terms: 15,
    preferred_products: ['sanitizante-1l', 'detergente-2kg', 'multiusos-1l'],
    total_orders: 18,
    total_spent: 195000,
    average_order_value: 10833,
    last_order_date: '2024-01-19',
    registration_date: '2023-08-14',
    sales_rep: 'María González',
    notes: 'Cadena de restaurantes icónica - Enfoque en higiene y limpieza de cocinas. Certificación COFEPRIS.',
    created_at: '2023-08-14T15:45:00Z',
    updated_at: '2024-01-19T10:30:00Z'
  }
];

// Mock customer orders
export const mockCustomerOrders: any[] = [
  {
    id: 'order-001',
    customer_id: 'cust-001',
    order_number: 'ORD-2024-001',
    status: 'delivered',
    priority: 'medium',
    order_date: '2024-01-18T08:00:00Z',
    requested_delivery_date: '2024-01-20T08:00:00Z',
    estimated_delivery_date: '2024-01-20T08:00:00Z',
    actual_delivery_date: '2024-01-20T10:30:00Z',
    items: [
      {
        id: 'item-001',
        product_id: 'sanitizante-1l',
        product_name: 'Sanitizante Ninu.mx 1L',
        quantity: 50,
        unit_price: 85.00,
        discount_percentage: 15, // Descuento wholesale
        line_total: 3612.50,
        production_batch_id: 'batch-2024-015',
        quality_approved: true,
        notes: undefined
      },
      {
        id: 'item-002',
        product_id: 'multiusos-1l',
        product_name: 'Limpiador Multiusos Ninu.mx 1L',
        quantity: 30,
        unit_price: 65.00,
        discount_percentage: 15,
        line_total: 1657.50,
        production_batch_id: 'batch-2024-012',
        quality_approved: true,
        notes: undefined
      }
    ],
    subtotal: 5270.00,
    discount_percentage: 15,
    discount_amount: 790.50,
    tax_amount: 716.80,
    shipping_cost: 250.00,
    total_amount: 5446.30,
    payment_status: 'paid',
    shipping_address: mockCustomerData[0].address,
    billing_address: mockCustomerData[0].address,
    special_instructions: 'Entrega en horario matutino por favor',
    internal_notes: 'Cliente VIP - Prioridad alta',
    created_by: 'maria.gonzalez',
    created_at: '2024-01-18T08:00:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  },
  {
    id: 'order-002',
    customer_id: 'cust-002',
    order_number: 'ORD-2024-002',
    status: 'in_production',
    priority: 'medium',
    order_date: '2024-01-20T16:45:00Z',
    requested_delivery_date: '2024-01-23T08:00:00Z',
    estimated_delivery_date: '2024-01-23T08:00:00Z',
    items: [
      {
        id: 'item-003',
        product_id: 'jabon-500ml',
        product_name: 'Jabón Líquido Ninu.mx 500ml',
        quantity: 24,
        unit_price: 45.00,
        discount_percentage: 0,
        line_total: 1080.00,
        quality_approved: false,
        notes: 'En producción'
      }
    ],
    subtotal: 1080.00,
    discount_percentage: 0,
    discount_amount: 0,
    tax_amount: 172.80,
    shipping_cost: 150.00,
    total_amount: 1402.80,
    payment_status: 'pending',
    shipping_address: mockCustomerData[1].address,
    billing_address: mockCustomerData[1].address,
    created_by: 'carlos.mendoza',
    created_at: '2024-01-20T16:45:00Z',
    updated_at: '2024-01-21T09:15:00Z'
  }
];

// Mock customer analytics
export const mockCustomerAnalytics: any = {
  total_customers: 156,
  active_customers: 142,
  new_customers_this_month: 8,
  vip_customers: 12,
  average_customer_value: 89450,
  customer_retention_rate: 87.5,
  churn_rate: 12.5,
  top_customers: [
    {
      customer_id: 'cust-001',
      customer_name: 'Oscar Torres',
      total_revenue: 875000,
      total_orders: 45,
      last_order_date: '2024-01-18',
      rank: 1
    },
    {
      customer_id: 'cust-004',
      customer_name: 'Hotel Plaza Veracruz',
      total_revenue: 450000,
      total_orders: 22,
      last_order_date: '2024-01-22',
      rank: 2
    },
    {
      customer_id: 'cust-002',
      customer_name: 'Elia Díaz',
      total_revenue: 320000,
      total_orders: 28,
      last_order_date: '2024-01-20',
      rank: 3
    }
  ],
  customer_distribution: {
    by_type: {
      'individual': 45,
      'business': 68,
      'distributor': 25,
      'retailer': 18
    },
    by_region: {
      'Xalapa': 78,
      'Veracruz': 35,
      'Coatepec': 22,
      'Otros': 21
    },
    by_tier: {
      'standard': 98,
      'wholesale': 32,
      'vip': 12,
      'custom': 14
    }
  },
  growth_metrics: {
    customer_acquisition_rate: 15.2,
    revenue_growth_rate: 23.8,
    order_frequency_trend: 8.5
  }
};

// Utility functions for customer management
export const getCustomerByid = (customerId: string): any | undefined => {
  return mockCustomerData.find(customer => customer.id === customerId);
};

export const getCustomerOrders = (customerId: string): any[] => {
  return mockCustomerOrders.filter(order => order.customer_id === customerId);
};

export const getCustomerStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'vip':
      return 'bg-yellow-100 text-yellow-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getCustomersByStatus = (status: string): any[] => {
  return mockCustomerData.filter(customer => customer.status === status);
};

export const getCustomersByType = (type: string): any[] => {
  return mockCustomerData.filter(customer => customer.type === type);
};

export const calculateCustomerLifetimeValue = (customer: any): number => {
  // Simple CLV calculation: average order value * order frequency * customer lifespan
  const avgOrdersPerMonth = customer.total_orders / 12; // Asumiendo 1 año de datos
  const estimatedLifespan = 36; // 3 años estimados
  return customer.average_order_value * avgOrdersPerMonth * estimatedLifespan;
};

export const getTopCustomers = (limit: number = 10): any[] => {
  return [...mockCustomerData]
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, limit);
};

export const searchCustomers = (query: string): any[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockCustomerData.filter(customer =>
    customer.name.toLowerCase().includes(lowercaseQuery) ||
    customer.email.toLowerCase().includes(lowercaseQuery) ||
    customer.company?.toLowerCase().includes(lowercaseQuery) ||
    customer.phone.includes(query)
  );
};

export const getCustomerMetrics = (customerId: string): any | null => {
  const customer = getCustomerByid(customerId);
  if (!customer) return null;

  const orders = getCustomerOrders(customerId);
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  
  return {
    customer_id: customerId,
    period: 'monthly',
    period_start: lastMonth.toISOString(),
    period_end: currentDate.toISOString(),
    total_orders: orders.length,
    total_revenue: customer.total_spent,
    average_order_value: customer.average_order_value,
    order_frequency: orders.length / 12, // órdenes por mes
    top_products: [
      {
        product_id: 'sanitizante-1l',
        product_name: 'Sanitizante Ninu.mx 1L',
        quantity_ordered: 150,
        revenue_generated: 12750,
        order_frequency: 8
      }
    ],
    payment_punctuality: 95, // 95% de pagos a tiempo
    credit_utilization: (customer.total_spent * 0.1) / customer.credit_limit * 100, // 10% del total gastado como saldo actual
    customer_lifetime_value: calculateCustomerLifetimeValue(customer),
    profit_margin: 35, // 35% margen promedio
    growth_rate: 15.5, // 15.5% crecimiento vs mes anterior
    last_interaction: customer.last_order_date || customer.updated_at
  };
};

// Integration functions for factory systems

export const linkCustomerToProduction = (customerId: string, productionBatchId: string): boolean => {
  const customer = getCustomerByid(customerId);
  if (!customer) return false;
  
  // Link customer order to production batch for tracking
  console.log(`Linking customer ${customer.name} to production batch ${productionBatchId}`);
  return true;
};

export const updateInventoryFromOrder = (order: any): any[] => {
  const movements: any[] = [];
  
  order.items.forEach((item: any) => {
    movements.push({
      id: `mov-${Date.now()}-${item.id}`,
      product_id: item.product_id,
      type: 'outbound',
      quantity: item.quantity,
      unit_cost: item.unit_price * 0.65, // Estimated cost (65% of selling price)
      total_cost: item.unit_price * 0.65 * item.quantity,
      reason: 'customer_order',
      reference_id: order.id,
      performed_by: order.created_by || 'system',
      timestamp: order.order_date,
      notes: `Order ${order.order_number} for customer ${order.customer_id}`
    });
  });
  
  return movements;
};

export const checkProductAvailability = (productId: string, quantity: number): {
  available: boolean;
  current_stock: number;
  required: number;
  estimated_production_time?: string;
} => {
  // Mock inventory check - in production this would query actual inventory
  const mockInventory: Record<string, number> = {
    'sanitizante-1l': 250,
    'multiusos-1l': 180,
    'detergente-2kg': 120,
    'jabon-500ml': 300,
    'kit-alberca': 45
  };
  
  const currentStock = mockInventory[productId] || 0;
  const available = currentStock >= quantity;
  
  return {
    available,
    current_stock: currentStock,
    required: quantity,
    estimated_production_time: available ? undefined : '2-3 días'
  };
};

export const generateCustomerOrderReport = (customerId: string): {
  customer: any;
  orders: any[];
  total_value: number;
  pending_orders: number;
  last_order_days_ago: number;
} | null => {
  const customer = getCustomerByid(customerId);
  if (!customer) return null;
  
  const orders = getCustomerOrders(customerId);
  const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length;
  
  const lastOrderDate = customer.last_order_date ? new Date(customer.last_order_date) : null;
  const daysSinceLastOrder = lastOrderDate ? 
    Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 
    999;
  
  return {
    customer,
    orders,
    total_value: totalValue,
    pending_orders: pendingOrders,
    last_order_days_ago: daysSinceLastOrder
  };
};
import { Reactor, ProductionStation, Product, ProductionMetrics, Alert, Batch, Recipe, QualityMetric, RawMaterial, Supplier } from '../../types'

// Product factory
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-test-001',
    name: 'Test Product',
    category: 'limpieza',
    description: 'Test product description',
    size: 1,
    unit: 'l',
    packaging: 'bottle',
    cofepisApproval: true,
    ingredients: ['Test ingredient 1', 'Test ingredient 2'],
    useCase: ['Test use 1', 'Test use 2', 'Test use 3'],
    shelfLife: 24,
    currentStock: 100,
    minStock: 20,
    productionCost: 25.00,
    salePrice: 50.00,
    ...overrides
  }
}

// Reactor factory
export function createMockReactor(overrides: Partial<Reactor> = {}): Reactor {
  const mockRecipe: Recipe = {
    id: 'recipe-001',
    productId: 'prod-001',
    name: 'Test Recipe',
    ingredients: [],
    steps: [],
    duration: 60,
    temperature: 25,
    mixingSpeed: 100,
    qualityStandards: []
  }

  const mockBatch: Batch = {
    id: 'batch-001',
    productId: 'prod-001',
    quantity: 1000,
    status: 'in_progress',
    startTime: new Date(),
    estimatedCompletion: new Date(Date.now() + 3600000),
    recipe: mockRecipe,
    qualityMetrics: []
  }

  return {
    id: 'reactor-test-001',
    name: 'Test Reactor',
    status: 'idle',
    capacity: 5000,
    currentBatch: mockBatch,
    temperature: 25,
    pressure: 1.0,
    mixingSpeed: 0,
    lastMaintenance: new Date(Date.now() - 7 * 24 * 3600000),
    nextMaintenance: new Date(Date.now() + 21 * 24 * 3600000),
    ...overrides
  }
}

// Station factory
export function createMockStation(overrides: Partial<ProductionStation> = {}): ProductionStation {
  const defaultProduct = createMockProduct()

  return {
    id: 'station-test-001',
    name: 'Test Station',
    type: 'filling',
    status: 'idle',
    currentProduct: defaultProduct,
    efficiency: 85,
    unitsPerHour: 100,
    lastActivity: new Date(),
    queue: [],
    ...overrides
  }
}

// Metrics factory
export function createMockMetrics(overrides: Partial<ProductionMetrics> = {}): ProductionMetrics {
  return {
    totalProduction: 10000,
    efficiency: 85.5,
    qualityRate: 97.2,
    downtime: 3.5,
    activeOrders: 5,
    completedOrders: 15,
    alertsCount: 2,
    timestamp: new Date(),
    ...overrides
  }
}

// Alert factory
export function createMockAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alert-test-001',
    type: 'warning',
    title: 'Test Alert',
    message: 'This is a test alert message',
    source: 'reactor-001',
    timestamp: new Date(),
    acknowledged: false,
    severity: 'medium',
    ...overrides
  }
}

// Quality Metric factory
export function createMockQualityMetric(overrides: Partial<QualityMetric> = {}): QualityMetric {
  return {
    id: 'quality-test-001',
    parameter: 'pH',
    value: 7.2,
    unit: 'pH',
    acceptableRange: [6.5, 7.5],
    status: 'pass',
    timestamp: new Date(),
    operator: 'test-operator',
    ...overrides
  }
}

// Batch factory
export function createMockBatch(overrides: Partial<Batch> = {}): Batch {
  const mockRecipe: Recipe = {
    id: 'recipe-001',
    productId: 'prod-001',
    name: 'Test Recipe',
    ingredients: [],
    steps: [],
    duration: 60,
    temperature: 25,
    mixingSpeed: 100,
    qualityStandards: []
  }

  return {
    id: 'batch-test-001',
    productId: 'prod-001',
    quantity: 1000,
    status: 'in_progress',
    startTime: new Date(),
    estimatedCompletion: new Date(Date.now() + 3600000),
    recipe: mockRecipe,
    qualityMetrics: [],
    ...overrides
  }
}

// Raw Material factory
export function createMockRawMaterial(overrides: Partial<RawMaterial> = {}): RawMaterial {
  return {
    id: 'rm-test-001',
    code: 'RM-TEST-001',
    name: 'Test Raw Material',
    description: 'Test raw material description',
    category: 'surfactants',
    unit_of_measure: 'kg',
    current_stock: 150,
    minimum_stock: 50,
    maximum_stock: 300,
    unit_cost: 35.50,
    supplier: 'Test Supplier',
    supplier_id: 'sup-test-001',
    supplier_name: 'Test Supplier',
    quality_grade: 'A',
    expiration_tracking: false,
    last_purchase_date: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    status: 'active' as const,
    created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }
}

// Supplier factory
export function createMockSupplier(overrides: Partial<Supplier> = {}): Supplier {
  return {
    id: 'sup-test-001',
    name: 'Test Supplier S.A.',
    code: 'TEST-SUP',
    contact_person: 'Juan Pérez',
    contact_info: 'contacto@testsupplier.com',
    email: 'contacto@testsupplier.com',
    phone: '+52 228 123 4567',
    address: 'Av. Test 123, Xalapa, Veracruz',
    quality_rating: 4.5,
    delivery_time_days: 7,
    payment_terms: 30,
    certification_level: 'ISO 9001',
    created_at: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }
}
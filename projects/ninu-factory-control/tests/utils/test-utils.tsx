import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock providers if needed in the future
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const user = userEvent.setup()
  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options })
  }
}

export * from '@testing-library/react'
export { customRender as render, userEvent }

// Test data factories
export const createMockReactor = (overrides = {}) => ({
  id: 'reactor-test-001',
  name: 'Reactor Test',
  status: 'idle' as const,
  capacity: 1000,
  temperature: 25,
  pressure: 1.0,
  mixingSpeed: 0,
  lastMaintenance: new Date('2024-01-01'),
  nextMaintenance: new Date('2024-02-01'),
  ...overrides,
})

export const createMockStation = (overrides = {}) => ({
  id: 'station-test-001',
  name: 'Test Station',
  type: 'labeling' as const,
  status: 'idle' as const,
  efficiency: 85,
  unitsPerHour: 100,
  lastActivity: new Date('2024-01-01'),
  queue: [],
  ...overrides,
})

export const createMockProduct = (overrides = {}) => ({
  id: 'product-test-001',
  name: 'Test Product',
  category: 'cleaner' as const,
  description: 'Test product description',
  size: 1,
  unit: 'l' as const,
  packaging: 'bottle' as const,
  cofepisApproval: true,
  ingredients: ['Test ingredient'],
  useCase: ['Test use case'],
  shelfLife: 24,
  currentStock: 100,
  minStock: 10,
  productionCost: 10.0,
  salePrice: 20.0,
  ...overrides,
})

export const createMockMetrics = (overrides = {}) => ({
  totalProduction: 1000,
  efficiency: 85,
  qualityRate: 95,
  downtime: 5,
  activeOrders: 5,
  completedOrders: 10,
  alertsCount: 2,
  timestamp: new Date('2024-01-01'),
  ...overrides,
})
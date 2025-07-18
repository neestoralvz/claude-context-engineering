import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Test utilities for Context Engineering Dashboard
 * Following TDD principles with comprehensive mocking and test helpers
 */

// Mock API service for testing
export const mockApiService = {
  getActiveAgents: jest.fn(),
  getAgentCoordination: jest.fn(),
  getAgentResources: jest.fn(),
  getAgentPerformance: jest.fn(),
  getAgentDetails: jest.fn(),
  createAgentSession: jest.fn(),
  logCoordinationEvent: jest.fn(),
  logResourceUtilization: jest.fn(),
  logAgentPerformance: jest.fn(),
  updateAgentSession: jest.fn(),
  createWebSocketConnection: jest.fn(),
  request: jest.fn(),
  isApiAvailable: jest.fn(),
}

// Mock data generators for consistent testing
export const mockData = {
  activeAgents: () => ({
    count: 2,
    agents: [
      {
        id: 1,
        session_id: 'session-1',
        agent_id: 'agent-1',
        agent_name: 'Test Agent 1',
        agent_type: 'claude-code',
        coordination_role: 'primary',
        start_time: '2024-01-01T10:00:00Z',
        status: 'active',
        resource_allocation: 0.8,
        metadata: { test: true }
      },
      {
        id: 2,
        session_id: 'session-2',
        agent_id: 'agent-2',
        agent_name: 'Test Agent 2',
        agent_type: 'claude-code',
        coordination_role: 'secondary',
        start_time: '2024-01-01T10:05:00Z',
        status: 'active',
        resource_allocation: 0.6,
        metadata: { test: true }
      }
    ],
    timestamp: '2024-01-01T10:10:00Z'
  }),

  coordinationEvents: () => ({
    timeRange: '24h',
    statistics: {
      totalEvents: 5,
      coordinationTypes: {
        handoff: 2,
        collaboration: 2,
        resource_sharing: 1
      },
      averagePerformanceImpact: 0.15,
      successRate: 80
    },
    events: [
      {
        id: 1,
        coordination_type: 'handoff',
        primary_agent_id: 'agent-1',
        secondary_agent_id: 'agent-2',
        start_time: '2024-01-01T10:01:00Z',
        status: 'completed',
        outcome: 'success',
        performance_impact: 0.2
      },
      {
        id: 2,
        coordination_type: 'collaboration',
        primary_agent_id: 'agent-2',
        secondary_agent_id: 'agent-1',
        start_time: '2024-01-01T10:03:00Z',
        status: 'active',
        outcome: null,
        performance_impact: 0.1
      }
    ],
    timestamp: '2024-01-01T10:10:00Z'
  }),

  resourceUtilization: () => ({
    agentId: 'all',
    timeRange: '24h',
    statistics: {
      totalDataPoints: 10,
      resourceTypes: {
        memory: {
          count: 4,
          avgUtilization: 65.5,
          avgEfficiency: 78.2
        },
        tokens: {
          count: 3,
          avgUtilization: 45.2,
          avgEfficiency: 85.1
        },
        cpu: {
          count: 3,
          avgUtilization: 34.8,
          avgEfficiency: 92.3
        }
      },
      averageUtilization: 48.5,
      averageEfficiency: 85.2,
      bottleneckCount: 1
    },
    resources: [
      {
        id: 1,
        agent_id: 'agent-1',
        resource_type: 'memory',
        resource_value: 512,
        resource_unit: 'MB',
        utilization_percentage: 75.5,
        efficiency_score: 82.1,
        bottleneck_detected: true,
        timestamp: '2024-01-01T10:00:00Z'
      },
      {
        id: 2,
        agent_id: 'agent-2',
        resource_type: 'tokens',
        resource_value: 1500,
        resource_unit: 'tokens',
        utilization_percentage: 45.2,
        efficiency_score: 88.7,
        bottleneck_detected: false,
        timestamp: '2024-01-01T10:01:00Z'
      }
    ],
    timestamp: '2024-01-01T10:10:00Z'
  }),

  agentPerformance: () => ({
    timeRange: '24h',
    insights: {
      totalAgents: 2,
      taskCategories: 3,
      topPerformers: [],
      averageMetrics: {
        executionTime: 2500,
        successRate: 85.5,
        qualityScore: 78.9
      }
    },
    performance: [
      {
        agent_id: 'agent-1',
        agent_name: 'Test Agent 1',
        task_category: 'coding',
        task_complexity: 7,
        execution_time_ms: 2200,
        success_rate: 90.0,
        quality_score: 85.5,
        efficiency_metrics: {
          tokens_per_task: 150,
          context_switches: 3,
          avg_response_time: 1800
        },
        comparative_baseline: 0.15,
        optimization_opportunities: [
          'Reduce context switching frequency',
          'Optimize token usage for complex tasks'
        ],
        total_tasks: 12,
        avg_execution_time: 2200,
        avg_success_rate: 90.0,
        avg_quality_score: 85.5
      },
      {
        agent_id: 'agent-2',
        agent_name: 'Test Agent 2',
        task_category: 'analysis',
        task_complexity: 5,
        execution_time_ms: 2800,
        success_rate: 81.0,
        quality_score: 72.3,
        efficiency_metrics: {
          tokens_per_task: 200,
          context_switches: 5,
          avg_response_time: 2100
        },
        comparative_baseline: -0.05,
        optimization_opportunities: [
          'Improve analysis accuracy',
          'Reduce execution time for simple tasks'
        ],
        total_tasks: 8,
        avg_execution_time: 2800,
        avg_success_rate: 81.0,
        avg_quality_score: 72.3
      }
    ],
    timestamp: '2024-01-01T10:10:00Z'
  })
}

// Test utilities for async operations
export const waitForAsyncOperations = () => new Promise(resolve => setTimeout(resolve, 0))

// Canvas context is now provided globally via jest.setup.js

// Custom render function with common providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Setup function for component tests
export const setupComponentTest = () => {
  // Reset all mocks before each test
  jest.clearAllMocks()
  
  // Setup default API mock responses
  mockApiService.getActiveAgents.mockResolvedValue(mockData.activeAgents())
  mockApiService.getAgentCoordination.mockResolvedValue(mockData.coordinationEvents())
  mockApiService.getAgentResources.mockResolvedValue(mockData.resourceUtilization())
  mockApiService.getAgentPerformance.mockResolvedValue(mockData.agentPerformance())
  mockApiService.isApiAvailable.mockResolvedValue(true)
  
  // Mock WebSocket
  const mockWebSocket = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1, // OPEN
  }
  mockApiService.createWebSocketConnection.mockReturnValue(mockWebSocket)
  
  return {
    mockApiService,
    mockWebSocket,
    mockData,
  }
}

// Error simulation utilities
export const simulateApiError = (method: keyof typeof mockApiService, error: Error | string) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error
  mockApiService[method].mockRejectedValue(errorObj)
}

// Time manipulation utilities for testing
export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms)
}

// Canvas testing utilities
export const setupCanvasTest = () => {
  const mockCanvas = document.createElement('canvas')
  mockCanvas.getContext = jest.fn(() => global.mockCanvasContext)
  mockCanvas.toDataURL = jest.fn(() => 'data:image/png;base64,mock')
  
  return {
    mockCanvas,
    mockContext: global.mockCanvasContext
  }
}

// Export custom render as default
export * from '@testing-library/react'
export { customRender as render }
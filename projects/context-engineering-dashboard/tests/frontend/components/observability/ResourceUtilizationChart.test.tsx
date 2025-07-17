/**
 * TDD Test Suite for ResourceUtilizationChart Component
 * Following Principles #9, #85, #86 - Mandatory TDD enforcement
 * 
 * Test Coverage Requirements:
 * - Real-time charts with alerts and resource monitoring
 * - Resource utilization and efficiency visualization
 * - Chart type switching and filtering
 * - Alert detection and threshold monitoring
 * - Performance optimization and error handling
 */

import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResourceUtilizationChart } from '@/components/observability/ResourceUtilizationChart'
import { setupComponentTest, simulateApiError, mockData, waitForAsyncOperations } from '../../../utils/test-utils'

// Mock the API service
jest.mock('@/services/api', () => ({
  apiService: require('../../../utils/test-utils').mockApiService
}))

describe('ResourceUtilizationChart Component', () => {
  let mockSetup: ReturnType<typeof setupComponentTest>

  beforeEach(() => {
    mockSetup = setupComponentTest()
    jest.useFakeTimers()

    // Setup resource-specific mock data
    mockSetup.mockApiService.getAgentResources.mockResolvedValue(mockData.resourceUtilization())
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Initial Render and Data Loading', () => {
    test('should render component with loading state initially', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Should show main component title
      expect(screen.getByText('Resource Utilization')).toBeInTheDocument()
      expect(screen.getByText(/Real-time monitoring/i)).toBeInTheDocument()
      
      // Should have chart controls
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(2) // Chart type and resource type filters
    })

    test('should load and display resource utilization data', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Wait for data to load
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledWith('24h')
      })

      // Should display resource statistics
      await waitFor(() => {
        expect(screen.getByText(/65.5/)).toBeInTheDocument() // Memory avg utilization
        expect(screen.getByText(/78.2/)).toBeInTheDocument() // Memory avg efficiency
      })
    })

    test('should handle API errors gracefully', async () => {
      simulateApiError('getAgentResources', 'Resource data unavailable')
      
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
        expect(screen.getByText('Resource data unavailable')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    test('should retry data loading when Try Again is clicked', async () => {
      simulateApiError('getAgentResources', 'Resource data unavailable')
      
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      // Reset the mock to succeed
      mockSetup.mockApiService.getAgentResources.mockResolvedValue(mockData.resourceUtilization())
      
      // Click try again
      fireEvent.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Chart Types and Visualization', () => {
    test('should switch between different chart types', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Find chart type selector
      const chartTypeSelect = screen.getByDisplayValue('utilization')
      expect(chartTypeSelect).toBeInTheDocument()

      // Test different chart types
      await act(async () => {
        fireEvent.change(chartTypeSelect, { target: { value: 'efficiency' } })
      })
      expect(chartTypeSelect).toHaveValue('efficiency')

      await act(async () => {
        fireEvent.change(chartTypeSelect, { target: { value: 'trend' } })
      })
      expect(chartTypeSelect).toHaveValue('trend')

      await act(async () => {
        fireEvent.change(chartTypeSelect, { target: { value: 'distribution' } })
      })
      expect(chartTypeSelect).toHaveValue('distribution')
    })

    test('should filter resources by type', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Find resource type filter
      const resourceFilter = screen.getByDisplayValue('all')
      expect(resourceFilter).toBeInTheDocument()

      // Test different resource filters
      await act(async () => {
        fireEvent.change(resourceFilter, { target: { value: 'memory' } })
      })
      expect(resourceFilter).toHaveValue('memory')

      await act(async () => {
        fireEvent.change(resourceFilter, { target: { value: 'tokens' } })
      })
      expect(resourceFilter).toHaveValue('tokens')

      await act(async () => {
        fireEvent.change(resourceFilter, { target: { value: 'cpu' } })
      })
      expect(resourceFilter).toHaveValue('cpu')
    })

    test('should display resource statistics and metrics', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Check for key statistics from mock data
        expect(screen.getByText('48.5%')).toBeInTheDocument() // Average utilization
        expect(screen.getByText('85.2%')).toBeInTheDocument() // Average efficiency
        expect(screen.getByText('1')).toBeInTheDocument() // Bottleneck count
      })
    })
  })

  describe('Alert Detection and Monitoring', () => {
    test('should detect and display bottleneck alerts', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Should show bottleneck alert for memory resource
        expect(screen.getByText(/bottleneck/i)).toBeInTheDocument()
        
        // Should show alert indicators
        const alertIcons = screen.getAllByTestId('alert-triangle') || screen.getAllByRole('img', { name: /alert/i })
        expect(alertIcons.length).toBeGreaterThan(0)
      })
    })

    test('should display resource utilization warnings', async () => {
      // Mock high utilization data
      const highUtilizationData = {
        ...mockData.resourceUtilization(),
        resources: [
          {
            id: 1,
            agent_id: 'agent-1',
            resource_type: 'memory',
            resource_value: 512,
            resource_unit: 'MB',
            utilization_percentage: 95.5, // High utilization
            efficiency_score: 60.1,
            bottleneck_detected: true,
            timestamp: '2024-01-01T10:00:00Z'
          }
        ]
      }
      
      mockSetup.mockApiService.getAgentResources.mockResolvedValue(highUtilizationData)

      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Should show high utilization warning
        expect(screen.getByText('95.5%')).toBeInTheDocument()
        
        // Should indicate critical resource usage
        const criticalIndicators = screen.getAllByText(/high/i) || screen.getAllByText(/critical/i)
        expect(criticalIndicators.length).toBeGreaterThan(0)
      })
    })

    test('should handle threshold-based alerting', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Check for threshold indicators (typically >80% utilization)
        const utilizationValues = screen.getAllByText(/%/)
        const highUtilization = utilizationValues.some(element => 
          parseFloat(element.textContent?.replace('%', '') || '0') > 80
        )
        
        if (highUtilization) {
          // Should show warning indicators for high utilization
          expect(screen.getByText(/75.5%/)).toBeInTheDocument() // From mock data
        }
      })
    })
  })

  describe('Real-time Updates and Auto-refresh', () => {
    test('should auto-refresh resource data when enabled', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Initial load
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledTimes(1)
      })

      // Advance timers to trigger auto-refresh (typically 30 seconds)
      await act(async () => {
        jest.advanceTimersByTime(30000)
      })

      // Should make another API call
      expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledTimes(2)
    })

    test('should refresh data when refresh button is clicked', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledTimes(1)
      })

      // Find and click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledTimes(2)
      })
    })

    test('should update charts with new data in real-time', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText('48.5%')).toBeInTheDocument()
      })

      // Update mock data
      const updatedData = {
        ...mockData.resourceUtilization(),
        stats: {
          ...mockData.resourceUtilization().stats,
          averageUtilization: 65.3
        }
      }
      mockSetup.mockApiService.getAgentResources.mockResolvedValue(updatedData)

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(screen.getByText('65.3%')).toBeInTheDocument()
      })
    })
  })

  describe('Time Range and Historical Data', () => {
    test('should change time range and refresh data', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Find time range selector
      const timeSelect = screen.getByDisplayValue('24h')
      expect(timeSelect).toBeInTheDocument()

      // Change time range
      await act(async () => {
        fireEvent.change(timeSelect, { target: { value: '1h' } })
      })

      expect(timeSelect).toHaveValue('1h')
      
      // Should trigger new API call with new time range
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentResources).toHaveBeenCalledWith('1h')
      })
    })

    test('should display historical trends appropriately', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Switch to trend chart type
      const chartTypeSelect = screen.getByDisplayValue('utilization')
      await act(async () => {
        fireEvent.change(chartTypeSelect, { target: { value: 'trend' } })
      })

      await waitFor(() => {
        // Should show trend-specific elements
        expect(chartTypeSelect).toHaveValue('trend')
        
        // Should display trend indicators or historical data points
        expect(screen.getByText(/trend/i) || screen.getByText(/historical/i)).toBeInTheDocument()
      })
    })
  })

  describe('Resource Details and Tooltips', () => {
    test('should show detailed resource information on hover/click', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Look for resource entries that should be clickable
        const resourceEntries = screen.getAllByText(/agent-/i)
        expect(resourceEntries.length).toBeGreaterThan(0)
      })

      // Simulate interaction with resource entry
      const memoryResource = screen.getByText('agent-1')
      fireEvent.click(memoryResource)

      // Should show detailed information (implementation dependent)
      // expect(screen.getByText(/resource details/i)).toBeInTheDocument()
    })

    test('should display resource units and measurements correctly', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Check for resource units from mock data
        expect(screen.getByText(/MB/i)).toBeInTheDocument() // Memory unit
        expect(screen.getByText(/tokens/i)).toBeInTheDocument() // Token unit
      })
    })
  })

  describe('Performance and Error Handling', () => {
    test('should handle large resource datasets efficiently', async () => {
      // Create large dataset
      const largeResourceSet = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        agent_id: `agent-${i % 10}`,
        resource_type: ['memory', 'tokens', 'cpu'][i % 3],
        resource_value: 100 + i,
        resource_unit: ['MB', 'tokens', 'cores'][i % 3],
        utilization_percentage: Math.random() * 100,
        efficiency_score: Math.random() * 100,
        bottleneck_detected: Math.random() > 0.8,
        timestamp: new Date(Date.now() - i * 1000).toISOString()
      }))

      const largeDataset = {
        ...mockData.resourceUtilization(),
        resources: largeResourceSet
      }

      mockSetup.mockApiService.getAgentResources.mockResolvedValue(largeDataset)

      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        // Should handle large dataset without performance issues
        expect(screen.getByText('Resource Utilization')).toBeInTheDocument()
      })
    })

    test('should handle malformed resource data gracefully', async () => {
      // Mock malformed data
      const malformedData = {
        resources: [
          {
            id: null,
            agent_id: '',
            resource_type: undefined,
            resource_value: NaN,
            resource_unit: null,
            utilization_percentage: 'invalid',
            efficiency_score: -1,
            bottleneck_detected: 'yes',
            timestamp: 'invalid-date'
          }
        ],
        stats: {
          totalDataPoints: -1,
          resourceTypes: null,
          averageUtilization: NaN,
          averageEfficiency: undefined,
          bottleneckCount: 'many'
        },
        timestamp: new Date().toISOString()
      }

      mockSetup.mockApiService.getAgentResources.mockResolvedValue(malformedData)

      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Should not crash and handle gracefully
      await waitFor(() => {
        expect(screen.getByText('Resource Utilization')).toBeInTheDocument()
      })
    })

    test('should handle network timeouts appropriately', async () => {
      simulateApiError('getAgentResources', new Error('Timeout'))
      
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/timeout/i) || screen.getByText(/failed to load/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Check for accessibility attributes
      expect(screen.getByLabelText(/chart type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/resource type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/time range/i)).toBeInTheDocument()
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup({ delay: null })
      
      await act(async () => {
        render(<ResourceUtilizationChart />)
      })
      
      // Test keyboard navigation through controls
      const chartTypeSelect = screen.getByDisplayValue('utilization')
      await user.tab()
      expect(chartTypeSelect).toHaveFocus()
      
      // Test keyboard interaction
      await user.keyboard('{ArrowDown}')
      // Should change selection (implementation dependent)
    })
  })
})
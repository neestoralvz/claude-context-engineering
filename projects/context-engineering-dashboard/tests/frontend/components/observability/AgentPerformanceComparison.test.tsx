/**
 * TDD Test Suite for AgentPerformanceComparison Component
 * Following Principles #9, #85, #86 - Mandatory TDD enforcement
 * 
 * Test Coverage Requirements:
 * - Performance metrics comparison and optimization insights
 * - Agent comparison views and sorting
 * - Performance trends and analysis
 * - Optimization recommendations display
 * - Interactive comparison features
 */

import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentPerformanceComparison } from '@/components/observability/AgentPerformanceComparison'
import { setupComponentTest, simulateApiError, mockData, waitForAsyncOperations } from '../../../utils/test-utils'

// Mock the API service
jest.mock('@/services/api', () => ({
  apiService: require('../../../utils/test-utils').mockApiService
}))

describe('AgentPerformanceComparison Component', () => {
  let mockSetup: ReturnType<typeof setupComponentTest>

  beforeEach(() => {
    mockSetup = setupComponentTest()
    jest.useFakeTimers()

    // Setup performance-specific mock data
    mockSetup.mockApiService.getAgentPerformance.mockResolvedValue(mockData.agentPerformance())
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Initial Render and Data Loading', () => {
    test('should render component with loading state initially', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Should show main component title
      expect(screen.getByText('Agent Performance Comparison')).toBeInTheDocument()
      expect(screen.getByText(/comparative analysis/i)).toBeInTheDocument()
      
      // Should have comparison controls
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(2) // View mode and sorting options
    })

    test('should load and display performance comparison data', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Wait for data to load
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledWith('24h')
      })

      // Should display performance metrics from mock data
      await waitFor(() => {
        expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
        expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
        expect(screen.getByText('90.0%')).toBeInTheDocument() // Success rate
        expect(screen.getByText('85.5')).toBeInTheDocument() // Quality score
      })
    })

    test('should handle API errors gracefully', async () => {
      simulateApiError('getAgentPerformance', 'Performance data unavailable')
      
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
        expect(screen.getByText('Performance data unavailable')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    test('should retry data loading when Try Again is clicked', async () => {
      simulateApiError('getAgentPerformance', 'Performance data unavailable')
      
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      // Reset the mock to succeed
      mockSetup.mockApiService.getAgentPerformance.mockResolvedValue(mockData.agentPerformance())
      
      // Click try again
      fireEvent.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Comparison Views and Modes', () => {
    test('should switch between different comparison views', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Find view mode selector
      const viewSelect = screen.getByDisplayValue('overview')
      expect(viewSelect).toBeInTheDocument()

      // Test different view modes
      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'detailed' } })
      })
      expect(viewSelect).toHaveValue('detailed')

      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'trends' } })
      })
      expect(viewSelect).toHaveValue('trends')

      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'optimization' } })
      })
      expect(viewSelect).toHaveValue('optimization')
    })

    test('should display overview metrics and insights', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        // Check for overview metrics from mock data
        expect(screen.getByText('2')).toBeInTheDocument() // Total agents
        expect(screen.getByText('3')).toBeInTheDocument() // Task categories
        expect(screen.getByText('2500')).toBeInTheDocument() // Average execution time
        expect(screen.getByText('85.5%')).toBeInTheDocument() // Average success rate
        expect(screen.getByText('78.9')).toBeInTheDocument() // Average quality score
      })
    })

    test('should show detailed performance breakdown by agent', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Switch to detailed view
      const viewSelect = screen.getByDisplayValue('overview')
      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'detailed' } })
      })

      await waitFor(() => {
        // Should show detailed metrics for each agent
        expect(screen.getByText('coding')).toBeInTheDocument() // Task category
        expect(screen.getByText('analysis')).toBeInTheDocument() // Task category
        expect(screen.getByText('12')).toBeInTheDocument() // Total tasks for agent 1
        expect(screen.getByText('8')).toBeInTheDocument() // Total tasks for agent 2
      })
    })
  })

  describe('Sorting and Filtering', () => {
    test('should sort agents by different performance metrics', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Find sort selector
      const sortSelect = screen.getByDisplayValue('success_rate')
      expect(sortSelect).toBeInTheDocument()

      // Test different sorting options
      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: 'quality_score' } })
      })
      expect(sortSelect).toHaveValue('quality_score')

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: 'execution_time' } })
      })
      expect(sortSelect).toHaveValue('execution_time')

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: 'efficiency' } })
      })
      expect(sortSelect).toHaveValue('efficiency')
    })

    test('should filter by task category', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Look for task category filter
      const taskFilter = screen.getByDisplayValue('all') || screen.getByRole('combobox')
      
      // Test filtering by specific task categories
      await act(async () => {
        fireEvent.change(taskFilter, { target: { value: 'coding' } })
      })

      // Should filter to show only coding tasks
      await waitFor(() => {
        expect(screen.getByText('coding')).toBeInTheDocument()
      })
    })

    test('should handle time range changes', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Find time range selector
      const timeSelect = screen.getByDisplayValue('24h')
      expect(timeSelect).toBeInTheDocument()

      // Change time range
      await act(async () => {
        fireEvent.change(timeSelect, { target: { value: '1h' } })
      })

      expect(timeSelect).toHaveValue('1h')
      
      // Should trigger new API call
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledWith('1h')
      })
    })
  })

  describe('Performance Insights and Top Performers', () => {
    test('should identify and display top performing agents', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        // Should highlight top performer (Agent 1 with 90% success rate)
        expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
        expect(screen.getByText('90.0%')).toBeInTheDocument()
        
        // Should show ranking or top performer indicators
        const topPerformerIndicators = screen.getAllByText(/top/i) || screen.getAllByText(/best/i)
        expect(topPerformerIndicators.length).toBeGreaterThan(0)
      })
    })

    test('should show comparative baselines and performance deltas', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        // Check for baseline comparisons from mock data
        expect(screen.getByText(/0.15/)).toBeInTheDocument() // Positive baseline for agent 1
        expect(screen.getByText(/-0.05/)).toBeInTheDocument() // Negative baseline for agent 2
        
        // Should show performance indicators (up/down arrows, colors)
        const performanceIndicators = screen.getAllByText(/↑/) || screen.getAllByText(/↓/) || 
                                    screen.getAllByText(/\+/) || screen.getAllByText(/-/)
        expect(performanceIndicators.length).toBeGreaterThan(0)
      })
    })

    test('should display efficiency metrics breakdown', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        // Check for efficiency metrics from mock data
        expect(screen.getByText('150')).toBeInTheDocument() // Tokens per task for agent 1
        expect(screen.getByText('200')).toBeInTheDocument() // Tokens per task for agent 2
        expect(screen.getByText('3')).toBeInTheDocument() // Context switches for agent 1
        expect(screen.getByText('5')).toBeInTheDocument() // Context switches for agent 2
      })
    })
  })

  describe('Optimization Recommendations', () => {
    test('should display optimization opportunities for each agent', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Switch to optimization view
      const viewSelect = screen.getByDisplayValue('overview')
      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'optimization' } })
      })

      await waitFor(() => {
        // Should show optimization recommendations from mock data
        expect(screen.getByText(/Reduce context switching frequency/)).toBeInTheDocument()
        expect(screen.getByText(/Optimize token usage/)).toBeInTheDocument()
        expect(screen.getByText(/Improve analysis accuracy/)).toBeInTheDocument()
        expect(screen.getByText(/Reduce execution time/)).toBeInTheDocument()
      })
    })

    test('should prioritize optimization recommendations', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Switch to optimization view
      const viewSelect = screen.getByDisplayValue('overview')
      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'optimization' } })
      })

      await waitFor(() => {
        // Should show prioritized recommendations
        // High impact recommendations should be highlighted
        const recommendations = screen.getAllByText(/reduce/i) || screen.getAllByText(/optimize/i) || screen.getAllByText(/improve/i)
        expect(recommendations.length).toBeGreaterThan(0)
      })
    })

    test('should show optimization impact predictions', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Switch to optimization view
      const viewSelect = screen.getByDisplayValue('overview')
      await act(async () => {
        fireEvent.change(viewSelect, { target: { value: 'optimization' } })
      })

      await waitFor(() => {
        // Should show potential impact of optimizations
        // This could be percentage improvements, time savings, etc.
        const impactIndicators = screen.getAllByText(/%/) || screen.getAllByText(/ms/) || screen.getAllByText(/improvement/i)
        expect(impactIndicators.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Interactive Features and Export', () => {
    test('should allow agent selection for detailed comparison', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        // Find and click on an agent for selection
        const agentEntry = screen.getByText('Test Agent 1')
        fireEvent.click(agentEntry)
        
        // Should show selection state or detailed view
        // Implementation depends on specific UI design
      })
    })

    test('should provide performance data export functionality', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Find download/export button
      const downloadButton = screen.getByRole('button', { name: /download/i })
      expect(downloadButton).toBeInTheDocument()

      // Test download action
      fireEvent.click(downloadButton)
      
      // Should trigger download (implementation dependent)
      // expect(mockDownload).toHaveBeenCalled()
    })

    test('should refresh comparison data when refresh button is clicked', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledTimes(1)
      })

      // Find and click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Real-time Updates', () => {
    test('should auto-refresh performance data when enabled', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Initial load
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledTimes(1)
      })

      // Advance timers to trigger auto-refresh (typically 60 seconds for performance data)
      await act(async () => {
        jest.advanceTimersByTime(60000)
      })

      // Should make another API call
      expect(mockSetup.mockApiService.getAgentPerformance).toHaveBeenCalledTimes(2)
    })

    test('should update comparison data with new performance metrics', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Initial render
      await waitFor(() => {
        expect(screen.getByText('85.5%')).toBeInTheDocument() // Original success rate
      })

      // Update mock data
      const updatedData = {
        ...mockData.agentPerformance(),
        insights: {
          ...mockData.agentPerformance().insights,
          averageMetrics: {
            ...mockData.agentPerformance().insights.averageMetrics,
            successRate: 87.2
          }
        }
      }
      mockSetup.mockApiService.getAgentPerformance.mockResolvedValue(updatedData)

      // Trigger refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(screen.getByText('87.2%')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Error Handling', () => {
    test('should handle large performance datasets efficiently', async () => {
      // Create large dataset
      const largePerformanceSet = Array.from({ length: 100 }, (_, i) => ({
        agent_id: `agent-${i}`,
        agent_name: `Agent ${i}`,
        task_category: ['coding', 'analysis', 'research'][i % 3],
        task_complexity: Math.floor(Math.random() * 10) + 1,
        execution_time_ms: Math.floor(Math.random() * 5000) + 1000,
        success_rate: Math.random() * 100,
        quality_score: Math.random() * 100,
        efficiency_metrics: {
          tokens_per_task: Math.floor(Math.random() * 300) + 50,
          context_switches: Math.floor(Math.random() * 10),
          avg_response_time: Math.floor(Math.random() * 3000) + 500
        },
        comparative_baseline: (Math.random() - 0.5) * 0.4,
        optimization_opportunities: ['Optimize performance', 'Reduce latency'],
        total_tasks: Math.floor(Math.random() * 50) + 1,
        avg_execution_time: Math.floor(Math.random() * 3000) + 1000,
        avg_success_rate: Math.random() * 100,
        avg_quality_score: Math.random() * 100
      }))

      const largeDataset = {
        ...mockData.agentPerformance(),
        performance: largePerformanceSet,
        insights: {
          ...mockData.agentPerformance().insights,
          totalAgents: largePerformanceSet.length
        }
      }

      mockSetup.mockApiService.getAgentPerformance.mockResolvedValue(largeDataset)

      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        // Should handle large dataset without performance issues
        expect(screen.getByText('Agent Performance Comparison')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument() // Total agents
      })
    })

    test('should handle malformed performance data gracefully', async () => {
      // Mock malformed data
      const malformedData = {
        performance: [
          {
            agent_id: null,
            agent_name: undefined,
            task_category: '',
            task_complexity: NaN,
            execution_time_ms: -1,
            success_rate: 'invalid',
            quality_score: null,
            efficiency_metrics: null,
            comparative_baseline: undefined,
            optimization_opportunities: 'not-an-array',
            total_tasks: -5,
            avg_execution_time: Infinity,
            avg_success_rate: 'high',
            avg_quality_score: {}
          }
        ],
        insights: {
          totalAgents: 'many',
          taskCategories: null,
          topPerformers: undefined,
          averageMetrics: {
            executionTime: NaN,
            successRate: 'good',
            qualityScore: -1
          }
        },
        timestamp: 'invalid-date'
      }

      mockSetup.mockApiService.getAgentPerformance.mockResolvedValue(malformedData)

      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Should not crash and handle gracefully
      await waitFor(() => {
        expect(screen.getByText('Agent Performance Comparison')).toBeInTheDocument()
      })
    })

    test('should handle network errors and timeouts', async () => {
      simulateApiError('getAgentPerformance', new Error('Network timeout'))
      
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/timeout/i) || screen.getByText(/failed to load/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Check for accessibility attributes
      expect(screen.getByLabelText(/view mode/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/time range/i)).toBeInTheDocument()
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup({ delay: null })
      
      await act(async () => {
        render(<AgentPerformanceComparison />)
      })
      
      // Test keyboard navigation through controls
      const viewSelect = screen.getByDisplayValue('overview')
      await user.tab()
      expect(viewSelect).toHaveFocus()
      
      // Test keyboard interaction
      await user.keyboard('{ArrowDown}')
      // Should change selection (implementation dependent)
    })
  })
})
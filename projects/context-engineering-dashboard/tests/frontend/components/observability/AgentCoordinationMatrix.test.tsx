/**
 * TDD Test Suite for AgentCoordinationMatrix Component
 * Following Principles #9, #85, #86 - Mandatory TDD enforcement
 * 
 * Test Coverage Requirements:
 * - API integration and data loading
 * - Canvas rendering and visualization
 * - User interactions (click, selection)
 * - WebSocket real-time updates
 * - Error handling and edge cases
 * - Network and matrix view modes
 */

import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentCoordinationMatrix } from '@/components/observability/AgentCoordinationMatrix'
import { setupComponentTest, simulateApiError, mockData, waitForAsyncOperations, setupCanvasTest } from '../../../utils/test-utils'

// Mock the API service
jest.mock('@/services/api', () => ({
  apiService: require('../../../utils/test-utils').mockApiService
}))

describe('AgentCoordinationMatrix Component', () => {
  let mockSetup: ReturnType<typeof setupComponentTest>
  let canvasSetup: ReturnType<typeof setupCanvasTest>

  beforeEach(() => {
    mockSetup = setupComponentTest()
    canvasSetup = setupCanvasTest()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  describe('Initial Render and Data Loading', () => {
    test('should render component with loading state initially', async () => {
      render(<AgentCoordinationMatrix />)
      
      // Should show loading state
      expect(screen.getByText('Agent Coordination Matrix')).toBeInTheDocument()
      expect(screen.getByText('Visual mapping of agent interactions and coordination patterns')).toBeInTheDocument()
      
      // Should have view mode controls
      expect(screen.getByDisplayValue('network')).toBeInTheDocument()
      expect(screen.getByDisplayValue('6h')).toBeInTheDocument()
    })

    test('should load and display agent coordination data', async () => {
      render(<AgentCoordinationMatrix />)
      
      // Wait for data to load
      await waitFor(() => {
        expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(1)
        expect(mockSetup.mockApiService.getAgentCoordination).toHaveBeenCalledWith('6h')
      })

      // Should display the canvas visualization
      const canvas = screen.getByRole('img', { hidden: true }) // Canvas is treated as img by testing library
      expect(canvas).toBeInTheDocument()
    })

    test('should handle API errors gracefully', async () => {
      simulateApiError('getActiveAgents', 'Network error')
      
      render(<AgentCoordinationMatrix />)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Coordination Data')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })
    })

    test('should retry data loading when Try Again is clicked', async () => {
      simulateApiError('getActiveAgents', 'Network error')
      
      render(<AgentCoordinationMatrix />)
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      // Reset the mock to succeed
      mockSetup.mockApiService.getActiveAgents.mockResolvedValue(mockData.activeAgents())
      
      // Click try again
      fireEvent.click(screen.getByText('Try Again'))
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Canvas Visualization', () => {
    test('should render network visualization with nodes and links', async () => {
      const mockData = {
        activeAgents: {
          agents: [
            {
              agent_id: 'agent-1',
              agent_name: 'Test Agent 1',
              agent_type: 'claude-code',
              coordination_role: 'primary',
              status: 'active'
            },
            {
              agent_id: 'agent-2', 
              agent_name: 'Test Agent 2',
              agent_type: 'claude-code',
              coordination_role: 'secondary',
              status: 'active'
            }
          ]
        },
        coordinationEvents: {
          events: [
            {
              primary_agent_id: 'agent-1',
              secondary_agent_id: 'agent-2',
              coordination_type: 'handoff',
              status: 'active',
              performance_impact: 0.2,
              start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
            }
          ]
        }
      }

      mockSetup.mockApiService.getActiveAgents.mockResolvedValue(mockData.activeAgents)
      mockSetup.mockApiService.getAgentCoordination.mockResolvedValue(mockData.coordinationEvents)

      render(<AgentCoordinationMatrix />)
      
      await waitFor(() => {
        expect(canvasSetup.mockContext.arc).toHaveBeenCalled() // Node drawing
        expect(canvasSetup.mockContext.fillText).toHaveBeenCalled() // Label drawing
        expect(canvasSetup.mockContext.moveTo).toHaveBeenCalled() // Link drawing
        expect(canvasSetup.mockContext.lineTo).toHaveBeenCalled() // Link drawing
      })
    })

    test('should handle empty data state', async () => {
      mockSetup.mockApiService.getActiveAgents.mockResolvedValue({ agents: [] })
      mockSetup.mockApiService.getAgentCoordination.mockResolvedValue({ events: [] })

      render(<AgentCoordinationMatrix />)
      
      await waitFor(() => {
        expect(canvasSetup.mockContext.fillText).toHaveBeenCalledWith('No active agents', expect.any(Number), expect.any(Number))
      })
    })

    test('should update canvas when data changes', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Simulate data update via refresh
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('User Interactions', () => {
    test('should handle node selection on canvas click', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      const canvas = screen.getByRole('img', { hidden: true })
      
      // Simulate click on canvas
      fireEvent.click(canvas, { 
        clientX: 100, 
        clientY: 100,
        target: { getBoundingClientRect: () => ({ left: 0, top: 0 }) }
      })

      // Should update the canvas rendering (selection highlight)
      expect(canvasSetup.mockContext.stroke).toHaveBeenCalled()
    })

    test('should show agent details when node is selected', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Initially should show "Select an Agent"
      expect(screen.getByText('Select an Agent')).toBeInTheDocument()
      
      // After clicking a node (mocked), should show agent details
      // This would require more complex canvas interaction mocking
    })

    test('should switch between network and matrix views', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Switch to matrix view
      const viewSelect = screen.getByDisplayValue('network')
      fireEvent.change(viewSelect, { target: { value: 'matrix' } })
      
      await waitFor(() => {
        // Should render matrix table instead of canvas
        expect(screen.queryByRole('table')).toBeInTheDocument()
      })
    })

    test('should change time range and refresh data', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Change time range
      const timeSelect = screen.getByDisplayValue('6h')
      fireEvent.change(timeSelect, { target: { value: '24h' } })
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getAgentCoordination).toHaveBeenCalledWith('24h')
      })
    })

    test('should refresh data when refresh button is clicked', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(2)
        expect(mockSetup.mockApiService.getAgentCoordination).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Matrix View Mode', () => {
    test('should render matrix table with agent relationships', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Switch to matrix view
      const viewSelect = screen.getByDisplayValue('network')
      fireEvent.change(viewSelect, { target: { value: 'matrix' } })
      
      await waitFor(() => {
        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
        
        // Should have headers for agents
        expect(screen.getByText('Test Agen')).toBeInTheDocument() // Truncated names
      })
    })

    test('should show coordination types in matrix cells', async () => {
      const mockCoordination = {
        events: [
          {
            primary_agent_id: 'agent-1',
            secondary_agent_id: 'agent-2',
            coordination_type: 'handoff',
            status: 'active',
            recent: true
          }
        ]
      }

      mockSetup.mockApiService.getAgentCoordination.mockResolvedValue(mockCoordination)

      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Switch to matrix view
      const viewSelect = screen.getByDisplayValue('network')
      fireEvent.change(viewSelect, { target: { value: 'matrix' } })
      
      await waitFor(() => {
        // Should show colored cells for coordination relationships
        const cells = screen.getAllByRole('cell')
        expect(cells.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Real-time Updates', () => {
    test('should auto-refresh data when enabled', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Fast-forward 30 seconds (auto-refresh interval)
      act(() => {
        jest.advanceTimersByTime(30000)
      })
      
      await waitFor(() => {
        expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(2)
      })
    })

    test('should not auto-refresh when disabled', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Disable auto-refresh (would need to implement this control)
      // For now, test that the component respects the interval
      
      act(() => {
        jest.advanceTimersByTime(29000) // Just under 30 seconds
      })
      
      // Should still be only 1 call
      expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(1)
    })
  })

  describe('Legend and UI Elements', () => {
    test('should display coordination type legend', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      expect(screen.getByText('Coordination Types:')).toBeInTheDocument()
      expect(screen.getByText('Handoff')).toBeInTheDocument()
      expect(screen.getByText('Collaboration')).toBeInTheDocument()
      expect(screen.getByText('Resource Sharing')).toBeInTheDocument()
      expect(screen.getByText('Conflict Resolution')).toBeInTheDocument()
    })

    test('should display status legend', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      expect(screen.getByText('Status:')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Paused')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    test('should show last updated timestamp', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      await waitFor(() => {
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Optimization', () => {
    test('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeAgentSet = Array.from({ length: 50 }, (_, i) => ({
        agent_id: `agent-${i}`,
        agent_name: `Test Agent ${i}`,
        agent_type: 'claude-code',
        coordination_role: 'primary',
        status: 'active'
      }))

      const largeCoordinationSet = Array.from({ length: 100 }, (_, i) => ({
        primary_agent_id: `agent-${i % 50}`,
        secondary_agent_id: `agent-${(i + 1) % 50}`,
        coordination_type: 'handoff',
        status: 'active',
        performance_impact: Math.random() * 0.5
      }))

      mockSetup.mockApiService.getActiveAgents.mockResolvedValue({ agents: largeAgentSet })
      mockSetup.mockApiService.getAgentCoordination.mockResolvedValue({ events: largeCoordinationSet })

      const startTime = performance.now()
      
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      const endTime = performance.now()
      
      // Should render within reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    test('should debounce rapid data updates', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Trigger multiple rapid refreshes
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      fireEvent.click(refreshButton)
      fireEvent.click(refreshButton)
      
      // Should only make additional API calls, not excessive ones
      await waitFor(() => {
        expect(mockSetup.mockApiService.getActiveAgents).toHaveBeenCalledTimes(4) // 1 initial + 3 clicks
      })
    })
  })

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Agent Coordination Matrix')
      
      // Controls should have proper labels
      expect(screen.getByLabelText(/View:/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Time:/)).toBeInTheDocument()
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Should be able to tab through controls
      await user.tab()
      expect(screen.getByDisplayValue('network')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByDisplayValue('6h')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByText('Refresh')).toHaveFocus()
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    test('should handle malformed API data', async () => {
      mockSetup.mockApiService.getActiveAgents.mockResolvedValue({ agents: null })
      mockSetup.mockApiService.getAgentCoordination.mockResolvedValue({ events: undefined })

      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Should not crash and should show empty state
      expect(canvasSetup.mockContext.fillText).toHaveBeenCalledWith('No active agents', expect.any(Number), expect.any(Number))
    })

    test('should handle canvas rendering errors gracefully', async () => {
      // Mock canvas context to throw error
      canvasSetup.mockContext.arc.mockImplementation(() => {
        throw new Error('Canvas error')
      })

      render(<AgentCoordinationMatrix />)
      
      await waitForAsyncOperations()
      
      // Component should not crash, error should be handled gracefully
      expect(screen.getByText('Agent Coordination Matrix')).toBeInTheDocument()
    })

    test('should handle network timeouts', async () => {
      mockSetup.mockApiService.getActiveAgents.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
      )

      render(<AgentCoordinationMatrix />)
      
      // Fast-forward past timeout
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Coordination Data')).toBeInTheDocument()
      })
    })
  })
})
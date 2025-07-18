/**
 * Service Worker Status Indicator Component Tests
 * Comprehensive test suite for ServiceWorkerStatusIndicator React component
 * 
 * @file ServiceWorkerStatusIndicator.test.tsx
 * @description TDD tests for ServiceWorkerStatusIndicator component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceWorkerStatusIndicator from '../../../components/diagnostics/ServiceWorkerStatusIndicator';
import * as diagnosticsModule from '../../../lib/utils/service-worker-diagnostics';

// Mock the diagnostics module
jest.mock('../../../lib/utils/service-worker-diagnostics', () => ({
  serviceWorkerDiagnostics: {
    subscribe: jest.fn(),
    refresh: jest.fn()
  }
}));

const mockDiagnostics = diagnosticsModule.serviceWorkerDiagnostics as jest.Mocked<typeof diagnosticsModule.serviceWorkerDiagnostics>;

const createMockDiagnosticResult = (overrides = {}) => ({
  isSupported: true,
  registrations: [
    {
      scope: 'https://example.com/',
      scriptURL: 'https://example.com/sw.js',
      state: 'activated' as ServiceWorkerState,
      updatefound: false,
      installing: null,
      waiting: null,
      active: {
        scriptURL: 'https://example.com/sw.js',
        state: 'activated' as ServiceWorkerState
      } as ServiceWorker
    }
  ],
  conflicts: [],
  networkInterceptors: [
    {
      scope: 'https://example.com/',
      patterns: ['/_next/static/**', '/api/**'],
      responseCount: 150,
      errorCount: 2,
      lastActivity: new Date()
    }
  ],
  performance: {
    registrationTime: 45,
    activationTime: 23,
    firstFetch: 156,
    cacheHitRatio: 87.5,
    errorRate: 1.3
  },
  recommendations: ['Service worker configuration appears healthy. Continue monitoring.'],
  ...overrides
});

describe('ServiceWorkerStatusIndicator', () => {
  let mockSubscribe: jest.Mock;
  let mockRefresh: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSubscribe = jest.fn();
    mockRefresh = jest.fn().mockResolvedValue(undefined);
    
    mockDiagnostics.subscribe = mockSubscribe;
    mockDiagnostics.refresh = mockRefresh;
  });

  describe('Basic Rendering', () => {
    it('should render loading state initially', () => {
      mockSubscribe.mockImplementation((callback) => {
        // Don't call callback immediately to simulate loading
        return jest.fn(); // unsubscribe function
      });

      render(<ServiceWorkerStatusIndicator />);
      
      expect(screen.getByText('Checking service workers...')).toBeInTheDocument();
    });

    it('should render compact mode', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator compact />);
      
      expect(screen.getByText(/SW 1/)).toBeInTheDocument();
    });

    it('should render detailed mode', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Service Worker Status')).toBeInTheDocument();
      expect(screen.getByText('Browser Support')).toBeInTheDocument();
    });

    it('should render healthy status', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('All service workers operating normally')).toBeInTheDocument();
    });

    it('should render unsupported browser state', () => {
      const mockResult = createMockDiagnosticResult({ isSupported: false });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Service Workers not supported')).toBeInTheDocument();
    });
  });

  describe('Status Calculation', () => {
    it('should show critical status for critical conflicts', () => {
      const mockResult = createMockDiagnosticResult({
        conflicts: [
          {
            type: 'duplicate-scope',
            severity: 'critical',
            description: 'Critical conflict',
            affectedRegistrations: ['sw.js'],
            resolution: 'Fix immediately',
            autoResolvable: false
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should show error status for high severity conflicts', () => {
      const mockResult = createMockDiagnosticResult({
        conflicts: [
          {
            type: 'script-error',
            severity: 'high',
            description: 'High severity conflict',
            affectedRegistrations: ['sw.js'],
            resolution: 'Needs attention',
            autoResolvable: true
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should show warning status for medium severity conflicts', () => {
      const mockResult = createMockDiagnosticResult({
        conflicts: [
          {
            type: 'version-mismatch',
            severity: 'medium',
            description: 'Medium severity conflict',
            affectedRegistrations: ['sw.js'],
            resolution: 'Should be resolved',
            autoResolvable: true
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should display correct conflict count', () => {
      const mockResult = createMockDiagnosticResult({
        conflicts: [
          {
            type: 'conflict1',
            severity: 'medium',
            description: 'Conflict 1',
            affectedRegistrations: ['sw1.js'],
            resolution: 'Fix 1',
            autoResolvable: true
          },
          {
            type: 'conflict2',
            severity: 'low',
            description: 'Conflict 2',
            affectedRegistrations: ['sw2.js'],
            resolution: 'Fix 2',
            autoResolvable: false
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator compact />);
      
      expect(screen.getByText(/2 conflicts/)).toBeInTheDocument();
    });
  });

  describe('Performance Metrics Display', () => {
    it('should display performance metrics in detailed mode', () => {
      const mockResult = createMockDiagnosticResult({
        performance: {
          registrationTime: 45,
          activationTime: 23,
          firstFetch: 156,
          cacheHitRatio: 87.5,
          errorRate: 1.3
        }
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('87.5%')).toBeInTheDocument();
      expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument();
    });

    it('should display network interceptor count', () => {
      const mockResult = createMockDiagnosticResult({
        networkInterceptors: [
          {
            scope: 'https://example.com/',
            patterns: ['**'],
            responseCount: 100,
            errorCount: 5,
            lastActivity: new Date()
          },
          {
            scope: 'https://example.com/api/',
            patterns: ['/api/**'],
            responseCount: 50,
            errorCount: 1,
            lastActivity: new Date()
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Interceptors')).toBeInTheDocument();
    });
  });

  describe('Registration Details', () => {
    it('should display active registrations in detailed mode', () => {
      const mockResult = createMockDiagnosticResult({
        registrations: [
          {
            scope: 'https://example.com/',
            scriptURL: 'https://example.com/sw.js',
            state: 'activated' as ServiceWorkerState,
            updatefound: false,
            installing: null,
            waiting: null,
            active: {
              scriptURL: 'https://example.com/sw.js',
              state: 'activated' as ServiceWorkerState
            } as ServiceWorker
          },
          {
            scope: 'https://example.com/api/',
            scriptURL: 'https://example.com/api/sw.js',
            state: 'installing' as ServiceWorkerState,
            updatefound: true,
            installing: {
              scriptURL: 'https://example.com/api/sw.js',
              state: 'installing' as ServiceWorkerState
            } as ServiceWorker,
            waiting: null,
            active: null
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Active Registrations')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/')).toBeInTheDocument();
      expect(screen.getByText('https://example.com/api/')).toBeInTheDocument();
      expect(screen.getByText('activated')).toBeInTheDocument();
      expect(screen.getByText('installing')).toBeInTheDocument();
    });

    it('should not show registrations section when no registrations exist', () => {
      const mockResult = createMockDiagnosticResult({
        registrations: []
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.queryByText('Active Registrations')).not.toBeInTheDocument();
    });
  });

  describe('Conflicts Display', () => {
    it('should display conflicts in detailed mode', () => {
      const mockResult = createMockDiagnosticResult({
        conflicts: [
          {
            type: 'duplicate-scope',
            severity: 'high',
            description: 'Multiple service workers registered for the same scope',
            affectedRegistrations: ['sw1.js', 'sw2.js'],
            resolution: 'Unregister duplicate service workers',
            autoResolvable: true
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Detected Conflicts')).toBeInTheDocument();
      expect(screen.getByText('Multiple service workers registered for the same scope')).toBeInTheDocument();
      expect(screen.getByText('Unregister duplicate service workers')).toBeInTheDocument();
      expect(screen.getByText('Auto-fixable')).toBeInTheDocument();
    });

    it('should not show conflicts section when no conflicts exist', () => {
      const mockResult = createMockDiagnosticResult({
        conflicts: []
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.queryByText('Detected Conflicts')).not.toBeInTheDocument();
    });
  });

  describe('Recommendations Display', () => {
    it('should display recommendations in detailed mode', () => {
      const mockResult = createMockDiagnosticResult({
        recommendations: [
          'Consider optimizing cache strategies for better performance',
          'Monitor error rates and investigate high failure patterns'
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Consider optimizing cache strategies for better performance')).toBeInTheDocument();
      expect(screen.getByText('Monitor error rates and investigate high failure patterns')).toBeInTheDocument();
    });

    it('should not show recommendations section when no recommendations exist', () => {
      const mockResult = createMockDiagnosticResult({
        recommendations: []
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator detailed />);
      
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });
  });

  describe('Interactive Controls', () => {
    it('should show refresh button when interactive', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator interactive />);
      
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    it('should call refresh when refresh button clicked', async () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator interactive detailed />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should disable refresh button while loading', async () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      mockRefresh.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ServiceWorkerStatusIndicator interactive detailed />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      expect(refreshButton).toBeDisabled();
    });

    it('should not show interactive controls when interactive is false', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator interactive={false} detailed />);
      
      expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
    });

    it('should show refresh button in compact mode', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator compact interactive />);
      
      const refreshButton = screen.getByRole('button');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Status Change Callback', () => {
    it('should call onStatusChange when status changes', () => {
      const onStatusChange = jest.fn();
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator onStatusChange={onStatusChange} />);
      
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isSupported: true,
          isActive: true,
          registrationCount: 1,
          conflictCount: 0,
          health: 'healthy'
        })
      );
    });

    it('should call onStatusChange with correct health status', () => {
      const onStatusChange = jest.fn();
      const mockResult = createMockDiagnosticResult({
        conflicts: [
          {
            type: 'critical-conflict',
            severity: 'critical',
            description: 'Critical issue',
            affectedRegistrations: ['sw.js'],
            resolution: 'Fix immediately',
            autoResolvable: false
          }
        ]
      });
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator onStatusChange={onStatusChange} />);
      
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          health: 'critical'
        })
      );
    });
  });

  describe('Subscription Management', () => {
    it('should subscribe to diagnostics on mount', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator />);
      
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = jest.fn();
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return mockUnsubscribe;
      });

      const { unmount } = render(<ServiceWorkerStatusIndicator />);
      
      unmount();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Time Formatting', () => {
    beforeEach(() => {
      // Mock Date.now to control time calculations
      jest.spyOn(Date, 'now').mockReturnValue(1000000000000); // Fixed timestamp
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should format recent update times correctly', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      // Mock recent update (30 seconds ago)
      const recentTime = new Date(1000000000000 - 30000);
      
      render(<ServiceWorkerStatusIndicator detailed />);
      
      // The component should show time since last update
      expect(screen.getByText(/Updated \d+s ago/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription errors gracefully', () => {
      mockSubscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      // Should not throw error
      expect(() => render(<ServiceWorkerStatusIndicator />)).not.toThrow();
    });

    it('should handle refresh errors gracefully', async () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      mockRefresh.mockRejectedValue(new Error('Refresh failed'));

      render(<ServiceWorkerStatusIndicator interactive detailed />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      // Should not throw error and button should re-enable
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });

    it('should handle null diagnostic result', () => {
      mockSubscribe.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator />);
      
      expect(screen.getByText('Service worker diagnostics unavailable')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator interactive detailed />);
      
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      render(<ServiceWorkerStatusIndicator interactive detailed />);
      
      const refreshButton = screen.getByText('Refresh');
      
      // Test keyboard interaction
      refreshButton.focus();
      expect(refreshButton).toHaveFocus();
      
      fireEvent.keyDown(refreshButton, { key: 'Enter' });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      const { container } = render(
        <ServiceWorkerStatusIndicator className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render different layouts for compact vs detailed', () => {
      const mockResult = createMockDiagnosticResult();
      
      mockSubscribe.mockImplementation((callback) => {
        callback(mockResult);
        return jest.fn();
      });

      const { rerender } = render(<ServiceWorkerStatusIndicator compact />);
      
      // Compact mode should be simpler
      expect(screen.queryByText('Service Worker Status')).not.toBeInTheDocument();
      
      rerender(<ServiceWorkerStatusIndicator detailed />);
      
      // Detailed mode should show full interface
      expect(screen.getByText('Service Worker Status')).toBeInTheDocument();
    });
  });
});
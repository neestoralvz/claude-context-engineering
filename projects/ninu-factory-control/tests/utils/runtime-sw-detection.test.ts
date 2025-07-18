/**
 * Runtime Service Worker Detection Tests
 * Comprehensive test suite for runtime service worker detection utilities
 * 
 * @file runtime-sw-detection.test.ts
 * @description TDD tests for RuntimeServiceWorkerDetection class and utilities
 */

import { 
  RuntimeServiceWorkerDetection, 
  createRuntimeDetection,
  type RuntimeDetectionState,
  type ServiceWorkerDetectionEvent,
  type DetectionConfiguration
} from '../../lib/utils/runtime-sw-detection';

// Mock ServiceWorker API
const mockServiceWorkerRegistration = {
  scope: 'https://example.com/',
  scriptURL: 'https://example.com/sw.js',
  installing: null,
  waiting: null,
  active: {
    scriptURL: 'https://example.com/sw.js',
    state: 'activated' as ServiceWorkerState,
    postMessage: jest.fn()
  },
  addEventListener: jest.fn(),
  unregister: jest.fn().mockResolvedValue(true)
};

const mockNavigator = {
  serviceWorker: {
    getRegistrations: jest.fn(),
    register: jest.fn(),
    addEventListener: jest.fn(),
    controller: null
  }
};

// Mock Performance API
const mockPerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}));

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

Object.defineProperty(global, 'fetch', {
  value: jest.fn(),
  writable: true
});

describe('RuntimeServiceWorkerDetection', () => {
  let detection: RuntimeServiceWorkerDetection;
  let config: DetectionConfiguration;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    config = {
      enableRealTimeMonitoring: true,
      enableConflictDetection: true,
      enablePerformanceTracking: true,
      alertThresholds: {
        errorRate: 5,
        responseTime: 1000,
        cacheHitRatio: 80
      },
      autoResolveConflicts: false
    };
    
    detection = new RuntimeServiceWorkerDetection(config);
  });

  afterEach(() => {
    jest.useRealTimers();
    detection.stop();
  });

  describe('Initialization', () => {
    it('should create detection instance with default config', () => {
      const defaultDetection = new RuntimeServiceWorkerDetection();
      expect(defaultDetection).toBeInstanceOf(RuntimeServiceWorkerDetection);
    });

    it('should create detection instance with custom config', () => {
      expect(detection).toBeInstanceOf(RuntimeServiceWorkerDetection);
    });

    it('should initialize with empty state', () => {
      const state = detection.getState();
      
      expect(state.isMonitoring).toBe(false);
      expect(state.detectedServiceWorkers.size).toBe(0);
      expect(state.activeConflicts.size).toBe(0);
      expect(state.eventLog).toEqual([]);
    });

    it('should start monitoring when started', () => {
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([]);
      
      detection.start();
      
      expect(detection.getState().isMonitoring).toBe(true);
    });
  });

  describe('Service Worker Detection', () => {
    it('should detect existing service workers', async () => {
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([mockServiceWorkerRegistration]);
      
      detection.start();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      expect(state.detectedServiceWorkers.size).toBe(1);
      expect(state.eventLog.some(e => e.type === 'registration')).toBe(true);
    });

    it('should extract service worker capabilities', async () => {
      const nextJSRegistration = {
        ...mockServiceWorkerRegistration,
        scope: 'https://example.com/_next/',
        active: {
          ...mockServiceWorkerRegistration.active,
          scriptURL: 'https://example.com/_next/sw.js'
        }
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([nextJSRegistration]);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      const serviceWorker = Array.from(state.detectedServiceWorkers.values())[0];
      
      expect(serviceWorker.capabilities).toContain('next.js-pwa');
      expect(serviceWorker.capabilities).toContain('static-caching');
    });

    it('should detect full-site control capability', async () => {
      const fullSiteRegistration = {
        ...mockServiceWorkerRegistration,
        scope: 'https://example.com/'
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([fullSiteRegistration]);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      const serviceWorker = Array.from(state.detectedServiceWorkers.values())[0];
      
      expect(serviceWorker.capabilities).toContain('full-site-control');
    });

    it('should extract version from script URL', async () => {
      const versionedRegistration = {
        ...mockServiceWorkerRegistration,
        active: {
          ...mockServiceWorkerRegistration.active,
          scriptURL: 'https://example.com/_next/static/build123/sw.js'
        }
      };
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([versionedRegistration]);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      const serviceWorker = Array.from(state.detectedServiceWorkers.values())[0];
      
      expect(serviceWorker.version).toBe('build123');
    });
  });

  describe('Real-time Monitoring', () => {
    it('should monitor registration changes', async () => {
      mockNavigator.serviceWorker.getRegistrations
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockServiceWorkerRegistration]);
      
      detection.start();
      
      // Trigger monitoring interval
      jest.advanceTimersByTime(5000);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      expect(state.detectedServiceWorkers.size).toBe(1);
    });

    it('should detect removed registrations', async () => {
      mockNavigator.serviceWorker.getRegistrations
        .mockResolvedValueOnce([mockServiceWorkerRegistration])
        .mockResolvedValueOnce([]);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Trigger monitoring interval
      jest.advanceTimersByTime(5000);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      expect(state.detectedServiceWorkers.size).toBe(0);
      expect(state.eventLog.some(e => e.type === 'unregistration')).toBe(true);
    });

    it('should intercept new registrations', async () => {
      const originalRegister = mockNavigator.serviceWorker.register;
      
      detection.start();
      
      // Mock successful registration
      mockNavigator.serviceWorker.register.mockResolvedValue(mockServiceWorkerRegistration);
      
      // Simulate registration call
      await mockNavigator.serviceWorker.register('/new-sw.js');
      
      const state = detection.getState();
      expect(state.eventLog.some(e => e.type === 'registration' && e.details?.newRegistration)).toBe(true);
    });

    it('should handle registration failures', async () => {
      detection.start();
      
      // Mock failed registration
      mockNavigator.serviceWorker.register.mockRejectedValue(new Error('Registration failed'));
      
      try {
        await mockNavigator.serviceWorker.register('/failing-sw.js');
      } catch (error) {
        // Expected to throw
      }
      
      const state = detection.getState();
      expect(state.eventLog.some(e => e.type === 'error' && e.details?.registrationError)).toBe(true);
    });
  });

  describe('Performance Tracking', () => {
    it('should track fetch performance', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('OK', { status: 200 }));
      global.fetch = mockFetch;
      
      detection.start();
      
      // Simulate fetch requests
      await fetch('/api/test');
      await fetch('/api/test2');
      
      const state = detection.getState();
      expect(state.performanceMetrics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should update performance metrics on fetch errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;
      
      detection.start();
      
      try {
        await fetch('/api/failing');
      } catch (error) {
        // Expected to throw
      }
      
      const state = detection.getState();
      expect(state.performanceMetrics.errorRate).toBeGreaterThan(0);
    });

    it('should track cache hit ratio', async () => {
      const mockResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'cache-control': 'max-age=3600' })
      });
      
      const mockFetch = jest.fn().mockResolvedValue(mockResponse);
      global.fetch = mockFetch;
      
      detection.start();
      
      await fetch('/cached-resource');
      
      const state = detection.getState();
      expect(state.performanceMetrics.cacheHitRatio).toBeGreaterThanOrEqual(0);
    });

    it('should check performance thresholds', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('High error rate'));
      global.fetch = mockFetch;
      
      detection.start();
      
      // Generate multiple errors to exceed threshold
      for (let i = 0; i < 10; i++) {
        try {
          await fetch(`/api/error-${i}`);
        } catch (error) {
          // Expected to throw
        }
      }
      
      const state = detection.getState();
      expect(state.eventLog.some(e => 
        e.type === 'error' && 
        e.scope === 'performance' && 
        e.details?.errorRate
      )).toBe(true);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect scope conflicts', async () => {
      const duplicateRegistrations = [
        mockServiceWorkerRegistration,
        {
          ...mockServiceWorkerRegistration,
          active: {
            ...mockServiceWorkerRegistration.active,
            scriptURL: 'https://example.com/sw-v2.js'
          }
        }
      ];
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue(duplicateRegistrations);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Trigger conflict detection
      jest.advanceTimersByTime(10000);
      
      const state = detection.getState();
      expect(state.activeConflicts.size).toBeGreaterThan(0);
      expect(state.eventLog.some(e => e.type === 'conflict' && e.details?.conflictType === 'scope')).toBe(true);
    });

    it('should detect version conflicts', async () => {
      const versionedRegistrations = [
        {
          ...mockServiceWorkerRegistration,
          active: {
            ...mockServiceWorkerRegistration.active,
            scriptURL: 'https://example.com/_next/static/v1/sw.js'
          }
        },
        {
          ...mockServiceWorkerRegistration,
          scope: 'https://example.com/app/',
          active: {
            ...mockServiceWorkerRegistration.active,
            scriptURL: 'https://example.com/_next/static/v2/sw.js'
          }
        }
      ];
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue(versionedRegistrations);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Trigger conflict detection
      jest.advanceTimersByTime(10000);
      
      const state = detection.getState();
      expect(state.eventLog.some(e => e.type === 'conflict' && e.details?.conflictType === 'version')).toBe(true);
    });

    it('should detect capability conflicts', async () => {
      const fullSiteRegistrations = [
        {
          ...mockServiceWorkerRegistration,
          scope: 'https://example.com/'
        },
        {
          ...mockServiceWorkerRegistration,
          scope: 'https://example.com/',
          active: {
            ...mockServiceWorkerRegistration.active,
            scriptURL: 'https://example.com/sw-different.js'
          }
        }
      ];
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue(fullSiteRegistrations);
      
      detection.start();
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Trigger conflict detection
      jest.advanceTimersByTime(10000);
      
      const state = detection.getState();
      expect(state.eventLog.some(e => 
        e.type === 'conflict' && 
        e.details?.conflictType === 'capability' &&
        e.details?.capability === 'full-site-control'
      )).toBe(true);
    });
  });

  describe('Event Management', () => {
    it('should log events with proper format', () => {
      detection.start();
      
      const state = detection.getState();
      
      if (state.eventLog.length > 0) {
        const event = state.eventLog[0];
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('timestamp');
        expect(event).toHaveProperty('scope');
        expect(event).toHaveProperty('severity');
      }
    });

    it('should limit event log size', async () => {
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([]);
      
      detection.start();
      
      // Generate more than 100 events
      for (let i = 0; i < 150; i++) {
        // Trigger change detection
        jest.advanceTimersByTime(5000);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      const state = detection.getState();
      expect(state.eventLog.length).toBeLessThanOrEqual(100);
    });

    it('should clear event log', () => {
      detection.start();
      detection.clearEventLog();
      
      const state = detection.getState();
      expect(state.eventLog).toEqual([]);
    });

    it('should filter events by type', () => {
      detection.start();
      
      const registrationEvents = detection.getEventsByType('registration');
      const errorEvents = detection.getEventsByType('error');
      
      expect(Array.isArray(registrationEvents)).toBe(true);
      expect(Array.isArray(errorEvents)).toBe(true);
    });

    it('should filter events by severity', () => {
      detection.start();
      
      const criticalEvents = detection.getEventsBySeverity('critical');
      const infoEvents = detection.getEventsBySeverity('info');
      
      expect(Array.isArray(criticalEvents)).toBe(true);
      expect(Array.isArray(infoEvents)).toBe(true);
    });
  });

  describe('Observer Pattern', () => {
    it('should allow subscription to state updates', () => {
      const observer = jest.fn();
      const unsubscribe = detection.subscribe(observer);
      
      expect(observer).toHaveBeenCalledWith(expect.any(Object));
      expect(typeof unsubscribe).toBe('function');
    });

    it('should notify observers on state changes', async () => {
      const observer = jest.fn();
      detection.subscribe(observer);
      
      observer.mockClear();
      
      mockNavigator.serviceWorker.getRegistrations.mockResolvedValue([mockServiceWorkerRegistration]);
      detection.start();
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(observer).toHaveBeenCalled();
    });

    it('should unsubscribe observers correctly', () => {
      const observer = jest.fn();
      const unsubscribe = detection.subscribe(observer);
      
      observer.mockClear();
      unsubscribe();
      
      detection.start();
      expect(observer).not.toHaveBeenCalled();
    });

    it('should handle observer notification failures', () => {
      const failingObserver = jest.fn().mockImplementation(() => {
        throw new Error('Observer failed');
      });
      
      detection.subscribe(failingObserver);
      
      // Should not throw error
      expect(() => detection.start()).not.toThrow();
    });
  });

  describe('Lifecycle Management', () => {
    it('should start monitoring', () => {
      detection.start();
      expect(detection.getState().isMonitoring).toBe(true);
    });

    it('should stop monitoring', () => {
      detection.start();
      detection.stop();
      
      const state = detection.getState();
      expect(state.isMonitoring).toBe(false);
    });

    it('should cleanup intervals on stop', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      detection.start();
      detection.stop();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should disconnect performance observer on stop', () => {
      const disconnectSpy = jest.fn();
      mockPerformanceObserver.mockReturnValue({
        observe: jest.fn(),
        disconnect: disconnectSpy
      });
      
      detection.start();
      detection.stop();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should respect enableRealTimeMonitoring setting', () => {
      const disabledConfig = { ...config, enableRealTimeMonitoring: false };
      const disabledDetection = new RuntimeServiceWorkerDetection(disabledConfig);
      
      disabledDetection.start();
      
      // Should not set up monitoring intervals
      expect(mockNavigator.serviceWorker.addEventListener).not.toHaveBeenCalled();
    });

    it('should respect enableConflictDetection setting', () => {
      const disabledConfig = { ...config, enableConflictDetection: false };
      const disabledDetection = new RuntimeServiceWorkerDetection(disabledConfig);
      
      disabledDetection.start();
      
      // Should not detect conflicts
      expect(disabledDetection.getState().activeConflicts.size).toBe(0);
    });

    it('should use custom alert thresholds', async () => {
      const customConfig = {
        ...config,
        alertThresholds: {
          errorRate: 1, // Very low threshold
          responseTime: 100,
          cacheHitRatio: 95
        }
      };
      
      const customDetection = new RuntimeServiceWorkerDetection(customConfig);
      const mockFetch = jest.fn().mockRejectedValue(new Error('Error'));
      global.fetch = mockFetch;
      
      customDetection.start();
      
      try {
        await fetch('/api/test');
      } catch (error) {
        // Expected to throw
      }
      
      const state = customDetection.getState();
      expect(state.eventLog.some(e => e.type === 'error' && e.scope === 'performance')).toBe(true);
      
      customDetection.stop();
    });
  });

  describe('Error Handling', () => {
    it('should handle unsupported browser gracefully', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      });
      
      const unsupportedDetection = new RuntimeServiceWorkerDetection();
      expect(() => unsupportedDetection.start()).not.toThrow();
    });

    it('should handle getRegistrations failures', async () => {
      mockNavigator.serviceWorker.getRegistrations.mockRejectedValue(new Error('Network error'));
      
      detection.start();
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const state = detection.getState();
      expect(state.eventLog.some(e => e.type === 'error')).toBe(true);
    });

    it('should handle performance observer creation failures', () => {
      Object.defineProperty(global, 'PerformanceObserver', {
        value: undefined,
        writable: true
      });
      
      const detectionWithoutPerfObs = new RuntimeServiceWorkerDetection(config);
      expect(() => detectionWithoutPerfObs.start()).not.toThrow();
    });
  });

  describe('Factory Function', () => {
    it('should create new instance via factory function', () => {
      const newDetection = createRuntimeDetection();
      
      expect(newDetection).toBeInstanceOf(RuntimeServiceWorkerDetection);
      expect(newDetection).not.toBe(detection);
    });

    it('should create instance with custom config via factory', () => {
      const customConfig = { enableRealTimeMonitoring: false };
      const newDetection = createRuntimeDetection(customConfig);
      
      expect(newDetection).toBeInstanceOf(RuntimeServiceWorkerDetection);
    });
  });
});
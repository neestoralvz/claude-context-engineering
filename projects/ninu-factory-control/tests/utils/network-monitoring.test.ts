/**
 * Network Request Monitoring Tests
 * Comprehensive test suite for network request monitoring utilities
 * 
 * @file network-monitoring.test.ts
 * @description TDD tests for NetworkRequestMonitor class and utilities
 */

import { 
  NetworkRequestMonitor, 
  createNetworkMonitor,
  type NetworkMonitoringState,
  type NetworkRequest,
  type MonitoringConfiguration
} from '../../lib/utils/network-monitoring';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock XMLHttpRequest
const mockXMLHttpRequest = {
  open: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  status: 200,
  statusText: 'OK',
  responseText: 'Mock response'
};

Object.defineProperty(global, 'XMLHttpRequest', {
  value: jest.fn(() => mockXMLHttpRequest),
  writable: true
});

// Mock Performance API
const mockPerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}));

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true
});

Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
  },
  writable: true
});

// Mock ServiceWorker API
Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: {
      getRegistrations: jest.fn().mockResolvedValue([])
    }
  },
  writable: true
});

describe('NetworkRequestMonitor', () => {
  let monitor: NetworkRequestMonitor;
  let config: MonitoringConfiguration;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    config = {
      enableRequestInterception: true,
      enablePerformanceTracking: true,
      enableServiceWorkerAnalysis: true,
      maxRequestHistory: 100,
      aggregationInterval: 1000,
      excludePatterns: ['/favicon.ico'],
      includePatterns: ['**']
    };
    
    monitor = new NetworkRequestMonitor(config);
  });

  afterEach(() => {
    jest.useRealTimers();
    monitor.stop();
  });

  describe('Initialization', () => {
    it('should create monitor instance with default config', () => {
      const defaultMonitor = new NetworkRequestMonitor();
      expect(defaultMonitor).toBeInstanceOf(NetworkRequestMonitor);
    });

    it('should create monitor instance with custom config', () => {
      expect(monitor).toBeInstanceOf(NetworkRequestMonitor);
    });

    it('should initialize with empty state', () => {
      const state = monitor.getState();
      
      expect(state.isActive).toBe(false);
      expect(state.requestHistory).toEqual([]);
      expect(state.analytics.totalRequests).toBe(0);
      expect(state.realTimeMetrics).toBeDefined();
    });

    it('should start monitoring when started', () => {
      monitor.start();
      
      const state = monitor.getState();
      expect(state.isActive).toBe(true);
    });
  });

  describe('Fetch Interception', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should intercept fetch requests', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      
      // Wait for aggregation
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      expect(state.requestHistory.length).toBeGreaterThan(0);
      
      const request = state.requestHistory[0];
      expect(request.url).toContain('/api/test');
      expect(request.method).toBe('GET');
      expect(request.status).toBe(200);
    });

    it('should track request duration', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/timed');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      try {
        await fetch('/api/failing');
      } catch (error) {
        // Expected to throw
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.error).toContain('Network error');
    });

    it('should detect cached responses', async () => {
      const mockResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'cache-control': 'max-age=3600' })
      });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/cached');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.cached).toBe(true);
    });

    it('should detect service worker interception', async () => {
      const mockResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/sw-intercepted');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.serviceWorkerIntercepted).toBe(true);
    });

    it('should exclude requests matching exclude patterns', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/favicon.ico');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      expect(state.requestHistory).toHaveLength(0);
    });

    it('should determine request types correctly', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      const testCases = [
        { url: '/script.js', expectedType: 'script' },
        { url: '/style.css', expectedType: 'stylesheet' },
        { url: '/image.png', expectedType: 'image' },
        { url: '/font.woff2', expectedType: 'font' },
        { url: '/page.html', expectedType: 'document' },
        { url: '/api/data', expectedType: 'xhr' },
        { url: '/unknown', expectedType: 'other' }
      ];
      
      for (const testCase of testCases) {
        await fetch(testCase.url);
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      testCases.forEach((testCase, index) => {
        const request = state.requestHistory[index];
        expect(request.type).toBe(testCase.expectedType);
      });
    });
  });

  describe('XMLHttpRequest Interception', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should intercept XMLHttpRequest', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/xhr-test');
      xhr.send();
      
      // Simulate loadend event
      const loadendHandler = mockXMLHttpRequest.addEventListener.mock.calls
        .find(call => call[0] === 'loadend')?.[1];
      
      if (loadendHandler) {
        loadendHandler();
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      expect(state.requestHistory.length).toBeGreaterThan(0);
      
      const request = state.requestHistory[0];
      expect(request.url).toContain('/api/xhr-test');
      expect(request.method).toBe('GET');
    });

    it('should track XMLHttpRequest duration', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/xhr-post');
      xhr.send('test data');
      
      // Simulate loadend event
      const loadendHandler = mockXMLHttpRequest.addEventListener.mock.calls
        .find(call => call[0] === 'loadend')?.[1];
      
      if (loadendHandler) {
        loadendHandler();
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.duration).toBeGreaterThanOrEqual(0);
      expect(request.method).toBe('POST');
    });

    it('should handle XMLHttpRequest errors', () => {
      mockXMLHttpRequest.status = 500;
      mockXMLHttpRequest.statusText = 'Internal Server Error';
      
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/xhr-error');
      xhr.send();
      
      // Simulate loadend event
      const loadendHandler = mockXMLHttpRequest.addEventListener.mock.calls
        .find(call => call[0] === 'loadend')?.[1];
      
      if (loadendHandler) {
        loadendHandler();
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.error).toContain('500');
    });
  });

  describe('Performance Tracking', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should track performance entries', () => {
      const mockEntry = {
        name: 'https://example.com/api/test',
        startTime: 100,
        duration: 50,
        transferSize: 1024,
        decodedBodySize: 2048
      };
      
      // Simulate performance observer callback
      const observerCallback = mockPerformanceObserver.mock.calls[0]?.[0];
      if (observerCallback) {
        observerCallback({
          getEntries: () => [mockEntry]
        });
      }
      
      // This would correlate with existing requests in a real scenario
      expect(mockPerformanceObserver).toHaveBeenCalled();
    });

    it('should setup performance observer', () => {
      expect(mockPerformanceObserver).toHaveBeenCalled();
      
      const observerInstance = mockPerformanceObserver.mock.results[0]?.value;
      expect(observerInstance.observe).toHaveBeenCalledWith({
        entryTypes: ['navigation', 'resource', 'measure']
      });
    });

    it('should disconnect performance observer on stop', () => {
      const observerInstance = mockPerformanceObserver.mock.results[0]?.value;
      
      monitor.stop();
      
      expect(observerInstance.disconnect).toHaveBeenCalled();
    });
  });

  describe('Analytics Calculation', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should calculate basic analytics', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test1');
      await fetch('/api/test2');
      
      // Trigger analytics update
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.analytics.totalRequests).toBe(2);
      expect(state.analytics.successfulRequests).toBe(2);
      expect(state.analytics.failedRequests).toBe(0);
    });

    it('should calculate error analytics', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('OK', { status: 200 }))
        .mockRejectedValueOnce(new Error('Failed'));
      
      await fetch('/api/success');
      
      try {
        await fetch('/api/failure');
      } catch (error) {
        // Expected to throw
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.analytics.totalRequests).toBe(2);
      expect(state.analytics.successfulRequests).toBe(1);
      expect(state.analytics.failedRequests).toBe(1);
    });

    it('should calculate average response time', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.analytics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should categorize requests by type', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/script.js');
      await fetch('/style.css');
      await fetch('/api/data');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.analytics.requestsByType.script).toBe(1);
      expect(state.analytics.requestsByType.stylesheet).toBe(1);
      expect(state.analytics.requestsByType.xhr).toBe(1);
    });

    it('should track errors by status code', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
        .mockResolvedValueOnce(new Response('Server Error', { status: 500 }));
      
      await fetch('/api/notfound');
      await fetch('/api/servererror');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.analytics.errorsByStatus[404]).toBe(1);
      expect(state.analytics.errorsByStatus[500]).toBe(1);
    });
  });

  describe('Service Worker Impact Analysis', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should analyze service worker performance impact', async () => {
      const swResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      const normalResponse = new Response('OK', { status: 200 });
      
      mockFetch
        .mockResolvedValueOnce(swResponse)
        .mockResolvedValueOnce(normalResponse);
      
      await fetch('/api/sw-request');
      await fetch('/api/normal-request');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const impact = state.analytics.serviceWorkerImpact;
      
      expect(impact.interceptedRequests).toBe(1);
      expect(impact.performanceImpact).toBeDefined();
    });

    it('should track cache hits and misses', async () => {
      const cachedResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 
          'x-served-by': 'service-worker',
          'cache-control': 'max-age=3600'
        })
      });
      const uncachedResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      
      mockFetch
        .mockResolvedValueOnce(cachedResponse)
        .mockResolvedValueOnce(uncachedResponse);
      
      await fetch('/api/cached');
      await fetch('/api/uncached');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const impact = state.analytics.serviceWorkerImpact;
      
      expect(impact.cacheHits).toBe(1);
      expect(impact.cacheMisses).toBe(1);
    });

    it('should calculate error introduction rate', async () => {
      const swErrorResponse = new Response('Error', { 
        status: 500,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      
      mockFetch.mockResolvedValue(swErrorResponse);
      
      await fetch('/api/sw-error');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const impact = state.analytics.serviceWorkerImpact;
      
      expect(impact.errorIntroduction).toBeGreaterThan(0);
    });
  });

  describe('Real-time Metrics', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should calculate requests per second', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      // Make requests
      await fetch('/api/test1');
      await fetch('/api/test2');
      
      // Trigger real-time update
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.realTimeMetrics.requestsPerSecond).toBeGreaterThanOrEqual(0);
    });

    it('should calculate real-time error rate', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('OK', { status: 200 }))
        .mockRejectedValueOnce(new Error('Failed'));
      
      await fetch('/api/success');
      
      try {
        await fetch('/api/failure');
      } catch (error) {
        // Expected to throw
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.realTimeMetrics.errorRate).toBeGreaterThan(0);
    });

    it('should calculate average latency', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.realTimeMetrics.averageLatency).toBeGreaterThanOrEqual(0);
    });

    it('should calculate service worker hit rate', async () => {
      const swResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      const normalResponse = new Response('OK', { status: 200 });
      
      mockFetch
        .mockResolvedValueOnce(swResponse)
        .mockResolvedValueOnce(normalResponse);
      
      await fetch('/api/sw-request');
      await fetch('/api/normal-request');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      
      expect(state.realTimeMetrics.serviceWorkerHitRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Observer Pattern', () => {
    it('should allow subscription to state updates', () => {
      const observer = jest.fn();
      const unsubscribe = monitor.subscribe(observer);
      
      expect(observer).toHaveBeenCalledWith(expect.any(Object));
      expect(typeof unsubscribe).toBe('function');
    });

    it('should notify observers on state changes', async () => {
      const observer = jest.fn();
      monitor.subscribe(observer);
      
      observer.mockClear();
      monitor.start();
      
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      jest.advanceTimersByTime(1000);
      
      expect(observer).toHaveBeenCalled();
    });

    it('should unsubscribe observers correctly', () => {
      const observer = jest.fn();
      const unsubscribe = monitor.subscribe(observer);
      
      observer.mockClear();
      unsubscribe();
      
      monitor.start();
      expect(observer).not.toHaveBeenCalled();
    });

    it('should handle observer notification failures', () => {
      const failingObserver = jest.fn().mockImplementation(() => {
        throw new Error('Observer failed');
      });
      
      monitor.subscribe(failingObserver);
      
      // Should not throw error
      expect(() => monitor.start()).not.toThrow();
    });
  });

  describe('Request History Management', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should limit request history size', async () => {
      const limitedMonitor = new NetworkRequestMonitor({
        ...config,
        maxRequestHistory: 5
      });
      
      limitedMonitor.start();
      
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      // Make more requests than the limit
      for (let i = 0; i < 10; i++) {
        await fetch(`/api/test${i}`);
      }
      
      jest.advanceTimersByTime(1000);
      
      const state = limitedMonitor.getState();
      expect(state.requestHistory.length).toBeLessThanOrEqual(5);
      
      limitedMonitor.stop();
    });

    it('should clear request history', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      jest.advanceTimersByTime(1000);
      
      monitor.clearHistory();
      
      const state = monitor.getState();
      expect(state.requestHistory).toEqual([]);
      expect(state.analytics.totalRequests).toBe(0);
    });

    it('should filter requests by pattern', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/users');
      await fetch('/api/posts');
      await fetch('/static/image.png');
      
      jest.advanceTimersByTime(1000);
      
      const apiRequests = monitor.getRequestsByPattern('/api/*');
      const staticRequests = monitor.getRequestsByPattern('/static/*');
      
      expect(apiRequests.length).toBe(2);
      expect(staticRequests.length).toBe(1);
    });

    it('should get service worker intercepted requests', async () => {
      const swResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      const normalResponse = new Response('OK', { status: 200 });
      
      mockFetch
        .mockResolvedValueOnce(swResponse)
        .mockResolvedValueOnce(normalResponse);
      
      await fetch('/api/sw-request');
      await fetch('/api/normal-request');
      
      jest.advanceTimersByTime(1000);
      
      const swRequests = monitor.getServiceWorkerRequests();
      
      expect(swRequests.length).toBe(1);
      expect(swRequests[0].serviceWorkerIntercepted).toBe(true);
    });

    it('should get failed requests', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('OK', { status: 200 }))
        .mockResolvedValueOnce(new Response('Error', { status: 500 }))
        .mockRejectedValueOnce(new Error('Network error'));
      
      await fetch('/api/success');
      await fetch('/api/server-error');
      
      try {
        await fetch('/api/network-error');
      } catch (error) {
        // Expected to throw
      }
      
      jest.advanceTimersByTime(1000);
      
      const failedRequests = monitor.getFailedRequests();
      
      expect(failedRequests.length).toBe(2);
    });
  });

  describe('Data Export', () => {
    beforeEach(() => {
      monitor.start();
    });

    it('should export analytics data', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      jest.advanceTimersByTime(1000);
      
      const exportData = monitor.exportAnalytics();
      
      expect(exportData).toHaveProperty('timestamp');
      expect(exportData).toHaveProperty('configuration');
      expect(exportData).toHaveProperty('analytics');
      expect(exportData).toHaveProperty('realTimeMetrics');
      expect(exportData).toHaveProperty('requestSample');
    });

    it('should include request sample in export', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      // Make multiple requests
      for (let i = 0; i < 150; i++) {
        await fetch(`/api/test${i}`);
      }
      
      jest.advanceTimersByTime(1000);
      
      const exportData = monitor.exportAnalytics();
      
      // Should include last 100 requests
      expect(exportData.requestSample.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Lifecycle Management', () => {
    it('should start monitoring', () => {
      monitor.start();
      expect(monitor.getState().isActive).toBe(true);
    });

    it('should stop monitoring', () => {
      monitor.start();
      monitor.stop();
      
      const state = monitor.getState();
      expect(state.isActive).toBe(false);
    });

    it('should restore original fetch on stop', () => {
      const originalFetch = global.fetch;
      
      monitor.start();
      expect(global.fetch).not.toBe(originalFetch);
      
      monitor.stop();
      expect(global.fetch).toBe(originalFetch);
    });

    it('should restore original XMLHttpRequest on stop', () => {
      const originalXHR = global.XMLHttpRequest;
      
      monitor.start();
      monitor.stop();
      
      expect(global.XMLHttpRequest).toBe(originalXHR);
    });

    it('should clear intervals on stop', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      monitor.start();
      monitor.stop();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should respect enableRequestInterception setting', () => {
      const disabledConfig = { ...config, enableRequestInterception: false };
      const disabledMonitor = new NetworkRequestMonitor(disabledConfig);
      
      const originalFetch = global.fetch;
      
      disabledMonitor.start();
      
      // Should not intercept fetch
      expect(global.fetch).toBe(originalFetch);
      
      disabledMonitor.stop();
    });

    it('should respect custom exclude patterns', async () => {
      const customConfig = {
        ...config,
        excludePatterns: ['/api/exclude*', '*.ignore']
      };
      const customMonitor = new NetworkRequestMonitor(customConfig);
      
      customMonitor.start();
      
      const mockResponse = new Response('OK', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/exclude/test');
      await fetch('/file.ignore');
      await fetch('/api/include/test');
      
      jest.advanceTimersByTime(1000);
      
      const state = customMonitor.getState();
      expect(state.requestHistory.length).toBe(1);
      expect(state.requestHistory[0].url).toContain('/api/include/test');
      
      customMonitor.stop();
    });

    it('should respect custom aggregation interval', () => {
      const customConfig = { ...config, aggregationInterval: 500 };
      const customMonitor = new NetworkRequestMonitor(customConfig);
      
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      customMonitor.start();
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500);
      
      customMonitor.stop();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch interception errors', async () => {
      monitor.start();
      
      // Mock fetch to throw during interception setup
      mockFetch.mockImplementation(() => {
        throw new Error('Fetch setup error');
      });
      
      try {
        await fetch('/api/test');
      } catch (error) {
        // Expected to throw
      }
      
      // Should not crash the monitor
      const state = monitor.getState();
      expect(state.isActive).toBe(true);
    });

    it('should handle XMLHttpRequest interception errors', () => {
      monitor.start();
      
      // Mock XMLHttpRequest to throw
      Object.defineProperty(global, 'XMLHttpRequest', {
        value: jest.fn(() => {
          throw new Error('XHR setup error');
        }),
        writable: true
      });
      
      expect(() => new XMLHttpRequest()).toThrow();
      
      // Monitor should still be active
      const state = monitor.getState();
      expect(state.isActive).toBe(true);
    });

    it('should handle performance observer errors', () => {
      mockPerformanceObserver.mockImplementation(() => {
        throw new Error('Performance observer error');
      });
      
      // Should not throw during initialization
      expect(() => monitor.start()).not.toThrow();
    });

    it('should handle service worker scope detection failures', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            getRegistrations: jest.fn().mockRejectedValue(new Error('SW error'))
          }
        },
        writable: true
      });
      
      monitor.start();
      
      const mockResponse = new Response('OK', { 
        status: 200,
        headers: new Headers({ 'x-served-by': 'service-worker' })
      });
      mockFetch.mockResolvedValue(mockResponse);
      
      await fetch('/api/test');
      
      jest.advanceTimersByTime(1000);
      
      const state = monitor.getState();
      const request = state.requestHistory[0];
      
      expect(request.serviceWorkerIntercepted).toBe(true);
      expect(request.serviceWorkerScope).toBeUndefined();
    });
  });

  describe('Factory Function', () => {
    it('should create new instance via factory function', () => {
      const newMonitor = createNetworkMonitor();
      
      expect(newMonitor).toBeInstanceOf(NetworkRequestMonitor);
      expect(newMonitor).not.toBe(monitor);
    });

    it('should create instance with custom config via factory', () => {
      const customConfig = { maxRequestHistory: 50 };
      const newMonitor = createNetworkMonitor(customConfig);
      
      expect(newMonitor).toBeInstanceOf(NetworkRequestMonitor);
    });
  });
});
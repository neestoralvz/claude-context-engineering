# Real-Time Performance Monitoring Core

**Module Purpose**: CRITICAL real-time performance monitoring system with comprehensive observers, dashboard components, and live metrics collection for the Context Engineering ecosystem.

**Navigation**: [← Main Hub](./monitoring-testing-protocols.md) | [Testing Framework →](./monitoring-testing-protocols-testing.md) | [Analytics & Results →](./monitoring-testing-protocols-analytics.md)

**Integration**: [Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md) | [Bundle & Runtime Optimization](./bundle-runtime-optimization.md)

---

## 📊 Real-Time Performance Monitoring

### **Comprehensive Performance Monitoring System**

### **Core Performance Metrics Collection**
```typescript
// Advanced performance monitoring with real-time analytics
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: PerformanceObserver[] = [];
  private analyticsEndpoint: string;
  private isMonitoringActive: boolean = true;
  
  constructor(config: MonitoringConfig = {}) {
    this.analyticsEndpoint = config.endpoint || '/api/analytics';
    this.initializeObservers();
    this.startPeriodicReporting();
  }
  
  private initializeObservers() {
    // Long Task Observer for main thread blocking detection
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('long-task', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
            severity: this.calculateTaskSeverity(entry.duration)
          });
          
          // Immediate alert for critical long tasks
          if (entry.duration > 100) {
            this.triggerPerformanceAlert('critical-long-task', {
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        }
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported:', e);
      }
    }
    
    // Navigation Performance Observer
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
      }
    });
    
    navigationObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navigationObserver);
    
    // Resource Loading Observer
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordResourceMetrics(entry as PerformanceResourceTiming);
      }
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }
  
  recordMetric(name: string, data: any) {
    if (!this.isMonitoringActive) return;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const enrichedData = {
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo(),
      ...data
    };
    
    this.metrics.get(name)!.push(enrichedData);
    
    // Maintain rolling window of 1000 entries
    const entries = this.metrics.get(name)!;
    if (entries.length > 1000) {
      entries.shift();
    }
    
    // Real-time analysis and alerting
    if (this.isSignificantMetric(name, data)) {
      this.sendToAnalytics(name, enrichedData);
    }
    
    // Update real-time dashboard
    this.updateDashboard(name, enrichedData);
  }
  
  private calculateTaskSeverity(duration: number): 'low' | 'medium' | 'high' | 'critical' {
    if (duration > 200) return 'critical';  // >200ms blocks user interaction
    if (duration > 100) return 'high';      // >100ms noticeable lag
    if (duration > 50) return 'medium';     // >50ms performance impact
    return 'low';
  }
  
  private isSignificantMetric(name: string, data: any): boolean {
    const thresholds = {
      'long-task': 50,           // Tasks longer than 50ms
      'component-render': 16,    // Renders longer than 16ms (60fps)
      'feature-load': 2000,      // Feature loads longer than 2s
      'formula-render': 100,     // Formula renders longer than 100ms
      'navigation': 3000,        // Navigation longer than 3s
      'resource-load': 1000,     // Resource loads longer than 1s
      'context-switch': 500,     // Context switches longer than 500ms
      'memory-usage': 50000000   // Memory usage above 50MB
    };
    
    return data.duration > (thresholds[name] || 0) || 
           data.size > (thresholds[name] || 0);
  }
  
  getPerformanceSummary(): PerformanceSummary {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    return {
      timestamp: now,
      period: '24 hours',
      metrics: {
        averageLoadTime: this.calculateAverage('page-load', 'duration', last24Hours),
        longTaskCount: this.getMetricCount('long-task', last24Hours),
        averageRenderTime: this.calculateAverage('component-render', 'duration', last24Hours),
        cacheHitRate: this.calculateCacheHitRate(last24Hours),
        memoryUsage: this.getCurrentMemoryUsage(),
        errorRate: this.calculateErrorRate(last24Hours),
        userSatisfactionScore: this.calculateUserSatisfaction(last24Hours)
      },
      webVitals: this.getWebVitalsMetrics(),
      trends: this.calculateTrends(),
      alerts: this.getActiveAlerts(),
      recommendations: this.generateRecommendations()
    };
  }
  
  // Real-time alerting system
  private triggerPerformanceAlert(type: string, data: any) {
    const alert = {
      id: `alert-${Date.now()}`,
      type,
      severity: this.getAlertSeverity(type, data),
      message: this.generateAlertMessage(type, data),
      timestamp: Date.now(),
      data
    };
    
    // Send to monitoring dashboard
    this.sendAlert(alert);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Performance Alert:', alert);
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor({
  endpoint: '/api/performance-analytics',
  alertThresholds: {
    criticalLongTask: 200,
    highRenderTime: 100,
    lowCacheHitRate: 0.7
  }
});
```

### **Real-Time Performance Dashboard Component**
```typescript
// Interactive performance dashboard with live metrics
export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceSummary>();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  
  // Real-time metrics updates
  useEffect(() => {
    const updateMetrics = () => {
      const summary = performanceMonitor.getPerformanceSummary();
      setMetrics(summary);
      setAlerts(summary.alerts);
    };
    
    // Initial load
    updateMetrics();
    
    // Real-time updates every second
    const interval = setInterval(updateMetrics, 1000);
    
    // WebSocket connection for real-time alerts
    const ws = new WebSocket('/ws/performance');
    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      setAlerts(prev => [...prev, alert]);
    };
    
    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);
  
  // Show only in development or for admin users
  if (process.env.NODE_ENV === 'production' && !isAdminUser()) {
    return null;
  }
  
  const getMetricColor = (value: number, thresholds: { good: number, warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-16 right-4 w-96 max-h-96 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border z-50 overflow-hidden"
        >
          {/* Alert notifications */}
          {alerts.length > 0 && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
              <div className="text-sm font-medium text-red-800 dark:text-red-200">
                {alerts.length} Performance Alert{alerts.length > 1 ? 's' : ''}
              </div>
            </div>
          )}
          
          {/* Metric tabs */}
          <div className="flex space-x-2 mb-3">
            {['overview', 'loading', 'rendering', 'memory'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedMetric(tab)}
                className={`px-2 py-1 text-xs rounded ${
                  selectedMetric === tab 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Metrics display */}
          <div className="text-sm space-y-2 max-h-64 overflow-y-auto">
            {metrics && selectedMetric === 'overview' && (
              <>
                <div className="font-semibold border-b pb-1">Performance Overview</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
                    <span className={`ml-1 font-mono ${getMetricColor(metrics.metrics.averageLoadTime, { good: 1000, warning: 2000 })}`}>
                      {metrics.metrics.averageLoadTime?.toFixed(0)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Long Tasks:</span>
                    <span className={`ml-1 font-mono ${getMetricColor(metrics.metrics.longTaskCount, { good: 0, warning: 5 })}`}>
                      {metrics.metrics.longTaskCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Render Time:</span>
                    <span className={`ml-1 font-mono ${getMetricColor(metrics.metrics.averageRenderTime, { good: 16, warning: 50 })}`}>
                      {metrics.metrics.averageRenderTime?.toFixed(1)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cache Hit:</span>
                    <span className={`ml-1 font-mono ${getMetricColor(1 - metrics.metrics.cacheHitRate, { good: 0.1, warning: 0.3 })}`}>
                      {(metrics.metrics.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Web Vitals */}
                <div className="mt-3 pt-2 border-t">
                  <div className="font-semibold text-xs text-gray-600 dark:text-gray-400 mb-1">Core Web Vitals</div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div>LCP: <span className="font-mono">{metrics.webVitals?.lcp?.toFixed(0)}ms</span></div>
                    <div>FID: <span className="font-mono">{metrics.webVitals?.fid?.toFixed(0)}ms</span></div>
                    <div>CLS: <span className="font-mono">{metrics.webVitals?.cls?.toFixed(3)}</span></div>
                  </div>
                </div>
              </>
            )}
            
            {/* Memory metrics */}
            {metrics && selectedMetric === 'memory' && (
              <>
                <div className="font-semibold border-b pb-1">Memory Usage</div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                  <span className="ml-1 font-mono">{(metrics.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Satisfaction:</span>
                  <span className="ml-1 font-mono">{(metrics.metrics.userSatisfactionScore * 100).toFixed(0)}%</span>
                </div>
              </>
            )}
          </div>
          
          {/* Performance grade */}
          {metrics && (
            <div className="mt-3 pt-2 border-t flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Performance Grade:</span>
              <span className={`font-bold text-lg ${
                metrics.metrics.userSatisfactionScore > 0.9 ? 'text-green-600' :
                metrics.metrics.userSatisfactionScore > 0.8 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.metrics.userSatisfactionScore > 0.95 ? 'A+' :
                 metrics.metrics.userSatisfactionScore > 0.9 ? 'A' :
                 metrics.metrics.userSatisfactionScore > 0.8 ? 'B' :
                 metrics.metrics.userSatisfactionScore > 0.7 ? 'C' : 'D'}
              </span>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg z-50 transition-colors ${
          alerts.length > 0 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={`Performance Monitor ${alerts.length > 0 ? `(${alerts.length} alerts)` : ''}`}
      >
        📊
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>
    </AnimatePresence>
  );
};
```

---

## 🔗 Module Integration Network

### **Cross-Reference Intelligence**
- **[Main Hub](./monitoring-testing-protocols.md)** - Complete monitoring & testing overview
- **[Testing Framework](./monitoring-testing-protocols-testing.md)** - Automated testing infrastructure
- **[Analytics & Results](./monitoring-testing-protocols-analytics.md)** - Performance achievements and metrics
- **[Performance Hub](../strategies/PERFORMANCE_OPTIMIZATION.md)** - Complete performance optimization guide
- **[Bundle & Runtime Optimization](./bundle-runtime-optimization.md)** - Technical optimization implementations

### **Core Technologies**
- **Performance Observer API**: Real-time browser performance monitoring
- **WebSocket Connections**: Live performance alert system
- **React Hooks**: Real-time dashboard state management
- **TypeScript Interfaces**: Strongly typed performance metrics
- **Analytics Integration**: Custom performance data collection

---

**Quick Navigation**: [← Main Hub](./monitoring-testing-protocols.md) | [Testing Framework →](./monitoring-testing-protocols-testing.md) | [Analytics & Results →](./monitoring-testing-protocols-analytics.md)

# Service Worker Diagnostics Tools

Comprehensive debugging and diagnostic tools for detecting and resolving service worker conflicts in the Ninu Factory Control application.

## Overview

This module provides a complete suite of tools for:
- **Real-time service worker detection and monitoring**
- **Automatic conflict detection and resolution**
- **Network request interception and analysis**
- **Performance monitoring and optimization**
- **Visual diagnostic interface**

## Components

### 🔍 Core Diagnostic Utilities

#### `ServiceWorkerDiagnostics`
Main diagnostic engine that scans, analyzes, and reports service worker issues.

**Features:**
- Registration scanning and state analysis
- Conflict detection (duplicate scopes, version mismatches, cache conflicts)
- Performance metrics calculation
- Auto-resolution capabilities
- Real-time observer pattern

**Usage:**
```typescript
import { serviceWorkerDiagnostics } from '../../lib/utils/service-worker-diagnostics';

// Subscribe to diagnostic updates
const unsubscribe = serviceWorkerDiagnostics.subscribe((result) => {
  console.log('Diagnostics:', result);
});

// Get current state
const result = serviceWorkerDiagnostics.getCurrentResult();

// Auto-resolve conflicts
const resolution = await serviceWorkerDiagnostics.autoResolveConflicts();
```

#### `RuntimeServiceWorkerDetection`
Real-time monitoring system for service worker activity and conflicts.

**Features:**
- Continuous monitoring of service worker registrations
- Performance tracking with fetch interception
- Automatic conflict detection
- Event logging and analysis
- Configurable alert thresholds

**Usage:**
```typescript
import { runtimeServiceWorkerDetection } from '../../lib/utils/runtime-sw-detection';

// Start monitoring
runtimeServiceWorkerDetection.start();

// Subscribe to events
const unsubscribe = runtimeServiceWorkerDetection.subscribe((state) => {
  console.log('Runtime state:', state);
});

// Get events by type
const errors = runtimeServiceWorkerDetection.getEventsByType('error');
```

#### `NetworkRequestMonitor`
Network request monitoring with service worker impact analysis.

**Features:**
- Fetch and XMLHttpRequest interception
- Service worker impact analysis
- Performance metrics calculation
- Real-time monitoring dashboard
- Request filtering and categorization

**Usage:**
```typescript
import { networkRequestMonitor } from '../../lib/utils/network-monitoring';

// Start monitoring
networkRequestMonitor.start();

// Get service worker intercepted requests
const swRequests = networkRequestMonitor.getServiceWorkerRequests();

// Export analytics
const data = networkRequestMonitor.exportAnalytics();
```

#### `ServiceWorkerConflictResolver`
Intelligent conflict resolution with multiple strategies.

**Features:**
- Multiple resolution strategies (duplicate scope, version mismatch, cache conflicts)
- User preference management
- Dry-run capabilities
- Backup and recovery
- Custom strategy registration

**Usage:**
```typescript
import { serviceWorkerConflictResolver } from '../../lib/utils/sw-conflict-resolver';

// Resolve conflicts automatically
const report = await serviceWorkerConflictResolver.resolveConflicts(conflicts);

// Preview resolution without changes
const preview = await serviceWorkerConflictResolver.previewResolution(conflicts);

// Register custom strategy
serviceWorkerConflictResolver.registerStrategy(customStrategy);
```

### 🎨 UI Components

#### `ServiceWorkerStatusIndicator`
Visual status indicator with health monitoring.

**Props:**
```typescript
interface ServiceWorkerStatusIndicatorProps {
  detailed?: boolean;          // Show detailed information
  compact?: boolean;           // Compact mode for minimal space
  interactive?: boolean;       // Enable interactive controls
  className?: string;          // Custom styling
  onStatusChange?: (status: ServiceWorkerStatus) => void;
}
```

**Features:**
- Health status visualization (healthy, warning, error, critical)
- Performance metrics display
- Registration details
- Conflict information
- Interactive refresh controls

#### `ServiceWorkerDiagnosticPage`
Complete diagnostic dashboard with tabbed interface.

**Props:**
```typescript
interface ServiceWorkerDiagnosticPageProps {
  developerMode?: boolean;     // Enable developer controls
  autoRefreshInterval?: number; // Auto-refresh interval in seconds
}
```

**Features:**
- **Overview Tab**: Status summary and quick actions
- **Conflicts Tab**: Detailed conflict analysis and resolution
- **Network Tab**: Network monitoring and service worker impact
- **Events Tab**: Real-time event log
- **Debug Tab**: Developer tools and raw data

## Installation & Setup

### 1. Dependencies
Ensure you have the required dependencies:
```bash
npm install lucide-react
```

### 2. Add to Layout
Update your layout to include the diagnostic status indicator:

```tsx
import ServiceWorkerStatusIndicator from '../components/diagnostics/ServiceWorkerStatusIndicator';

export default function Layout({ children }) {
  return (
    <div>
      <header>
        {/* Your header content */}
        <ServiceWorkerStatusIndicator compact interactive />
      </header>
      {children}
    </div>
  );
}
```

### 3. Add Diagnostic Route
Create a diagnostic page route:

```tsx
// app/diagnostics/page.tsx
import ServiceWorkerDiagnosticPage from '../../components/diagnostics/ServiceWorkerDiagnosticPage';

export default function DiagnosticsPage() {
  return (
    <ServiceWorkerDiagnosticPage 
      developerMode={process.env.NODE_ENV === 'development'}
      autoRefreshInterval={30}
    />
  );
}
```

### 4. Navigation Links
Add links to the diagnostic page:

```tsx
<Link href="/diagnostics">Service Worker Diagnostics</Link>
```

## Configuration

### Detection Configuration
```typescript
const detectionConfig: DetectionConfiguration = {
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
```

### Monitoring Configuration
```typescript
const monitoringConfig: MonitoringConfiguration = {
  enableRequestInterception: true,
  enablePerformanceTracking: true,
  enableServiceWorkerAnalysis: true,
  maxRequestHistory: 1000,
  aggregationInterval: 5000,
  excludePatterns: ['/favicon.ico', '/__webpack_hmr'],
  includePatterns: ['**']
};
```

### User Preferences
```typescript
const userPreferences: UserPreferences = {
  autoResolveLevel: 'moderate',  // 'conservative' | 'moderate' | 'aggressive'
  allowUnregistration: true,
  allowCacheClear: true,
  allowPageReload: false,
  preserveUserData: true,
  backupBeforeChanges: true
};
```

## Common Use Cases

### 1. Basic Health Monitoring
```tsx
function App() {
  return (
    <div>
      <ServiceWorkerStatusIndicator 
        compact 
        interactive 
        onStatusChange={(status) => {
          if (status.health === 'critical') {
            alert('Critical service worker issue detected!');
          }
        }}
      />
    </div>
  );
}
```

### 2. Automatic Conflict Resolution
```tsx
useEffect(() => {
  const checkAndResolve = async () => {
    const result = serviceWorkerDiagnostics.getCurrentResult();
    
    if (result.conflicts.length > 0) {
      // Preview resolution first
      const preview = await serviceWorkerConflictResolver.previewResolution(result.conflicts);
      
      if (preview.actions.every(a => a.risk === 'low')) {
        // Auto-resolve low-risk conflicts
        await serviceWorkerConflictResolver.resolveConflicts(result.conflicts);
      }
    }
  };

  checkAndResolve();
}, []);
```

### 3. Performance Monitoring
```tsx
useEffect(() => {
  const unsubscribe = networkRequestMonitor.subscribe((state) => {
    if (state.realTimeMetrics.errorRate > 10) {
      console.warn('High error rate detected:', state.realTimeMetrics.errorRate);
    }
    
    if (state.analytics.serviceWorkerImpact.performanceImpact < -20) {
      console.warn('Service worker causing performance degradation');
    }
  });

  networkRequestMonitor.start();
  
  return unsubscribe;
}, []);
```

### 4. Development Debugging
```tsx
function DevTools() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const unsubscribe = runtimeServiceWorkerDetection.subscribe((state) => {
        setEvents(state.eventLog.slice(-10)); // Last 10 events
      });

      runtimeServiceWorkerDetection.start();
      return unsubscribe;
    }
  }, []);

  return (
    <div>
      {events.map(event => (
        <div key={event.timestamp.toISOString()}>
          {event.type}: {event.scope} - {event.severity}
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Diagnostic Result Interface
```typescript
interface ServiceWorkerDiagnosticResult {
  isSupported: boolean;
  registrations: ServiceWorkerRegistration[];
  conflicts: ServiceWorkerConflict[];
  networkInterceptors: NetworkInterceptor[];
  performance: PerformanceMetrics;
  recommendations: string[];
}
```

### Conflict Types
- **`duplicate-scope`**: Multiple service workers with same scope
- **`version-mismatch`**: Different versions of same service worker
- **`cache-conflict`**: Cache naming conflicts between workers
- **`script-error`**: Service worker script failed to activate

### Severity Levels
- **`critical`**: Immediate attention required
- **`high`**: Should be resolved soon
- **`medium`**: Should be monitored
- **`low`**: Minor issue

## Testing

The diagnostic tools include comprehensive test suites:

```bash
# Run all diagnostic tests
npm test -- --testPathPattern=diagnostics

# Run specific utility tests
npm test -- service-worker-diagnostics.test.ts
npm test -- runtime-sw-detection.test.ts
npm test -- network-monitoring.test.ts
npm test -- sw-conflict-resolver.test.ts

# Run component tests
npm test -- ServiceWorkerStatusIndicator.test.tsx
```

## Performance Considerations

### Memory Usage
- Event logs are limited to 100 entries
- Request history limited to configurable maximum (default: 1000)
- Auto-cleanup of expired data

### CPU Impact
- Monitoring intervals can be adjusted
- Excludes patterns for irrelevant requests
- Efficient observer pattern implementation

### Network Impact
- Minimal overhead on fetch/XHR interception
- Optional performance tracking
- Configurable aggregation intervals

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Reduce `maxRequestHistory` in monitoring config
   - Adjust `aggregationInterval` for less frequent updates

2. **Performance Impact**
   - Disable unnecessary monitoring features
   - Use exclude patterns for high-volume endpoints

3. **False Positive Conflicts**
   - Adjust detection sensitivity
   - Register custom resolution strategies

4. **Auto-Resolution Failures**
   - Check user preferences
   - Review browser permissions
   - Enable backup before changes

### Debug Mode
Enable debug logging:
```typescript
// Set debug flag
localStorage.setItem('sw-diagnostics-debug', 'true');

// Check console for detailed logs
```

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Limited service worker support
- **Edge**: Full support

Graceful degradation for unsupported browsers.

## Security Considerations

- No sensitive data logged
- User confirmation for destructive actions
- Backup creation before changes
- Safe defaults for auto-resolution

## Contributing

1. Add new diagnostic strategies to `ServiceWorkerConflictResolver`
2. Extend detection patterns in `RuntimeServiceWorkerDetection`
3. Add new metrics to `NetworkRequestMonitor`
4. Enhance UI components with additional features

## License

Same as project license.
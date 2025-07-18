# Service Worker Isolation System

## Overview

The Ninu Factory Control application includes a comprehensive service worker isolation system designed to prevent and resolve conflicts with external service workers. This system provides:

- **Application-specific service worker registration** with scope isolation
- **Conflict detection and bypass mechanisms** for external service workers
- **Namespace-isolated caching strategies** to prevent cache pollution
- **Debugging tools** for monitoring and troubleshooting service worker issues
- **Automatic conflict resolution** with configurable strategies

## Quick Start

### 1. Basic Setup

Add the service worker setup to your root layout:

```tsx
// app/layout.tsx
import { ServiceWorkerSetup } from '@/lib/service-worker/setup';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ServiceWorkerSetup 
          autoSetup={true}
          showDebugPanel={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  );
}
```

### 2. Manual Setup

For more control over the setup process:

```tsx
import { setupNinuServiceWorker } from '@/lib/service-worker';

async function initializeApp() {
  const result = await setupNinuServiceWorker({
    enableDebug: true,
    enableConflictResolution: true,
    cacheStrategy: 'conservative',
    scope: '/ninu-factory/'
  });
  
  if (result.success) {
    console.log('Service worker ready');
  } else {
    console.error('Setup failed:', result.error);
  }
}
```

## Core Components

### 1. Service Worker Registration (`registration.ts`)

Provides isolated service worker registration with conflict prevention:

```tsx
import { NinuServiceWorkerManager } from '@/lib/service-worker';

const swManager = NinuServiceWorkerManager.getInstance({
  scope: '/ninu-factory/',
  namespace: 'ninu-factory-control',
  conflictResolution: 'override'
});

const result = await swManager.register('/ninu-sw.js');
```

**Key Features:**
- Scoped registration to prevent interference
- Automatic conflict detection before registration
- Event-driven updates and messaging
- Configurable conflict resolution strategies

### 2. Conflict Resolver (`conflict-resolver.ts`)

Detects and resolves service worker conflicts:

```tsx
import { ServiceWorkerConflictResolver } from '@/lib/service-worker';

const resolver = new ServiceWorkerConflictResolver(config);

// Start continuous monitoring
resolver.startConflictMonitoring(30000); // Every 30 seconds

// Manual conflict detection
const conflicts = await resolver.detectConflicts();

// Emergency cleanup
const removed = await resolver.forceUnregisterAllExternal();
```

**Conflict Types Detected:**
- Overlapping service worker scopes
- Known problematic service workers (Workbox, etc.)
- Request interception conflicts
- Cache namespace conflicts

### 3. Cache Manager (`cache-manager.ts`)

Namespace-isolated caching with multiple strategies:

```tsx
import { NinuCacheManager } from '@/lib/service-worker';

const cacheManager = new NinuCacheManager(config);

// Handle requests with automatic strategy selection
const response = await cacheManager.handleRequest(request);

// Manual cache operations
await cacheManager.preloadCriticalResources([
  '/',
  '/api/health',
  '/images/logo.webp'
]);
```

**Cache Strategies:**
- **Cache-first**: Static assets, images, fonts
- **Network-first**: API requests, dynamic content
- **Stale-while-revalidate**: Background updates
- **Cache-only**: Offline-only resources
- **Network-only**: Always fresh content

### 4. Debug Tools (`debug-tools.ts`)

Comprehensive debugging and monitoring:

```tsx
import { ServiceWorkerDebugger } from '@/lib/service-worker';

const debugger = new ServiceWorkerDebugger(config);

// Start monitoring
debugger.startMonitoring({
  intervalMs: 10000,
  logToConsole: true,
  trackPerformance: true,
  detectConflicts: true
});

// Generate debug report
const report = await debugger.generateReport();

// Run diagnostics
const diagnostics = await debugger.runDiagnostics();
```

## Configuration Options

### ServiceWorkerConfig

```tsx
interface ServiceWorkerConfig {
  // Service worker scope (default: '/ninu-factory/')
  scope?: string;
  
  // Cache update strategy (default: 'none')
  updateViaCache?: 'imports' | 'all' | 'none';
  
  // Enable debug logging (default: false)
  debug?: boolean;
  
  // Application namespace (default: 'ninu-factory-control')
  namespace?: string;
  
  // Isolation mode (default: 'strict')
  isolationMode?: 'strict' | 'lenient';
  
  // Conflict resolution strategy (default: 'override')
  conflictResolution?: 'abort' | 'override' | 'coexist';
  
  // Cache configuration
  cache?: {
    version?: string;
    strategies?: {
      static?: CacheStrategy;
      api?: CacheStrategy;
      images?: CacheStrategy;
      fonts?: CacheStrategy;
    };
    maxSize?: number; // MB
    expiration?: number; // hours
  };
  
  // Request interception rules
  interception?: {
    patterns?: string[]; // URLs to intercept
    bypass?: string[];   // URLs to bypass
    modifyRequests?: boolean;
    headers?: Record<string, string>;
  };
}
```

## Advanced Usage

### React Hooks

#### useNinuServiceWorker

```tsx
import { useNinuServiceWorker } from '@/lib/service-worker';

function MyComponent() {
  const {
    registration,
    isLoading,
    error,
    hasUpdate,
    register,
    unregister,
    update
  } = useNinuServiceWorker({
    scope: '/ninu-factory/',
    debug: true
  });

  if (hasUpdate) {
    return <UpdateNotification onUpdate={update} />;
  }

  return <div>Service Worker: {registration ? 'Active' : 'Inactive'}</div>;
}
```

#### useServiceWorkerDebugger

```tsx
import { useServiceWorkerDebugger } from '@/lib/service-worker';

function DebugPanel() {
  const {
    isMonitoring,
    debugInfo,
    diagnostics,
    startMonitoring,
    runDiagnostics,
    generateReport
  } = useServiceWorkerDebugger(config);

  return (
    <div>
      <button onClick={() => startMonitoring()}>
        {isMonitoring ? 'Stop' : 'Start'} Monitoring
      </button>
      <button onClick={() => runDiagnostics()}>
        Run Diagnostics
      </button>
      {/* Debug info display */}
    </div>
  );
}
```

### Request Bypass

For direct network access bypassing service workers:

```tsx
import { RequestBypass } from '@/lib/service-worker';

// Bypass service worker for specific request
const response = await RequestBypass.fetch('/api/critical-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

## Debug Panel

The debug panel provides real-time monitoring and control:

```tsx
import { ServiceWorkerDebugPanel } from '@/components/debug/ServiceWorkerDebugPanel';

<ServiceWorkerDebugPanel 
  show={process.env.NODE_ENV === 'development'}
  config={{ debug: true }}
  autoMonitor={true}
/>
```

**Debug Panel Features:**
- Real-time service worker status
- Conflict detection and resolution
- Cache statistics and management
- Diagnostic tests
- Debug report generation
- Emergency cleanup tools

## Service Worker File

The actual service worker (`/public/ninu-sw.js`) implements:

- **Namespace isolation**: All cache names prefixed with application namespace
- **Scope-based filtering**: Only handles requests from application origin
- **Bypass headers**: Respects `x-ninu-bypass` header for direct network access
- **Strategy-based caching**: Different strategies for different resource types
- **Version management**: Automatic cleanup of old cache versions
- **Offline support**: Graceful degradation with offline pages

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   ```tsx
   // Check browser support
   if (!('serviceWorker' in navigator)) {
     console.error('Service workers not supported');
   }
   
   // Check for HTTPS (required in production)
   if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
     console.error('HTTPS required for service workers');
   }
   ```

2. **Cache Conflicts**
   ```tsx
   // Clear all caches
   import { emergencyServiceWorkerCleanup } from '@/lib/service-worker';
   await emergencyServiceWorkerCleanup();
   ```

3. **External Service Worker Interference**
   ```tsx
   // Check for conflicts
   import { checkServiceWorkerConflicts } from '@/lib/service-worker';
   const result = await checkServiceWorkerConflicts();
   console.log('Conflicts:', result.conflicts);
   ```

### Debug Commands

```tsx
// Available in development console when debug panel is active
window.ninuSWDebugger.generateReport();
window.ninuSWDebugger.runDiagnostics();
window.ninuSWDebugger.clearDebugData();
```

## Best Practices

1. **Use Isolated Scopes**: Always use application-specific scopes (e.g., `/ninu-factory/`)
2. **Enable Conflict Resolution**: Use `conflictResolution: 'override'` in production
3. **Monitor in Development**: Enable debug panel and monitoring during development
4. **Test Offline Scenarios**: Verify graceful degradation when network is unavailable
5. **Regular Cleanup**: Implement periodic cache cleanup to prevent storage bloat
6. **Update Notifications**: Show user-friendly update notifications
7. **Error Handling**: Implement proper error boundaries for service worker failures

## Security Considerations

- Service worker scope is restricted to application origin
- Cache keys are namespaced to prevent cross-application pollution
- Bypass headers are validated to prevent abuse
- Debug features are disabled in production builds
- Emergency cleanup functions require user confirmation

## Performance Impact

- Initial registration: ~100-200ms
- Cache lookup: ~1-5ms
- Conflict detection: ~50-100ms (when enabled)
- Debug monitoring: ~10-20ms per interval
- Memory usage: ~2-5MB for cache management

The service worker isolation system is designed to be lightweight and non-intrusive while providing comprehensive protection against external service worker conflicts.
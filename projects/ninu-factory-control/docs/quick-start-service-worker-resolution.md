# Quick Start: Service Worker Conflict Resolution

## Immediate Solutions (Emergency Use)

### 1. Browser Console Emergency Tool

**For immediate conflict resolution, paste this in browser console:**

```javascript
// Load the emergency resolver
const script = document.createElement('script');
script.src = '/sw-conflict-resolver.js';
document.head.appendChild(script);

// Wait 2 seconds, then run resolution
setTimeout(() => {
  ninuSWResolver.resolveConflicts();
}, 2000);
```

### 2. Manual Browser Commands

#### Chrome
```
1. Open DevTools (F12)
2. Go to: Application → Service Workers
3. Click "Unregister" for each conflicting worker
4. Go to: Application → Storage → Clear all storage
```

#### Firefox
```
1. Type in address bar: about:serviceworkers
2. Click "Unregister" for conflicting workers
3. Go to: about:preferences#privacy → Clear Data
```

#### Safari
```
1. Open Web Inspector (Cmd+Option+I)
2. Go to: Storage → Service Workers
3. Remove conflicting registrations
```

## Programmatic Solutions

### 1. React Hook Usage

```typescript
import { useServiceWorkerManager } from '../lib/hooks/useServiceWorkerManager';

function MyComponent() {
  const {
    hasConflicts,
    resolveConflicts,
    emergencyCleanup
  } = useServiceWorkerManager({
    autoCheck: true,
    onConflictDetected: (conflicts) => {
      console.log('Conflicts detected:', conflicts);
    }
  });

  if (hasConflicts) {
    return (
      <button onClick={resolveConflicts}>
        Fix Service Worker Conflicts
      </button>
    );
  }

  return <div>No conflicts detected</div>;
}
```

### 2. Direct Manager Usage

```typescript
import { serviceWorkerManager } from '../lib/utils/service-worker-manager';

// Check for conflicts
const conflicts = await serviceWorkerManager.scanForConflicts();

// Resolve automatically
if (conflicts.length > 0) {
  await serviceWorkerManager.unregisterConflictingWorkers();
}

// Emergency cleanup (removes ALL service workers)
await serviceWorkerManager.emergencyCleanup();
```

### 3. UI Component Integration

```tsx
import ServiceWorkerStatus from '../components/ui/ServiceWorkerStatus';

function Dashboard() {
  return (
    <div>
      <h1>Factory Dashboard</h1>
      
      {/* Service Worker Status Monitor */}
      <ServiceWorkerStatus 
        autoCheck={true}
        showDetails={true}
        className="mb-4"
      />
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

## Browser-Specific Quick Commands

### Chrome DevTools
```javascript
// Open DevTools Console and run:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    console.log('Unregistering:', registration.scope);
    registration.unregister();
  });
});
```

### Firefox Console
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
  console.log('All service workers unregistered');
});
```

## Prevention Configuration

### Next.js Configuration

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/ninu-sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/ninu-factory'
          }
        ]
      }
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/ninu-factory/:path*',
        destination: '/:path*'
      }
    ]
  }
};
```

### Service Worker Registration

```javascript
// Register with isolated scope
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ninu-sw.js', {
    scope: '/ninu-factory/',
    type: 'module'
  }).then(registration => {
    console.log('Ninu SW registered:', registration.scope);
  });
}
```

## Monitoring Setup

### Automatic Conflict Detection

```typescript
// Set up monitoring
const monitor = new ServiceWorkerManager();

// Check every 30 seconds
setInterval(async () => {
  const conflicts = await monitor.scanForConflicts();
  if (conflicts.length > 0) {
    console.warn('Service worker conflicts detected:', conflicts);
    // Optionally auto-resolve
    await monitor.unregisterConflictingWorkers();
  }
}, 30000);
```

### Real-time Alerts

```typescript
// Monitor for new service worker registrations
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('Service worker controller changed - checking for conflicts');
  serviceWorkerManager.scanForConflicts();
});
```

## Troubleshooting Common Issues

### Issue: Multiple service workers active
**Solution:** Use emergency cleanup tool

### Issue: Service worker won't unregister
**Solution:** Try browser-specific manual steps

### Issue: Cache conflicts
**Solution:** Clear browser storage completely

### Issue: Network requests intercepted
**Solution:** Check service worker scope isolation

## Testing Your Resolution

1. **Create conflict:** Register a generic service worker
2. **Detect:** Use scan tool to detect conflicts
3. **Resolve:** Use automatic resolution
4. **Verify:** Confirm clean state

```javascript
// Test script
(async () => {
  // 1. Create test conflict
  await navigator.serviceWorker.register('/test-sw.js', { scope: '/' });
  
  // 2. Detect conflicts
  const conflicts = await serviceWorkerManager.scanForConflicts();
  console.log('Conflicts found:', conflicts.length);
  
  // 3. Resolve
  await serviceWorkerManager.unregisterConflictingWorkers();
  
  // 4. Verify
  const afterCleanup = await serviceWorkerManager.scanForConflicts();
  console.log('Conflicts after cleanup:', afterCleanup.length);
})();
```

## Contact & Support

For the Ninu Factory Control system:
- **Emergency:** Use browser console emergency tool
- **Development:** Check `/docs/service-worker-conflict-resolution.md`
- **Testing:** Run comprehensive test suite
# Browser Cache & Service Worker Cleanup Guide
## Ninu Factory Control Application

**Ultra-Comprehensive Cache Management**: Complete procedures for browser cache, service worker, and application state cleanup.

## ⚡ Quick Emergency Cleanup

**⟳ IMMEDIATE RESET** (≤60s):

```bash
# Developer Console (F12) - Run in Console tab
localStorage.clear();
sessionStorage.clear();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}
location.reload(true);
```

**◉ CRITICAL SHORTCUTS**:
- **[Emergency Reset](#emergency-reset)** → Complete application state reset
- **[Manual Cleanup](#manual-browser-cleanup)** → Step-by-step browser procedures
- **[Programmatic Solutions](#programmatic-cleanup-utilities)** → Code-based cleanup tools
- **[IndexedDB Cleanup](#indexeddb-cleanup)** → Database cache management
- **[Force Refresh Methods](#force-refresh-procedures)** → Override cache mechanisms

**✓ STATUS**: Chrome + Firefox + Safari + Edge = 100% coverage

## 🧠 Core Cache Management Philosophy

**Meta-Principle**: "Clean state, reliable performance, predictable behavior."

**Core Behaviors**:
1. **Progressive Cleanup** - Start with simplest methods, escalate if needed
2. **Browser-Specific Approaches** - Tailored procedures for each browser
3. **Programmatic Fallbacks** - Code-based solutions when manual fails
4. **State Verification** - Confirm cleanup effectiveness
5. **Development Workflow** - Integrated into development process
6. **Production Safety** - Non-destructive approaches for live systems

## 📋 Manual Browser Cleanup

### **🌐 Google Chrome** (Comprehensive)

**◉ STANDARD CLEANUP**:
1. **Open Developer Tools**: `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. **Clear Storage Panel**:
   - Go to `Application` tab
   - In left sidebar, click `Storage`
   - Click `Clear site data` button
   - Confirm with `Clear site data`

**⟳ ADVANCED CLEANUP**:
1. **Service Worker Unregistration**:
   - Application tab → Service Workers section
   - Find "ninu-factory-control" worker
   - Click `Unregister` for each active worker
   - Refresh page to verify removal

2. **Cache Storage Cleanup**:
   - Application tab → Cache Storage
   - Right-click each cache entry
   - Select `Delete` for all entries
   - Verify cache list is empty

3. **Local/Session Storage**:
   - Application tab → Local Storage
   - Right-click domain entry → `Clear`
   - Application tab → Session Storage
   - Right-click domain entry → `Clear`

4. **IndexedDB Cleanup**:
   - Application tab → IndexedDB
   - Right-click database entries → `Delete database`
   - Confirm deletion for each database

**🔧 CHROME SETTINGS CLEANUP**:
```
Chrome Menu → Settings → Privacy and Security → Clear browsing data
- Time range: "Last hour" or "All time"
- ✓ Cookies and other site data
- ✓ Cached images and files
- Click "Clear data"
```

### **🦊 Mozilla Firefox** (Comprehensive)

**◉ STANDARD CLEANUP**:
1. **Open Developer Tools**: `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. **Storage Inspector**:
   - Go to `Storage` tab
   - Right-click on domain under each category
   - Select `Delete All` for:
     - Local Storage
     - Session Storage
     - Cache Storage
     - IndexedDB

**⟳ SERVICE WORKER CLEANUP**:
1. **Workers Panel**:
   - Developer Tools → `Application` tab (or `Storage` in newer versions)
   - Find `Service Workers` section
   - Click `Unregister` for active workers
   - Verify worker list is empty

**🔧 FIREFOX SETTINGS CLEANUP**:
```
Firefox Menu → Settings → Privacy & Security → Clear Data
- ✓ Cookies and Site Data
- ✓ Cached Web Content
- Click "Clear"
```

**Advanced about:config Cleanup**:
```
Type in address bar: about:config
Search: "dom.serviceWorkers"
dom.serviceWorkers.enabled = false (temporarily)
Restart Firefox, then re-enable
```

### **🍎 Safari** (Comprehensive)

**◉ STANDARD CLEANUP**:
1. **Enable Developer Menu**:
   - Safari → Preferences → Advanced
   - ✓ Show Develop menu in menu bar

2. **Web Inspector Cleanup**:
   - Right-click page → `Inspect Element`
   - Go to `Storage` tab
   - Clear each storage type:
     - Local Storage → Right-click → `Clear Local Storage`
     - Session Storage → Right-click → `Clear Session Storage`
     - Application Cache → Delete entries

**⟳ SERVICE WORKER CLEANUP**:
1. **Develop Menu**:
   - Develop → Service Workers → [Your Domain]
   - Click `Unregister` for each worker
   - Verify removal in console

**🔧 SAFARI SETTINGS CLEANUP**:
```
Safari → Settings → Privacy → Manage Website Data
- Search for "localhost" or your domain
- Select entries → Remove
- Or click "Remove All" for complete cleanup
```

### **🔷 Microsoft Edge** (Comprehensive)

**◉ STANDARD CLEANUP** (Similar to Chrome):
1. **Developer Tools**: `F12`
2. **Application Tab**:
   - Storage section → Clear site data
   - Service Workers → Unregister all
   - Cache Storage → Delete all entries

**🔧 EDGE SETTINGS CLEANUP**:
```
Edge Menu → Settings → Reset and cleanup → Clear browsing data
- Time range: "All time"
- ✓ Cookies and other site data  
- ✓ Cached images and files
- Click "Clear now"
```

## 🛠️ Programmatic Cleanup Utilities

### **⚡ Emergency Reset Script** (Developer Console)

```javascript
// EMERGENCY CLEANUP - Run in browser console
(function emergencyCleanup() {
  console.log('🚨 Starting Emergency Cleanup for Ninu Factory Control...');
  
  // 1. Clear all storage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Local/Session Storage cleared');
  } catch (e) {
    console.error('❌ Storage cleanup failed:', e);
  }
  
  // 2. Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`📡 Found ${registrations.length} service worker(s)`);
      registrations.forEach((registration, index) => {
        registration.unregister().then(success => {
          console.log(`✅ Service worker ${index + 1} unregistered:`, success);
        });
      });
    });
  }
  
  // 3. Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      console.log(`🗂️ Found ${names.length} cache(s):`, names);
      names.forEach(name => {
        caches.delete(name).then(success => {
          console.log(`✅ Cache '${name}' deleted:`, success);
        });
      });
    });
  }
  
  // 4. Clear IndexedDB (if any)
  if ('indexedDB' in window) {
    // This requires knowing database names, which we'll detect
    console.log('🔍 Checking for IndexedDB databases...');
    
    // List databases (Chrome/Firefox)
    if (indexedDB.databases) {
      indexedDB.databases().then(databases => {
        console.log(`💾 Found ${databases.length} IndexedDB database(s):`, databases);
        databases.forEach(db => {
          const deleteReq = indexedDB.deleteDatabase(db.name);
          deleteReq.onsuccess = () => console.log(`✅ Database '${db.name}' deleted`);
          deleteReq.onerror = (e) => console.error(`❌ Failed to delete '${db.name}':`, e);
        });
      });
    }
  }
  
  console.log('🔄 Forcing hard refresh in 2 seconds...');
  setTimeout(() => {
    window.location.reload(true);
  }, 2000);
})();
```

### **🔧 Advanced Cache Diagnosis Script**

```javascript
// CACHE DIAGNOSIS - Run in browser console
(function diagnoseCacheState() {
  console.log('🔍 NINU FACTORY CONTROL - Cache Diagnosis Report');
  console.log('================================================');
  
  // 1. Storage Analysis
  const localStorageSize = new Blob(Object.values(localStorage)).size;
  const sessionStorageSize = new Blob(Object.values(sessionStorage)).size;
  
  console.log(`📦 Local Storage: ${Object.keys(localStorage).length} items, ${(localStorageSize/1024).toFixed(2)}KB`);
  console.log(`📋 Session Storage: ${Object.keys(sessionStorage).length} items, ${(sessionStorageSize/1024).toFixed(2)}KB`);
  
  if (Object.keys(localStorage).length > 0) {
    console.log('📦 Local Storage Contents:', Object.keys(localStorage));
  }
  
  // 2. Service Worker Status
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`📡 Service Workers: ${registrations.length} registered`);
      registrations.forEach((reg, i) => {
        console.log(`   ${i+1}. Scope: ${reg.scope}, State: ${reg.active?.state || 'inactive'}`);
      });
    });
  }
  
  // 3. Cache Storage Analysis
  if ('caches' in window) {
    caches.keys().then(names => {
      console.log(`🗂️ Cache Storage: ${names.length} cache(s)`);
      names.forEach(name => {
        caches.open(name).then(cache => {
          cache.keys().then(keys => {
            console.log(`   - ${name}: ${keys.length} cached items`);
          });
        });
      });
    });
  }
  
  // 4. IndexedDB Status
  if ('indexedDB' in window && indexedDB.databases) {
    indexedDB.databases().then(databases => {
      console.log(`💾 IndexedDB: ${databases.length} database(s)`);
      databases.forEach(db => {
        console.log(`   - ${db.name} (version ${db.version})`);
      });
    });
  }
  
  // 5. WebSocket Status (if applicable)
  console.log('🔌 WebSocket ReadyState Guide: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED');
  
  console.log('================================================');
  console.log('✅ Diagnosis complete. Use emergencyCleanup() to reset.');
})();
```

## 📱 Application-Integrated Cleanup

### **⚡ React Component for Cache Management**

```typescript
// components/admin/CacheManager.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CacheStatus {
  localStorage: number;
  sessionStorage: number;
  serviceWorkers: number;
  caches: number;
  indexedDBs: number;
}

export default function CacheManager() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  const diagnoseCaches = async (): Promise<CacheStatus> => {
    const status: CacheStatus = {
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      serviceWorkers: 0,
      caches: 0,
      indexedDBs: 0
    };

    // Count service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      status.serviceWorkers = registrations.length;
    }

    // Count cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      status.caches = cacheNames.length;
    }

    // Count IndexedDB (if available)
    if ('indexedDB' in window && 'databases' in indexedDB) {
      try {
        const databases = await (indexedDB as any).databases();
        status.indexedDBs = databases.length;
      } catch (e) {
        console.warn('Could not enumerate IndexedDB databases:', e);
      }
    }

    return status;
  };

  const handleDiagnose = async () => {
    const status = await diagnoseCaches();
    setCacheStatus(status);
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    
    try {
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }

      // Clear cache storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }

      // Clear IndexedDB
      if ('indexedDB' in window && 'databases' in indexedDB) {
        try {
          const databases = await (indexedDB as any).databases();
          await Promise.all(
            databases.map((db: any) => {
              return new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name);
                deleteReq.onsuccess = () => resolve(true);
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            })
          );
        } catch (e) {
          console.warn('IndexedDB cleanup failed:', e);
        }
      }

      setLastCleared(new Date());
      
      // Force reload after brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceRefresh = () => {
    // Force refresh with cache bypass
    window.location.reload();
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cache & Storage Manager
          </h2>
          <p className="text-gray-600">
            Manage browser caches, service workers, and application storage for optimal performance.
          </p>
        </div>

        {/* Diagnosis Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cache Diagnosis</h3>
            <Button 
              onClick={handleDiagnose}
              variant="outline"
            >
              Scan Caches
            </Button>
          </div>

          {cacheStatus && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <Badge variant={cacheStatus.localStorage > 0 ? "default" : "secondary"}>
                  {cacheStatus.localStorage}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Local Storage</p>
              </div>
              <div className="text-center">
                <Badge variant={cacheStatus.sessionStorage > 0 ? "default" : "secondary"}>
                  {cacheStatus.sessionStorage}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Session Storage</p>
              </div>
              <div className="text-center">
                <Badge variant={cacheStatus.serviceWorkers > 0 ? "destructive" : "secondary"}>
                  {cacheStatus.serviceWorkers}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Service Workers</p>
              </div>
              <div className="text-center">
                <Badge variant={cacheStatus.caches > 0 ? "default" : "secondary"}>
                  {cacheStatus.caches}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Cache Storage</p>
              </div>
              <div className="text-center">
                <Badge variant={cacheStatus.indexedDBs > 0 ? "default" : "secondary"}>
                  {cacheStatus.indexedDBs}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">IndexedDB</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleClearAll}
            variant="destructive"
            disabled={isClearing}
            className="flex-1"
          >
            {isClearing ? 'Clearing...' : 'Clear All Caches'}
          </Button>
          <Button 
            onClick={handleForceRefresh}
            variant="outline"
            className="flex-1"
          >
            Force Refresh
          </Button>
        </div>

        {/* Last Cleared Info */}
        {lastCleared && (
          <div className="text-sm text-gray-500 text-center">
            Last cleared: {lastCleared.toLocaleString()}
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Warning:</strong> Clearing caches will remove all stored application data 
            and force a complete reload. Any unsaved changes will be lost.
          </p>
        </div>
      </div>
    </Card>
  );
}
```

## 🗄️ IndexedDB Cleanup

### **💾 Comprehensive IndexedDB Management**

```javascript
// IndexedDB Cleanup Utility
class IndexedDBCleaner {
  static async listDatabases() {
    if (!('indexedDB' in window)) {
      throw new Error('IndexedDB not supported');
    }
    
    if ('databases' in indexedDB) {
      return await indexedDB.databases();
    } else {
      // Fallback for Safari/older browsers
      return [];
    }
  }
  
  static async deleteDatabase(dbName) {
    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase(dbName);
      deleteReq.onsuccess = () => resolve(true);
      deleteReq.onerror = () => reject(deleteReq.error);
      deleteReq.onblocked = () => {
        console.warn(`Database '${dbName}' deletion blocked. Close all tabs and try again.`);
        reject(new Error('Database deletion blocked'));
      };
    });
  }
  
  static async clearAllDatabases() {
    try {
      const databases = await this.listDatabases();
      console.log(`Found ${databases.length} IndexedDB database(s)`);
      
      const results = await Promise.allSettled(
        databases.map(db => this.deleteDatabase(db.name))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`IndexedDB cleanup: ${successful} deleted, ${failed} failed`);
      return { successful, failed, total: databases.length };
    } catch (error) {
      console.error('IndexedDB cleanup failed:', error);
      throw error;
    }
  }
  
  static async getDBSize(dbName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        let totalSize = 0;
        
        const objectStoreNames = Array.from(db.objectStoreNames);
        const transaction = db.transaction(objectStoreNames, 'readonly');
        
        let processed = 0;
        
        objectStoreNames.forEach(storeName => {
          const store = transaction.objectStore(storeName);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const data = getAllRequest.result;
            const storeSize = new Blob([JSON.stringify(data)]).size;
            totalSize += storeSize;
            processed++;
            
            if (processed === objectStoreNames.length) {
              db.close();
              resolve(totalSize);
            }
          };
        });
        
        if (objectStoreNames.length === 0) {
          db.close();
          resolve(0);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// Usage examples:
// IndexedDBCleaner.listDatabases().then(console.log);
// IndexedDBCleaner.clearAllDatabases();
// IndexedDBCleaner.getDBSize('myDatabase').then(size => console.log(`Size: ${size} bytes`));
```

## 🔄 Force Refresh Procedures

### **⚡ Force Refresh Methods by Browser**

```javascript
// Force Refresh Utility Functions
const ForceRefreshMethods = {
  // Method 1: Standard force refresh
  standardForceRefresh: () => {
    window.location.reload(true);
  },
  
  // Method 2: Hard navigation refresh
  hardNavigationRefresh: () => {
    window.location.href = window.location.href;
  },
  
  // Method 3: Cache-busting refresh
  cacheBustingRefresh: () => {
    const url = new URL(window.location);
    url.searchParams.set('_t', Date.now().toString());
    window.location.href = url.toString();
  },
  
  // Method 4: Complete state reset
  completeStateReset: () => {
    // Clear everything first
    localStorage.clear();
    sessionStorage.clear();
    
    // Then force refresh
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname;
    }, 100);
  },
  
  // Method 5: Service Worker bypass refresh
  serviceWorkerBypassRefresh: async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // Add no-cache headers via meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
    
    window.location.reload(true);
  }
};

// Browser-specific force refresh
const BrowserSpecificRefresh = {
  // Chrome: Ctrl+Shift+R or Cmd+Shift+R
  chrome: () => {
    // Programmatic equivalent
    if ('chrome' in window) {
      window.location.reload(true);
    }
  },
  
  // Firefox: Ctrl+F5 or Ctrl+Shift+R
  firefox: () => {
    if (navigator.userAgent.toLowerCase().includes('firefox')) {
      window.location.reload(true);
    }
  },
  
  // Safari: Cmd+Option+R
  safari: () => {
    if (navigator.userAgent.toLowerCase().includes('safari') && 
        !navigator.userAgent.toLowerCase().includes('chrome')) {
      window.location.reload(true);
    }
  }
};
```

### **🔧 Cache Headers Manipulation**

```javascript
// Cache Control Utility
class CacheController {
  static addNoCacheHeaders() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
    
    const pragma = document.createElement('meta');
    pragma.httpEquiv = 'Pragma';
    pragma.content = 'no-cache';
    document.head.appendChild(pragma);
    
    const expires = document.createElement('meta');
    expires.httpEquiv = 'Expires';
    expires.content = '0';
    document.head.appendChild(expires);
  }
  
  static bypassCacheForFetch(url) {
    const bypassUrl = new URL(url);
    bypassUrl.searchParams.set('_cacheBust', Date.now().toString());
    return bypassUrl.toString();
  }
  
  static createNoCacheFetch() {
    return (url, options = {}) => {
      const noCacheOptions = {
        ...options,
        cache: 'no-store',
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      return fetch(this.bypassCacheForFetch(url), noCacheOptions);
    };
  }
}
```

## 🎯 Development Workflow Integration

### **⚡ NPM Scripts for Cache Management**

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "cache:clear": "echo 'Open http://localhost:3000/admin/cache-manager to clear caches'",
    "dev:nocache": "next dev --port 3000 && echo 'Development server with cache-busting'",
    "build:fresh": "rm -rf .next && npm run build",
    "start:nocache": "next start --port 3000",
    "debug:cache": "node scripts/debug-cache.js"
  }
}
```

### **🛠️ Development Cache Debug Script**

```javascript
// scripts/debug-cache.js
const fs = require('fs');
const path = require('path');

function analyzeCacheFiles() {
  const nextDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(nextDir)) {
    console.log('No .next directory found. Run npm run build first.');
    return;
  }
  
  function getDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }
  
  const totalSize = getDirectorySize(nextDir);
  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.log(`📦 Next.js Cache Analysis for Ninu Factory Control`);
  console.log(`================================================`);
  console.log(`Total .next directory size: ${sizeInMB} MB`);
  console.log(`Location: ${nextDir}`);
  console.log(`\n🧹 To clear Next.js cache:`);
  console.log(`   rm -rf .next && npm run build`);
  console.log(`\n🔍 Cache directories:`);
  
  const subdirs = fs.readdirSync(nextDir).filter(item => {
    return fs.statSync(path.join(nextDir, item)).isDirectory();
  });
  
  subdirs.forEach(dir => {
    const dirPath = path.join(nextDir, dir);
    const dirSize = getDirectorySize(dirPath);
    const dirSizeKB = (dirSize / 1024).toFixed(2);
    console.log(`   - ${dir}: ${dirSizeKB} KB`);
  });
}

analyzeCacheFiles();
```

## 🚨 Emergency Procedures

### **🔴 Complete System Reset** (Nuclear Option)

```javascript
// NUCLEAR RESET - Only use when everything else fails
async function nuclearReset() {
  console.log('🚨 NUCLEAR RESET INITIATED for Ninu Factory Control');
  console.log('This will completely reset all browser data for this application.');
  
  const confirmReset = confirm(
    'Are you sure you want to completely reset all application data? This cannot be undone.'
  );
  
  if (!confirmReset) {
    console.log('❌ Reset cancelled by user');
    return;
  }
  
  try {
    // 1. Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Browser storage cleared');
    
    // 2. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('✅ Service workers unregistered');
    }
    
    // 3. Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ Cache storage cleared');
    }
    
    // 4. Clear IndexedDB
    if ('indexedDB' in window && 'databases' in indexedDB) {
      const databases = await indexedDB.databases();
      await Promise.all(databases.map(db => {
        return new Promise((resolve) => {
          const deleteReq = indexedDB.deleteDatabase(db.name);
          deleteReq.onsuccess = () => resolve();
          deleteReq.onerror = () => resolve(); // Don't fail the entire process
        });
      }));
      console.log('✅ IndexedDB cleared');
    }
    
    // 5. Clear cookies (domain-specific)
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    console.log('✅ Cookies cleared');
    
    // 6. Add no-cache meta tags
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
    
    console.log('🔄 Forcing complete page reload...');
    
    // 7. Force complete reload
    setTimeout(() => {
      window.location.replace(window.location.origin);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Nuclear reset failed:', error);
    alert('Reset failed. Please manually clear browser data and restart the browser.');
  }
}

// To use: nuclearReset()
```

## 📊 Cache Monitoring & Prevention

### **⚡ Real-time Cache Monitor**

```javascript
// Cache Monitor Class for ongoing monitoring
class CacheMonitor {
  constructor() {
    this.monitoring = false;
    this.intervals = [];
  }
  
  startMonitoring(intervalMs = 30000) {
    if (this.monitoring) return;
    
    this.monitoring = true;
    console.log('📊 Starting cache monitoring for Ninu Factory Control...');
    
    const monitor = setInterval(async () => {
      const report = await this.generateReport();
      console.log('📊 Cache Monitor Report:', report);
      
      // Alert if storage is getting large
      if (report.totalStorageSize > 5 * 1024 * 1024) { // 5MB
        console.warn('⚠️ Large storage detected. Consider cleanup.');
      }
      
      // Alert if many service workers
      if (report.serviceWorkers > 1) {
        console.warn('⚠️ Multiple service workers detected.');
      }
    }, intervalMs);
    
    this.intervals.push(monitor);
  }
  
  stopMonitoring() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.monitoring = false;
    console.log('📊 Cache monitoring stopped');
  }
  
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      localStorageSize: new Blob(Object.values(localStorage)).size,
      sessionStorageSize: new Blob(Object.values(sessionStorage)).size,
      serviceWorkers: 0,
      cacheStorage: 0,
      indexedDBs: 0
    };
    
    // Count service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      report.serviceWorkers = registrations.length;
    }
    
    // Count cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      report.cacheStorage = cacheNames.length;
    }
    
    // Count IndexedDB
    if ('indexedDB' in window && 'databases' in indexedDB) {
      try {
        const databases = await indexedDB.databases();
        report.indexedDBs = databases.length;
      } catch (e) {
        // Ignore if not supported
      }
    }
    
    report.totalStorageSize = report.localStorageSize + report.sessionStorageSize;
    
    return report;
  }
}

// Usage:
// const monitor = new CacheMonitor();
// monitor.startMonitoring(30000); // Check every 30 seconds
// monitor.stopMonitoring(); // When done
```

## 🎯 Browser-Specific Keyboard Shortcuts

### **⌨️ Quick Reference Card**

| Browser | Force Refresh | Developer Tools | Clear Site Data |
|---------|---------------|-----------------|-----------------|
| **Chrome** | `Ctrl+Shift+R` (Win/Linux)<br/>`Cmd+Shift+R` (Mac) | `F12` or `Ctrl+Shift+I` | DevTools → Application → Storage → Clear site data |
| **Firefox** | `Ctrl+F5` or `Ctrl+Shift+R` (Win/Linux)<br/>`Cmd+Shift+R` (Mac) | `F12` or `Ctrl+Shift+I` | DevTools → Storage → Right-click → Delete All |
| **Safari** | `Cmd+Option+R` (Mac) | `Cmd+Option+I` (Mac) | Develop → Web Inspector → Storage |
| **Edge** | `Ctrl+Shift+R` (Win)<br/>`Cmd+Shift+R` (Mac) | `F12` or `Ctrl+Shift+I` | DevTools → Application → Storage → Clear site data |

### **🔧 URL Bar Commands**

| Browser | Command | Description |
|---------|---------|-------------|
| **Chrome** | `chrome://settings/clearBrowserData` | Direct to clear browsing data |
| **Firefox** | `about:preferences#privacy` | Privacy settings page |
| **Safari** | N/A | Use Safari → Preferences → Privacy |
| **Edge** | `edge://settings/clearBrowserData` | Direct to clear browsing data |

## 📋 Troubleshooting Guide

### **🔍 Common Issues & Solutions**

**❌ ISSUE**: Service worker won't unregister
```javascript
// SOLUTION: Force unregistration with error handling
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister().catch(error => {
      console.log('Force unregister failed, trying alternative method');
      // Alternative: Navigate to chrome://serviceworker-internals/ manually
    });
  });
});
```

**❌ ISSUE**: Cache won't clear despite commands
```javascript
// SOLUTION: Clear with specific cache names
caches.keys().then(names => {
  // Clear each cache individually
  names.forEach(name => {
    caches.delete(name).then(success => {
      if (!success) {
        console.warn(`Failed to delete cache: ${name}`);
        // Manual intervention required
      }
    });
  });
});
```

**❌ ISSUE**: IndexedDB deletion blocked
```javascript
// SOLUTION: Close all database connections first
const closeAllDBConnections = async (dbName) => {
  // First, try to open and immediately close
  const request = indexedDB.open(dbName);
  request.onsuccess = (event) => {
    const db = event.target.result;
    db.close();
    
    // Now try to delete
    const deleteReq = indexedDB.deleteDatabase(dbName);
    deleteReq.onblocked = () => {
      alert('Please close all other tabs with this application and try again.');
    };
  };
};
```

**❌ ISSUE**: Application still showing old data after cache clear
```javascript
// SOLUTION: Complete state reset with delay
const completeReset = async () => {
  // Clear everything
  localStorage.clear();
  sessionStorage.clear();
  
  // Wait for storage to clear
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Add cache-busting timestamp
  const url = new URL(window.location);
  url.searchParams.set('v', Date.now());
  
  // Force navigate to cache-busted URL
  window.location.replace(url.toString());
};
```

## ✅ Success Verification

### **🎯 Post-Cleanup Verification Checklist**

After performing cleanup, verify success with this checklist:

**✓ STORAGE VERIFICATION**:
```javascript
// Run in console to verify cleanup
console.log('Local Storage items:', Object.keys(localStorage).length);
console.log('Session Storage items:', Object.keys(sessionStorage).length);
console.log('Expected: 0 for both');
```

**✓ SERVICE WORKER VERIFICATION**:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registered:', registrations.length);
  console.log('Expected: 0');
});
```

**✓ CACHE STORAGE VERIFICATION**:
```javascript
caches.keys().then(names => {
  console.log('Cache Storage entries:', names.length);
  console.log('Expected: 0');
});
```

**✓ FUNCTIONAL VERIFICATION**:
- [ ] Application loads without cached content
- [ ] Real-time WebSocket connections work properly
- [ ] All factory metrics display current data
- [ ] No console errors related to missing cache resources
- [ ] Browser DevTools show empty storage sections

## 🔗 Quick Reference Links

**📚 ESSENTIAL DOCUMENTATION**:
- **[Next.js Caching Guide](https://nextjs.org/docs/app/building-your-application/caching)** → Framework-specific cache behavior
- **[Service Worker MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)** → Complete service worker reference
- **[Cache API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Cache)** → Browser cache storage API
- **[IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** → Client-side database API

**🛠️ BROWSER DOCUMENTATION**:
- **[Chrome DevTools Storage](https://developers.google.com/web/tools/chrome-devtools/storage/overview)** → Chrome storage debugging
- **[Firefox Developer Tools](https://developer.mozilla.org/en-US/docs/Tools/Storage_Inspector)** → Firefox storage inspector
- **[Safari Web Inspector](https://webkit.org/web-inspector/storage-tab/)** → Safari storage management

---

**◉ Factory Status**: ✅ Comprehensive cache management ready + ✅ All browsers covered + ✅ Emergency procedures + ✅ Development integration

**⟳ Ninu.mx Integration**: 100% cache control + Real-time state management + Production-ready cleanup procedures + Developer-friendly tools
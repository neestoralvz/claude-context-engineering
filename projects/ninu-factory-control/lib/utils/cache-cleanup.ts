/**
 * Browser Cache & Service Worker Cleanup Utilities
 * Ninu Factory Control Application
 */

export interface CacheStatus {
  localStorage: number;
  sessionStorage: number;
  serviceWorkers: number;
  caches: number;
  indexedDBs: number;
  localStorageSize: number;
  sessionStorageSize: number;
  timestamp: Date;
}

export interface CleanupResult {
  success: boolean;
  message: string;
  details: {
    localStorage: boolean;
    sessionStorage: boolean;
    serviceWorkers: { cleared: number; failed: number };
    caches: { cleared: number; failed: number };
    indexedDBs: { cleared: number; failed: number };
  };
}

/**
 * Emergency cleanup utility for immediate cache clearing
 */
export class EmergencyCleanup {
  /**
   * Execute complete emergency cleanup
   */
  static async execute(): Promise<CleanupResult> {
    console.log('🚨 Starting Emergency Cleanup for Ninu Factory Control...');
    
    const result: CleanupResult = {
      success: false,
      message: '',
      details: {
        localStorage: false,
        sessionStorage: false,
        serviceWorkers: { cleared: 0, failed: 0 },
        caches: { cleared: 0, failed: 0 },
        indexedDBs: { cleared: 0, failed: 0 }
      }
    };

    try {
      // 1. Clear browser storage
      try {
        localStorage.clear();
        result.details.localStorage = true;
        console.log('✅ Local Storage cleared');
      } catch (e) {
        console.error('❌ Local Storage cleanup failed:', e);
      }

      try {
        sessionStorage.clear();
        result.details.sessionStorage = true;
        console.log('✅ Session Storage cleared');
      } catch (e) {
        console.error('❌ Session Storage cleanup failed:', e);
      }

      // 2. Unregister service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log(`📡 Found ${registrations.length} service worker(s)`);
          
          const unregisterPromises = registrations.map(async (registration, index) => {
            try {
              const success = await registration.unregister();
              if (success) {
                result.details.serviceWorkers.cleared++;
                console.log(`✅ Service worker ${index + 1} unregistered`);
              } else {
                result.details.serviceWorkers.failed++;
                console.error(`❌ Service worker ${index + 1} unregister failed`);
              }
            } catch (e) {
              result.details.serviceWorkers.failed++;
              console.error(`❌ Service worker ${index + 1} unregister error:`, e);
            }
          });

          await Promise.all(unregisterPromises);
        } catch (e) {
          console.error('❌ Service worker cleanup failed:', e);
        }
      }

      // 3. Clear cache storage
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          console.log(`🗂️ Found ${cacheNames.length} cache(s):`, cacheNames);
          
          const deletePromises = cacheNames.map(async (name) => {
            try {
              const success = await caches.delete(name);
              if (success) {
                result.details.caches.cleared++;
                console.log(`✅ Cache '${name}' deleted`);
              } else {
                result.details.caches.failed++;
                console.error(`❌ Cache '${name}' deletion failed`);
              }
            } catch (e) {
              result.details.caches.failed++;
              console.error(`❌ Cache '${name}' deletion error:`, e);
            }
          });

          await Promise.all(deletePromises);
        } catch (e) {
          console.error('❌ Cache storage cleanup failed:', e);
        }
      }

      // 4. Clear IndexedDB
      if ('indexedDB' in window) {
        try {
          if ('databases' in indexedDB) {
            const databases = await (indexedDB as any).databases();
            console.log(`💾 Found ${databases.length} IndexedDB database(s):`, databases);
            
            const deletePromises = databases.map(async (db: any) => {
              try {
                await this.deleteIndexedDB(db.name);
                result.details.indexedDBs.cleared++;
                console.log(`✅ Database '${db.name}' deleted`);
              } catch (e) {
                result.details.indexedDBs.failed++;
                console.error(`❌ Database '${db.name}' deletion failed:`, e);
              }
            });

            await Promise.all(deletePromises);
          }
        } catch (e) {
          console.error('❌ IndexedDB cleanup failed:', e);
        }
      }

      // 5. Determine overall success
      const hasErrors = 
        !result.details.localStorage ||
        !result.details.sessionStorage ||
        result.details.serviceWorkers.failed > 0 ||
        result.details.caches.failed > 0 ||
        result.details.indexedDBs.failed > 0;

      result.success = !hasErrors;
      result.message = result.success 
        ? 'Emergency cleanup completed successfully'
        : 'Emergency cleanup completed with some errors';

      console.log('🔄 Emergency cleanup finished. Reload recommended.');
      return result;

    } catch (error) {
      result.success = false;
      result.message = `Emergency cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌ Emergency cleanup failed:', error);
      return result;
    }
  }

  /**
   * Delete IndexedDB database with proper error handling
   */
  private static deleteIndexedDB(dbName: string): Promise<boolean> {
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

  /**
   * Force refresh with cache bypass
   */
  static forceRefresh(): void {
    console.log('🔄 Forcing hard refresh...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  /**
   * Complete state reset (nuclear option)
   */
  static async nuclearReset(): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to completely reset all application data? This cannot be undone.'
    );

    if (!confirmed) {
      console.log('❌ Nuclear reset cancelled by user');
      return;
    }

    try {
      await this.execute();
      
      // Clear cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Add no-cache headers
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta);

      console.log('🔄 Nuclear reset complete. Redirecting...');
      setTimeout(() => {
        window.location.replace(window.location.origin);
      }, 1000);

    } catch (error) {
      console.error('❌ Nuclear reset failed:', error);
      alert('Nuclear reset failed. Please manually clear browser data and restart the browser.');
    }
  }
}

/**
 * Cache diagnostic utility
 */
export class CacheDiagnostics {
  /**
   * Generate comprehensive cache status report
   */
  static async generateReport(): Promise<CacheStatus> {
    const status: CacheStatus = {
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length,
      localStorageSize: this.calculateStorageSize(localStorage),
      sessionStorageSize: this.calculateStorageSize(sessionStorage),
      serviceWorkers: 0,
      caches: 0,
      indexedDBs: 0,
      timestamp: new Date()
    };

    // Count service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        status.serviceWorkers = registrations.length;
      } catch (e) {
        console.warn('Could not enumerate service workers:', e);
      }
    }

    // Count cache storage
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        status.caches = cacheNames.length;
      } catch (e) {
        console.warn('Could not enumerate caches:', e);
      }
    }

    // Count IndexedDB
    if ('indexedDB' in window && 'databases' in indexedDB) {
      try {
        const databases = await (indexedDB as any).databases();
        status.indexedDBs = databases.length;
      } catch (e) {
        console.warn('Could not enumerate IndexedDB databases:', e);
      }
    }

    return status;
  }

  /**
   * Calculate storage size in bytes
   */
  private static calculateStorageSize(storage: Storage): number {
    try {
      const values = Object.values(storage);
      return new Blob(values).size;
    } catch (e) {
      console.warn('Could not calculate storage size:', e);
      return 0;
    }
  }

  /**
   * Print detailed diagnostic report to console
   */
  static async printDiagnosticReport(): Promise<void> {
    console.log('🔍 NINU FACTORY CONTROL - Cache Diagnosis Report');
    console.log('================================================');
    
    const status = await this.generateReport();
    
    console.log(`📦 Local Storage: ${status.localStorage} items, ${(status.localStorageSize/1024).toFixed(2)}KB`);
    console.log(`📋 Session Storage: ${status.sessionStorage} items, ${(status.sessionStorageSize/1024).toFixed(2)}KB`);
    console.log(`📡 Service Workers: ${status.serviceWorkers} registered`);
    console.log(`🗂️ Cache Storage: ${status.caches} cache(s)`);
    console.log(`💾 IndexedDB: ${status.indexedDBs} database(s)`);
    console.log(`⏰ Report Time: ${status.timestamp.toISOString()}`);
    
    if (status.localStorage > 0) {
      console.log('📦 Local Storage Contents:', Object.keys(localStorage));
    }
    
    console.log('================================================');
    console.log('✅ Diagnosis complete. Use EmergencyCleanup.execute() to reset.');
  }
}

/**
 * Force refresh utilities
 */
export class ForceRefresh {
  /**
   * Standard force refresh
   */
  static standard(): void {
    window.location.reload();
  }

  /**
   * Hard navigation refresh
   */
  static hardNavigation(): void {
    window.location.href = window.location.href;
  }

  /**
   * Cache-busting refresh with timestamp
   */
  static cacheBusting(): void {
    const url = new URL(window.location.href);
    url.searchParams.set('_t', Date.now().toString());
    window.location.href = url.toString();
  }

  /**
   * Complete state reset refresh
   */
  static async completeStateReset(): Promise<void> {
    localStorage.clear();
    sessionStorage.clear();
    
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname;
    }, 100);
  }

  /**
   * Service worker bypass refresh
   */
  static async serviceWorkerBypass(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // Add no-cache headers
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta);
    
    window.location.reload();
  }
}

/**
 * Cache control utilities
 */
export class CacheController {
  /**
   * Add no-cache meta tags to document head
   */
  static addNoCacheHeaders(): void {
    const existingMeta = document.querySelector('meta[http-equiv="Cache-Control"]');
    if (existingMeta) {
      existingMeta.remove();
    }

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

  /**
   * Create cache-busting URL
   */
  static bypassCacheForUrl(url: string): string {
    const bypassUrl = new URL(url);
    bypassUrl.searchParams.set('_cacheBust', Date.now().toString());
    return bypassUrl.toString();
  }

  /**
   * Create fetch function with no-cache headers
   */
  static createNoCacheFetch() {
    return (url: string, options: RequestInit = {}): Promise<Response> => {
      const noCacheOptions: RequestInit = {
        ...options,
        cache: 'no-store',
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      return fetch(this.bypassCacheForUrl(url), noCacheOptions);
    };
  }
}

/**
 * Real-time cache monitor
 */
export class CacheMonitor {
  private monitoring = false;
  private intervals: NodeJS.Timeout[] = [];

  /**
   * Start monitoring cache status
   */
  startMonitoring(intervalMs = 30000): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    console.log('📊 Starting cache monitoring for Ninu Factory Control...');
    
    const monitor = setInterval(async () => {
      const report = await CacheDiagnostics.generateReport();
      console.log('📊 Cache Monitor Report:', report);
      
      // Alert if storage is getting large
      const totalSize = report.localStorageSize + report.sessionStorageSize;
      if (totalSize > 5 * 1024 * 1024) { // 5MB
        console.warn('⚠️ Large storage detected. Consider cleanup.');
      }
      
      // Alert if many service workers
      if (report.serviceWorkers > 1) {
        console.warn('⚠️ Multiple service workers detected.');
      }
    }, intervalMs);
    
    this.intervals.push(monitor);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.monitoring = false;
    console.log('📊 Cache monitoring stopped');
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoring;
  }
}

// Global utility functions for console access
if (typeof window !== 'undefined') {
  // Make utilities available globally for console debugging
  (window as any).NinuCacheUtils = {
    emergencyCleanup: EmergencyCleanup.execute,
    nuclearReset: EmergencyCleanup.nuclearReset,
    diagnose: CacheDiagnostics.printDiagnosticReport,
    forceRefresh: ForceRefresh.standard,
    cacheBustingRefresh: ForceRefresh.cacheBusting,
    monitor: new CacheMonitor()
  };

  console.log('🛠️ Ninu Cache Utils loaded. Available commands:');
  console.log('  - NinuCacheUtils.emergencyCleanup()');
  console.log('  - NinuCacheUtils.nuclearReset()');
  console.log('  - NinuCacheUtils.diagnose()');
  console.log('  - NinuCacheUtils.forceRefresh()');
  console.log('  - NinuCacheUtils.cacheBustingRefresh()');
  console.log('  - NinuCacheUtils.monitor.startMonitoring()');
}
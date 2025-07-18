/**
 * Ninu Factory Control - Application Service Worker
 * Isolated service worker with conflict prevention and namespace isolation
 */

const CACHE_VERSION = '1.0.0';
const CACHE_PREFIX = 'ninu-factory-control-v1.0.0';
const SW_VERSION = '1.0.0';

// Cache names with namespace isolation
const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-static`,
  api: `${CACHE_PREFIX}-api`,
  images: `${CACHE_PREFIX}-images`,
  fonts: `${CACHE_PREFIX}-fonts`,
  runtime: `${CACHE_PREFIX}-runtime`
};

// Resources to precache
const PRECACHE_URLS = [
  '/',
  '/productos',
  '/dashboard',
  '/admin/productos',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/images/ninu/logo.webp'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[Ninu SW] Installing service worker v' + SW_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        // Open static cache and add precache resources
        const staticCache = await caches.open(CACHE_NAMES.static);
        await staticCache.addAll(PRECACHE_URLS);
        
        console.log('[Ninu SW] Precached ' + PRECACHE_URLS.length + ' resources');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[Ninu SW] Install failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Ninu SW] Activating service worker v' + SW_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        
        // Delete old caches that don't match current version
        const deletePromises = cacheNames
          .filter(cacheName => {
            // Only delete our own caches (namespace protection)
            return cacheName.startsWith('ninu-factory-control-') && 
                   !cacheName.startsWith(CACHE_PREFIX);
          })
          .map(cacheName => {
            console.log('[Ninu SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        await Promise.all(deletePromises);
        
        // Claim all clients immediately
        await self.clients.claim();
        
        console.log('[Ninu SW] Activation complete');
        
        // Notify clients of activation
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'NINU_SW_MESSAGE',
            action: 'SW_ACTIVATED',
            version: SW_VERSION
          });
        });
        
      } catch (error) {
        console.error('[Ninu SW] Activation failed:', error);
      }
    })()
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle requests from our origin (scope isolation)
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Check for bypass headers (conflict prevention)
  if (request.headers.get('x-ninu-bypass') === 'true') {
    console.log('[Ninu SW] Bypassing request:', url.pathname);
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Handle requests with appropriate caching strategy
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determine resource type and caching strategy
    if (url.pathname.startsWith('/api/')) {
      return await handleAPIRequest(request);
    } else if (isStaticAsset(url)) {
      return await handleStaticAsset(request);
    } else if (isImage(url)) {
      return await handleImage(request);
    } else if (isFont(url)) {
      return await handleFont(request);
    } else {
      return await handleNavigation(request);
    }
  } catch (error) {
    console.error('[Ninu SW] Request handling failed:', url.pathname, error);
    return createErrorResponse(request);
  }
}

// API requests - Network first, cache fallback
async function handleAPIRequest(request) {
  const cache = await caches.open(CACHE_NAMES.api);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      
      // Add service worker header
      const response = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'x-ninu-sw': 'true',
          'x-ninu-strategy': 'network-first'
        }
      });
      
      return response;
    }
    
    // Network response not ok, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[Ninu SW] Serving API from cache:', request.url);
      return addSWHeaders(cachedResponse, 'cache-fallback');
    }
    
    return networkResponse; // Return the failed network response
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[Ninu SW] Serving API from cache (network failed):', request.url);
      return addSWHeaders(cachedResponse, 'cache-only');
    }
    
    // Return API error response
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'API request failed and no cached response available',
      offline: true
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'x-ninu-sw': 'true',
        'x-ninu-strategy': 'error'
      }
    });
  }
}

// Static assets - Cache first
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAMES.static);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse && !isCacheExpired(cachedResponse)) {
    return addSWHeaders(cachedResponse, 'cache-first');
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      cache.put(request, networkResponse.clone());
      return addSWHeaders(networkResponse, 'network');
    }
    
    // Return cached version even if expired
    if (cachedResponse) {
      return addSWHeaders(cachedResponse, 'cache-stale');
    }
    
    return networkResponse;
    
  } catch (error) {
    // Return cached version if available
    if (cachedResponse) {
      return addSWHeaders(cachedResponse, 'cache-offline');
    }
    
    throw error;
  }
}

// Images - Cache first with long expiration
async function handleImage(request) {
  const cache = await caches.open(CACHE_NAMES.images);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return addSWHeaders(cachedResponse, 'cache-first');
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return addSWHeaders(networkResponse, 'network');
  } catch (error) {
    return createErrorResponse(request);
  }
}

// Fonts - Cache first (long-term caching)
async function handleFont(request) {
  const cache = await caches.open(CACHE_NAMES.fonts);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return addSWHeaders(cachedResponse, 'cache-first');
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return addSWHeaders(networkResponse, 'network');
  } catch (error) {
    return createErrorResponse(request);
  }
}

// Navigation requests - Network first, cache fallback
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAMES.runtime);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return addSWHeaders(networkResponse, 'network-first');
    }
    
    // Try cache for navigation
    const cachedResponse = await cache.match(request) || await cache.match('/');
    if (cachedResponse) {
      return addSWHeaders(cachedResponse, 'cache-fallback');
    }
    
    return networkResponse;
    
  } catch (error) {
    // Serve cached page or offline page
    const cachedResponse = await cache.match(request) || await cache.match('/');
    if (cachedResponse) {
      return addSWHeaders(cachedResponse, 'cache-offline');
    }
    
    return createOfflinePage();
  }
}

// Utility functions

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') || 
         /\.(js|css|json)$/i.test(url.pathname);
}

function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isFont(url) {
  return /\.(woff|woff2|ttf|eot)$/i.test(url.pathname);
}

function isCacheExpired(response) {
  const cachedAt = response.headers.get('x-ninu-cached-at');
  if (!cachedAt) return false;
  
  const cacheTime = parseInt(cachedAt, 10);
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
  
  return Date.now() - cacheTime > expirationTime;
}

function addSWHeaders(response, strategy) {
  const headers = new Headers(response.headers);
  headers.set('x-ninu-sw', 'true');
  headers.set('x-ninu-strategy', strategy);
  headers.set('x-ninu-cached-at', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

function createErrorResponse(request) {
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({
      error: 'Resource unavailable',
      offline: true
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'x-ninu-sw': 'true'
      }
    });
  }
  
  return new Response('Resource not available offline', {
    status: 503,
    headers: {
      'Content-Type': 'text/plain',
      'x-ninu-sw': 'true'
    }
  });
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Ninu Factory Control - Sin Conexión</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
            color: #333;
          }
          .offline-container {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .logo {
            color: #2563eb;
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .message {
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .retry-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .retry-btn:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="logo">Ninu Factory Control</div>
          <div class="message">
            <h2>Sin Conexión a Internet</h2>
            <p>La aplicación no está disponible en modo offline. Por favor verifica tu conexión e intenta nuevamente.</p>
          </div>
          <button class="retry-btn" onclick="window.location.reload()">
            Reintentar
          </button>
        </div>
      </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html',
      'x-ninu-sw': 'true',
      'x-ninu-offline': 'true'
    }
  });
}

// Message handling
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION_RESPONSE',
        version: SW_VERSION
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          success: true
        });
      });
      break;
      
    default:
      console.log('[Ninu SW] Unknown message action:', action);
  }
});

// Clear all application caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const ninuCaches = cacheNames.filter(name => name.startsWith('ninu-factory-control-'));
  
  await Promise.all(
    ninuCaches.map(name => caches.delete(name))
  );
  
  console.log('[Ninu SW] Cleared all caches');
}

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(performCacheCleanup());
  }
});

async function performCacheCleanup() {
  console.log('[Ninu SW] Performing periodic cache cleanup');
  
  for (const cacheName of Object.values(CACHE_NAMES)) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      // Remove expired entries
      for (const request of keys) {
        const response = await cache.match(request);
        if (response && isCacheExpired(response)) {
          await cache.delete(request);
        }
      }
    } catch (error) {
      console.error('[Ninu SW] Cache cleanup failed for', cacheName, error);
    }
  }
}

console.log('[Ninu SW] Service Worker loaded, version:', SW_VERSION);
const CACHE_NAME = 'flashfusion-v2';
const STATIC_CACHE = 'flashfusion-static-v2';
const DYNAMIC_CACHE = 'flashfusion-dynamic-v2';
const API_CACHE = 'flashfusion-api-v2';

// Detect dev mode from SW URL query param (set at install time)
// Also check self.location for replit/localhost patterns as fallback
const swUrl = new URL(self.location.href);
let isDevMode = swUrl.searchParams.get('dev') === '1' ||
                self.location.hostname === 'localhost' ||
                self.location.hostname.includes('.replit.') ||
                self.location.hostname.includes('-00-') ||
                self.location.protocol === 'http:';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

const API_ROUTES = [
  '/api/products',
  '/api/categories',
  '/api/ai/brand-voices',
  '/api/ai/product-concepts',
  '/api/ai/campaigns'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing, dev mode:', isDevMode);
  
  if (isDevMode) {
    // In dev mode, skip pre-caching and clear any existing caches
    event.waitUntil(
      caches.keys()
        .then((names) => Promise.all(
          names.filter(n => n.startsWith('flashfusion-')).map(n => caches.delete(n))
        ))
        .then(() => {
          console.log('[SW] Dev mode: cleared caches, skipping pre-cache');
          return self.skipWaiting();
        })
    );
  } else {
    // Production: pre-cache static assets
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('[SW] Pre-caching static assets');
          return cache.addAll(STATIC_ASSETS);
        })
        .then(() => self.skipWaiting())
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('flashfusion-') && 
                     name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Skip caching for Vite HMR and dev server requests
  if (url.pathname.startsWith('/@') || 
      url.pathname.startsWith('/node_modules/') ||
      url.pathname.includes('vite') ||
      url.pathname.endsWith('.tsx') ||
      url.pathname.endsWith('.ts') ||
      url.search.includes('v=')) {
    return;
  }

  if (url.pathname.startsWith('/api/ai/stream')) {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // In development mode, bypass caching for scripts and styles entirely
  if (isDevMode) {
    if (request.destination === 'script' || 
        request.destination === 'style' ||
        request.mode === 'navigate') {
      return; // Let browser handle directly - no caching
    }
  }

  if (request.destination === 'image' || 
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache-first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network-first falling back to cache');
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ 
      error: 'offline', 
      message: 'You are offline and this data is not cached' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  return cachedResponse || fetchPromise || new Response('Offline', { status: 503 });
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation offline, serving shell');
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    const indexPage = await cache.match('/');
    if (indexPage) {
      return indexPage;
    }
    return new Response('<h1>Offline</h1><p>Please check your connection.</p>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_STARTED' });
    });
    
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETED' });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FlashFusion';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.url || '/',
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
          clientList[0].navigate(event.notification.data);
        } else {
          self.clients.openWindow(event.notification.data);
        }
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SET_DEV_MODE') {
    isDevMode = event.data.isDev;
    console.log('[SW] Dev mode set to:', isDevMode);
    // Clear caches in dev mode to prevent stale content
    if (isDevMode) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.startsWith('flashfusion-')) {
            caches.delete(name);
            console.log('[SW] Cleared dev cache:', name);
          }
        });
      });
    }
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      })
    );
  }
});

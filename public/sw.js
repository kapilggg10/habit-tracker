// Service Worker for Habit Tracker PWA
// Version-aware caching with stale-while-revalidate strategy

const CACHE_NAME = 'habit-tracker-v1';
const VERSION_URL = '/version.json';
const OFFLINE_URL = '/offline.html';

// Install event - Cache app shell on first visit
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache critical app shell assets
      // Note: We cache these immediately, other assets will be cached on-demand
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        VERSION_URL,
        OFFLINE_URL,
      ]).catch((error) => {
        console.error('[SW] Failed to cache app shell:', error);
        // Don't fail installation if some assets fail to cache
      });
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Compare version strings (semantic versioning)
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  return 0;
}

// Check if response is HTML
function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html') || 
         request.url.endsWith('/') ||
         request.url.endsWith('.html');
}

// Check if request is for static asset
function isStaticAsset(url) {
  return url.includes('/_next/static/') ||
         url.includes('/icon-') ||
         url.includes('/favicon.ico') ||
         url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

// Fetch event - Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle version.json specially - always check network first
  if (url.pathname === VERSION_URL) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            // Clone response for caching
            const responseCloneForCache = response.clone();
            // Clone response for JSON parsing
            const responseCloneForJson = response.clone();
            
            // Cache the version file
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseCloneForCache);
            });
            
            // Compare with cached version
            caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                Promise.all([
                  cachedResponse.json(),
                  responseCloneForJson.json(),
                ]).then(([cachedVersion, serverVersion]) => {
                  if (compareVersions(serverVersion.version, cachedVersion.version) > 0) {
                    // New version available - notify clients
                    self.clients.matchAll().then((clients) => {
                      clients.forEach((client) => {
                        client.postMessage({
                          type: 'NEW_VERSION_AVAILABLE',
                          version: serverVersion.version,
                        });
                      });
                    });
                  }
                }).catch((error) => {
                  console.error('[SW] Error comparing versions:', error);
                });
              }
            }).catch((error) => {
              console.error('[SW] Error accessing cache:', error);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // HTML pages - Stale-while-revalidate strategy
  if (isHTMLRequest(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Always try to fetch from network in background
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              // Update cache with new response
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return null to use cache
            return null;
          });
        
        // Return cached response immediately if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If no cache, wait for network
        return fetchPromise.then((networkResponse) => {
          if (networkResponse) {
            return networkResponse;
          }
          
          // If network failed and no cache, return offline page
          return caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }
  
  // Static assets - Cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
            })
            .catch(() => {
              // Ignore network errors for background updates
            });
          
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Network failed and not in cache
            return new Response('Offline', { status: 503 });
          });
      })
    );
    return;
  }
  
  // Default: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If HTML request and no cache, return offline page
          if (isHTMLRequest(request)) {
            return caches.match(OFFLINE_URL);
          }
          
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    // Check version when client requests it
    fetch(VERSION_URL)
      .then((response) => response.json())
      .then((serverVersion) => {
        caches.match(VERSION_URL).then((cachedResponse) => {
          if (cachedResponse) {
            cachedResponse.json().then((cachedVersion) => {
              if (compareVersions(serverVersion.version, cachedVersion.version) > 0) {
                event.ports[0].postMessage({
                  type: 'NEW_VERSION_AVAILABLE',
                  version: serverVersion.version,
                });
              } else {
                event.ports[0].postMessage({
                  type: 'VERSION_CURRENT',
                  version: serverVersion.version,
                });
              }
            });
          } else {
            event.ports[0].postMessage({
              type: 'VERSION_CURRENT',
              version: serverVersion.version,
            });
          }
        });
      })
      .catch(() => {
        event.ports[0].postMessage({
          type: 'VERSION_CHECK_FAILED',
        });
      });
  }
});


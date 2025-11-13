// Service Worker for Caching Static Assets
// This file caches CSS, JS, images, and fonts to improve load times

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `green-economy-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  // HTML Pages
  '/',
  '/index.html',
  '/agriculture.html',
  '/building.html',
  '/energy.html',
  '/environment.html',
  '/natural.html',
  '/production.html',
  '/transport.html',
  '/waste.html',
  '/water.html',

  // Core Stylesheets
  '/global.css',
  '/index.css',
  '/Master Page(Header and Footer)/MasterPage.css',

  // Core Scripts
  '/Master Page(Header and Footer)/MasterPage.js',
  '/Trans.js',
  '/scripts/navigation.js',
  '/scripts/video-controls.js',
  '/scripts/analytics.js',

  // Font Awesome (for icons)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2',

  // i18next libraries (for translations)
  'https://unpkg.com/i18next@22/i18next.min.js',
  'https://unpkg.com/i18next-http-backend@2.2.0/i18nextHttpBackend.min.js',
  'https://unpkg.com/i18next-browser-languagedetector@7.0.1/i18nextBrowserLanguageDetector.min.js',

  // Lunr.js (for search)
  'https://cdnjs.cloudflare.com/ajax/libs/lunr.js/2.3.9/lunr.min.js',

  // Translation files
  '/locales/en.json',
  '/locales/tn.json',
  '/locales/zu.json',
  '/lang/en.json',
  '/lang/tn.json',
  '/lang/zu.json'
];

// Install event: Cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing and caching static assets...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        
        // Cache all assets, but don't fail if some are unavailable
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => 
              console.warn(`[Service Worker] Failed to cache: ${url}`, err)
            )
          )
        );
      })
      .then(() => self.skipWaiting()) // Activate immediately
      .catch((err) => console.error('[Service Worker] Install failed:', err))
  );
});

// Activate event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating and cleaning old caches...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('green-economy-')) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control of pages immediately
  );
});

// Fetch event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except whitelisted CDNs)
  const isExternal = !url.origin.includes(self.location.origin);
  const isWhitelistedCDN = isExternal && (
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('translate.google.com') ||
    url.hostname.includes('cdn.tailwindcss.com')
  );

  // Strategy 1: Cache First for static assets (CSS, JS, images, fonts, etc.)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' || 
      request.destination === 'font' ||
      isWhitelistedCDN) {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[Service Worker] Cache hit:', request.url);
            return response;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              // Don't cache error responses
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }

              // Clone the response for caching
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                  console.log('[Service Worker] Cached from network:', request.url);
                });

              return response;
            })
            .catch(() => {
              // If offline and not in cache, return a fallback
              console.warn('[Service Worker] Fetch failed (offline?):', request.url);
              
              // Return a simple offline page if available
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
            });
        })
    );
  } 
  // Strategy 2: Network First for API calls and HTML documents
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache error responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone and cache successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          console.log('[Service Worker] Network failed, serving from cache:', request.url);
          return caches.match(request)
            .then((response) => {
              if (response) return response;
              
              // If not in cache either, return a fallback
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
              
              return new Response('Offline - content not available', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
});

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    console.log('[Service Worker] Force update requested');
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    console.log('[Service Worker] Cache cleared');
  }
});

console.log('[Service Worker] Loaded successfully');

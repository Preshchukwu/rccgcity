const CACHE = 'rccgcity-v1'

const PRECACHE = [
  '/',
  '/map',
  '/search',
  '/help',
  '/guide',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
]

// ── Install: pre-cache shell pages and assets ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// ── Activate: remove stale caches ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: per-resource caching strategies ─────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return

  // Facilities list — stale-while-revalidate (show cached, update in background)
  if (url.pathname === '/api/facilities') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Cloudinary images — cache-first with 30-day TTL
  if (url.hostname.includes('cloudinary.com')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Static assets (JS, CSS, fonts, images) — cache-first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Page navigations and everything else — network-first with cache fallback
  event.respondWith(networkFirst(request))
})

// ── Strategy: Cache First ──────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

// ── Strategy: Network First ────────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
      return response
    }
    // Server returned an error — serve stale cache if available
    const cached = await caches.match(request)
    return cached ?? response
  } catch {
    // Network unreachable — fall back to cache
    const cached = await caches.match(request)
    return cached ?? new Response('You are offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

// ── Strategy: Stale While Revalidate ──────────────────────────────────────
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone())
    return response
  }).catch(() => null)
  return cached ?? await fetchPromise ?? new Response('Offline', { status: 503 })
}

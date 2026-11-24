const CACHE_PREFIX = 'cafefe-';
const STATIC_CACHE = `${CACHE_PREFIX}static-v3`;
const API_CACHE = `${CACHE_PREFIX}api-v1`;
const API_ORIGIN = 'http://localhost:9080';
const API_PREFIX = '/Cafefe/resources/v1/';
const CACHEABLE_API_PATH = /^\/Cafefe\/resources\/v1\/(?:producto|tipo_producto|producto_tipo_producto|caja|orden|orden_producto)(?:\/|$)/;
const STATIC_ASSET_PATH = /\.(?:html|css|js|mjs|json|png|jpe?g|svg|webp|gif|ico|woff2?)$/i;

function isInScope(url) {
  const scope = new URL(self.registration.scope);
  return url.origin === scope.origin && url.pathname.startsWith(scope.pathname);
}

function isCacheableApiRequest(request, url) {
  return request.method === 'GET' &&
    url.origin === API_ORIGIN &&
    url.pathname.startsWith(API_PREFIX) &&
    CACHEABLE_API_PATH.test(url.pathname);
}

async function cacheStaticResponse(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
    if (response.status >= 500 && cached) return cached;
    return response;
  } catch (error) {
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const appEntry = new URL('src/index.html', self.registration.scope);
      const cachedEntry = await cache.match(appEntry.href);
      if (cachedEntry) return cachedEntry;
    }
    throw error;
  }
}

async function cacheApiResponse(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    if (response.status >= 500) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Sin conexión y sin una respuesta en caché.' }), {
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}

async function precacheResources(urls) {
  const cache = await caches.open(STATIC_CACHE);
  const inScopeUrls = urls
    .map((value) => new URL(value, self.registration.scope))
    .filter((url) => isInScope(url) && STATIC_ASSET_PATH.test(url.pathname));

  const results = await Promise.allSettled(inScopeUrls.map(async (url) => {
    const response = await fetch(url.href);
    if (!response.ok) throw new Error(`No se pudo cachear ${url.pathname}: HTTP ${response.status}`);
    await cache.put(url.href, response);
  }));
  results.filter((result) => result.status === 'rejected')
    .forEach((result) => console.error('Error al precachear un recurso:', result.reason));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const resources = [
      'src/index.html',
      'manifest.json',
      'src/assets/styles/main.css',
      'src/assets/styles/variables.css',
      'src/assets/images/cafefeLogo.png',
      'src/assets/images/cafefeLogo-192.png',
      'src/assets/images/cafefeLogo-512.png',
      'src/js/boundary/main.js'
    ].map((path) => new URL(path, self.registration.scope).href);
    await cache.addAll(resources);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, API_CACHE].includes(name))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRECACHE_RESOURCES' && Array.isArray(event.data.urls)) {
    event.waitUntil(precacheResources(event.data.urls));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (isCacheableApiRequest(request, url)) {
    event.respondWith(cacheApiResponse(request));
    return;
  }

  if (request.method === 'GET' && isInScope(url) && STATIC_ASSET_PATH.test(url.pathname)) {
    event.respondWith(cacheStaticResponse(request));
    return;
  }

  if (request.method === 'GET' && request.mode === 'navigate' && isInScope(url)) {
    event.respondWith(cacheStaticResponse(request));
  }
});

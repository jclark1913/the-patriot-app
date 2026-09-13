/// <reference lib="webworker" />

import { cacheNames, clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  getCacheKeyForURL,
  precacheAndRoute,
} from 'workbox-precaching'
import type { PrecacheEntry } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>
}

const assets = self.__WB_MANIFEST
precacheAndRoute(assets)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))
clientsClaim()

// Installation must cache the entire build before activation. Updates wait for
// an explicit Home action; claiming a tab never reloads its in-memory session.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting())
  }
  if (event.data?.type === 'CHECK_OFFLINE' && event.ports[0]) {
    event.waitUntil(
      (async () => {
        try {
          const cache = await caches.open(cacheNames.precache)
          const cached = await Promise.all(
            assets.map(async (asset) => {
              const key = getCacheKeyForURL(
                typeof asset === 'string' ? asset : asset.url,
              )
              return key ? Boolean(await cache.match(key)) : false
            }),
          )
          event.ports[0].postMessage({
            ready: cached.length > 0 && cached.every(Boolean),
          })
        } catch {
          event.ports[0].postMessage({ ready: false })
        }
      })(),
    )
  }
})

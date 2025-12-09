/**
 * Service Worker for Restaurant POS PWA
 * Handles offline caching, background sync, and push notifications
 */

const CACHE_NAME = "foodstall-pos-v1";
const API_CACHE = "foodstall-pos-api-v1";
const IMAGE_CACHE = "foodstall-pos-images-v1";

// Assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/items",
  "/orders/create",
  "/expenses/create",
  "/offline.html", // Create this fallback page
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(
        STATIC_ASSETS.filter((url) => url !== "/offline.html")
      );
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== API_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control immediately
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Return offline response for failed API calls
            return new Response(
              JSON.stringify({
                error: "Offline",
                message:
                  "You are currently offline. Changes will sync when online.",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // Images - cache first
  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline page if no cache
            return caches.match("/offline.html") || new Response("Offline");
          });
        })
    );
    return;
  }

  // Other assets - cache first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
      );
    })
  );
});

// Background sync for offline orders/expenses
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "sync-orders" || event.tag === "sync-expenses") {
    event.waitUntil(syncData(event.tag));
  }
});

async function syncData(tag) {
  console.log("[SW] Syncing data:", tag);

  // This will be handled by the app's sync logic
  // Just notify all clients that sync is needed
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_REQUIRED",
      tag: tag,
    });
  });
}

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || "New notification",
    icon: "/icon-192.png",
    badge: "/icon-72.png",
    vibrate: [200, 100, 200],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "FoodStall POS", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});

// Message handler from clients
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CACHE_ITEMS") {
    // Cache items data for offline use
    const items = event.data.items;
    caches.open(API_CACHE).then((cache) => {
      cache.put(
        "/api/items",
        new Response(JSON.stringify(items), {
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  }

  if (event.data.type === "CACHE_CATEGORIES") {
    // Cache categories data for offline use
    const categories = event.data.categories;
    caches.open(API_CACHE).then((cache) => {
      cache.put(
        "/api/categories",
        new Response(JSON.stringify(categories), {
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  }
});

console.log("[SW] Service worker loaded");

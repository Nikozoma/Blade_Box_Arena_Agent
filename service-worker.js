"use strict";

const CACHE_VERSION = "blade-box-arena-pwa-v3";
const CORE_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.webmanifest",
  "/src/config.js",
  "/src/pwa.js",
  "/src/game.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-maskable-512.png",
  "/assets/adventurer/idle/down.png",
  "/assets/adventurer/idle/up.png",
  "/assets/adventurer/idle/left.png",
  "/assets/adventurer/idle/right.png",
  "/assets/adventurer/run/down.png",
  "/assets/adventurer/run/up.png",
  "/assets/adventurer/run/left.png",
  "/assets/adventurer/run/right.png",
  "/assets/adventurer/attack/down.png",
  "/assets/adventurer/attack/up.png",
  "/assets/adventurer/attack/left.png",
  "/assets/adventurer/attack/right.png",
  "/assets/enemies/skeleton1_movement.png",
  "/assets/enemies/skeleton2_movement.png",
  "/assets/enemies/vampire_movement.png",
  "/assets/dungeon/tileset.png",
  "/assets/dungeon/props/chest.png",
  "/assets/dungeon/props/torch_1.png",
  "/assets/dungeon/props/torch_2.png",
  "/assets/dungeon/props/torch_3.png",
  "/assets/dungeon/props/torch_4.png",
  "/assets/vfx/electric_shield.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== CACHE_VERSION)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function shouldSkipCache(requestUrl) {
  return requestUrl.pathname.startsWith("/api/")
    || requestUrl.pathname.startsWith("/health")
    || requestUrl.pathname.startsWith("/rooms")
    || requestUrl.pathname.startsWith("/ws")
    || requestUrl.pathname.startsWith("/socket");
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || shouldSkipCache(requestUrl)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});

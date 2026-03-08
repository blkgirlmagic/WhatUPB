// ---------------------------------------------------------------------------
//  WhatUPB Service Worker
//
//  Minimal SW that makes the app installable, caches static assets for
//  faster loads, and shows an offline fallback when the network drops.
//  Registration is gated to production in ServiceWorkerRegistrar.tsx.
// ---------------------------------------------------------------------------

const CACHE_NAME = "whatupb-v1";

// Assets to pre-cache during install
const PRECACHE_ASSETS = ["/offline", "/icon.svg", "/favicon.ico"];

// ── INSTALL ─────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// ── ACTIVATE ────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  // Delete any caches that aren't the current version
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── FETCH ───────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST to /api/messages, etc.)
  if (request.method !== "GET") return;

  // Skip API routes — always network-only, never cache
  if (url.pathname.startsWith("/api/")) return;

  // ── Next.js static assets (content-hashed, immutable) → cache-first ──
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // ── Navigation (HTML pages) → network-first, offline fallback ──
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline"))
    );
    return;
  }

  // ── Everything else (images, fonts, etc.) → network-first with cache ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

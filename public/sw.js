// Service worker for PWA installability.
// Chrome's install-eligibility check requires a registered SW that ACTUALLY
// handles fetch (an empty handler does not count). We pass every request
// through to the network via event.respondWith(fetch(...)).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pure passthrough — no caching. The respondWith call is what makes Chrome
  // count this as a real fetch handler for install eligibility.
  event.respondWith(fetch(event.request));
});

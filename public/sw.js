// Minimal service worker — present so Chrome treats WearWise as installable.
// Deliberately does NOT cache anything; every request goes to the network.
// If you want offline support later, swap the fetch handler for a strategy
// (cache-first for static, network-first for pages, etc.).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass through — the browser handles the request normally.
});

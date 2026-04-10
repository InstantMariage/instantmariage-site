// InstantMariage Service Worker — Push Notifications

const CACHE_NAME = "instantmariage-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Gestion des événements push (VAPID — pour usage futur backend)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "InstantMariage", body: event.data.text(), url: "/messages" };
  }

  const options = {
    body: payload.body ?? "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.url ?? "/messages" },
    tag: payload.tag ?? "message",
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "InstantMariage", options)
  );
});

// Clic sur la notification → ouvre/focus la conversation
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/messages";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Si un onglet du site est déjà ouvert, on le focus et on navigue
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        // Sinon on ouvre un nouvel onglet
        return self.clients.openWindow(targetUrl);
      })
  );
});

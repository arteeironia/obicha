self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'Respira', body: event.data ? event.data.text() : '' }; }

  const title = data.title || 'Respira — Ô bicha!';
  const options = {
    body: data.body || '',
    icon: '/Logo_-_O_Bicha.png',
    badge: '/Logo_-_O_Bicha.png',
    data: { url: data.url || '/respira' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/respira';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/respira') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

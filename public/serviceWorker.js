
// Wersja cache - zwiększaj, aby wymusić aktualizację plików
const CACHE_NAME = 'event-manager-v1';

// Lista plików do cache'owania
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Nasłuchuj na żądania i obsługuj cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jeśli znaleziono w cache, zwróć z cache
        if (response) {
          return response;
        }

        // Jeśli nie ma w cache, pobierz z sieci
        return fetch(event.request)
          .then((response) => {
            // Sprawdź czy odpowiedź jest poprawna
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Sklonuj odpowiedź, ponieważ odpowiedź jest strumieniem
            // i może być użyta tylko raz
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Zapisz do cache tylko żądania GET
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Jeśli sieć nie jest dostępna i żądanie dotyczy HTML,
            // zwróć stronę offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Aktualizacja Service Workera
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Obsługa powiadomień push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Obsługa kliknięcia w powiadomienie
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

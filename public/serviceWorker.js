
// Wersja cache - zwiększaj, aby wymusić aktualizację plików
const CACHE_NAME = 'event-manager-v2';

// Lista plików do cache'owania
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  // Dodaj więcej ścieżek do plików, które powinny być dostępne offline
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

// Rozszerzona obsługa powiadomień push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        timestamp: data.timestamp || Date.now()
      },
      actions: data.actions || [
        {
          action: 'view',
          title: 'Zobacz szczegóły'
        }
      ],
      tag: data.tag || 'default', // Tag pozwala na grupowanie i zastępowanie powiadomień
      renotify: data.renotify || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Błąd podczas parsowania powiadomienia push:', error);
  }
});

// Obsługa kliknięcia w powiadomienie
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  // Logowanie interakcji z powiadomieniem
  console.log('Użytkownik kliknął powiadomienie:', notification.data);
  
  // Obsługa akcji z powiadomienia
  if (event.action === 'view') {
    console.log('Użytkownik kliknął "Zobacz szczegóły"');
  }

  event.waitUntil(
    clients.openWindow(notification.data.url)
  );
});

// Obsługa zamknięcia powiadomienia bez interakcji
self.addEventListener('notificationclose', (event) => {
  console.log('Użytkownik zamknął powiadomienie bez interakcji:', event.notification.data);
});


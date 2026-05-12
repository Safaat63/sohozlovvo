// Service Worker for PWA and Push Notifications
const CACHE_NAME = 'supernal-wear-commerce-v2';
const urlsToCache = [
    '/',
    '/offline',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first for Next.js chunks, cache for offline page
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Never cache Next.js internal files (_next directory)
    if (url.pathname.startsWith('/_next/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Never cache API routes
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Only cache GET requests (Cache API doesn't support POST, PUT, DELETE, etc.)
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // Network-first strategy for everything else
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response before caching
                const responseToCache = response.clone();

                // Only cache successful responses and supported schemes (http/https)
                if (response.status === 200 && (url.protocol === 'http:' || url.protocol === 'https:')) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request).then((response) => {
                    return response || caches.match('/offline');
                });
            })
    );
});

// Push event - show notification
self.addEventListener('push', (event) => {
    const options = {
        body: 'New notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
            },
            {
                action: 'close',
                title: 'Close',
            },
        ],
    };

    let notificationData = options;

    let parsedTitle = 'New Notification';

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...options,
                body: data.body,
                icon: data.icon || options.icon,
                badge: data.badge || options.badge,
                image: data.image,
                data: {
                    ...options.data,
                    url: data.url,
                    ...data.data,
                },
                tag: data.tag,
            };
            if (data.title) {
                parsedTitle = data.title;
            }
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }

    event.waitUntil(
        self.registration.showNotification(parsedTitle, notificationData)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

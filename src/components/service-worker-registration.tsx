'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Unregister old service workers and clear caches (temporary fix)
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister();
                });
            });

            // Clear all caches
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName);
                });
            });

            // Register new service worker
            setTimeout(() => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('Service Worker registered:', registration);
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                    });
            }, 100);
        }
    }, []);

    return null;
}

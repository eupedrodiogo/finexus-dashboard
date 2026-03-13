import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { openDB } from 'idb';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

async function getDb() {
    return openDB('prospera-share', 1, {
        upgrade(db) {
            db.createObjectStore('shared-files');
        },
    });
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (event.request.method === 'POST' && url.pathname === '/share-target') {
        event.respondWith(
            (async () => {
                try {
                    const formData = await event.request.formData();
                    const files = formData.getAll('files');

                    if (files && files.length > 0) {
                        const db = await getDb();
                        // Store the first file for simplicity, or handle multiple
                        // Using a specific key that the client will check
                        await db.put('shared-files', files[0], 'latest-share');
                        // Also store metadata if needed, but file blob has properties
                    }

                    return Response.redirect('/', 303);
                } catch (err) {
                    console.error('Share target failed', err);
                    return Response.redirect('/', 303);
                }
            })()
        );
    }
});

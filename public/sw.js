// Service Worker with no caching
const CACHE_NAME = 'xmeals-v1';

// Install event 
self.addEventListener('install', (event) => {
    console.log('Service Worker installed.');
    self.skipWaiting();
});

// Activate event - Removed cache cleanup logic (can keep for version control/log)
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
    self.clients.claim();
});

// Fetch event - Only fetch from network, no cache storage
self.addEventListener('fetch', (event) => {
    // console.log('Intercepted request:', event.request.url);

    if (!event.request.url.startsWith('http')) {
        console.warn('Unsupported request scheme:', event.request.url);
        return;
    }

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Fallback response if offline (can customize this or remove if not needed)
                return new Response("You are currently offline. Please check your connection.", {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});

// Full code which contain cache memory storage below, but commented out for now


// // Updated Service Worker for both local and Netlify environments
// const CACHE_NAME = 'xmealuser-v5';
// const ASSETS_TO_CACHE = [
//   './',
//   './index.html',
//   './manifest.json',
//   './icon.png',
//   './app.jsx'
// ];

// // Install event - Cache important files
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('Cache opened');
//         return cache.addAll(ASSETS_TO_CACHE);
//       })
//       .catch(error => {
//         console.error('Cache installation failed:', error);
//       })
//   );
//   // Force the waiting service worker to become the active service worker
//   self.skipWaiting();
// });

// // Activate event - Clean up old caches
// self.addEventListener('activate', (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheWhitelist.indexOf(cacheName) === -1) {
//             // Delete old caches
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
//   // Ensure the service worker takes control of all clients immediately
//   self.clients.claim();
// });

// // Fetch event - Serve from cache first, then network
// self.addEventListener('fetch', (event) => {
//   // Ignore requests with unsupported schemes
//   console.log('Intercepted request:', event.request.url);

//   if (!event.request.url.startsWith('http')) {
//     console.warn('Unsupported request scheme:', event.request.url);
//     return;
//   }

//   event.respondWith(
//     caches.match(event.request)
//       .then((response) => {
//         // Cache hit - return the response from the cached version
//         if (response) {
//           return response;
//         }

//         // Not in cache - return the result from the live server
//         const fetchRequest = event.request.clone();

//         return fetch(fetchRequest)
//           .then((response) => {
//             // Check if we received a valid response
//             if (!response || response.status !== 200 || response.type !== 'basic') {
//               return response;
//             }

//             // Clone the response as it's a one-time use stream
//             const responseToCache = response.clone();

//             caches.open(CACHE_NAME)
//               .then((cache) => {
//                 cache.put(event.request, responseToCache);
//               });

//             return response;
//           })
//           .catch(() => {
//             // Return a basic offline page as fallback for other requests
//             return new Response("You are currently offline. Please check your connection.", {
//               status: 503,
//               headers: { 'Content-Type': 'text/plain' }
//             });
//           });
//       })
//   );
// });
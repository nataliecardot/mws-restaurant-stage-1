// Service worker script (service worker is registered in js/main.js). Using to cache resources on service worker install. Service worker intercepts network requests. This script mainly listens for events

// Not placing this file in js folder because for security reasons, a service worker can only control the pages that are in its same directory or its subdirectories (must cache assets outside of js folder)

// Must work with service worker to pick up changes to CSS, etc., by changing service worker so browser treats updated service worker as new version, which gets its own install event in which it fetches assets (including updated ones) and places them in a new cache, which isn't automatic (have to change name of cache). Create new cache as not to disrupt one already being used by old service worker and pages it controls. Delete old cache once old service worker is released
const cacheID = 'mws-restaurant-v1';

const cacheAssets = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/data/restaurants.json',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/data/restaurants.json',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg'
];

// The install event listener opens caches object and populates it with list of resources to cache. cache.addAll() will reject if any resources fail to cache, preventing service worker from installing (in other words it's atomic). Also addAll() uses fetch; requests transmitted via browser cache
self.addEventListener('install', e => {
  console.log('Service worker installed!');

  // event.waitUntil() enables us to signal progress of install. It also extends lifetime of install event until passed promise resolves successfully (note: a "settled" promise is either fulfilled [resolve() was called] or rejected [reject() was called], but not pending. Sometimes "resolved" and "settled" are used synonymously to mean not pending. A "resolved" promise is one that is settled to match state of another promise, meaning the then function will be called). If promise rejects, service worker is abandoned
  e.waitUntil(
    caches.open(cacheID).then(cache => {
      console.log('Service worker caching files!');
      return cache.addAll(cacheAssets);
    });
  );
});

// Service worker receives activate event once installed. Main purpose is cleanup of resources used in previous versions of a service worker script
self.addEventListener('activate', e => {
  console.log('Service worker activated!');
  // Deletion of old caches
  e.waitUntil(
    // caches.keys() gets names of all caches
    caches.keys().then(cacheNames => {
      // Returns a single Promise that resolves when all promises in argument have resolved or when argument contains no promises
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service worker deleting old cache');
            return caches.delete(cache);
          }
        });
      );
    });
  );
});

// Must program service worker to intercept requests and return their cached version instead of going to network to retrieve them. First step is attaching event handler to fetch event, which is triggered each time a request is made

// Add event listener for fetch event to add service worker
self.addEventListener('fetch', (e => {
  console.log(e.request.url);

  // event.respondWith() method tells browser to evaluate result of event in the future. caches.match(event.request), which is used to remove something from cache, searches cache for resource matching current web request that triggered fetch event, based on URL string, and returns a promise that resolves even if file is not found in cache, unlike cache.match, caches.match tries to find match in any cache, starting with oldest
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    });
  );
}));

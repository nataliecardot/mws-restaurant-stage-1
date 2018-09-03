// Service worker script (service worker is registered in js/main.js). Using to cache resources on service worker install. Service worker intercepts network requests. This script mainly listens for events

// Not placing this file in js folder because for security reasons, a service worker can only control the pages that are in its same directory or its subdirectories (must cache assets outside of js folder)

// Must work with service worker to pick up changes to CSS, etc., by changing service worker so browser treats updated service worker as new version, which gets its own install event in which it fetches assets (including updated ones) and places them in a new cache, which isn't automatic (have to change name of cache). Create new cache as not to disrupt one already being used by old service worker and pages it controls. Delete old cache once old service worker is released
const staticCacheName = 'restaurant-reviews-app-cache-v1'

const cacheAssets = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/data/restaurants.json',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
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

// On service worker install, this code creates cache with provided name and populates it with list of resources to cache
self.addEventListener('install', e => {
  console.log('Service worker installed!');

  // event.waitUntil() enables us to signal progress of install. It also extends lifetime of install event until passed promise resolves successfully (note: a "settled" promise is either fulfilled [resolve() was called] or rejected [reject() was called], but not pending. Sometimes "resolved" and "settled" are used synonymously to mean not pending. A "resolved" promise is one that is settled to match state of another promise, meaning the then function will be called). If promise rejects, service worker is abandoned
  e.waitUntil(
    caches.open('staticCacheName').then(cache => {
      console.log('Service worker caching files!');
      // cache.addAll() will reject if any resources fail to cache, preventing service worker from installing (in other words it's atomic). Also addAll() uses fetch; requests transmitted via browser cache
      return cache.addAll(cacheAssets);
    }).catch(err => {
      console.log(`Install failed due to ${err}`);
    }) // No semicolon allowed here!
  );
});

// Must program service worker to intercept requests and return their cached version instead of going to network to retrieve them. First step is attaching event handler to fetch event, which is triggered each time a request is made

// Adds event listener for fetch event to add service worker
self.addEventListener('fetch', e => {
  // event.respondWith() method prevents default fetch event and provides a promise. Match method determines whether event request URL already exists within the cache loaded during installation. If a match is found, the response (cached version of asset being requested) is returned; or, if not, fetch from network proceeds
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    }) // No semicolon allowed here!
  );
});

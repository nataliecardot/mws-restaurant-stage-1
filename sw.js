// Service worker script. Using to cache resources on service worker install

// Not placing this file in js folder because for security reasons, a service worker can only control the pages that are in its same directory or its subdirectories (must cache assets outside of js folder)

const cacheName = 'restaurant-cache';

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

// The install event listener opens caches object and populates it with list of resources to cache. cache.addAll() will reject if any resources fail to cache, preventing service worker from installing
self.addEventListener('install', e => {
  console.log('Service worker installed!');

  // event.waitUntil() extends lifetime of install event until passed promise resolves successfully (note: a "settled" promise is either fulfilled [resolve() was called] or rejected [reject() was called], but not pending. Sometimes "resolved" and "settled" are used synonymously to mean not pending. A "resolved" promise is one that is settled to match state of another promise, meaning the then function will be called). If promise rejects, service worker is abandoned
  e.waitUntil(
    caches.open('cacheName').then(cache => {
      console.log('Service worker caching files!')
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
        })
      );
    })
  );
});

// Must program service worker to intercept requests and return their cached version instead of going to network to retrieve them. First step is attaching event handler to fetch event, which is triggered each time a request is made

// Add event listener for fetch event to add service worker
self.addEventListener('fetch', (e => {
  console.log(e.request.url);

  // "The event.respondWith() method tells the browser to evaluate the result of the event in the future. caches.match(event.request) takes the current web request that triggered the fetch event and looks in the cache for a resource that matches. The match is performed by looking at the URL string. The match method returns a promise that resolves even if the file is not found in the cache. This means that you get a choice about what you do. In your simple case, when the file is not found, you simply want to fetch it from the network and return it to the browser. https://developers.google.com/web/fundamentals/codelabs/offline/"
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
}));

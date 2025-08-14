const CACHE_NAME = 'flashmy-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/firebase-config.js',
  '/auth.js',
  '/fsrs.js',
  '/study.js',
  '/notifications.js',
  '/import-export.js',
  '/tags-history.js',
  '/themes.js',
  '/share-collab.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});

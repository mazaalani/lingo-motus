//install sw
self.addEventListener("install", (e) => {
  /* e.waitUntil(
    caches.open("site-static").then((cache) => {
      cache.addAll([
        "/v1.0/",
        "/v1.0/index.html",
        "/v1.0/app.js",
        "/v1.0/Game.js",
        "/v1.0/Grid.js",
        "/v1.0/style.css",
      ]);
    })
  ); */
});

//activate sw
self.addEventListener("activate", (e) => {
  console.log("activated: ", e);
});

//fetch event
self.addEventListener("fetch", (e) => {
  //reponse personnalisée et si un des elements demandé est dans le cache
  //renvoyer le cache ne pas faire de fetch
  /* e.respondWith(
    caches.match(e.request).then((cachesRes) => {
      return cachesRes || fetch(e.request);
    })
  ); */
});

const CACHE_NAME = 'daiku-calc-v2.1.2'; // バージョンを変えるたびにここを更新してください
const urlsToCache = [
  '大工の計算機.html'
];

// 1. インストール時の処理
self.addEventListener('install', (event) => {
  // 新しいService Workerを待機させず、すぐにアクティブにする
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// 2. アクティベート時の処理（古いキャッシュの自動クリーンアップ）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 現在のCACHE_NAMEと一致しない古いキャッシュを削除
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // すぐにページをコントロール下におく
  );
});

// 3. フェッチ時の処理（ネットワーク優先・オフライン時にキャッシュ）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワークから正常に取得できた場合はキャッシュを最新に更新して返す
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワーク通信に失敗した場合（オフライン時など）はキャッシュを返す
        return caches.match(event.request);
      })
  );
});

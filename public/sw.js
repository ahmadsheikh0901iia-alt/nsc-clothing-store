/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER — jaan boojh kar chhota
   ───────────────────────────────────────────────────────────────
   Do wajhon se maujood hai:

   1. Chrome tab tak install ki paishkash nahi karta jab tak site
      ke paas ek service worker na ho jo `fetch` sunta ho. Ye
      wohi shart poori karta hai.

   2. Jab phone ka signal chala jaye, grahak ko browser ka wo
      bad-numa "No internet" safha na mile — apni dukaan ka apna
      paigham mile.

   ── JO YE JAAN BOOJH KAR NAHI KARTA ──
   Ye product, daam, ya stock kabhi mehfooz (cache) NAHI karta.
   Wajah saaf hai: aap admin se daam badlein aur grahak ko purana
   daam nazar aaye — ye us se behtar hai ke site thori der zyada
   le. Sirf wo cheezein rakhi jati hain jo kabhi badalti hi nahi:
   logo, aur icon.

   Har naye deploy par CACHE ka naam badalna hota hai, warna
   purani file chipki reh jati hai. Isi liye version yahan ek hi
   jagah likha hai.
   ═══════════════════════════════════════════════════════════════ */

const VERSION = 'nsc-v1';
const SHELL = 'nsc-shell-' + VERSION;

/* Sirf wo cheezein jo kabhi nahi badaltin */
const FOREVER = [
  '/logo-mark.png',
  '/logo-gold.png',
  '/icon-192.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      /* Koi ek file na mile to poora install nahi girna chahiye */
      .then((cache) => Promise.allSettled(FOREVER.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Sirf saada GET. Order bhejna, admin ka kaam, Supabase — in
     sab ko haath nahi lagana. */
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/admin')) return;

  /* Safha khud: hamesha network se — taza daam, taza stock.
     Network na ho to neeche wala paigham. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_PAGE, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            status: 200,
          })
      )
    );
    return;
  }

  /* Wo chand hamesha wali tasveerein: pehle cache, warna network */
  if (FOREVER.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request))
    );
  }
});

const OFFLINE_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NSC Clothing Store</title>
<style>
  :root { color-scheme: dark; }
  body{margin:0;min-height:100vh;display:grid;place-items:center;
       background:#0a0a09;color:#efe9dd;text-align:center;padding:2rem;
       font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:300}
  img{width:96px;height:96px;margin-bottom:1.75rem}
  h1{font-size:1.35rem;font-weight:300;letter-spacing:.02em;margin:0 0 .75rem}
  p{color:#a5a096;font-size:.9rem;line-height:1.7;max-width:34ch;margin:0 auto 1.75rem}
  button{font:inherit;color:#0a0a09;background:#c2a56b;border:0;
         padding:.85rem 2rem;letter-spacing:.18em;text-transform:uppercase;
         font-size:.7rem;cursor:pointer}
</style></head>
<body>
  <div>
    <img src="/icon-192.png" alt="NSC Clothing Store">
    <h1>Internet nahi mil raha</h1>
    <p>Aap ka phone abhi network se nahi jura. Signal wapas aate hi
       dobara koshish karein — aap ka bag wahin mehfooz hai.</p>
    <button onclick="location.reload()">Dobara koshish karein</button>
  </div>
</body></html>`;

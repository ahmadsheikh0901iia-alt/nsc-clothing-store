import { runGate } from '@/lib/gate';

/* ═══════════════════════════════════════════════════════════════
   MIDDLEWARE — jar wali
   ───────────────────────────────────────────────────────────────
   Pehle is file mein sirf `NextResponse.next()` tha — ek khali
   darwaza. Aur kyunke Next.js jar wali file ko tarjeeh deta hai,
   `src/middleware.js` — jis mein asal hifazat likhi thi — kabhi
   chali hi nahi. CSRF ki jaanch bhi khamosh thi aur /admin ka
   `X-Robots-Tag` bhi nahi lag raha tha.

   Ab dono file ek hi gate ko bulati hain, is liye Next jo bhi
   chune, natija ek hi rehta hai.

   Ye file hata bhi dein to site theek chalti rahegi — tab
   `src/middleware.js` apna kaam kar legi.
   ═══════════════════════════════════════════════════════════════ */

export async function middleware(request) {
  return runGate(request);
}

export const config = {
  /* Lafz-ba-lafz — dono middleware file mein yehi qatar. */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.*\\.png|media/|products/|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|woff2?)$).*)',
  ],
};

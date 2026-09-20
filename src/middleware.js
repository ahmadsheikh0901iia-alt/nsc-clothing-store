import { runGate } from '@/lib/gate';

/* ═══════════════════════════════════════════════════════════════
   MIDDLEWARE — src wali
   ───────────────────────────────────────────────────────────────
   Asal kaam `src/lib/gate.js` mein hai. Ye file sirf darwaza
   kholti hai.

   Project ki jar mein bhi aisi hi ek file hai. Next.js un dono
   mein se sirf EK chalata hai — aur wo kaunsi hogi, is par
   bharosa karna theek nahi. Is liye dono ek hi gate ko bulati
   hain: Next jo bhi chune, hifazat wohi rehti hai.
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

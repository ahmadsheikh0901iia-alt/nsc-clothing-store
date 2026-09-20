import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyToken } from '@/lib/admin-token';

/* ═══════════════════════════════════════════════════════════════
   ADMIN AUTH — server ki taraf
   ───────────────────────────────────────────────────────────────
   Teen parton wali hifazat:

     1. middleware.js   — /api/admin/* ka darwaza
     2. requireAdmin()  — har admin route apni jaanch khud bhi
                          karta hai (agar middleware kabhi na
                          chale, tab bhi)
     3. isAdmin()       — /admin ka safha login ya panel mein se
                          kya dikhana hai, ye faisla

   Ek parat nakaam ho to baqi do phir bhi darwaza band rakhti
   hain. Yehi asal tareeqa hai.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Kya is request ke sath sahi admin cookie hai?
 * Server components aur route handlers, dono ke liye.
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  try {
    const jar = await cookies();
    return await verifyToken(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

/**
 * Har admin route ke shuru mein ek line.
 * Ijazat na ho to seedha 401 wapas karta hai.
 *
 *   const gate = await requireAdmin();
 *   if (gate) return gate;
 *
 * @returns {Promise<NextResponse|null>}
 */
export async function requireAdmin() {
  if (await isAdmin()) return null;
  return NextResponse.json(
    { ok: false, error: 'unauthorised' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  );
}

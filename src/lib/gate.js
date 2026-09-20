import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyToken } from '@/lib/admin-token';

/* ═══════════════════════════════════════════════════════════════
   THE GATE — middleware ka asal kaam
   ───────────────────────────────────────────────────────────────
   Ye file khud middleware NAHI hai. Middleware sirf isay bulata
   hai. Wajah saaf hai:

   Next.js middleware ko do jagah dhoondta hai — project ki jar
   mein, ya `src/` ke andar. Is project mein DONO jagah file
   maujood hai, aur Next un mein se sirf EK chalata hai. Pehle
   jar wali khali file chal rahi thi, is liye admin ka darwaza
   aur CSRF ki jaanch — dono khamosh pare the.

   Ab dono file ek hi kaam karti hain: yahan bula leti hain. Next
   jo bhi chune, hifazat chalti hai.

   Char kaam yahan hote hain:

     1. CSRF — koi doosri site aap ki cookie istemal kar ke kuch
        na badal sake

     2. /api/admin/* ka darwaza — sahi chitthi ke baghair andar
        nahi (har route apni jaanch bhi karta hai; ye pehli parat
        hai, aakhri nahi)

     3. /admin, /api aur /order ko search engines se chhupana

     4. In safhon ko kabhi cache na hone dena

   Baqi hifazati headers (CSP, HSTS, frame, referrer, permissions)
   next.config.mjs mein hain — wahan se wo har safhe aur har file
   par lagte hain.
   ═══════════════════════════════════════════════════════════════ */

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/** Request humari apni site se aayi hai? */
function sameOrigin(request) {
  const origin = request.headers.get('origin');

  // Browser har soorat mein Origin nahi bhejta — us par rok
  // lagana asal customers ko rok dega.
  if (!origin) return true;

  let from;
  try {
    from = new URL(origin);
  } catch {
    return false;
  }

  const host = request.headers.get('host');
  if (host && from.host === host) return true;

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      if (new URL(site).host === from.host) return true;
    } catch {
      /* ghalat URL — nazar-andaz */
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (from.hostname === 'localhost' || from.hostname === '127.0.0.1') return true;
  }

  return false;
}

/**
 * Har request is se guzarti hai, safha banne se pehle.
 * @param {import('next/server').NextRequest} request
 */
export async function runGate(request) {
  const { pathname } = request.nextUrl;

  /* ── 1. CSRF ──
     Sirf un requests par jo kuch badalti hain. Parhne wali
     requests par rok ka koi faida nahi. */
  if (pathname.startsWith('/api') && MUTATING.has(request.method)) {
    if (!sameOrigin(request)) {
      return NextResponse.json(
        { ok: false, error: 'bad_origin' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  /* ── 2. Admin API ka darwaza ──
     Login khud khula rehna chahiye, warna koi andar aa hi nahi
     sakta. Baqi sab band. */
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    const ok = await verifyToken(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: 'unauthorised' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  const response = NextResponse.next();

  /* ── 3 aur 4. Search engines se door, aur kabhi cache nahi ── */
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/order')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

/* ── MATCHER YAHAN KYUN NAHI ──
   Next.js middleware ke `config.matcher` ko build ke waqt parhta
   hai, chalne se pehle — is liye wo har middleware file mein
   lafz-ba-lafz likha hona chahiye, kisi doosri file se import
   kiya hua nahi. Dono file mein wohi ek qatar likhi hai; badlein
   to dono mein badlein. */

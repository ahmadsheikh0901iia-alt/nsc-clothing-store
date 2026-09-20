import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  MIN_PASSWORD_LENGTH,
  adminPassword,
  cookieOptions,
  createToken,
} from '@/lib/admin-token';
import { clientIp, rateLimit, resetLimit } from '@/lib/rate-limit';
import { str } from '@/lib/validate';
import { audit } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

/* ═══════════════════════════════════════════════════════════════
   POST   /api/admin/login    andar aana
   DELETE /api/admin/login    bahar nikalna
   ───────────────────────────────────────────────────────────────
   Char hifazati baatein:

     · Password sirf server par milaya jata hai, aur harf-dar-harf
       is tarah ke waqt se koi suragh na mile (timing-safe).
     · Kamiyab hone par cookie mein password nahi, ek dastkhat shuda
       chitthi jati hai — barah ghante ki. httpOnly hai, is liye
       koi script use parh bhi nahi sakti.
     · Paanch ghalat koshishon ke baad wo IP pandrah minute ke liye
       band. Password anda-zan toorna na-mumkin ho jata hai.
     · Password aath harf se chhota ho to login hi kaam nahi karta —
       kamzor password chup chaap qabool nahi hota.
   ═══════════════════════════════════════════════════════════════ */

export async function POST(request) {
  const ip = clientIp(request);

  // Paanch koshishein fi pandrah minute.
  const limit = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'rate_limited',
        message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.`,
      },
      { status: 429, headers: { ...NO_STORE, 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const expected = adminPassword();
  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error: 'not_configured',
        message: `ADMIN_PASSWORD is not set in .env.local, or is shorter than ${MIN_PASSWORD_LENGTH} characters.`,
      },
      { status: 503, headers: NO_STORE }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400, headers: NO_STORE });
  }

  const given = str(body?.password, 200);

  // Waqt se suragh na mile: dono ko barabar lambai tak ginte hain.
  const a = given;
  const b = expected;
  let diff = a.length === b.length ? 0 : 1;
  const len = Math.max(a.length, b.length, 1);
  for (let i = 0; i < len; i += 1) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  if (diff !== 0) {
    await audit(request, 'login.fail');
    return NextResponse.json(
      { ok: false, error: 'wrong_password', message: 'That password is not right.' },
      { status: 401, headers: NO_STORE }
    );
  }

  const token = await createToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500, headers: NO_STORE });
  }

  // Kamiyab — ginti saaf, taake agli dafa poori koshishein milein.
  resetLimit(`admin-login:${ip}`);
  await audit(request, 'login.ok');

  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  response.cookies.set(ADMIN_COOKIE, token, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  response.cookies.set(ADMIN_COOKIE, '', cookieOptions(0));
  return response;
}

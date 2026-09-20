import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { email as cleanEmail } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

/* ═══════════════════════════════════════════════════════════════
   POST /api/newsletter
   ───────────────────────────────────────────────────────────────
   Footer ka form. Pehle ye "Joined ✓" dikha kar email phenk deta
   tha — ab wo asal mein `subscribers` table mein jati hai.

   Har email ke sath ek `unsubscribe_id` bhi banta hai, kyunke
   privacy policy wada karti hai ke nikalna ek click ka kaam hai.
   Ab wo wada sach hai: /unsubscribe?id=...
   ═══════════════════════════════════════════════════════════════ */

export async function POST(request) {
  const ip = clientIp(request);
  const limit = rateLimit(`news:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: NO_STORE });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400, headers: NO_STORE });
  }

  const email = cleanEmail(body?.email);
  if (!email) {
    return NextResponse.json(
      { ok: false, error: 'invalid', message: 'That email does not look right.' },
      { status: 400, headers: NO_STORE }
    );
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503, headers: NO_STORE });
  }

  const { error } = await db.from('subscribers').insert({ email, source: 'footer' });

  if (error) {
    // 23505 = pehle se maujood. Ye ghalti nahi — customer ko
    // "aap pehle se list par hain" kehna hi theek hai.
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, already: true }, { headers: NO_STORE });
    }
    // eslint-disable-next-line no-console
    console.error('[NSC] newsletter:', error.message);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500, headers: NO_STORE });
  }

  return NextResponse.json({ ok: true, already: false }, { headers: NO_STORE });
}

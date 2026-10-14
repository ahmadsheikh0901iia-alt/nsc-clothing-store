import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { email as cleanEmail } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export async function POST(request) {
  const ip = clientIp(request);
  const limit = await rateLimit(`news:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: limit.unavailable ? 'temporarily_unavailable' : 'rate_limited' }, { status: limit.unavailable ? 503 : 429, headers: NO_STORE });
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

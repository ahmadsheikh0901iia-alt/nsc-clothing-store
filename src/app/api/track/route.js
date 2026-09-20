import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { digits, str } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

/* ═══════════════════════════════════════════════════════════════
   POST /api/track
   ───────────────────────────────────────────────────────────────
   Customer apna order dekh sakta hai — account banaye baghair.

   Do cheezein chahiye: order number, aur us number ke aakhri
   chaar digit jo order par likha tha. Sirf order number kaafi
   nahi, warna koi bhi anda-zan number daal kar doosron ke pate
   parh leta.

   Rate limit yahan khaas ahem hai: yehi wo jagah hai jahan koi
   hazaron order number aazma kar dekh sakta hai. Bees koshishein
   fi das minute — asal customer ko kabhi mehsoos bhi nahi hoga.
   ═══════════════════════════════════════════════════════════════ */

export async function POST(request) {
  const ip = clientIp(request);
  const limit = rateLimit(`track:${ip}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: NO_STORE });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400, headers: NO_STORE });
  }

  const orderNumber = str(body?.orderNumber, 40).toUpperCase();
  const last4 = digits(body?.phoneLast4, 20).slice(-4);

  if (!orderNumber || last4.length !== 4) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: NO_STORE });
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503, headers: NO_STORE });
  }

  const { data, error } = await db.rpc('track_order', {
    p_order_number: orderNumber,
    p_phone_last4: last4,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] track:', error.message);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500, headers: NO_STORE });
  }

  if (!data?.ok) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json({ ok: true, order: data }, { headers: NO_STORE });
}

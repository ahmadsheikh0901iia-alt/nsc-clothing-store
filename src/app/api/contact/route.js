import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { notifyNewMessage } from '@/lib/notify';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { str } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

const SUBJECTS = [
  'General enquiry',
  'Order status',
  'Exchange or return',
  'Bulk / wholesale order',
  'Custom stitching',
];

/* ═══════════════════════════════════════════════════════════════
   POST /api/contact
   ───────────────────────────────────────────────────────────────
   Contact form pehle sirf WhatsApp khol deta tha. Agar customer
   "send" na dabata to paigham kahin nahi bacha tha.

   Ab paigham pehle mehfooz hota hai, phir WhatsApp khulta hai.
   Dono mein se ek bhi chale to paigham aap tak pohanch jata hai.
   ═══════════════════════════════════════════════════════════════ */

export async function POST(request) {
  const ip = clientIp(request);
  const limit = rateLimit(`contact:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: NO_STORE });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400, headers: NO_STORE });
  }

  // Honeypot
  if (str(body?.website, 100)) {
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const name = str(body?.name, 120);
  const message = str(body?.message, 4000);
  if (name.length < 2 || message.length < 2) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400, headers: NO_STORE });
  }

  const phone = str(body?.phone, 40);
  const subject = SUBJECTS.includes(body?.subject) ? body.subject : SUBJECTS[0];

  const db = supabaseAdmin();
  if (!db) {
    // Keys nahi hain — form phir bhi WhatsApp khol dega.
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503, headers: NO_STORE });
  }

  const { error } = await db.from('messages').insert({
    name,
    phone,
    subject,
    body: message,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] contact:', error.message);
    return NextResponse.json({ ok: false, error: 'server' }, { status: 500, headers: NO_STORE });
  }

  try {
    await notifyNewMessage({ name, phone, subject, body: message });
  } catch {
    /* ittila na ja sake to bhi paigham mehfooz hai */
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SHIPPING } from '@/lib/constants';
import { generateOrderNumber } from '@/lib/data/orders';
import { notifyNewOrder } from '@/lib/notify';
import { clientIp, hashIp, rateLimit } from '@/lib/rate-limit';
import { email as cleanEmail, orderItems, phone as cleanPhone, str } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════════════════════
   POST /api/orders
   ───────────────────────────────────────────────────────────────
   Site ka sab se ahem darwaza. Yahin par wo cheez hoti hai jo
   pehle kahin nahi hoti thi: order asal mein mehfooz hota hai.

   Jo browser bhejta hai:   slug, size, colour, tadaad
   Jo browser NAHI bhejta:  price, subtotal, delivery, total

   Price sirf database se aati hai. Is liye koi shakhs browser
   mein number badal kar Rs 14,500 ka suit Rs 1 mein nahi le ja
   sakta — ye e-commerce ki sab se aam aur sab se mehngi ghalti
   hai, aur yahan uska darwaza band hai.

   Tarteeb:
     1. Rate limit  — ek IP se toofan nahi
     2. Honeypot    — bots ke liye chhupa hua khana
     3. Jaanch      — har field ki shakal aur hadd
     4. place_order — ek hi transaction: price, stock, order
     5. Ittila      — Telegram / email, server se
   ═══════════════════════════════════════════════════════════════ */

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

const fail = (error, extra = {}, status = 400) =>
  NextResponse.json({ ok: false, error, ...extra }, { status, headers: NO_STORE });

/* Sirf `npm run dev` par. Live site par database ka asal paigham
   kabhi bahar nahi jata — us mein table aur column ke naam hote
   hain, jo kisi hamla-awar ke liye naqsha ban jate hain. Magar
   apne computer par yehi paigham dekhe baghair masla dhoondhna
   andhere mein teer chalana hai. */
const DEV = process.env.NODE_ENV !== 'production';
const devHint = (error) =>
  DEV
    ? {
        dev_message: error?.message || String(error),
        dev_hint:
          "Aksar is ka matlab hota hai ke `supabase-setup.sql` poori nahi chali. Supabase ke SQL Editor mein wo file dobara chala dein — us mein `place_order` function hai.",
      }
    : {};

export async function POST(request) {
  /* ── 1. Rate limit ──
     Aath order fi das minute, ek IP se. Asal customer kabhi is
     hadd tak nahi pohanchta; bot pehle minute mein pohanch jata
     hai. */
  const ip = clientIp(request);
  const limit = rateLimit(`orders:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { ...NO_STORE, 'Retry-After': String(limit.retryAfter) } }
    );
  }

  /* ── Body parh lein ── */
  let body;
  try {
    body = await request.json();
  } catch {
    return fail('invalid', { message: 'That request did not look right.' });
  }
  if (!body || typeof body !== 'object') {
    return fail('invalid', { message: 'That request did not look right.' });
  }

  /* ── 2. Honeypot ──
     Form mein ek khana hai jo aankh se nazar nahi aata. Insan
     usay kabhi nahi bharta; bot har khana bharta hai. Bhara hua
     mila to hum kamiyabi ka jhoota jawab de dete hain — bot ko
     lagta hai kaam ho gaya aur wo dobara koshish nahi karta,
     jabke database bilkul saaf rehta hai. */
  if (str(body.website, 100)) {
    return NextResponse.json(
      { ok: true, orderNumber: generateOrderNumber(), subtotal: 0, shipping: 0, total: 0, items: [] },
      { headers: NO_STORE }
    );
  }

  /* ── 3. Jaanch ── */
  const customerName = str(body.customer_name, 120);
  if (customerName.length < 2) {
    return fail('invalid', { message: 'Please enter your full name.' });
  }

  const phone = cleanPhone(body.phone);
  if (!phone) {
    return fail('invalid', { message: 'That phone number does not look right.' });
  }

  const address = str(body.address, 400);
  if (address.length < 6) {
    return fail('invalid', { message: 'Please enter the full delivery address.' });
  }

  const city = str(body.city, 80);
  if (city.length < 2) {
    return fail('invalid', { message: 'Please enter your city.' });
  }

  const items = orderItems(body.items);
  if (!items) {
    return fail('empty_cart');
  }

  const email = cleanEmail(body.email);
  const notes = str(body.notes, 800);
  const source = ['checkout', 'quick-order'].includes(body.source) ? body.source : 'checkout';

  /* ── 4. Database ── */
  const db = supabaseAdmin();
  if (!db) {
    // Keys set nahi hain. Jhoota "ho gaya" kehne se behtar hai
    // saaf bata dena — customer WhatsApp kar lega.
    return fail('not_configured', {}, 503);
  }

  const ipHash = await hashIp(ip);

  const args = {
    p_customer_name: customerName,
    p_phone: phone,
    p_phone_digits: phone,
    p_email: email,
    p_address: address,
    p_city: city,
    p_notes: notes,
    p_source: source,
    p_items: items,
    p_shipping_flat: SHIPPING.flatRate,
    p_shipping_free_over: SHIPPING.freeOver,
    p_ip_hash: ipHash,
  };

  // Order number randomly banta hai; behad kam imkaan hai ke
  // wohi number pehle se maujood ho. Us soorat mein ek aur.
  let result = null;
  let orderNumber = '';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    orderNumber = generateOrderNumber();
    // eslint-disable-next-line no-await-in-loop
    const { data, error } = await db.rpc('place_order', {
      ...args,
      p_order_number: orderNumber,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[NSC] place_order:', error.message);
      return fail('server', devHint(error), 500);
    }

    if (data?.error === 'duplicate_order_number') continue;

    result = data;
    break;
  }

  if (!result) return fail('server', {}, 500);

  if (!result.ok) {
    // Stock ya product ka masla — customer ko saaf batayein.
    return fail(result.error, { name: result.name, available: result.available, slug: result.slug });
  }

  /* ── 5. Ittila — aap ko, server se ──
     Customer ke kisi amal par bharosa nahi. Nakaam ho jaye to
     bhi order mehfooz hai, is liye poora amal try ke andar hai. */
  try {
    await notifyNewOrder({
      order_number: result.order_number,
      customer_name: customerName,
      phone,
      address,
      city,
      notes,
      items: result.items,
      subtotal: Number(result.subtotal),
      shipping: Number(result.shipping),
      total: Number(result.total),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[NSC] notify:', e?.message || e);
  }

  return NextResponse.json(
    {
      ok: true,
      orderNumber: result.order_number,
      subtotal: Number(result.subtotal),
      shipping: Number(result.shipping),
      total: Number(result.total),
      items: result.items,
    },
    { headers: NO_STORE }
  );
}

/** Baqi tareeqe band. */
export async function GET() {
  return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
}

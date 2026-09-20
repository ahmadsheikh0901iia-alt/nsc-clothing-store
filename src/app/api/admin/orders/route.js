import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { STATUS_KEYS } from '@/lib/order-status';
import { bool, int, str } from '@/lib/validate';
import { audit } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

const json = (body, status = 200) =>
  NextResponse.json(body, { status, headers: NO_STORE });

/* ═══════════════════════════════════════════════════════════════
   GET   /api/admin/orders    orders + dashboard ke numbers
   PATCH /api/admin/orders    status badalna, ya courier / note
   ───────────────────────────────────────────────────────────────
   Status BADALNA seedha update se nahi hota — wo database ke
   `set_order_status` function se guzarta hai. Wahi function:

     · sahi khane mein waqt bhi darj karta hai
       (confirmed_at, shipped_at, delivered_at, cancelled_at)
     · cancel karne par stock wapas shelf par bhejta hai
     · cancel se wapas zinda karne par stock dobara kaatta hai
       (aur agar stock na bacha ho to status badalne hi nahi deta)

   Yehi wo "automatic" hissa hai jo pehle kaam nahi kar raha tha.
   Ab ye database ke andar hai, is liye kabhi aadha nahi hota.
   ═══════════════════════════════════════════════════════════════ */

export async function GET(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  const params = request.nextUrl.searchParams;
  const status = params.get('status');
  const search = str(params.get('q'), 80);
  const limit = int(params.get('limit'), 1, 200, 100);

  let query = db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status && STATUS_KEYS.includes(status)) {
    query = query.eq('status', status);
  }

  if (search) {
    const safe = search.replace(/[%,()]/g, ' ');
    query = query.or(
      `order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,phone.ilike.%${safe}%,city.ilike.%${safe}%`
    );
  }

  const [{ data: orders, error }, { data: stats }] = await Promise.all([
    query,
    db.rpc('admin_stats'),
  ]);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] admin orders:', error.message);
    return json({ ok: false, error: 'server' }, 500);
  }

  return json({ ok: true, orders: orders || [], stats: stats || {} });
}

export async function PATCH(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const orderNumber = str(body?.orderNumber, 40).toUpperCase();
  if (!orderNumber) return json({ ok: false, error: 'invalid' }, 400);

  /* ── Status — hamesha database ke function se ── */
  if (body?.status) {
    const status = str(body.status, 20);
    if (!STATUS_KEYS.includes(status)) {
      return json({ ok: false, error: 'bad_status' }, 400);
    }

    const { data, error } = await db.rpc('set_order_status', {
      p_order_number: orderNumber,
      p_status: status,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[NSC] set_order_status:', error.message);
      return json({ ok: false, error: 'server' }, 500);
    }

    await audit(request, 'order.status', { order: orderNumber, status });

    if (!data?.ok) {
      return json(
        {
          ok: false,
          error: data?.error || 'failed',
          name: data?.name,
          available: data?.available,
        },
        400
      );
    }
  }

  /* ── Baqi khane — seedha update, koi qaida nahi torta ── */
  const patch = {};
  if (body?.courier !== undefined) patch.courier = str(body.courier, 60);
  if (body?.trackingNumber !== undefined) patch.tracking_number = str(body.trackingNumber, 80);
  if (body?.notesInternal !== undefined) patch.notes_internal = str(body.notesInternal, 1000);
  if (body?.whatsappSent !== undefined) patch.whatsapp_sent = bool(body.whatsappSent);

  if (Object.keys(patch).length > 0) {
    const { error } = await db.from('orders').update(patch).eq('order_number', orderNumber);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[NSC] order patch:', error.message);
      return json({ ok: false, error: 'server' }, 500);
    }
  }

  /* ── Nayi shakal wapas bhejein, taake panel foran sahi dikhe ── */
  const { data: order } = await db
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .maybeSingle();

  const { data: stats } = await db.rpc('admin_stats');

  return json({ ok: true, order: order || null, stats: stats || {} });
}

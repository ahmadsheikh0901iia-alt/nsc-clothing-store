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
   GET    /api/admin/orders   orders + dashboard ke numbers
   PATCH  /api/admin/orders   status badalna, ya courier / note
   DELETE /api/admin/orders   sirf cancelled order mitana
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

/* ═══════════════════════════════════════════════════════════════
   DELETE /api/admin/orders
   ───────────────────────────────────────────────────────────────
   Cancelled order ko hamesha ke liye mitana. Do soorat:

     ?order=NSC-1234     ek order
     ?all=cancelled      jitne bhi cancelled hain, sab

   ── TEEN TAALAY, AUR TEENON ZAROORI HAIN ──

   1. `requireAdmin()` — bina login ke yahan tak baat hi nahi
      pahunchti.

   2. **Server khud dekhta hai ke order cancelled hai ya nahi.**
      Ye sab se ahem qatar hai. Admin panel mein Delete ka button
      sirf cancelled order par dikhta hai — magar button chhupa
      dena koi hifazat nahi hoti. Jo shakhs seedha is pate par
      request bhej de, us ke liye wo button maujood hi nahi tha.
      Is liye asli jaanch yahan hoti hai: pehle order ka status
      parha jata hai, aur `cancelled` na ho to kuch nahi mitta.
      Yani chalta hua order kisi soorat nahi mit sakta — na ghalti
      se, na jaan boojh kar.

   3. `audit()` — kya mita, kab, kis pate se. Order mit jata hai,
      us ka nishan reh jata hai.

   ── STOCK ──
   Jab order cancel hua tha, usi waqt `set_order_status` ne maal
   wapas shelf par bhej diya tha. Ab mitane se stock ko haath nahi
   lagta — warna wohi maal do dafa wapas aa jata.
   ═══════════════════════════════════════════════════════════════ */

export async function DELETE(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  const params = request.nextUrl.searchParams;
  const all = str(params.get('all'), 20);
  const orderNumber = str(params.get('order'), 40).toUpperCase();

  /* ── Sab cancelled, ek sath ── */
  if (all === 'cancelled') {
    const { data, error } = await db
      .from('orders')
      .delete()
      .eq('status', 'cancelled')
      .select('order_number');

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[NSC] orders bulk delete:', error.message);
      return json({ ok: false, error: 'server' }, 500);
    }

    const removed = (data || []).map((o) => o.order_number);
    await audit(request, 'order.delete.bulk', { count: removed.length });

    const { data: stats } = await db.rpc('admin_stats');
    return json({ ok: true, removed, count: removed.length, stats: stats || {} });
  }

  /* ── Ek order ── */
  if (!orderNumber) return json({ ok: false, error: 'invalid' }, 400);

  const { data: order, error: readError } = await db
    .from('orders')
    .select('order_number, status')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (readError) {
    // eslint-disable-next-line no-console
    console.error('[NSC] order read before delete:', readError.message);
    return json({ ok: false, error: 'server' }, 500);
  }

  if (!order) return json({ ok: false, error: 'not_found' }, 404);

  /* Yehi wo jaanch hai jo button chhupane se nahi hoti. */
  if (order.status !== 'cancelled') {
    return json(
      { ok: false, error: 'not_cancelled', status: order.status },
      409
    );
  }

  const { error } = await db
    .from('orders')
    .delete()
    .eq('order_number', orderNumber)
    .eq('status', 'cancelled'); // dobara, race ki soorat mein

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] order delete:', error.message);
    return json({ ok: false, error: 'server' }, 500);
  }

  await audit(request, 'order.delete', { order: orderNumber });

  const { data: stats } = await db.rpc('admin_stats');
  return json({ ok: true, order: orderNumber, stats: stats || {} });
}

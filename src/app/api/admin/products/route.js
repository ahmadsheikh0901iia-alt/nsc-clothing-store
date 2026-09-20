import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { CATEGORY_SLUGS, subCollections } from '@/lib/constants';
import { bool, imageUrl, int, num, slugify, str, stringList } from '@/lib/validate';
import { audit } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

const json = (body, status = 200) =>
  NextResponse.json(body, { status, headers: NO_STORE });

/* ═══════════════════════════════════════════════════════════════
   /api/admin/products
   ───────────────────────────────────────────────────────────────
   GET     sare products (chhupe hue bhi)
   POST    naya product
   PATCH   maujooda product badalna
   DELETE  product hatana

   Har field yahan bhi jaanchi jati hai, chahe form ne pehle
   jaanch li ho. Category sirf un chhe slugs mein se ho sakti
   hai jo constants.js mein hain — is se wo purani ghalti hamesha
   ke liye band ho jati hai jahan ghalat slug wala product save
   to ho jata tha magar site par kahin nazar nahi aata tha.

   Tasveer ka pata bhi jaancha jata hai: sirf apni public/ folder
   ya apni Supabase storage. Kisi aur site ka URL yahan se nahi
   guzar sakta.
   ═══════════════════════════════════════════════════════════════ */

/** Form se aayi row ko database ki shakal mein badalta hai. */
function shape(body, { partial = false } = {}) {
  const out = {};
  const has = (key) => body[key] !== undefined;

  if (!partial || has('name')) {
    const name = str(body.name, 160);
    if (!name) return { error: 'Please enter a product name.' };
    out.name = name;
  }

  if (!partial || has('slug') || has('name')) {
    const slug = slugify(body.slug || body.name, 120);
    if (!slug) return { error: 'Could not build a slug — put some letters in the name.' };
    out.slug = slug;
  }

  if (!partial || has('category')) {
    const category = str(body.category, 60);
    if (!CATEGORY_SLUGS.includes(category)) {
      return { error: 'Category must be one of the eight on the list.' };
    }
    out.category = category;
  }

  /* ── Collection ──
     Sirf wohi slug qabool jo us category ke andar waqai maujood
     hai. Browser se aaya hua koi bhi lafz seedha database mein
     nahi jata — warna product ek aise khane mein chala jata jo
     site par kabhi nazar hi nahi aata. */
  if (!partial || has('collection') || has('category')) {
    const category = out.category || str(body.category, 60);
    const allowed = subCollections(category).map((c) => c.slug);
    const given = str(body.collection, 40);

    if (allowed.length === 0) {
      out.collection = '';
    } else if (allowed.includes(given)) {
      out.collection = given;
    } else if (!partial) {
      // Naya product, aur collection nahi bheja — pehla le lein
      out.collection = allowed[0];
    }
  }

  if (!partial || has('price')) {
    out.price = num(body.price, 0, 100000000, 0);
  }

  if (!partial || has('compare_at_price')) {
    const compare = body.compare_at_price;
    out.compare_at_price =
      compare === '' || compare === null || compare === undefined
        ? null
        : num(compare, 0, 100000000, 0) || null;
  }

  if (!partial || has('description')) out.description = str(body.description, 4000);
  if (!partial || has('fabric')) out.fabric = str(body.fabric, 300);

  if (!partial || has('images')) {
    out.images = stringList(body.images, 12, 500).map(imageUrl).filter(Boolean);
  }
  if (!partial || has('sizes')) out.sizes = stringList(body.sizes, 24, 60);
  if (!partial || has('colors')) out.colors = stringList(body.colors, 24, 60);

  if (!partial || has('in_stock')) out.in_stock = bool(body.in_stock, true);

  if (!partial || has('stock_count')) {
    const raw = body.stock_count;
    out.stock_count =
      raw === '' || raw === null || raw === undefined ? null : int(raw, 0, 100000, 0);
  }

  if (!partial || has('featured')) out.featured = bool(body.featured, false);
  if (!partial || has('published')) out.published = bool(body.published, true);
  if (has('sort_order')) out.sort_order = int(body.sort_order, -9999, 9999, 0);

  // compare_at_price price se kam ho to us ka koi matlab nahi.
  if (out.compare_at_price !== undefined && out.price !== undefined) {
    if (out.compare_at_price !== null && out.compare_at_price <= out.price) {
      out.compare_at_price = null;
    }
  }

  return { row: out };
}

export async function GET(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  const search = str(request.nextUrl.searchParams.get('q'), 80);

  /* Purane schema par `sort_order` maujood nahi hota. Aisi soorat
     mein poori list gir jati thi — ab dobara us ke baghair maangi
     jati hai, taake admin panel har haal mein khule. */
  const build = (withSort) => {
    let query = db.from('products').select('*');
    if (withSort) query = query.order('sort_order', { ascending: true });
    query = query.order('created_at', { ascending: false }).limit(500);

    if (search) {
      const safe = search.replace(/[%,()]/g, ' ');
      query = query.or(`name.ilike.%${safe}%,slug.ilike.%${safe}%,fabric.ilike.%${safe}%`);
    }
    return query;
  };

  let { data, error } = await build(true);

  if (error && /sort_order/i.test(`${error.message} ${error.details || ''}`)) {
    // eslint-disable-next-line no-console
    console.error(
      "[NSC] admin products: the 'sort_order' column is missing from the database — run supabase-setup.sql again."
    );
    ({ data, error } = await build(false));
  }

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] admin products:', error.message);
    return json({ ok: false, error: 'server' }, 500);
  }

  return json({ ok: true, products: data || [] });
}


export async function POST(request) {
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

  const { row, error: shapeError } = shape(body || {});
  if (shapeError) return json({ ok: false, error: 'invalid', message: shapeError }, 400);

  const { data, error } = await db.from('products').insert(row).select('*').single();

  if (error) {
    if (error.code === '23505') {
      return json(
        { ok: false, error: 'duplicate', message: `Slug "${row.slug}" is already taken.` },
        409
      );
    }
    // eslint-disable-next-line no-console
    console.error('[NSC] product insert:', error.message);
    return json({ ok: false, error: 'server', message: error.message }, 500);
  }

  await audit(request, 'product.create', { slug: row.slug, name: row.name });

  return json({ ok: true, product: data });
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

  const id = str(body?.id, 60);
  if (!id) return json({ ok: false, error: 'invalid' }, 400);

  const { row, error: shapeError } = shape(body || {}, { partial: true });
  if (shapeError) return json({ ok: false, error: 'invalid', message: shapeError }, 400);

  if (Object.keys(row).length === 0) {
    return json({ ok: false, error: 'invalid', message: 'Nothing to change.' }, 400);
  }

  const { data, error } = await db
    .from('products')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return json(
        { ok: false, error: 'duplicate', message: `Slug "${row.slug}" is already taken.` },
        409
      );
    }
    // eslint-disable-next-line no-console
    console.error('[NSC] product update:', error.message);
    return json({ ok: false, error: 'server', message: error.message }, 500);
  }

  await audit(request, 'product.update', { id, fields: Object.keys(row) });

  return json({ ok: true, product: data });
}

export async function DELETE(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  const id = str(request.nextUrl.searchParams.get('id'), 60);
  if (!id) return json({ ok: false, error: 'invalid' }, 400);

  const { error } = await db.from('products').delete().eq('id', id);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] product delete:', error.message);
    return json({ ok: false, error: 'server', message: error.message }, 500);
  }

  await audit(request, 'product.delete', { id });

  return json({ ok: true });
}

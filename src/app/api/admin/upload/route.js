import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/validate';
import { audit } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

const json = (body, status = 200) =>
  NextResponse.json(body, { status, headers: NO_STORE });

const BUCKET = 'product-images';
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

/** Sirf ye chaar. Har ek ka pehchan-nishan (magic bytes) bhi. */
const TYPES = {
  'image/jpeg': { ext: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  'image/png': { ext: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/webp': { ext: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] },
  'image/avif': { ext: 'avif', magic: [] },
};

/**
 * File ke pehle chand bytes dekh kar tasdeeq karta hai ke ye
 * waqai tasveer hai.
 *
 * Sirf naam ya content-type par bharosa nahi kiya ja sakta —
 * dono browser se aate hain aur dono badle ja sakte hain. Asal
 * bytes jhoot nahi bolte.
 */
function looksLikeImage(bytes, mime) {
  const spec = TYPES[mime];
  if (!spec) return false;
  if (spec.magic.length === 0) return true; // avif ka header lamba hai
  return spec.magic.some((sig) => sig.every((byte, i) => bytes[i] === byte));
}

/* ═══════════════════════════════════════════════════════════════
   POST /api/admin/upload
   ───────────────────────────────────────────────────────────────
   Tasveer seedha admin panel se Supabase Storage par.

   Pehle tasveer public/products/ mein haath se rakhni parti thi
   aur form mein uska rasta likhna parta tha. Ab drag-and-drop.

   Upload service role se hota hai, browser se nahi — is liye
   upload ki koi chabi kabhi browser tak pohanchti hi nahi.
   ═══════════════════════════════════════════════════════════════ */

export async function POST(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return json({ ok: false, error: 'invalid', message: 'No file was received.' }, 400);
  }

  if (file.size > MAX_BYTES) {
    return json(
      {
        ok: false,
        error: 'too_large',
        message: `That image is ${(file.size / 1048576).toFixed(1)} MB — it needs to be under 6 MB.`,
      },
      413
    );
  }

  const mime = String(file.type || '').toLowerCase();
  if (!TYPES[mime]) {
    return json(
      { ok: false, error: 'bad_type', message: 'JPG, PNG, WebP or AVIF only.' },
      415
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!looksLikeImage(buffer, mime)) {
    return json(
      { ok: false, error: 'bad_type', message: 'That file does not look like an image.' },
      415
    );
  }

  // Naam khud banate hain — browser ka bheja hua naam kabhi
  // seedha rasta banane ke liye istemal nahi hota.
  const hint = slugify(String(form.get('name') || file.name || 'product'), 50) || 'product';
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const path = `${hint}/${stamp}-${random}.${TYPES[mime].ext}`;

  const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] upload:', error.message);
    return json(
      {
        ok: false,
        error: 'server',
        message:
          error.message?.includes('Bucket not found')
            ? 'Storage bucket not found — run supabase-setup.sql again.'
            : error.message,
      },
      500
    );
  }

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);

  await audit(request, 'image.upload', { path, bytes: file.size });

  return json({ ok: true, url: data.publicUrl, path });
}

export async function DELETE(request) {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  const path = String(request.nextUrl.searchParams.get('path') || '');
  if (!path || path.includes('..')) return json({ ok: false, error: 'invalid' }, 400);

  const { error } = await db.storage.from(BUCKET).remove([path]);
  if (error) return json({ ok: false, error: 'server', message: error.message }, 500);

  return json({ ok: true });
}

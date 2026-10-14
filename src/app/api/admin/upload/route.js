import sharp from 'sharp';
import { MAX_UPLOAD_BYTES } from '@/lib/images';
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
const MAX_BYTES = MAX_UPLOAD_BYTES;

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
        message: `That image is ${(file.size / 1048576).toFixed(1)} MB — it needs to be under 4 MB.`,
      },
      413
    );
  }

  let buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 40000000, animated: false });
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp', 'avif', 'heif'].includes(metadata.format)) {
      return json({ ok: false, error: 'bad_type', message: 'JPG, PNG, WebP or AVIF only.' }, 415);
    }
    buffer = await image.rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch {
    return json({ ok: false, error: 'bad_type', message: 'That file could not be decoded as a safe image.' }, 415);
  }

  // Naam khud banate hain — browser ka bheja hua naam kabhi
  // seedha rasta banane ke liye istemal nahi hota.
  const hint = slugify(String(form.get('name') || file.name || 'product'), 50) || 'product';
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const path = `${hint}/${stamp}-${random}.webp`;

  const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/webp',
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

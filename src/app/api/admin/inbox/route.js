import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { bool, str } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

const json = (body, status = 200) =>
  NextResponse.json(body, { status, headers: NO_STORE });

/* ═══════════════════════════════════════════════════════════════
   /api/admin/inbox
   ───────────────────────────────────────────────────────────────
   Contact form ke paighamat aur newsletter ki list.
   GET   dono le aata hai
   PATCH ek paigham ko "ho gaya" ya wapas "khula" karta hai
   ═══════════════════════════════════════════════════════════════ */

export async function GET() {
  const gate = await requireAdmin();
  if (gate) return gate;

  const db = supabaseAdmin();
  if (!db) return json({ ok: false, error: 'not_configured' }, 503);

  const [messages, subscribers] = await Promise.all([
    db.from('messages').select('*').order('created_at', { ascending: false }).limit(200),
    db
      .from('subscribers')
      .select('id,email,created_at,active')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1000),
  ]);

  if (messages.error || subscribers.error) {
    // eslint-disable-next-line no-console
    console.error('[NSC] inbox:', messages.error?.message || subscribers.error?.message);
    return json({ ok: false, error: 'server' }, 500);
  }

  return json({
    ok: true,
    messages: messages.data || [],
    subscribers: subscribers.data || [],
  });
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

  const { error } = await db
    .from('messages')
    .update({ handled: bool(body?.handled, true) })
    .eq('id', id);

  if (error) return json({ ok: false, error: 'server' }, 500);

  return json({ ok: true });
}

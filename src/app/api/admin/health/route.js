import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, supabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/** Authenticated, read-only diagnostics. Never returns secrets or customer rows. */
export async function GET() {
  const gate = await requireAdmin();
  if (gate) return gate;
  const db = supabaseAdmin();
  const checks = [
    { name: 'Public database configuration', ok: supabaseConfigured },
    { name: 'Server database configuration', ok: Boolean(db) },
    { name: 'Owner notifications configured (delivery not tested)', ok: Boolean(
      (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) || process.env.RESEND_API_KEY
    ) },
  ];
  if (db) {
    const required = {
      products: 'id,slug,collection,sort_order', orders: 'order_number,deleted',
      messages: 'id', subscribers: 'id', admin_log: 'id', nsc_rate_limits: 'key',
    };
    await Promise.all(Object.entries(required).map(async ([table, columns]) => {
      try {
        const { error } = await db.from(table).select(columns, { head: true }).limit(1);
        checks.push({ name: table === 'nsc_rate_limits' ? 'Shared rate-limit migration table' : `${table} schema`, ok: !error });
      } catch { checks.push({ name: `${table} connection`, ok: false }); }
    }));
    try {
      const { data, error } = await db.storage.getBucket('product-images');
      checks.push({ name: 'Public product-images storage bucket', ok: !error && data?.public === true });
    } catch { checks.push({ name: 'Product image storage connection', ok: false }); }
  }
  return NextResponse.json({ ok: true, checks }, { headers: { 'Cache-Control': 'no-store' } });
}

import { supabaseAdmin } from '@/lib/supabase';
import { createMemoryLimiter } from '@/lib/rate-limit-core';

const memory = createMemoryLimiter();
let warnedAt = 0;

/** A shared atomic counter across all Vercel instances. The migration is additive
 * and never modifies orders/products. Legacy installations keep their existing
 * protection and emit a setup warning until it is applied. */
export async function rateLimit(key, limit, windowMs) {
  const db = supabaseAdmin();
  if (db) {
    try {
      const { data, error } = await db.rpc('nsc_take_rate_limit', {
        p_key: await hashIp(key), p_limit: limit, p_window_ms: windowMs,
      });
      if (!error && data && typeof data.ok === 'boolean') return data;
      if (Date.now() - warnedAt > 60000) {
        console.warn('[NSC] Shared rate limit unavailable. Apply the rate-limit migration; local protection is active.');
        warnedAt = Date.now();
      }
    } catch {
      console.warn('[NSC] Shared rate-limit connection unavailable.');
    }
  }
  if (process.env.NSC_REQUIRE_SHARED_RATE_LIMIT === 'true') {
    return { ok: false, remaining: 0, retryAfter: 60, unavailable: true };
  }
  return memory.take(key, limit, windowMs);
}

export async function resetLimit(key) {
  memory.reset(key);
  const db = supabaseAdmin();
  if (db) {
    try { await db.rpc('nsc_reset_rate_limit', { p_key: await hashIp(key) }); }
    catch { /* Expiry still releases the counter. */ }
  }
}

/**
 * Request se visitor ka IP nikalta hai. Vercel `x-forwarded-for`
 * bhejta hai; pehla pata asal client ka hota hai.
 * @param {Request} request
 */
export function clientIp(request) {
  const h = request.headers;
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return h.get('x-real-ip') || h.get('cf-connecting-ip') || 'unknown';
}

/**
 * IP ka ek chhota, wapas na parha ja sakne wala nishan — taake
 * duplicate orders pakre ja sakein magar database mein kisi ka
 * asal IP na likha jaye.
 * @param {string} ip
 */
export async function hashIp(ip) {
  try {
    const data = new TextEncoder().encode(`nsc:${ip}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)]
      .slice(0, 8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

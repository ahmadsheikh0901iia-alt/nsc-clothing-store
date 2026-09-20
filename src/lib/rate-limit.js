/* ═══════════════════════════════════════════════════════════════
   RATE LIMIT
   ───────────────────────────────────────────────────────────────
   Ek hi IP se bar bar aane wali requests ko rokta hai — bots,
   spam orders, aur admin ka password toorne ki koshish.

   Ye server ki apni yaad-dasht mein rehta hai, is liye server
   restart hone par khali ho jata hai aur Vercel ke har instance
   ki apni ginti hoti hai. Poora hal nahi, magar 99% shor ye yahin
   rok deta hai aur is ke liye koi extra service ya paisa nahi
   lagta. Agar kabhi zaroorat pare to isi file ko Upstash Redis
   par badal dena kaafi hoga — baqi code chhune ki zaroorat nahi.
   ═══════════════════════════════════════════════════════════════ */

const buckets = new Map();
const MAX_KEYS = 5000;

/** Purani entries hata deta hai taake yaad-dasht barhti na rahe. */
function sweep(now) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, entry] of buckets) {
    if (entry.reset <= now) buckets.delete(key);
  }
  // Phir bhi bhari ho to sab se purani nikal dein.
  if (buckets.size >= MAX_KEYS) {
    const oldest = [...buckets.entries()]
      .sort((a, b) => a[1].reset - b[1].reset)
      .slice(0, Math.floor(MAX_KEYS / 4));
    for (const [key] of oldest) buckets.delete(key);
  }
}

/**
 * @param {string} key     e.g. `orders:${ip}`
 * @param {number} limit   is arse mein kitni baar
 * @param {number} windowMs arsa, milliseconds mein
 * @returns {{ok: boolean, remaining: number, retryAfter: number}}
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);

  if (!entry || entry.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((entry.reset - now) / 1000)),
    };
  }

  return { ok: true, remaining: limit - entry.count, retryAfter: 0 };
}

/** Kamiyab login ke baad ginti saaf kar deta hai. */
export function resetLimit(key) {
  buckets.delete(key);
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

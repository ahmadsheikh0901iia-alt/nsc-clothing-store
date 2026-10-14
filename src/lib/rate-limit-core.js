/** Local fallback for development / legacy databases. Production should use
 * the atomic Postgres function in supabase/migrations. */
export function createMemoryLimiter({ now = Date.now, maxKeys = 5000 } = {}) {
  const buckets = new Map();
  return {
    take(key, limit, windowMs) {
      const stamp = now();
      if (buckets.size >= maxKeys) {
        for (const [k, entry] of buckets) if (entry.reset <= stamp) buckets.delete(k);
        // Do not evict active limits: reject new keys while full.
        if (buckets.size >= maxKeys && !buckets.has(key)) return { ok: false, remaining: 0, retryAfter: 60 };
      }
      let entry = buckets.get(key);
      if (!entry || entry.reset <= stamp) {
        entry = { count: 0, reset: stamp + windowMs };
        buckets.set(key, entry);
      }
      entry.count += 1;
      return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count),
        retryAfter: entry.count <= limit ? 0 : Math.max(1, Math.ceil((entry.reset - stamp) / 1000)) };
    },
    reset(key) { buckets.delete(key); },
  };
}

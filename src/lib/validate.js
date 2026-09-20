/* ═══════════════════════════════════════════════════════════════
   INPUT KI JAANCH
   ───────────────────────────────────────────────────────────────
   Baahar se aane wali har cheez par shak karna chahiye — chahe
   woh humare apne form se hi aayi ho. Browser mein kuch bhi
   badla ja sakta hai, is liye asal jaanch hamesha server par
   hoti hai, aur woh yahan hai.
   ═══════════════════════════════════════════════════════════════ */

/** Har cheez ko string banata hai, kinare saaf kar ke, hadd ke andar. */
export function str(value, max = 300) {
  if (value === null || value === undefined) return '';
  return String(value)
    // Control characters — text mein inka koi kaam nahi.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

/** Sirf digits. */
export function digits(value, max = 20) {
  return String(value ?? '').replace(/\D/g, '').slice(0, max);
}

/** Hadd ke andar poora number. */
export function int(value, min, max, fallback = min) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Hadd ke andar aam number. */
export function num(value, min, max, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function bool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return fallback;
}

/** Email ki halki si jaanch — sakht regex se faida kam, nuqsan zyada. */
export function email(value) {
  const clean = str(value, 160).toLowerCase();
  if (!clean) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean) ? clean : '';
}

/** url mein daale ja sakne wala slug. */
export function slugify(value, max = 90) {
  return String(value ?? '')
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
}

/** Kisi bhi cheez ko strings ki saaf list banata hai. */
export function stringList(value, maxItems = 40, maxLength = 80) {
  let list = value;
  if (typeof list === 'string') {
    list = list.split(/[\n,]/);
  }
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => str(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Pakistani phone number ki jaanch.
 * 03xx xxxxxxx, +92 3xx, 92 3xx — sab qabool.
 */
export function phone(value) {
  const raw = str(value, 40);
  const d = digits(raw);
  if (d.length < 10 || d.length > 15) return null;
  return raw;
}

/**
 * Order ke items ki jaanch. Price yahan se NAHI aati — wo
 * database se aati hai. Sirf "kya" aur "kitna".
 */
export function orderItems(value) {
  if (!Array.isArray(value) || value.length === 0) return null;
  if (value.length > 40) return null;

  const items = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null;
    const slug = slugify(raw.slug, 120);
    if (!slug) return null;
    items.push({
      slug,
      size: str(raw.size, 60) || null,
      color: str(raw.color, 60) || null,
      qty: int(raw.qty, 1, 99, 1),
    });
  }
  return items;
}

/**
 * Sirf hamari apni storage ya public/ ki tasveerein. Kisi aur
 * site ka URL yahan se nahi guzar sakta — na `javascript:`, na
 * `data:`.
 */
export function imageUrl(value) {
  const clean = str(value, 500);
  if (!clean) return '';
  if (clean.startsWith('/')) return clean.startsWith('//') ? '' : clean;
  if (/^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(clean)) {
    return clean;
  }
  return '';
}

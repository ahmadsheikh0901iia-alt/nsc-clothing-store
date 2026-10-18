/**
 * Product image sources.
 *
 * ── PEHLE KYA HOTA THA ──────────────────────────────────────
 * Sirf do shakal qabul kiye jate thay: local file (`/products/…`)
 * ya Supabase ka public storage. Baqi HAR URL ko
 * `/products/placeholder.jpg` par bhej diya jaata tha — khamoshi
 * se, koi error bhi nahi. Jo tasveer doosri jagah (custom domain,
 * CDN, purana upload) par hoti, wo kabhi nahi dikhti, aur na dikhne
 * ki wajah bhi pata nahi chalti thi.
 *
 * ── AB KYA HOTA HAI ──────────────────────────────────────────
 * Har wohi URL jo browser khud fetch kar sakta hai, seedha use
 * hota hai:
 *
 *   · local file  → `/products/…`
 *   · koi bhi `https://` URL → seedha (CDN se, bina optimizer ke)
 *   · khaali / bekaar value → sirf tabhi placeholder
 *
 * Is tarah "tasveer nahi dikh rahi" ki shikayat dobara nahi aati:
 * agar URL theek hai to wo dikhegi, aur agar sach mein koi file
 * nahi hai to tabhi placeholder aayega.
 */

/** Kya yeh local file hai (`/products/…`)? */
function isLocalPath(source) {
  return source.startsWith('/') && !source.startsWith('//') && !source.includes('\\');
}

/** Sirf wahi URL jo browser seedha khul sakta hai. */
function isSafeRemote(source) {
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * Image source ko saaf karta hai.
 * @param {unknown} value
 * @returns {string} ek URL jo browser par sach mein khul sakti hai
 */
export function safeImageSource(value) {
  if (typeof value !== 'string') return '/products/placeholder.jpg';
  const source = value.trim();
  if (!source) return '/products/placeholder.jpg';
  if (isLocalPath(source)) return source;
  if (isSafeRemote(source)) return source;
  return '/products/placeholder.jpg';
}

/** Kya yeh source seedha (bina optimizer ke) load hona chahiye? */
export function isExternalSource(value) {
  return typeof value === 'string' && /^https:\/\//i.test(value.trim());
}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const UPLOAD_LABEL = '4 MB';

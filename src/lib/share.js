/* ═══════════════════════════════════════════════════════════════
   DATABASE KI QATAR  →  SHARE KARNE WALI SHAKL
   ───────────────────────────────────────────────────────────────
   `utils.js` jaan boojh kar khaali hai — wo kuch import nahi
   karta. Magar share ka paighaam banane ke liye teen cheezein
   bahar se chahiye: dukaan ka pata (STORE.url), rangon ke naam,
   aur WhatsApp ki likhai se saaf kiya hua text.

   Is liye wo saara kaam yahan hai, aur `utils.js` saaf raha.

   ── TASVEER KA PATA POORA HONA CHAHIYE ──
   Paighaam mein `/products/kuch.jpg` likhne ka koi matlab nahi —
   jis ko bheja gaya wo use khol hi nahi sakta. Is liye adhoora
   pata hamesha dukaan ke pate ke sath jor diya jata hai.

   ── PLACEHOLDER TASVEER NAHI BHEJNI ──
   `primaryImage()` tasveer na hone par apni jagah ek khaali
   tasveer de deta hai, taake safhe par sooraakh na ho. Magar
   WhatsApp par us ka pata bhejna bekar hai — is soorat mein
   paighaam khud kehta hai "Image not available".
   ═══════════════════════════════════════════════════════════════ */

import { STORE, colorName } from '@/lib/constants';
import { cleanText, primaryImage, toArray } from '@/lib/utils';

/** "4999" → "4,999" — aur jahan ye naap na chale, wahan jaisa hai waisa. */
function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? '');
  try {
    return new Intl.NumberFormat('en-PK').format(n);
  } catch {
    return String(n);
  }
}

/**
 * Ek product ko us shakl mein badalta hai jo `getWhatsAppShareUrl`
 * maangta hai.
 *
 * @param {Object} product          database ki qatar
 * @param {Object} [picked]         safhe par grahak ne jo chuna
 * @param {string|null} [picked.size]
 * @param {string|null} [picked.color]
 */
export function toShareProduct(product, { size = null, color = null } = {}) {
  const base = String(STORE?.url || '').replace(/\/$/, '');

  /* ── Size / Colour ──
     Grahak ne kuch chun rakha ho to wohi. Warna jitne maujood
     hain, sab — taake jis ko bheja jaye use poora pata ho. */
  const sizes = toArray(product?.sizes);
  const colors = toArray(product?.colors).map((c) => colorName(c)).filter(Boolean);

  const bits = [];
  if (size) bits.push(`Size ${size}`);
  else if (sizes.length) bits.push(`Size ${sizes.join(', ')}`);
  if (color) bits.push(`Colour ${color}`);
  else if (colors.length) bits.push(`Colour ${colors.join(', ')}`);

  /* ── Tasveer ── */
  const raw = primaryImage(product);
  const isPlaceholder = !raw || raw.includes('placeholder');
  let imageUrl = '';
  if (!isPlaceholder) {
    imageUrl = /^https?:\/\//i.test(raw) ? raw : `${base}${raw.startsWith('/') ? '' : '/'}${raw}`;
  }

  return {
    title: cleanText(product?.name, 90),
    currency: 'PKR',
    price: money(product?.price),
    variant: bits.join(' · ') || '-',
    url: product?.slug ? `${base}/shop/${product.slug}` : base,
    imageUrl,
    shortDescription: cleanText(product?.description, 160),
  };
}

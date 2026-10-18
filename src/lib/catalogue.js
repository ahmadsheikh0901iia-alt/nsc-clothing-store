/**
 * Catalogue ke bhi khane — wahi usool jo pehle the, sirf ek jagah
 * rakh kar taake homepage aur collection ka safha ek doosre se
 * kabhi na bhatkein.
 *
 * ── "NEW ARRIVALS" AUR "TOP SALES" ───────────────────────────
 * Ye do khaane admi ke chune hue products hain: admin ke dropdown
 * mein se koi product in par chuna ja sakta hai. Is liye inhein
 * category ki tarah hi dekha jata hai — jaise pehle hota tha.
 *
 * (Inhein "sab se naye thirty" ya "sab se zyada discount wale"
 * banane ki koshish nahi honi chahiye: admin ka chuna hua maal
 * hi maqsad hai, warna uska intikhab bekaar ho jata hai.)
 */

/** Kitni chhoot — 0 ka matlab "koi chhoot nahi". */
export function saleCut(product) {
  const was = Number(product?.compare_at_price);
  const price = Number(product?.price);
  return was > price && price > 0 ? Math.round(((was - price) / was) * 100) : 0;
}

/**
 * Ek khaane ke products.
 *
 * @param {Array} products
 * @param {string} category
 * @param {string} collection taqseem (winter/summer…) — khaali to poora khana
 * @param {number} limit dikhane ki had (0 = koi had nahi)
 */
export function collectionProducts(products, category, collection = '', limit = 0) {
  const rows = (products || []).filter(
    (p) => p?.category === category && (!collection || p?.collection === collection)
  );
  return limit > 0 ? rows.slice(0, limit) : rows;
}

/**
 * Har khane mein kitne products.
 *
 * Sirf wahi ginna hai jo products ke apne `category` mein likha
 * hai — koi khaali hisa bana kar ginna nahi, warna homepage par
 * ginti aur asal catalogue se alag ho jati hai.
 */
export function categoryCounts(products) {
  const counts = {};
  for (const p of products || []) {
    if (!p?.category) continue;
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return counts;
}

/**
 * Kya yeh ghalti sirf is liye aayi ke yeh column mojood nahi?
 *
 * Postgres 42703 (undefined_column) aur PostgREST 204 (schema cache
 * mein column nahi) — yeh do sarchi ghaltiyan hain. Inke ilawa
 * message mein "column" ya "does not exist" ka zikr bhi kaafi hai:
 * kuch purane server sirf naam likh dete hain, code nahi.
 *
 * Network ki ghalti (jisme poora query URL message mein aa jata
 * hai) galti se qualify nahi hoti — wahan sirf column ka naam
 * dekhna kaafi nahi, "column"/"does not exist" bhi dekhna zaroori
 * hai.
 */
export function missingColumn(error, name) {
  if (!error) return false;
  const text = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`;
  if (!new RegExp(`\\b${name}\\b`, 'i').test(text)) return false;
  if (['42703', 'PGRST204'].includes(error.code)) return true;
  return /\bcolumn\b|\bdoes not exist\b|\bschema cache\b/i.test(text);
}

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
 * Lekin ek keemat rakhni hai: agar admin ne abhi in dono mein
 * kuch nahi rakha (ya jo rakha tha wo nikal gaya), to yeh tile
 * khali na baithen. Is liye intikhab ke baad ek "warna" (fallback)
 * hai — wahi usool jo Top Sales section pehle se chalata hai:
 *
 *   · New In  → admin ka chuna hua maal, warna sab se naye 30 maal
 *   · Top Sales → admin ka chuna hua maal, warna sach mein chhoot
 *     wale maal (sab se zyada chhoot pehle)
 *
 * Is se do farq hote hain — dono acche:
 *   1. Admin ka chuna hua maal hamesha pehle hai (us ki marzi
 *      ki hona chahiye).
 *   2. Khali tile nahi dikhti, aur homepage ki ginti aur collection
 *      ke safhe ki ginti ek jaisi rehti hai.
 */

/** Kitni chhoot — 0 ka matlab "koi chhoot nahi". */
export function saleCut(product) {
  const was = Number(product?.compare_at_price);
  const price = Number(product?.price);
  return was > price && price > 0 ? Math.round(((was - price) / was) * 100) : 0;
}

/** New In ki had — tees maal, jitna safha par theek dikhta hai.
    (Yahi had `NEW_ARRIVAL_LIMIT` hai constants.js mein — yahan
    dobara nahi likhi gayi taake yeh module constants se khud
    rahza na ho, magar had ek hi rahe.) */
export const NEW_IN_LIMIT = 30;

/** Naya maal — sab se naya pehle. Purana maal sab se aakhir. */
function newestFirst(a, b) {
  const at = Date.parse(a?.created_at || '') || 0;
  const bt = Date.parse(b?.created_at || '') || 0;
  if (bt !== at) return bt - at;
  return String(a?.id || '').localeCompare(String(b?.id || ''));
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
  const all = products || [];
  let rows = all.filter(
    (p) => p?.category === category && (!collection || p?.collection === collection)
  );

  /* Do chunav ke liye "warna" — sirf jab admin ne kuch nahi rakha
     ho, aur sirf poore khaane par (taqseem ke andar nahi). */
  if (!rows.length && !collection) {
    if (category === 'new-arrivals') {
      rows = [...all].sort(newestFirst).slice(0, NEW_IN_LIMIT);
    } else if (category === 'top-sales') {
      rows = all
        .filter((p) => saleCut(p) > 0)
        .sort((a, b) => saleCut(b) - saleCut(a));
    }
  }

  return limit > 0 ? rows.slice(0, limit) : rows;
}

/**
 * Har khane mein kitne products.
 *
 * Sirf wahi ginna hai jo products ke apne `category` mein likha
 * hai — koi khaali hisa bana kar ginna nahi, warna homepage par
 * ginti aur asal catalogue se alag ho jati hai.
 *
 * Do chunav ki ginti bhi wahi honi chahiye jo tile par dikhti
 * hai (admin ka chuna hua maal, ya uska "warna") — warna homepage
 * aur collection ka safha do alag baatein bata dein.
 */
export function categoryCounts(products) {
  const all = products || [];
  const counts = {};
  for (const p of all) {
    if (!p?.category) continue;
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  for (const slug of ['new-arrivals', 'top-sales']) {
    const had = slug === 'new-arrivals' ? NEW_IN_LIMIT : 0;
    counts[slug] = collectionProducts(all, slug, '', had).length;
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

import { supabasePublic, supabaseConfigured } from '@/lib/supabase';
import { MOCK_PRODUCTS } from '@/lib/mock-products';

/* ═══════════════════════════════════════════════════════════════
   ★★★  PRODUCT DATA LAYER  ★★★
   ───────────────────────────────────────────────────────────────
   Poori website apne products SIRF is file se leti hai. Har page
   aur har component yahin se import karta hai, kahin aur se nahi.

   Ab ye Supabase par laga hua hai. Agar .env.local mein keys na
   hon to ye khud ba khud mock-products.js par wapas chala jata
   hai — yani site keys ke baghair bhi chalti rehti hai, sirf
   catalogue khali dikhta hai. Koi crash nahi, koi safed safha
   nahi.

   Har function apni ghalti khud sambhalta hai: database gir bhi
   jaye to khali list wapas aati hai, safha nahi girta.
   ═══════════════════════════════════════════════════════════════ */

/** Wohi column jo site istemal karti hai — `select *` se behtar. */
const COLUMNS = [
  'id', 'slug', 'name', 'category', 'price', 'compare_at_price',
  'description', 'fabric', 'images', 'sizes', 'colors',
  'in_stock', 'stock_count', 'featured', 'published', 'created_at',
  'collection',
].join(',');

/** Ek hi jagah se error console par jata hai. */
function warn(where, error) {
  if (!error) return;
  // eslint-disable-next-line no-console
  console.error(`[NSC] products.${where}:`, error.message || error);
}

/** Keys na hon to mock, warna live client. */
function client() {
  return supabaseConfigured ? supabasePublic() : null;
}

/* ───────────────────────────────────────────────────────────────
   SORT_ORDER KI EHTIYAT
   ───────────────────────────────────────────────────────────────
   `sort_order` column `supabase-setup.sql` ke naye version mein
   aaya hai. Agar kisi database par abhi purana schema chal raha
   ho to us column par order karte hi Postgres poori query rad
   kar deta hai — aur poora catalogue gayab ho jata hai.

   Is liye har query do baar tak chalti hai: pehle sort_order ke
   sath, aur agar wohi column na mile to us ke baghair. Site kabhi
   khali nahi hoti; console par saaf likh diya jata hai ke SQL
   dobara chalane ki zaroorat hai.
   ─────────────────────────────────────────────────────────────── */

/** Error sirf is liye aaya ke sort_order column maujood nahi? */
function missingSortOrder(error) {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
  return /sort_order/i.test(text);
}

/* `collection` ka khana bhi baad mein aaya hai. Jis database par wo
   abhi nahi hai, wahan bhi catalogue khali nahi hona chahiye — is
   liye woh column select se nikal kar dobara koshish ki jati hai. */
function missingCollection(error) {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`;
  return /\bcollection\b/i.test(text);
}

const COLUMNS_NO_COLLECTION = COLUMNS.split(',')
  .filter((c) => c !== 'collection')
  .join(',');

/* Ek dafa pata chal jaye ke khana nahi hai, to poori zindagi us ke
   baghair chalte hain — har query par dobara girne ki zaroorat nahi. */
let collectionOk = true;

const cols = () => (collectionOk ? COLUMNS : COLUMNS_NO_COLLECTION);

/**
 * `build(withSort)` do dafa bulaya ja sakta hai.
 * @param {(withSort: boolean) => PromiseLike<{data: any, error: any}>} build
 * @param {string} where
 */
async function ordered(build, where) {
  let { data, error } = await build(true, cols());

  if (error && missingCollection(error)) {
    collectionOk = false;
    warn(
      `${where} — the 'collection' column is missing from the database. Run this one line of SQL: alter table public.products add column if not exists collection text not null default '';`,
      error
    );
    ({ data, error } = await build(true, cols()));
  }

  if (error && missingSortOrder(error)) {
    warn(
      `${where} — the 'sort_order' column is missing from the database; run supabase-setup.sql again. Carrying on without it for now`,
      error
    );
    ({ data, error } = await build(false, cols()));
  }

  if (error) {
    warn(where, error);
    return null;
  }
  return data || [];
}

/* ───────────────────────────────────────────────────────────────
   HAR PRODUCT KI SHAKAL

     id                uuid
     slug              text     url mein isi ka istemal hota hai
     name              text
     category          text     constants.js ke paanch slugs mein se
     price             numeric  PKR
     compare_at_price  numeric | null
     description       text
     fabric            text
     images            jsonb    pehli cover, doosri hover
     sizes             jsonb    ["S","M","L"]
     colors            jsonb    ["Sage","Ivory"]
     in_stock          boolean
     stock_count       int | null   (null = bay-shumar)
     featured          boolean
     published         boolean  false = site par nazar nahi aata
     created_at        timestamptz
   ─────────────────────────────────────────────────────────────── */

/**
 * Har published product, naya pehle.
 * @returns {Promise<Array>}
 */
export async function getProducts() {
  const db = client();
  if (!db) return MOCK_PRODUCTS.filter((p) => p.published !== false);

  const rows = await ordered(
    (withSort, columns) => {
      let q = db.from('products').select(columns).eq('published', true);
      if (withSort) q = q.order('sort_order', { ascending: true });
      return q.order('created_at', { ascending: false });
    },
    'getProducts'
  );
  return rows || [];
}

/**
 * Ek product, uske slug se. Na mile to `null` — safha khud 404
 * dikha deta hai.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function getProductBySlug(slug) {
  if (!slug) return null;

  const db = client();
  if (!db) return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;

  const { data, error } = await db
    .from('products')
    .select(cols())
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    warn('getProductBySlug', error);
    return null;
  }
  return data ?? null;
}

/**
 * Ek category ke sare products.
 * @param {string} categorySlug
 * @returns {Promise<Array>}
 */
export async function getProductsByCategory(categorySlug, collection = '', limit = 0) {
  if (!categorySlug) return [];

  const sub = String(collection || '').trim();
  const cap = Number(limit) > 0 ? Number(limit) : 0;

  const db = client();
  if (!db) {
    const all = await getProducts();
    const rows = all.filter(
      (p) => p.category === categorySlug && (!sub || p.collection === sub)
    );
    return cap ? rows.slice(0, cap) : rows;
  }

  const rows = await ordered(
    (withSort, columns) => {
      let q = db
        .from('products')
        .select(columns)
        .eq('category', categorySlug)
        .eq('published', true);
      if (sub && collectionOk) q = q.eq('collection', sub);
      if (withSort) q = q.order('sort_order', { ascending: true });
      q = q.order('created_at', { ascending: false });
      /* New Arrivals par tees ki had lagti hai. Ye DIKHANE ki had
         hai: teeswein ke baad wala suit safhe par aana band ho
         jata hai, magar apni jagah aur apne orders ke sath
         database mein salamat rehta hai. */
      if (cap) q = q.limit(cap);
      return q;
    },
    'getProductsByCategory'
  );
  return rows || [];
}

/**
 * Home page ka grid. Agar koi product `featured` nahi hai to
 * naye products dikha deta hai — taake grid kabhi khali na ho.
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getFeaturedProducts(limit = 6) {
  const db = client();
  if (!db) {
    const all = await getProducts();
    const picked = all.filter((p) => p.featured);
    return (picked.length ? picked : all).slice(0, limit);
  }

  const data = await ordered(
    (withSort, columns) => {
      let q = db
        .from('products')
        .select(columns)
        .eq('published', true)
        .eq('featured', true);
      if (withSort) q = q.order('sort_order', { ascending: true });
      return q.order('created_at', { ascending: false }).limit(limit);
    },
    'getFeaturedProducts'
  );
  if (data === null) return [];
  if (data.length) return data;

  // Koi featured nahi — naya maal dikha dein.
  const { data: latest, error: e2 } = await db
    .from('products')
    .select(cols())
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (e2) {
    warn('getFeaturedProducts(latest)', e2);
    return [];
  }
  return latest || [];
}

/**
 * "You may also like" — pehle usi category se, phir baqi se.
 * @param {Object} product
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRelatedProducts(product, limit = 4) {
  if (!product) return [];

  const db = client();
  if (!db) {
    const all = await getProducts();
    const same = all.filter((p) => p.category === product.category && p.id !== product.id);
    const rest = all.filter((p) => p.category !== product.category && p.id !== product.id);
    return [...same, ...rest].slice(0, limit);
  }

  const { data, error } = await db
    .from('products')
    .select(cols())
    .eq('published', true)
    .eq('category', product.category)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    warn('getRelatedProducts', error);
    return [];
  }

  const same = data || [];
  if (same.length >= limit) return same;

  // Kam par gaye to baqi departments se poora karein.
  const { data: others } = await db
    .from('products')
    .select(cols())
    .eq('published', true)
    .neq('category', product.category)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(limit - same.length);

  return [...same, ...(others || [])];
}

/**
 * Har slug — Next.js in se product pages pehle se bana leta hai.
 * Jo product baad mein add hota hai wo bhi chalta hai, bas pehli
 * dafa thora dair se khulta hai.
 * @returns {Promise<string[]>}
 */
export async function getAllProductSlugs() {
  const db = client();
  if (!db) return MOCK_PRODUCTS.filter((p) => p.published !== false).map((p) => p.slug);

  const { data, error } = await db
    .from('products')
    .select('slug')
    .eq('published', true);

  if (error) {
    warn('getAllProductSlugs', error);
    return [];
  }
  return (data || []).map((row) => row.slug).filter(Boolean);
}

/**
 * Har category mein kitne products — home page ke tiles ke liye.
 * @returns {Promise<Record<string, number>>}
 */
export async function getCategoryCounts() {
  const db = client();
  if (!db) {
    const all = await getProducts();
    return all.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }

  const { data, error } = await db
    .from('products')
    .select('category')
    .eq('published', true);

  if (error) {
    warn('getCategoryCounts', error);
    return {};
  }

  return (data || []).reduce((acc, row) => {
    if (!row.category) return acc;
    acc[row.category] = (acc[row.category] || 0) + 1;
    return acc;
  }, {});
}

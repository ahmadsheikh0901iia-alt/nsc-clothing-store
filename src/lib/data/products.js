import { cache } from 'react';
import { supabasePublic, supabaseConfigured } from '@/lib/supabase';
import { MOCK_PRODUCTS } from '@/lib/mock-products';
import { categoryCounts, collectionProducts, missingColumn, saleCut } from '@/lib/catalogue';

const COLUMNS = ['id', 'slug', 'name', 'category', 'price', 'compare_at_price',
  'description', 'fabric', 'images', 'sizes', 'colors', 'in_stock', 'stock_count',
  'featured', 'published', 'created_at', 'collection'].join(',');

/**
 * Ek hi jagah se error console par, aur koi ghalti safhe ko na gira de.
 *
 * ── DO KAAM ──────────────────────────────────────────────────
 * 1. Purane schema ka hisa (jaise `collection` ya `sort_order`
 *    ka column na hona) — dobara koshish, sirf usi column ke
 *    baghair. Ye dobara poora catalogue bacha leta hai.
 *
 * 2. Aur koi ghalti — console par saaf likh di jati hai, magar
 *    safha nahi girti. Catalogue khaali rahe to bhi site khuli
 *    rehti hai; khaali safha khaali catalogue se bhi buri hai.
 */
async function read(build, label, { sorted = false } = {}) {
  let columns = COLUMNS;
  let sort = sorted;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await build(columns, sort);
    if (!error) return data || [];
    if (columns.includes('collection') && missingColumn(error, 'collection')) {
      columns = columns.split(',').filter((c) => c !== 'collection').join(',');
      console.warn('[NSC] Legacy products schema: the "collection" column is missing. Run: alter table public.products add column if not exists collection text not null default \'\';');
      continue;
    }
    if (sort && missingColumn(error, 'sort_order')) {
      sort = false;
      console.warn('[NSC] Legacy products schema: the "sort_order" column is missing. Run supabase-setup.sql again; carrying on without it for now.');
      continue;
    }
    console.error(`[NSC] products.${label}:`, error.code || 'database_error', error.message || '');
    return null;
  }
  return null;
}

/** Request-scoped deduplication: layout, homepage and metadata share one read.
 * Pagination avoids silently losing products at Supabase's default row cap. */
export const getProducts = cache(async () => {
  if (!supabaseConfigured) return MOCK_PRODUCTS.filter((p) => p.published !== false);
  const db = supabasePublic();
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const page = await read((columns, sort) => {
      let query = db.from('products').select(columns).eq('published', true);
      if (sort) query = query.order('sort_order', { ascending: true });
      return query.order('created_at', { ascending: false }).order('id').range(offset, offset + pageSize - 1);
    }, 'list', { sorted: true });
    if (!page) return [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
});

export const getProductBySlug = cache(async (slug) => {
  if (!slug) return null;
  if (!supabaseConfigured) return MOCK_PRODUCTS.find((p) => p.slug === slug && p.published !== false) || null;
  const row = await read((columns) => supabasePublic().from('products').select(columns)
    .eq('slug', slug).eq('published', true).maybeSingle(), 'product');
  return Array.isArray(row) ? row[0] || null : row || null;
});

export async function getProductsByCategory(category, collection = '', limit = 0) {
  return collectionProducts(await getProducts(), category, collection, limit);
}

export async function getFeaturedProducts(limit = 6) {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  /* Related products are optional: their failure must not hide a valid product. */
  try {
    const all = (await getProducts()).filter((p) => p.id !== product.id);
    return [...all.filter((p) => p.category === product.category),
      ...all.filter((p) => p.category !== product.category)].slice(0, limit);
  } catch { return []; }
}

export async function getAllProductSlugs() {
  return (await getProducts()).map((p) => p.slug).filter(Boolean);
}

export async function getCategoryCounts() {
  return categoryCounts(await getProducts());
}

/**
 * TOP SALES — do raaste, isi tarteeb mein:
 *
 *   1. Jo product admin ne khud "Top Sales" ke khane mein rakha.
 *      Ye uska apna intikhab hai, is liye sab se pehle.
 *   2. Agar wo khana khali ho — wo jin par waqai chhoot hai,
 *      aur un mein bhi jinke chhoot sab se bare hain.
 *
 * Section kabhi khali nahi baithta, aur jhoot bhi nahi bolta.
 */
export async function getTopSaleProducts(limit = 8) {
  const all = await getProducts();
  const flagged = all.filter((p) => p.category === 'top-sales');
  if (flagged.length) return flagged.slice(0, limit);
  return all
    .filter((p) => saleCut(p) > 0)
    .sort((a, b) => saleCut(b) - saleCut(a))
    .slice(0, limit);
}

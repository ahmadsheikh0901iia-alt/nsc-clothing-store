import { cache } from 'react';
import { supabasePublic, supabaseConfigured } from '@/lib/supabase';
import { MOCK_PRODUCTS } from '@/lib/mock-products';
import { categoryCounts, collectionProducts, missingColumn } from '@/lib/catalogue';

const COLUMNS = ['id', 'slug', 'name', 'category', 'price', 'compare_at_price',
  'description', 'fabric', 'images', 'sizes', 'colors', 'in_stock', 'stock_count',
  'featured', 'published', 'created_at', 'collection'].join(',');

/** Retry only known legacy-schema differences. Never disguise a failed database
 * as an empty shelf or cache schema guesses for an entire server lifetime. */
async function read(build, label, { sorted = false } = {}) {
  let columns = COLUMNS;
  let sort = sorted;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await build(columns, sort);
    if (!error) return data;
    if (columns.includes('collection') && missingColumn(error, 'collection')) {
      columns = columns.split(',').filter((c) => c !== 'collection').join(',');
      console.warn('[NSC] Legacy products schema: collection column missing.');
      continue;
    }
    if (sort && missingColumn(error, 'sort_order')) {
      sort = false;
      console.warn('[NSC] Legacy products schema: sort_order column missing.');
      continue;
    }
    console.error(`[NSC] products.${label}:`, error.code || 'database_error');
    throw new Error('The catalogue is temporarily unavailable. Please try again.');
  }
  throw new Error('The catalogue is temporarily unavailable. Please try again.');
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
    rows.push(...(page || []));
    if (!page || page.length < pageSize) break;
  }
  return rows;
});

export const getProductBySlug = cache(async (slug) => {
  if (!slug) return null;
  if (!supabaseConfigured) return MOCK_PRODUCTS.find((p) => p.slug === slug && p.published !== false) || null;
  return read((columns) => supabasePublic().from('products').select(columns)
    .eq('slug', slug).eq('published', true).maybeSingle(), 'product');
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
  // Related products are optional: their failure must not hide a valid product.
  try {
    const all = (await getProducts()).filter((p) => p.id !== product.id);
    return [...all.filter((p) => p.category === product.category),
      ...all.filter((p) => p.category !== product.category)].slice(0, limit);
  } catch { return []; }
}

export async function getAllProductSlugs() {
  return (await getProducts()).map((p) => p.slug).filter(Boolean);
}

export async function getCategoryCounts() { return categoryCounts(await getProducts()); }
export async function getTopSaleProducts(limit = 8) {
  return collectionProducts(await getProducts(), 'top-sales', '', limit);
}

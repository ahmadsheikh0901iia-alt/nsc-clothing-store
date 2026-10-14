export const dynamic = 'force-dynamic';

import { CATEGORIES, STORE } from '@/lib/constants';
import { getProducts } from '@/lib/data/products';

/** Fresh sitemap: product changes do not require a redeploy. */
export default async function sitemap() {
  const base = STORE.url.replace(/\/$/, '');
  const now = new Date();

  const staticPages = ['', '/shop', '/about', '/contact', '/policies'].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/shop' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const products = await getProducts();
  const productPages = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}

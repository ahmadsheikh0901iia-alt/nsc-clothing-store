import { CATEGORIES, STORE } from '@/lib/constants';
import { getProducts } from '@/lib/data/products';

/**
 * Sitemap, generated at build time.
 *
 * Next serves this at /sitemap.xml. It walks the same data layer the
 * pages do, so every product you add in Supabase appears here on the
 * next build without anyone remembering to update a list.
 *
 * Set NEXT_PUBLIC_SITE_URL to your real domain before going live, or
 * every URL in here will point at localhost.
 */
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

  let productPages = [];
  try {
    const products = await getProducts();
    productPages = products.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
  } catch {
    // A database hiccup must not fail the build — ship the rest.
  }

  return [...staticPages, ...categoryPages, ...productPages];
}

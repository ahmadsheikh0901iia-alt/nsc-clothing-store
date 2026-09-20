import { STORE } from '@/lib/constants';

/**
 * /robots.txt par milta hai.
 *
 * Cart aur checkout is liye band hain ke wo har visitor ke apne
 * hain — crawler ke liye wahan kuch bhi nahi, aur uska waqt is
 * site ke asal safhon par lagna chahiye.
 *
 * /admin, /api aur /order ab isi wajah se — aur hifazat ke liye
 * bhi — band hain. Admin panel ka Google mein aana koi faida
 * nahi deta, nuqsan hi deta hai.
 */
export default function robots() {
  const base = STORE.url.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cart', '/checkout', '/admin', '/api/', '/order'],
      },
      {
        /* Ye do sirf tasveerein jama karne aate hain, kuch bhejte
           nahi. Bandwidth bachane ke liye band. */
        userAgent: ['GPTBot', 'CCBot'],
        disallow: '/',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

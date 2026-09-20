import { STORE } from '@/lib/constants';

/**
 * /manifest.webmanifest
 *
 * Isi se phone par "Add to Home Screen" kaam karta hai — site
 * apne icon ke sath, browser ke pate wali patti ke baghair
 * khulti hai, bilkul app ki tarah. Wapas aane wale khareedar ke
 * liye ye ek tap ka farq hai.
 */
export default function manifest() {
  return {
    name: `${STORE.name} — Premium Stitched & Unstitched Clothing`,
    short_name: STORE.shortName,
    description: STORE.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a09',
    theme_color: '#0a0a09',
    lang: 'en-PK',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],
    icons: [
      {
        /* public/icon.png — seedha rasta. `/icon` par Next kuch
           nahi deta, is liye wo 404 tha. */
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      { name: 'Shop', url: '/shop' },
      { name: 'Track an order', url: '/order' },
      { name: 'Contact', url: '/contact' },
    ],
  };
}

import { STORE } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  /manifest.webmanifest
 *  ─────────────────────────────────────────────────────────────
 *  Isi se phone par "install" kaam karta hai: site apne icon ke
 *  sath, browser ki pata-patti ke baghair khulti hai — bilkul ek
 *  app ki tarah.
 *
 *  ── JO TOOTA HUA THA ──
 *  Yahan icon ka rasta `/icon.png` likha tha, magar `public/`
 *  mein aisi koi file thi hi nahi. Yani manifest ek aisi tasveer
 *  maang raha tha jo maujood nahi — 404. Chrome ka qaida saaf
 *  hai: 192px aur 512px, dono maujood hon, warna wo install ki
 *  paishkash karta hi nahi. Isi liye install ka button kabhi
 *  nazar nahi aata tha.
 *
 *  Ab chaar asli tasveerein hain, aur teenon zaroori naap poore:
 *
 *    icon-192.png           Android ki list aur splash
 *    icon-512.png           bara naap, har jagah
 *    icon-maskable-512.png  Android icon ko gol ya squircle mein
 *                           kaat deta hai; is wali mein logo
 *                           andar ki mehfooz jagah par hai, is
 *                           liye kinare kabhi nahi kat-te
 *    apple-touch-icon.png   iPhone ki home screen
 *
 *  Chaaron logo-mark.png se bani hain — wohi larki aur "NSC" ka
 *  likha hua nishan, site ke apne kaale par. Koi alag se likha
 *  hua lafz nahi; pehle apple-icon.jsx sirf "NSC" TYPE kar ke ek
 *  dabba bana deta tha, wo file ab khatam kar di gayi hai.
 *
 *  ── ICON KE NEECHE WALA NAAM ──
 *  Wo `short_name` hai, aur usay phone KHUD likhta hai — Android
 *  ho ya iPhone, home screen par har icon ke neeche kuch na kuch
 *  likha jata hai, ye band karne ka koi tareeqa mojood nahi. Is
 *  liye ise sab se chhota rakha gaya hai: sirf "NSC".
 * ═══════════════════════════════════════════════════════════════
 */
export default function manifest() {
  return {
    /* `id` ke baghair Chrome start_url ko hi pehchan maan leta hai;
       kabhi domain badla to wo ise nayi app samajhta. */
    id: '/',

    name: `${STORE.name} — Premium Stitched & Unstitched Clothing`,
    short_name: 'NSC',
    description: STORE.description,

    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',

    background_color: '#0a0a09',
    theme_color: '#0a0a09',
    lang: 'en-PK',
    dir: 'ltr',
    categories: ['shopping', 'lifestyle'],

    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],

    shortcuts: [
      { name: 'Shop', short_name: 'Shop', url: '/shop' },
      { name: 'Track an order', short_name: 'Track', url: '/order' },
      { name: 'Contact', short_name: 'Contact', url: '/contact' },
    ],
  };
}

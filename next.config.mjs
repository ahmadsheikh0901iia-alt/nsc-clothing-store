/** @type {import('next').NextConfig} */

/* ═══════════════════════════════════════════════════════════════
   HIFAZATI HEADERS
   ───────────────────────────────────────────────────────────────
   Ye woh hidayaat hain jo browser ko har safhe ke sath jati hain
   aur batati hain ke is site par kya jaiz hai aur kya nahi. Ek
   baar theek se likh dein to bohat se hamle apne aap na-mumkin
   ho jate hain.

   ── EK AHEM BAAT ──
   Sakht CSP sirf LIVE site par lagti hai, `npm run dev` par nahi.
   Wajah ye hai ke development mein Next khud eval() aur ek
   websocket istemal karta hai (jis se safha khud ba khud taza
   hota hai) — sakht CSP dono ko rok deti aur dev server bilkul
   kaam karna chhor deta. Is liye yahan do alag set hain:
   development ka narm, aur production ka sakht.

   connect-src ke liye Supabase ka apna pata chahiye. Wo build ke
   waqt .env se yahan aa jata hai — set na ho to sirf apni site
   ki ijazat rehti hai.
   ═══════════════════════════════════════════════════════════════ */

const isProd = process.env.NODE_ENV === 'production';

const supabaseOrigin = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).origin : '';
  } catch {
    return '';
  }
})();

/* Storage ki tasveerein aur realtime ka websocket. */
const supabaseWs = supabaseOrigin ? supabaseOrigin.replace('https://', 'wss://') : '';

const csp = [
  "default-src 'self'",

  /* Next.js apne chalane wale script khud safhe mein likhta hai,
     aur layout.js mein theme wala chhota script bhi inline hai
     (wohi jo safed jhatka rokta hai). Is liye script ke liye
     'unsafe-inline' chhorna parta hai.

     Asal hifazat neeche wali lines karti hain: koi doosri site
     yahan se script nahi la sakti, ye site kisi frame mein nahi
     khul sakti, aur form kahin bahar submit nahi ho sakta.

     Development mein 'unsafe-eval' bhi chahiye — warna Next ka
     fast refresh chalta hi nahi. Live site par wo nahi jata. */
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  ['img-src', "'self'", 'data:', 'blob:', supabaseOrigin].filter(Boolean).join(' '),
  "media-src 'self'",

  /* Dev mein Next apne hi server se websocket banata hai. */
  ['connect-src', "'self'", supabaseOrigin, supabaseWs, isProd ? '' : 'ws: http://localhost:*']
    .filter(Boolean)
    .join(' '),

  /* Flash, Java aur is qism ki purani cheezein — bilkul band. */
  "object-src 'none'",

  /* Koi <base> tag daal kar sare link apni site par nahi mor sakta. */
  "base-uri 'self'",

  /* Is site ka koi bhi form kisi doosri site par submit nahi hoga. */
  "form-action 'self'",

  /* Ye site kisi iframe mein nahi khul sakti — clickjacking khatam. */
  "frame-ancestors 'none'",

  /* http ki har request khud https ban jati hai — sirf live par. */
  isProd ? 'upgrade-insecure-requests' : '',
]
  .filter(Boolean)
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },

  /* File ka type wohi mana jayega jo hum batayein — browser
     andaza nahi lagayega. */
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  /* Purane browsers ke liye frame-ancestors ka jorridar. */
  { key: 'X-Frame-Options', value: 'DENY' },

  /* Doosri site ko sirf domain pata chalega, poora rasta nahi. */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  /* Camera, mic, location — kisi ki zaroorat nahi, sab band. */
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()',
  },

  { key: 'X-DNS-Prefetch-Control', value: 'on' },

  /* Ye site jo tab kholti hai, wo tab is site ke window par
     pohanch nahi sakti (tabnabbing khatam). */
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },

  /* Koi doosri site is site ki tasveerein ya files apne safhe
     mein utha kar istemal nahi kar sakti. */
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },

  /* Purane Adobe plugins ke liye crossdomain.xml ka darwaza
     band — wo raasta aaj kal sirf hamlay ke kaam aata hai. */
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },

  /* Kuch browsers ka purana XSS filter khud masla ban jata tha;
     usay band rakhna hi mehfooz hai, CSP uska kaam behtar karti
     hai. */
  { key: 'X-XSS-Protection', value: '0' },

  /* Browser ko batata hai: is domain par hamesha https, do saal
     tak. Localhost par iska koi matlab nahi aur ye musibat bhi
     bana sakta hai, is liye sirf live par. */
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig = {
  reactStrictMode: true,

  /* Jawab ke headers mein Next apna naam nahi likhega. Chhoti
     baat hai, magar hamla karne wale ko kam maloomat milti hai. */
  poweredByHeader: false,

  compress: true,

  images: {
    /**
     * Admin panel se upload hui tasveerein Supabase Storage par
     * jati hain, jahan se wo aap ke apne subdomain se milti hain:
     *
     *   https://<project-ref>.supabase.co/storage/v1/object/public/...
     *
     * next/image kisi bhi anjaan host se tasveer lene se inkar
     * karta hai — yehi is list ka poora maqsad hai, taake
     * database mein para koi ajnabi URL aap ke image optimiser
     * ko kisi aur ki bandwidth ka darwaza na bana de. Rasta bhi
     * usi wajah se public storage tak mehdood hai.
     *
     * public/ ki tasveerein local hain, unhein kisi entry ki
     * zaroorat nahi.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,

    /**
     * ── TASVEER KI SAFAI ──────────────────────────────────────
     * Next 16 mein ye list lazmi hai. Jo bhi `quality` kisi
     * <Image> par likhi ho, agar wo is list mein na ho to Next
     * KHAMOSHI SE use qareeb tareen allowed value par le aata
     * hai — koi warning nahi, koi error nahi.
     *
     * Yehi is site ka masla tha: har tasveer par `quality={92}`
     * likha hone ke bawajood browser ko `q=75` hi milta, kyunke
     * default list sirf [75] hai. Poori site ki tasveerein us
     * ek line ki wajah se dabi hui aa rahi theen.
     *
     * 75 list mein rehne dein — purane cached URLs usi par
     * bane hue hain, aur unhein todne ki koi wajah nahi.
     *
     * 92 se ooper jane ka faida nazar nahi aata, file ka wazan
     * tezi se barhta hai. 100 maslehat ke khilaf hai: wo JPEG
     * ko taqreeban bila-nuqsan bana deta hai aur hero ki tasveer
     * teen guna bhaari ho jati hai.
     * ───────────────────────────────────────────────────────── */
    qualities: [75, 92],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        /* Admin aur API kabhi cache nahi hone chahiye. */
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },

  async redirects() {
    return [
      /* Ghalat likhe hue rastay — 404 se behtar hai seedha sahi
         jagah pohanchana. */
      { source: '/shop-all', destination: '/shop', permanent: true },
      { source: '/collections', destination: '/shop', permanent: true },
      { source: '/track', destination: '/order', permanent: false },
      { source: '/tracking', destination: '/order', permanent: false },

      /* Bridal ka khana ab "Festival" kehlata hai, aur us ka rasta
         bhi badal gaya hai. Purana rasta zinda rakha gaya hai taake
         jo link pehle kisi ko bheja ja chuka ho, wo toote na. */
      { source: '/collections/wedding-dress', destination: '/collections/festival', permanent: true },
    ];
  },
};

export default nextConfig;

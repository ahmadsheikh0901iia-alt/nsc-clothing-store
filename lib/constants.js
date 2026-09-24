/**
 * ═══════════════════════════════════════════════════════════════
 *  STORE CONSTANTS
 *  Edit anything here and it updates everywhere on the site.
 *  This is the file to open first when something needs changing.
 * ═══════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════════
   SITE KA APNA PATA — aur ek khamosh kharabi jo live jate hi
   nazar aati
   ───────────────────────────────────────────────────────────────
   `NEXT_PUBLIC_SITE_URL` apne computer par `http://localhost:3000`
   hota hai, aur yehi theek hai. Magar site jab live jati hai to
   agar ye wahan bhi wohi reh jaye — aur bhoolna behad aasan hai —
   to teen cheezein khamoshi se toot jati hain:

     · share ka link          → localhost bhejta hai, yani kisi ke
                                bhi phone par khulta hi nahi
     · WhatsApp / Facebook ka
       preview                → khali aata hai
     · sitemap aur robots     → Google ko localhost batate hain,
                                aur safha kabhi index nahi hota

   Aur ye teenon aisi kharabiyan hain jo apne computer par kabhi
   nazar nahi aatin — sirf khareedar ko nazar aati hain.

   Is liye ab teen darje hain. Vercel apni site ka asal pata khud
   `NEXT_PUBLIC_VERCEL_URL` mein daal deta hai, so agar upar wala
   khana bhara na ho ya galti se localhost reh gaya ho, site khud
   apna asal pata utha leti hai.

   Apna domain lagane ke baad `NEXT_PUBLIC_SITE_URL` Vercel par set
   kar dein — wo phir sab se pehle chunа jata hai.
   ═══════════════════════════════════════════════════════════════ */

const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\/?$/i;

/** Jo bhi mila hai usay ek durust pate ki shakal dein, warna khali. */
function tidy(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    /* Ye jaanch ahem hai: `layout.js` is par `new URL()` chalati hai,
       aur wahan ek ghalat harf poori site gira deta hai. Yahan
       pakar lein to sab se bura anjaam ye hai ke site localhost par
       reh jaye — jo theek kiya ja sakta hai. */
    const u = new URL(withScheme);
    if (!u.hostname || !u.hostname.includes('.')) {
      /* localhost jaisa naam — sirf tabhi qabool jab wo waqai
         localhost ho (neeche wala darja us ko sambhal leta hai). */
      return LOCAL.test(withScheme) ? withScheme : '';
    }
    return withScheme;
  } catch {
    return '';
  }
}

function siteUrl() {
  const given = tidy(process.env.NEXT_PUBLIC_SITE_URL);

  /* Diya hua pata tabhi maana jayega jab wo waqai bahar ka ho. */
  if (given && !LOCAL.test(given)) return given;

  /* Vercel par: apna asal pata, khud ba khud. */
  const onVercel = tidy(process.env.NEXT_PUBLIC_VERCEL_URL);
  if (onVercel && !LOCAL.test(onVercel)) return onVercel;

  /* Apne computer par. */
  return given || 'http://localhost:3000';
}

export const SITE_URL = siteUrl();

export const STORE = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'NSC Clothing Store',
  shortName: 'NSC',
  tagline: 'Threadwork for the modern wardrobe',
  description:
    'NSC Clothing Store — premium stitched and unstitched clothing, men’s suiting lengths, hand-finished shawls and block-print bedsheets. Made in Pakistan, delivered nationwide with cash on delivery.',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '0322 6032459',
  /** International format, digits only — required by the WhatsApp link. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923226032459',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'shahmed569i@icloud.com',
  url: SITE_URL,

  /** The two cities the store actually operates from. */
  cities: ['Faisalabad', 'Gujranwala'],
  city: 'Faisalabad & Gujranwala, Pakistan',
  hours: 'Open 24/7 — message any time',
  hoursShort: '24/7',
};

/**
 * Every social account, in the order they appear in the footer.
 * `icon` matches an export in components/ui/Icons.jsx.
 * Blank the href and the link disappears on its own.
 */
export const SOCIALS = [
  {
    label: 'WhatsApp Community',
    short: 'Community',
    icon: 'whatsapp',
    href: 'https://chat.whatsapp.com/Eo5IDhv5sCz73OVJyfHJvs',
    note: 'Every new arrival and restock posted first',
  },
  {
    label: 'Instagram',
    short: 'Instagram',
    icon: 'instagram',
    href: 'https://www.instagram.com/nsc_clothing_store',
  },
  {
    label: 'TikTok',
    short: 'TikTok',
    icon: 'tiktok',
    href: 'https://www.tiktok.com/@nsc_clothing_store',
  },
  {
    label: 'Facebook',
    short: 'Facebook',
    icon: 'facebook',
    href: 'https://www.facebook.com/share/1Ey2dzvuGX/',
  },
  {
    label: 'YouTube',
    short: 'YouTube',
    icon: 'youtube',
    href: 'https://youtube.com/@nscclothingstore',
  },
].filter((s) => s.href);

/** The direct one-to-one chat, as opposed to the community broadcast. */
export const WHATSAPP_CHAT = `https://wa.me/${STORE.whatsapp}`;

/**
 * The categories. `slug` must match the `category` column in Supabase
 * exactly — that string is what links a product row to a page.
 *
 * Adding a category takes three edits: an entry here, a matching entry
 * in SIZE_PRESETS below, and products carrying that slug.
 */
export const CATEGORIES = [
  {
    slug: 'festival',
    name: 'Festival',
    short: 'Festival',
    group: 'Festival',
    index: '01',
    blurb: 'Made to your measurements, by hand, over six weeks.',
    image: '/products/wedding-01.jpg',
  },
  {
    slug: 'womens-stitched',
    name: "Women's Stitched",
    short: 'Stitched',
    group: 'Women',
    index: '02',
    blurb: 'Ready to wear. Finished, pressed, and cut to a true fit.',
    image: '/products/womens-stitched-01.jpg',
  },
  {
    slug: 'womens-unstitched',
    name: "Women's Unstitched",
    short: 'Unstitched',
    group: 'Women',
    index: '03',
    blurb: 'Three-piece lawn, cotton and chiffon. Yours to shape.',
    image: '/products/womens-unstitched-01.jpg',
  },
  {
    slug: 'mens-unstitched',
    name: "Men's Unstitched",
    short: "Men's",
    group: 'Men',
    index: '04',
    blurb: 'Suiting lengths in wash-and-wear, boski and fine blends.',
    image: '/products/mens-unstitched-01.jpg',
  },
  {
    slug: 'shawls',
    name: 'Shawls',
    short: 'Shawls',
    group: 'Wrap',
    index: '05',
    blurb: 'Woven paisley, wool and pashmina winter wraps.',
    image: '/products/shawls-01.jpg',
  },
  {
    slug: 'bedsheets',
    name: 'Bedsheets',
    short: 'Bedsheets',
    group: 'Home',
    index: '06',
    blurb: 'Hand block-printed cotton sets, single through king.',
    image: '/products/bedsheets-01.jpg',
  },

  /* ── Do chunav ──
     Ye baqi chhe ki tarah poore khane hain: admin ke usi dropdown
     mein aate hain, apna safha rakhte hain, aur home ke usi grid
     mein apna card rakhte hain.

     `kind: 'edit'` sirf nazar ke liye hai — is se card par ek
     baareek sunehri lakeer lagti hai, taake aankh ko pata chale ke
     ye mausam ka khana nahi, chunav hai. Data mein koi farq nahi. */
  {
    slug: 'new-arrivals',
    name: 'New Arrivals',
    short: 'New In',
    group: 'This week',
    index: '07',
    kind: 'edit',
    blurb: 'The newest thirty pieces on the rail. When the thirty-first arrives, the oldest steps out.',
    image: '/collections/new-arrivals.jpg',
  },
  {
    slug: 'top-sales',
    name: 'Top Sales',
    short: 'Top Sales',
    group: 'Most wanted',
    index: '08',
    kind: 'edit',
    blurb: 'The pieces that leave the shelf fastest — chosen by what people actually buy.',
    image: '/collections/top-sales.jpg',
  },
];

/* ═══════════════════════════════════════════════════════════════
   SUB-COLLECTIONS
   ───────────────────────────────────────────────────────────────
   Kuch departments ke andar mausam ka farq hota hai, aur kuch mein
   mard aur aurat ka. Ye wohi taqseem hai.

   Jis category ka yahan zikr nahi, us ke andar koi taqseem nahi —
   na safhe par, na admin panel mein. Is liye naya khaana banane ke
   liye sirf yahan ek qatar likhni parti hai; baqi site khud samajh
   leti hai.
   ═══════════════════════════════════════════════════════════════ */

export const SUB_COLLECTIONS = {
  'womens-stitched': [
    {
      slug: 'winter',
      name: 'Winter Collection',
      blurb: 'Khaddar, linen and wool-blend three pieces, lined and ready to wear.',
      image: '/collections/womens-stitched-winter.jpg',
    },
    {
      slug: 'summer',
      name: 'Summer Collection',
      blurb: 'Lawn and cotton, cut loose and finished light.',
      image: '/collections/womens-stitched-summer.jpg',
    },
  ],

  'womens-unstitched': [
    {
      slug: 'winter',
      name: 'Winter Collection',
      blurb: 'Khaddar, karandi and wool-blend lengths, sold by the piece.',
      image: '/collections/womens-unstitched-winter.jpg',
    },
    {
      slug: 'summer',
      name: 'Summer Collection',
      blurb: 'Printed lawn, cotton and chiffon — three pieces, yours to shape.',
      image: '/collections/womens-unstitched-summer.jpg',
    },
  ],

  'mens-unstitched': [
    {
      slug: 'winter',
      name: 'Winter Collection',
      blurb: 'Tweed, herringbone and mid-weight suiting for the cold months.',
      image: '/collections/mens-unstitched-winter.jpg',
    },
    {
      slug: 'summer',
      name: 'Summer Collection',
      blurb: 'Wash-and-wear, boski and fine poly-viscose, cut to length.',
      image: '/collections/mens-unstitched-summer.jpg',
    },
  ],

  bedsheets: [
    {
      slug: 'winter',
      name: 'Winter Collection',
      blurb: 'Heavier cotton and quilted sets in autumn colour, warm to the hand.',
      image: '/collections/bedsheets-winter.jpg',
    },
    {
      slug: 'summer',
      name: 'Summer Collection',
      blurb: 'Light printed cotton — leaf, floral and plain, cool through the heat.',
      image: '/collections/bedsheets-summer.jpg',
    },
  ],

  shawls: [
    {
      slug: 'womens',
      name: "Women's Collection",
      blurb: 'Kashmiri embroidery, pashmina and woven paisley wraps.',
      image: '/collections/shawls-womens.jpg',
    },
    {
      slug: 'gents',
      name: 'Gents Collection',
      blurb: 'Shoulder shawls and lohis in paisley, plain and check.',
      image: '/collections/shawls-gents.jpg',
    },
  ],
};

/** Is category ke andar koi taqseem hai? Na ho to khali list. */
export const subCollections = (categorySlug) => SUB_COLLECTIONS[categorySlug] || [];

/** Ek sub-collection, uske slug se. Na mile to `null`. */
export const getSubCollection = (categorySlug, slug) =>
  subCollections(categorySlug).find((s) => s.slug === slug) || null;

/** Har wo slug jo database mein `collection` ke khane mein ja sakta hai. */
export const SUB_COLLECTION_SLUGS = [
  ...new Set(Object.values(SUB_COLLECTIONS).flat().map((s) => s.slug)),
];

/* ═══════════════════════════════════════════════════════════════
   NEW ARRIVALS AUR TOP SALES — ab ye poore khane hain
   ───────────────────────────────────────────────────────────────
   Pehle ye "nishan" thay: har suit apni asli category mein rehta
   tha aur us ke oopar ek alag nishan lag jata tha. Wajah ye thi ke
   is tarah ek hi suit Festival mein bhi reh sakta tha aur New
   Arrivals mein bhi.

   Magar dukan chalane wale ke liye wo do jaghon par faisla karna
   tha: pehle category chuno, phir nishan lagao. Dukandar ne saaf
   kaha ke usay EK hi dropdown chahiye jis mein aath option hon.
   Wohi durust hai — jo cheez roz istemal hoti hai, us ka saada
   hona us ki har khoobi se bhaari hai.

   So ab ye upar wali list ka hissa hain. Faida: admin mein ek hi
   dropdown, safha wahi ka wahi, aur code se ek poori tabqa-bandi
   khatam.

   Qeemat: ek suit ek waqt mein ek hi khane mein reh sakta hai —
   ya Festival, ya New Arrivals. Ye qeemat dukandar ne jaan boojh
   kar chuni hai.
   ═══════════════════════════════════════════════════════════════ */

/**
 * New Arrivals ke safhe par zyada se zyada kitne suits dikhein.
 *
 * Ye ab DIKHANE ki had hai, mitane ki nahi. Tees ke baad wala suit
 * safhe par aana band ho jata hai, magar apni jagah, apne orders
 * aur apne record ke sath database mein salamat rehta hai. Naya
 * aaye to sab se purana khud neeche utar jata hai — bilkul wohi
 * natija jo maanga gaya tha, magar kuch mitaye baghair.
 */
export const NEW_ARRIVAL_LIMIT = 30;

/** Jin khanon par dikhane ki had lagti hai. */
export const CATEGORY_LIMITS = { 'new-arrivals': NEW_ARRIVAL_LIMIT };

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);

/** Purana naam — kahin reh gaya ho to toote na. */
export const getCategoryOrSection = getCategory;

/** Size options offered per category, used by the product page. */
export const SIZE_PRESETS = {
  /* Festival har soorat mein napai par banti hai — standard size
     sirf un ke liye hain jo taiyar piece chahte hain. */
  festival: ['Custom — made to measure', 'XS', 'S', 'M', 'L', 'XL'],
  'womens-stitched': ['XS', 'S', 'M', 'L', 'XL'],
  'womens-unstitched': ['Unstitched — 3 Piece', 'Unstitched — 2 Piece'],
  'mens-unstitched': ['Unstitched — 4.5m', 'Unstitched — 5m'],
  shawls: ['One Size'],
  bedsheets: ['Single', 'Double', 'Queen', 'King'],

  /* New Arrivals aur Top Sales mein kuch bhi aa sakta hai — silaa
     hua suit, be-silaa than, shawl, chadar. Is liye yahan sab se
     aam naap rakhe gaye hain; form par inhein badla bhi ja sakta
     hai aur nayi naap likhi bhi ja sakti hai. */
  'new-arrivals': ['XS', 'S', 'M', 'L', 'XL', 'One Size', 'Unstitched — 3 Piece'],
  'top-sales': ['XS', 'S', 'M', 'L', 'XL', 'One Size', 'Unstitched — 3 Piece'],
};

/* ═══════════════════════════════════════════════════════════════
   DELIVERY
   One place for the promise, so the home page, the product page,
   the order form and the policies can never drift apart.
   ═══════════════════════════════════════════════════════════════ */

export const DELIVERY = {
  minDays: 4,
  maxDays: 5,
  /** "4–5 working days" — used in running copy. */
  window: '4–5 working days',
  /** Short form for badges and the assurance band. */
  short: '4–5 day delivery',
  from: 'Faisalabad & Gujranwala',
};

/**
 * Brand statements for the marquee ribbon.
 *
 * Tarteeb ka apna matlab hai. Taak (1, 3, 5…) bare serif harfon
 * mein aata hai — ye ghar ka apna bayan hai. Juft (2, 4, 6…) chhote
 * sunehri capitals mein — ye sar-e-rah ki muhr hai. CSS yehi taqseem
 * `:nth-child` se karta hai, is liye dono qismein baari baari aani
 * chahiyen. Beech mein kuch daalein to ginti sambhal kar.
 */
export const RIBBON = [
  'Hand-finished in Pakistan',
  'Est. Faisalabad',
  'Festival, made to measure',
  'Cash on delivery',
  'Cloth chosen by hand',
  `Delivered in ${DELIVERY.window}`,
  'Stitched & unstitched',
  'Free over Rs 10,000',
];

/**
 * The four promises shown in the assurance band. Keep these true —
 * they are the whole reason a first-time visitor trusts the order form.
 */
export const ASSURANCES = [
  {
    index: '01',
    title: 'Cash on delivery',
    body: 'Pay the courier at your door, anywhere in Pakistan. Nothing leaves your pocket before the parcel reaches your hand.',
  },
  {
    index: '02',
    title: `Delivered in ${DELIVERY.window}`,
    body: `Packed and handed to the courier from ${DELIVERY.from}, with a tracking number sent to you on WhatsApp the moment it ships.`,
  },
  {
    index: '03',
    title: 'Seven-day exchange',
    body: 'Wrong size, or the colour reads differently in daylight? Message us within seven days and we will swap it.',
  },
  {
    index: '04',
    title: 'Open 24/7',
    body: `Message ${STORE.phone} at any hour. A person answers — someone who has actually held the cloth.`,
  },
];

/**
 * The five-step atelier workflow, drawn as a scroll-linked timeline.
 *
 * Har qadam ke sath ab us ki apni tasveer bhi hai. Atelier ke safhe
 * par ye tasveerein ek hi jagah par chipki rehti hain aur qadam
 * badalte hi aapas mein badal jati hain — is liye tarteeb ahem hai:
 * `image` wohi hona chahiye jo us qadam ko waqai dikhata ho.
 *
 * Home page ka Workflow component `image` ko nazarandaz kar deta
 * hai, is liye yahan tasveer barhane se wahan kuch nahi bigarta.
 */
export const WORKFLOW = [
  {
    step: '01',
    title: 'Fabric',
    body: 'Bolts are sourced from the mills of Faisalabad, then hand-graded for weight, drape and colour-fastness before a single metre is cut.',
    image: '/products/mens-unstitched-01-detail.jpg',
    alt: 'Folded suiting lengths stacked by weight and colour',
    note: 'Faisalabad · mill floor',
  },
  {
    step: '02',
    title: 'Pattern',
    body: 'Blocks are drafted to a true South-Asian fit — generous through the shoulder, clean at the waist — then nested to waste as little cloth as possible.',
    image: '/products/womens-unstitched-01-detail.jpg',
    alt: 'An unstitched panel folded open before cutting',
    note: 'Cutting table',
  },
  {
    step: '03',
    title: 'Embroidery',
    body: 'Neckline, borders and daaman are worked by hand. A single formal panel can take three days across two artisans.',
    image: '/products/wedding-01-detail.jpg',
    alt: 'Gold hand embroidery worked across a maroon neckline',
    note: 'Three days · two hands',
  },
  {
    step: '04',
    title: 'Finish',
    body: 'Seams are French-bound, tassels knotted, and every piece steam-pressed and inspected against the original sample.',
    image: '/media/look-04.jpg',
    alt: 'A finished cuff and hem, pressed and inspected',
    note: 'Final inspection',
  },
  {
    step: '05',
    title: 'Delivery',
    body: `Wrapped in tissue, boxed, and dispatched nationwide from ${DELIVERY.from}. ${DELIVERY.window} to your door, cash on delivery, seven-day exchange.`,
    image: '/products/womens-stitched-01-detail.jpg',
    alt: 'A finished three piece, worn',
    note: `${DELIVERY.window} · nationwide`,
  },
];

/* ═══════════════════════════════════════════════════════════════
   THE ATELIER PAGE
   ───────────────────────────────────────────────────────────────
   /about ka poora saman ek jagah. Safha khud kuch nahi likhta —
   sab kuch yahan se uthata hai, is liye tehreer badalni ho to
   component kholne ki zaroorat nahi.
   ═══════════════════════════════════════════════════════════════ */

export const ATELIER = {
  /* Upar ka film aur uska bayan */
  eyebrow: 'The Atelier',
  title: { lead: 'A small house,', em: 'made carefully.' },
  lede:
    'It is easy to buy cheap clothing in Pakistan, and easy to buy expensive clothing. It is surprisingly hard to buy well-made clothing at a fair price. NSC exists in that gap — a few mills, fewer artisans, and nothing spent on anything you cannot wear.',

  /* Bara jumla — safhe ke beech mein, aahista khulta hua */
  creed: {
    quote:
      'We would rather sell one suit that outlives the season than four that do not.',
    by: 'The house rule, unchanged since the first rail',
  },

  /* Do tasveerein jo bare jumle ke sath chalti hain */
  creedShots: [
    { src: '/media/look-01.jpg', alt: 'A sage three piece on the studio rail' },
    { src: '/products/shawls-01-detail.jpg', alt: 'Woven paisley, close' },
  ],

  /* Aahista chalti hui tasveeron ki do qatarein. Pehli daayein se
     baayein, doosri ulti — is liye nazar kabhi theherti nahi. */
  drift: [
    { src: '/media/look-02.jpg', alt: 'Studio rail, sage three piece' },
    { src: '/collections/womens-stitched-winter.jpg', alt: 'Winter stitched' },
    { src: '/products/wedding-01-detail.jpg', alt: 'Festival embroidery' },
    { src: '/collections/shawls-womens.jpg', alt: "Women's shawls" },
    { src: '/products/bedsheets-01-detail.jpg', alt: 'Block-printed cotton' },
    { src: '/media/look-03.jpg', alt: 'Pearl and dupatta detail' },
  ],
  driftBack: [
    { src: '/collections/mens-unstitched-winter.jpg', alt: 'Winter suiting' },
    { src: '/products/womens-stitched-01-dupatta.jpg', alt: 'Printed dupatta' },
    { src: '/collections/bedsheets-summer.jpg', alt: 'Summer bedsheets' },
    { src: '/products/shawls-01-alt.jpg', alt: 'Shawl, folded' },
    { src: '/collections/womens-unstitched-summer.jpg', alt: 'Summer unstitched' },
    { src: '/media/look-01.jpg', alt: 'Studio rail' },
  ],

  /* Chaurai bhar ki tasveer, scroll ke sath narmi se safar karti hui */
  plate: {
    src: '/products/wedding-01-wide.jpg',
    alt: 'A festival piece laid out across the finishing table',
    caption: 'Six weeks, one dress, two pairs of hands.',
  },

  /* Teen usool */
  values: [
    {
      t: 'Honest fabric',
      b: 'The fabric is named on every listing — weight, blend and finish. If a piece is poly-cotton we say poly-cotton, because you will find out in July regardless.',
    },
    {
      t: 'One price',
      b: 'No inflated “original price” to strike through. When something is reduced it is because we want the rail cleared, and we say so.',
    },
    {
      t: 'A real person',
      b: `Messages to ${STORE.phone} are answered by someone who can actually check the shelf, not a script. Usually within the hour.`,
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   JO SAFHE PAR BOLTA HAI — reviews, aur un se pehle ghar ki awaaz
   ───────────────────────────────────────────────────────────────
   Safhe par ek hi khana hai jo khud ba khud badalta rehta hai.
   Us khane mein kya aata hai, ye neeche wali ek line tay karti
   hai:

       REVIEWS_READY === false  →  ghar ki apni baat (HOUSE_NOTES)
       REVIEWS_READY === true   →  asli khareedaron ke reviews

   ── MEIN NE FARZI REVIEWS KYUN NAHI LIKHE ──

   Aap ne kaha tha ke mein khud ache reviews likh doon. Maine
   nahi likhe, aur wajah sirf ek hai: farzi naam aur farzi mulk
   ke sath likha hua review jhoot hai, aur wo jhoot aap ke naam
   par safhe par lagta hai. Ek khareedar bhi pakar le to bharosa
   hamesha ke liye jata hai — aur Pakistan samet ziyada tar
   mumalik mein ye qanoonan bhi dhoka shumar hota hai. Aap ki
   dukan asli hai; usay farzi tareef ki zaroorat nahi.

   Is liye us khane mein abhi WO baat hai jo poori ki poori sach
   hai — aap ke apne kaam ka usool, aap ki apni awaaz mein. Safha
   utna hi khoobsurat lagta hai, khud ba khud badalta hai, aur
   koi patti "sample" nahi likhti.

   ── ASLI REVIEWS LAGANE MEIN PAANCH MINUTE LAGTE HAIN ──

   1. Apne WhatsApp se un khareedaron ke messages nikaal lein jo
      unhon ne KHUD likhe hain.
   2. Neeche REVIEWS mein har khane ka `quote`, `name`, `place`
      aur `bought` bhar dein — jo unhon ne likha, wohi.
   3. `REVIEWS_READY` ko `true` kar dein.

   Bas. Safha khud ba khud reviews par chala jayega aur upar
   "Word of mouth" likh dega. Mujhe screenshot bhej dein to mein
   khud laga doonga.
   ═══════════════════════════════════════════════════════════════ */

/** Asli reviews maujood hain? Jab tak nahi — ghar ki apni baat. */
export const REVIEWS_READY = false;

/* ── GHAR KI APNI BAAT ──
   Ye tareef nahi, usool hain. Har line wo cheez hai jis par ye
   dukan kaam karti hai. Assurance wale khane se jaan boojh kar
   alag rakhi gayi hain: wahan waada hai (paisa, delivery,
   exchange, waqt), yahan kaam ki samajh hai — kapra, silai, aur
   dukan chalane ka tareeqa. */
export const HOUSE_NOTES = [
  {
    quote:
      'We photograph every piece twice — once for the drape, once close enough to count the stitches. If a photograph flatters a cloth more than the cloth deserves, it does not go up.',
    label: 'On photographs',
  },
  {
    quote:
      'Lawn is judged by what happens after the third wash, not by how it looks on the shelf. That is the test we buy on.',
    label: 'On lawn',
  },
  {
    quote:
      'A wedding dress is photographed far more often than it is worn. So it is not made to be glanced at — it is made to survive being looked at closely, for hours, by people standing very near.',
    label: 'On festival wear',
  },
  {
    quote:
      'Nothing is listed until it is on our own shelf. If the site says a piece is here, it is here — no pre-orders dressed up as stock.',
    label: 'On stock',
  },
  {
    quote:
      'Unstitched is not the cheap option. It is the one where the fit is decided by your own darzi, so we cut the lengths long enough to give him room to work.',
    label: 'On unstitched',
  },
  {
    quote:
      'Colour on a screen is a guess. Ask us and we will send a photograph taken in daylight, in the hand, before you spend a single rupee.',
    label: 'On colour',
  },
  {
    quote:
      'A shawl is warm because of how tightly it is woven, not because of what it weighs. The heavy ones are usually hiding something.',
    label: 'On shawls',
  },
  {
    quote:
      'The number at the bottom of this page is a phone a person answers. Most days that person has held the cloth you are asking about.',
    label: 'On answering',
  },
  {
    quote:
      'We would rather lose a sale than argue about an exchange. It costs less, and it is how a shop lasts longer than one season.',
    label: 'On exchange',
  },
];

/* ── ASLI REVIEWS ──
   Khali hai jab tak asli na aa jayen. Shakal ye hai:

     { quote: 'jo unhon ne likha', name: 'Ayesha K.',
       place: 'Lahore, Pakistan', bought: "Women's Stitched" }

   Yahan bharne ke baad upar REVIEWS_READY ko true kar dein. */
export const REVIEWS = [];

/** Jo safhe par nazar aana chahiye — reviews, warna ghar ki baat. */
export const TESTIMONIALS = REVIEWS_READY && REVIEWS.length ? REVIEWS : HOUSE_NOTES;

/** Purana naam — kahin reh gaya ho to toote na. */
export const REVIEWS_ARE_SAMPLES = false;

/** Currency formatter — Pakistani Rupee, no decimals. */
export const formatPKR = (value) => {
  const n = Number(value ?? 0);
  return `Rs ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

/** Builds a pre-filled WhatsApp link to the direct chat. */
export const whatsappLink = (message) =>
  `${WHATSAPP_CHAT}?text=${encodeURIComponent(message)}`;

/** Main navigation. */
export const NAV_LINKS = [
  /* `menuOnly` = upar ki patti par nahi, sirf khulne wale menu aur
     footer mein. "Shop All" wahan se nikala gaya hai kyunke upar
     gyarah naam thay aur pehla naam logo ke oopar chala jata tha.
     Safha, raasta aur menu ka darwaza sab waise hi hain — sirf
     upar ki qatar se hat gaya hai. */
  { label: 'Shop All', href: '/shop', menuOnly: true },
  { label: 'New In', href: '/collections/new-arrivals' },
  { label: 'Top Sales', href: '/collections/top-sales' },
  { label: 'Festival', href: '/collections/festival' },
  { label: 'Stitched', href: '/collections/womens-stitched' },
  { label: 'Unstitched', href: '/collections/womens-unstitched' },
  { label: "Men's", href: '/collections/mens-unstitched' },
  { label: 'Shawls', href: '/collections/shawls' },
  { label: 'Bedsheets', href: '/collections/bedsheets' },
  { label: 'Atelier', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Swatch colours. Any colour name used on a product maps to a hex
 * value here so the little dots on product cards render correctly.
 * Add a new name here whenever you add a new colour to a product.
 */
export const COLOR_HEX = {
  Sage: '#a9b6ac',
  Mint: '#b8cdc4',
  'Dusty Rose': '#b79ea1',
  Rose: '#b79ea1',
  Ivory: '#ece5d8',
  Bone: '#efe9dd',
  Cream: '#f0e7d6',
  Sand: '#cdbfa3',
  Charcoal: '#3a3a37',
  Black: '#141412',
  Gold: '#c2a56b',
  Olive: '#7c6e51',
  Navy: '#2b3446',
  'Indigo Blue': '#5d7ba6',
  Blue: '#5d7ba6',
  Maroon: '#5c2f33',
  Chestnut: '#7b4436',
  Terracotta: '#b06a4e',
  White: '#f7f4ee',
  /* Sampled from the festival photograph */
  Wine: '#5a2231',
  Oxblood: '#4a1d24',
  'Antique Gold': '#b3924f',
  Champagne: '#ded0b4',
  /* Sampled from the men's suiting photograph */
  Khaki: '#4a3925',
  Bottle: '#17201f',
  Midnight: '#161f2e',
  Rosewood: '#b29f91',
  Chalk: '#d9d4d1',
  Steel: '#72726f',
  Espresso: '#22201b',
  Onyx: '#191a1f',
  Pistachio: '#a5a38a',
  Camel: '#8d795e',
};

/* ═══════════════════════════════════════════════════════════════
   RANG — naam aur uska hex, ek hi qatar mein
   ───────────────────────────────────────────────────────────────
   Pehle sirf upar wali list ke rang chal sakte thay. Aap koi naya
   naam likhte — "Peach" — to site par uska nishan bhoora nazar
   aata, aur theek karne ke liye constants.js kholni parti thi.

   Ab admin ke form mein aap naam ke sath uska rang bhi chun lete
   hain. Dono ek hi likhai mein mehfooz hote hain:

       "Peach|#ffd7b5"

   Ye sirf andar ka intezam hai. Grahak ko, pachi mein, order ki
   parchi mein aur WhatsApp ke paigham mein hamesha sirf "Peach"
   hi jata hai — colorName() us se naam alag kar deta hai.

   Purane 44 product jaise thay waise hi chalte rahenge: un mein
   sirf naam hai, koi `|` nahi, to colorHex() upar wali list se
   dekh leta hai.
   ═══════════════════════════════════════════════════════════════ */

/** "Peach|#ffd7b5" se sirf "Peach" — aur saada naam jyon ka tyon. */
export const colorName = (value) => {
  const text = String(value == null ? '' : value);
  const cut = text.indexOf('|');
  return (cut === -1 ? text : text.slice(0, cut)).trim();
};

/**
 * Nishan ka rang. Teen jagah dekhta hai, isi tarteeb se:
 *   1. naam ke sath likha hua hex  — "Peach|#ffd7b5"
 *   2. upar wali COLOR_HEX ki list — "Sage"
 *   3. neutral bhoora             — jab kuch na mile
 */
export const colorHex = (value) => {
  const text = String(value == null ? '' : value);
  const cut = text.indexOf('|');

  if (cut !== -1) {
    const hex = text.slice(cut + 1).trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return hex;
  }

  return COLOR_HEX[text.trim()] || '#6a655c';
};

/** Naam ke sath rang jorne ke liye — admin ka form yahi banata hai. */
export const colorValue = (name, hex) => {
  const clean = colorName(name);
  if (!clean) return '';
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(hex || '').trim())
    ? `${clean}|${String(hex).trim().toLowerCase()}`
    : clean;
};


/**
 * ── THE FESTIVAL ROOM ──────────────────────────────────────────
 * Home page ka wo hissa jo ek hi dress ko poora safha deta hai.
 *
 * `video` ke aage koi extension NAHI — component khud `.webm`
 * aur `.mp4` dono jor leta hai, aur browser jo chala sake wo
 * utha leta hai.
 *
 * Halka version bhejna ho to `/media/bridal-loop-short` chhor
 * dein; poori tees second wali chahiye to `/media/bridal-loop`
 * kar dein.
 */
export const BRIDAL = {
  eyebrow: 'The festival room',

  title: { lead: 'One dress,', em: 'six weeks of hands.' },

  lede:
    'A festival dress is the one garment photographed far more often than it is worn. So it is not made to be glanced at. It is made to survive being looked at closely, for hours, by people standing very near.',

  body:
    'This one begins as undyed silk and is finished six weeks later. The placket is worked first, in salma-sitara, by a single pair of hands — the same pair from first stitch to last, because no two people ever lay thread at quite the same tension. The daaman runs the full hem without a break in the pattern. The dupatta is matched to the border while both are still stretched on the frame, which is the only moment the two can honestly be compared. Nothing here is finished by machine, and nothing about it is hurried.',

  specs: [
    { k: 'Ground', v: 'Raw silk, fully lined' },
    { k: 'Work', v: 'Hand salma-sitara and zardozi' },
    { k: 'Dupatta', v: 'Organza, border on four sides' },
    { k: 'Made in', v: 'Six weeks, to your measurements' },
  ],

  note: 'Filmed in the atelier · no filter, no grade',

  href: '/collections/festival',
  cta: 'Enter the festival room',

  /* Extension ke baghair — component .webm aur .mp4 khud lagata hai */
  video: '/media/bridal-loop-short',
  poster: '/media/bridal-poster.jpg',

  still: '/products/wedding-01-wide.jpg',
  stillAlt: 'The finished dress, photographed in the courtyard by lantern light',
};

/**
 * ── THE CLOTH ──────────────────────────────────────────────────
 * The suiting section on the home page. The swatch hexes were
 * sampled from the photograph itself, so the dots on screen are the
 * actual colours of the cloth on the shelf. If you reshoot, resample
 * — a swatch that does not match the bolt is worse than no swatch.
 */
export const CLOTH = {
  eyebrow: 'The cloth room',
  title: 'Eleven greys before breakfast.',
  body: 'Suiting is bought by the length and judged by the hand. These are shelf colours, photographed under one light on one day so they can honestly be compared — no filter, no colour grade, no borrowed studio shot.',
  image: '/products/mens-unstitched-01.jpg',
  detail: '/products/mens-unstitched-01-detail.jpg',
  href: '/collections/mens-unstitched',
  meta: [
    { k: 'Cut to', v: '4.5m and 5m lengths' },
    { k: 'Weave', v: 'Wash-and-wear, boski, fine poly-viscose' },
    { k: 'Season', v: 'All year, mid-weight' },
  ],
  swatches: [
    { name: 'Khaki', hex: '#4a3925' },
    { name: 'Bottle', hex: '#17201f' },
    { name: 'Midnight', hex: '#161f2e' },
    { name: 'Rosewood', hex: '#b29f91' },
    { name: 'Ivory', hex: '#dedccf' },
    { name: 'Chalk', hex: '#d9d4d1' },
    { name: 'Steel', hex: '#72726f' },
    { name: 'Espresso', hex: '#22201b' },
    { name: 'Onyx', hex: '#191a1f' },
    { name: 'Pistachio', hex: '#a5a38a' },
    { name: 'Camel', hex: '#8d795e' },
    { name: 'pink', hex: '#e11292' },
  ],
};

/**
 * The close-work section: a full garment shot that a loupe travels
 * across as you scroll, with the specs called out on hairlines.
 */
export const CLOSE_WORK = {
  wide: '/products/womens-stitched-01.jpg',
  macro: '/products/womens-stitched-01-detail.jpg',
  eyebrow: 'Under the lens',
  title: 'Close work',
  body: 'Every listing is photographed twice — once for the drape, once at arm’s length so you can count the stitches before you spend a rupee. What you see is the cloth you receive.',
  specs: [
    { k: 'Ground', v: 'Slub-weave cotton lawn, 145 gsm' },
    { k: 'Work', v: 'Screen-print with mirror-cut placket' },
    { k: 'Trim', v: 'Cotton lace, hand-attached daaman' },
    { k: 'Dupatta', v: 'Printed cotton net, 2.5 metres' },
  ],
  href: '/collections/womens-stitched',
};

/** Numbers shown on the About page. Edit these to your real figures. */
export const STATS = [
  { v: '6', k: 'Collections' },
  { v: '4–5', k: 'Day Delivery' },
  { v: '7 Day', k: 'Exchange' },
  { v: '24/7', k: 'On WhatsApp' },
];

/** Shipping rules used by the cart, checkout and order form. */
export const SHIPPING = {
  flatRate: 250,
  freeOver: 5000,
};

/** Works out delivery cost for a subtotal. */
export const shippingFor = (subtotal) =>
  subtotal >= SHIPPING.freeOver || subtotal === 0 ? 0 : SHIPPING.flatRate;

/**
 * ── POLICIES ───────────────────────────────────────────────────
 * The five documents a customer looks for before trusting a store
 * they have not bought from before. Rendered at /policies, linked
 * from the footer, and deep-linkable by id.
 *
 * These describe how the store actually works today. When something
 * changes — a price, a window, a courier — change it HERE and it is
 * corrected everywhere it is quoted.
 */
export const POLICIES = [
  {
    id: 'delivery',
    title: 'Delivery',
    intro: `Every order is packed and dispatched from ${DELIVERY.from}.`,
    points: [
      `Orders reach you in ${DELIVERY.window} anywhere in Pakistan. Remote areas can take a day or two longer, and we tell you if yours is one of them before we ship.`,
      `Delivery is ${formatPKR(SHIPPING.flatRate)}, and free on orders over ${formatPKR(SHIPPING.freeOver)}.`,
      'We call the number on your order to confirm it before it ships, so please give a number you actually answer.',
      'A tracking number is sent to you on WhatsApp the moment the parcel leaves us.',
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    intro: 'Cash on delivery, everywhere we ship.',
    points: [
      'You pay the courier in cash when the parcel is handed to you. Nothing is taken in advance.',
      'The website never asks for a card number, a bank detail or an account password — if any page ever does, it is not us.',
      'Bank transfer can be arranged for large or wholesale orders. Message us and we will set it up personally.',
    ],
  },
  {
    id: 'returns',
    title: 'Returns & exchange',
    intro: 'Seven days from the day the parcel reaches you.',
    points: [
      'Unworn and unwashed items with their tags still attached can be exchanged within seven days for a different size or colour, subject to stock.',
      'If we sent the wrong item, or it arrived damaged, we cover the return delivery both ways. Send us a photograph on WhatsApp and we will arrange it the same day.',
      'Unstitched cloth that has already been cut cannot be returned, because it can no longer be sold on. Please check the length and colour before it goes to the tailor.',
      'Stitched-to-measure and altered pieces are final sale for the same reason.',
      'We exchange rather than refund. If nothing we have works as a swap, we issue a credit note valid for a year — and if the fault was ours, you can have the money back instead. Ask, and we will not argue about it.',
    ],
  },
  {
    id: 'colour',
    title: 'Colour & cloth',
    intro: 'Every photograph on this site is our own.',
    points: [
      'Nothing is a borrowed studio shot or a supplier catalogue image. What you see is the piece we hold.',
      'Screens vary. A colour can read warmer or cooler on your phone than in daylight — if the shade matters, message us and we will send a photograph taken next to a window.',
      'Hand block-print and hand embroidery carry small variations from piece to piece. That is the mark of the hand, not a fault, and it is not grounds for return.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of sale',
    intro: 'The plain version of what we both agree to when you order.',
    points: [
      'Placing an order is an offer to buy, not a finished contract. It becomes a contract when we confirm it — which is why we call you first. Until then either side can walk away with no hard feelings.',
      'Prices and stock can change without notice. The price you are charged is the one shown when we confirm your order; if it has moved since, we tell you before anything ships.',
      'We may decline or cancel an order — an obvious pricing mistake, an address we cannot reach, or a number nobody answers. If that happens we say so, and nothing has been taken from you anyway.',
      'Photographs, text and the design of this site belong to us. Please do not lift them for another shop; ask instead, and for a genuine reason we usually say yes.',
      'Nothing here removes any right you have under Pakistani consumer law. Anything we cannot settle between us falls under the courts of Punjab, Pakistan.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    intro: 'We ask for the least we can and keep it to ourselves.',
    points: [
      'An order needs your name, phone number and delivery address. That is all we store, and we use it only to deliver the order and to contact you about it.',
      'Your details are never sold, rented or passed to anyone except the courier carrying your parcel.',
      'The newsletter is opt-in and one email a week. Every one of them has an unsubscribe link, and leaving takes one click.',
      `To have your details removed from our records, message ${STORE.phone} and we will delete them.`,
    ],
  },
];

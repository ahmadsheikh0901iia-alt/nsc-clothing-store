import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider, THEME_KEY } from '@/context/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Toasts from '@/components/layout/Toasts';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import AdminShortcut from '@/components/layout/AdminShortcut';
import BackToTop from '@/components/layout/BackToTop';
import ScrollTop from '@/components/layout/ScrollTop';
import PWA from '@/components/layout/PWA';
import Intro from '@/components/layout/Intro';
import { getProducts } from '@/lib/data/products';
import { DELIVERY, SOCIALS, STORE } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
   ROOT LAYOUT
   Wraps every page: fonts, the store provider, the header, the
   overlays and the footer.
   ═══════════════════════════════════════════════════════════════ */

export const metadata = {
  metadataBase: new URL(STORE.url),
  title: {
    default: `${STORE.name} — Premium Stitched & Unstitched Clothing`,
    template: `%s · ${STORE.name}`,
  },
  description: STORE.description,
  applicationName: STORE.name,
  keywords: [
    'NSC Clothing Store',
    'stitched clothing Pakistan',
    'unstitched lawn',
    "women's suits",
    "men's unstitched suiting",
    'boski',
    'wash and wear',
    'Faisalabad',
    'Gujranwala',
    'cash on delivery',
    'shawls',
    'bedsheets',
    'online clothing store Pakistan',
  ],
  openGraph: {
    type: 'website',
    title: `${STORE.name} — Premium Stitched & Unstitched Clothing`,
    description: STORE.description,
    siteName: STORE.name,
    locale: 'en_PK',
    url: STORE.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: STORE.name,
    description: STORE.description,
  },
  alternates: { canonical: '/' },

  /* ── PHONE KI HOME SCREEN KA NISHAN ──
     iOS `apple-touch-icon` ke baghair site ka ek dhundla sa
     screenshot laga deta hai. Pehle yahan apple-icon.jsx thi jo
     sirf "NSC" TYPE kar ke ek dabba banati thi — wo file ab
     khatam kar di gayi hai, aur us ki jagah asli nishan hai. */
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },

  /* iOS ke apne do ishare. Inke baghair iPhone home screen se
     khulne par bhi Safari ki pata-patti dikhata rehta hai — yani
     "app" wala ehsaas adhoora reh jata hai.
       capable      : poori screen, browser ka chrome nahi
       statusBarStyle: uper ki patti site ke kaale mein ghul jaye */
  appleWebApp: {
    capable: true,
    title: 'NSC',
    statusBarStyle: 'black-translucent',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: true, address: false, email: false },

  /* ── GOOGLE SEARCH CONSOLE ──
     Google ko ye sabit karna hota hai ke site waqai hamari hai.
     Ye qatar har safhe ke <head> mein ye tag laga deti hai:

       <meta name="google-site-verification" content="3S9Ifu…" />

     Namecheap mein isi maqsad ka ek TXT record bhi laga hua hai.
     Dono saath chal sakte hain — jo pehle mil jaye, Google usi se
     tasdeeq kar leta hai. Verify ho jane ke baad bhi ye qatar yahin
     rehni chahiye; hatane par Google baad mein dobara poochh sakta
     hai. */
  verification: {
    google: '3S9Ifusrm6Gq0vijdj0osm9MvkFlfEbWtNz180weHHU',
  },
};

export const viewport = {
  // One per OS preference, so the browser chrome is already correct
  // before any JavaScript runs. ThemeContext narrows these to a single
  // value the moment it knows what the visitor actually chose.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ee' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a09' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Runs before the browser paints a single pixel, so the page never
 * flashes the wrong theme. Deliberately tiny and dependency-free:
 * read the saved choice, fall back to the OS, stamp <html>.
 *
 * Ab ek doosra kaam bhi karti hai: <html> par `data-js="on"` laga
 * deti hai.
 *
 * Wajah: site ke jumle aur tasveerein shuru mein `opacity: 0` par
 * hoti hain aur JavaScript unhein nazar mein aate hi khol deti
 * hai. Agar kisi purane phone par JavaScript chali hi na — purani
 * zubaan samajh na aaye, ya bundle beech mein ruk jaye — to wo
 * sab hamesha ke liye chhupe reh jate thay. Safha khulta tha,
 * magar khali.
 *
 * Ab chhupane ka kaam sirf tab hota hai jab ye chhoti si qatar
 * khud chal chuki ho. Na chali — to kuch chhupta hi nahi, poora
 * safha seedha nazar aata hai. Chal gayi — to sab kuch jaisa tha
 * waisa, narmi ke sath.
 *
 * Ye qatar <head> mein sab se pehle chalti hai, kisi bundle ka
 * intezar nahi karti, aur is mein koi nayi zubaan nahi hai — is
 * liye har phone par chalti hai.
 *
 * Teesra kaam: zaroorat par animation band kar deti hai — <html>
 * par `data-lux="off"` laga kar. Do raaste:
 *   · build par:  NEXT_PUBLIC_LUX_ANIM=off
 *   · chalti site par, browser console mein:
 *         localStorage.setItem('nsc-lux','off'); location.reload()
 * Doosra raasta pehle par bhaari hai, taake bina naya deploy kiye
 * jaanch ki ja sake. Wapas chalu karne ke liye 'on'.
 */
const LUX_OFF = process.env.NEXT_PUBLIC_LUX_ANIM === 'off';

const NO_FLASH = `(function(){try{
document.documentElement.setAttribute("data-js","on");

/* ── REFRESH PAR FOOTER KI JHALAK ──
   Ye qatar yahan HONI hi thi, aur yehi ek jagah hai jahan ye kaam
   karti hai.

   Browser safha dobara kholte waqt aap ki purani jagah khud
   "restore" karta hai — aur ye wo sab se pehla kaam hai jo wo
   karta hai, safha dikhane se bhi pehle. Agar aap neeche thay, to
   pehli hi jhalak footer ki hoti hai.

   ScrollTop.jsx bhi yehi qatar chalata hai, magar wo React ke
   hydrate hone ke BAAD chalti hai — us waqt tak browser apna kaam
   kar chuka hota hai aur safha ek dafa dikh chuka hota hai. Is
   liye wahan se refresh wali jhalak kabhi nahi ruk sakti thi.

   Yahan ye qatar <head> ke sab se pehle script mein hai, yani
   browser ke restore karne se PEHLE. "manual" keh dene par browser
   jagah wapas rakhta hi nahi — aur jhalak ka mauqa hi nahi banta.

   Back / forward ka safar ScrollTop.jsx sambhalta hai, wahan
   purani jagah par lautna theek hai. */
try{if("scrollRestoration" in history)history.scrollRestoration="manual";}catch(e){}

var lux=${LUX_OFF ? '"off"' : 'null'};
try{var o=localStorage.getItem("nsc-lux");if(o==="off"||o==="on")lux=o;}catch(e){}
if(lux==="off")document.documentElement.setAttribute("data-lux","off");
var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});
document.documentElement.dataset.theme=(s==="light"||s==="dark")?s:
(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");
}catch(e){document.documentElement.dataset.theme="dark";}})();`;

/* ═══════════════════════════════════════════════════════════════
   STRUCTURED DATA
   ───────────────────────────────────────────────────────────────
   Google ko sirf safhe ka text nahi, dukaan ka taaruf bhi chahiye:
   naam, logo, phone, sheher, kaam ke ghante, social accounts.
   Pehle sirf product ka structured data tha, dukaan ka nahi.

   Isi se Google ke natayij ke daayein taraf wala panel banta hai,
   aur "NSC Clothing Store" search karne par dukaan ke tor par
   pehchani jati hai — sirf ek website ke tor par nahi.
   ═══════════════════════════════════════════════════════════════ */
function storeJsonLd() {
  const base = STORE.url.replace(/\/$/, '');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: STORE.name,
        url: base,
        logo: `${base}/logo-gold.png`,
        image: `${base}/opengraph-image`,
        description: STORE.description,
        email: STORE.email,
        telephone: STORE.phone,
        sameAs: SOCIALS.map((s) => s.href).filter(Boolean),
        areaServed: { '@type': 'Country', name: 'Pakistan' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: `+${STORE.whatsapp}`,
          contactType: 'customer service',
          availableLanguage: ['Urdu', 'English'],
          areaServed: 'PK',
        },
      },
      {
        '@type': 'OnlineStore',
        '@id': `${base}/#store`,
        name: STORE.name,
        url: base,
        parentOrganization: { '@id': `${base}/#organization` },
        currenciesAccepted: 'PKR',
        paymentAccepted: 'Cash on delivery',
        openingHours: 'Mo-Su 00:00-23:59',
        address: STORE.cities.map((city) => ({
          '@type': 'PostalAddress',
          addressLocality: city,
          addressCountry: 'PK',
        })),
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'PK',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'https://schema.org/Monday',
                'https://schema.org/Tuesday',
                'https://schema.org/Wednesday',
                'https://schema.org/Thursday',
                'https://schema.org/Friday',
                'https://schema.org/Saturday',
              ],
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: DELIVERY.minDays,
              maxValue: DELIVERY.maxDays,
              unitCode: 'DAY',
            },
          },
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: STORE.name,
        publisher: { '@id': `${base}/#organization` },
        inLanguage: 'en-PK',
      },
    ],
  };
}

export default async function RootLayout({ children }) {
  // Loaded once here so the search overlay can filter instantly,
  // with no loading spinner and no extra request.
  const products = await getProducts();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must be the first thing in the head — see NO_FLASH above. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />

        {/* Fonts are linked rather than bundled, so a slow or blocked
            font server can never break your build — the page simply
            falls back to the stacks declared in styles/tokens.css. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap"
        />

        {/* Dukaan ka taaruf, Google ke liye */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd()) }}
        />
      </head>

      <body id="top">
        {/* Safha khulte hi teen second ka logo — Intro.jsx */}
        <Intro />
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <ThemeProvider>
          <StoreProvider>
            <Header />

            <main id="main">{children}</main>

            <Footer />

            {/* Overlays live outside <main> so they sit above everything */}
            <CartDrawer />
            <SearchOverlay products={products} />
            <Toasts />

            {/* Neeche do gol button, do kinaron par:
                daayein WhatsApp, baayein upar jane wala. */}
            <WhatsAppButton />
            <BackToTop />

            {/* Har naya safha apne upar se shuru ho — na ke aakhir
                se. Kuch dikhata nahi, sirf ye ek kaam karta hai. */}
            <ScrollTop />

            {/* Service worker, aur Chrome ka install wala parwana —
                wo parwana ek hi dafa aata hai, is liye sunna safhe
                ke shuru mein hi shuru karna parta hai. */}
            <PWA />

            {/* Alt + A, ya kahin bhi "admin" likh dein */}
            <AdminShortcut />
          </StoreProvider>
        </ThemeProvider>

        {/* Photographic grain over the whole page */}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}

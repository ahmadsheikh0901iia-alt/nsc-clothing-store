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
 */
const NO_FLASH = `(function(){try{
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
            <WhatsAppButton />

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

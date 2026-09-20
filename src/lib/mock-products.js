/**
 * ═══════════════════════════════════════════════════════════════
 *  YOUR CATALOGUE
 *  ─────────────────────────────────────────────────────────────
 *  DELIBERATELY EMPTY. You are adding products from Supabase, so
 *  this list stays at zero and the whole site reads its products
 *  from the database instead — see BACKEND-LATER.md.
 *
 *  Nothing is broken while it is empty. Every page has a finished
 *  "arriving soon" state, the categories still show, and the site
 *  looks intentional rather than half-built.
 *
 *  ── IF YOU EVER WANT TO TEST WITHOUT THE DATABASE ─────────────
 *  Copy the commented block at the bottom of this file into the
 *  array below and change the values. The site will pick it up
 *  immediately with no other edit anywhere.
 *
 *  ── THE RULES, WHICHEVER WAY YOU ADD THEM ─────────────────────
 *  · `id` and `slug` must be unique. `slug` becomes the URL.
 *  · `category` must be one of the five slugs in constants.js:
 *      womens-stitched   womens-unstitched   mens-unstitched
 *      shawls            bedsheets
 *  · Photos go in public/products/, portrait 3:4 (900 × 1200 is
 *    ideal). The first image is the cover, the second is what
 *    appears on hover.
 *  · Any colour name must exist in COLOR_HEX in constants.js,
 *    otherwise its swatch dot falls back to grey.
 *  · `published: false` hides a product without deleting its text.
 * ═══════════════════════════════════════════════════════════════
 */

/** Defaults, so a product block only states what makes it different. */
export const productDefaults = {
  compare_at_price: null,
  colors: ['Bone'],
  featured: false,
  in_stock: true,
  stock_count: 12,
  published: true,
  fabric: 'Premium lawn',
  created_at: '2026-01-01T00:00:00Z',
};

/** Applies those defaults to one product. */
export const P = (o) => ({ ...productDefaults, ...o });

/**
 * Empty on purpose — products come from Supabase.
 */
export const MOCK_PRODUCTS = [];

/* ═══════════════════════════════════════════════════════════════
   EXAMPLE — copy this into MOCK_PRODUCTS above to test offline.

  P({
    id: 'nsc-001',
    slug: 'indigo-bagh-three-piece',
    name: 'Indigo Bagh — Three Piece',
    category: 'womens-stitched',
    price: 12500,
    compare_at_price: 15900,
    description:
      'A block-print three piece in indigo on cream. The placket is ' +
      'mirror-cut and edged in cotton lace, and the printed net dupatta ' +
      'carries the same border as the daaman.',
    fabric: 'Slub cotton lawn · printed net dupatta',
    images: [
      '/products/womens-stitched-01.jpg',
      '/products/womens-stitched-01-detail.jpg',
      '/products/womens-stitched-01-alt.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Indigo Blue', 'Cream'],
    featured: true,
    stock_count: 8,
    created_at: '2026-03-04T00:00:00Z',
  }),

   ═══════════════════════════════════════════════════════════════ */

# Repair scope — 14 October 2026

## Code changes

- Upgraded Next.js to 16.3.8 and patched sharp/source-map dependencies. Production npm audit returned zero known vulnerabilities at verification time.
- **The image optimiser answers every width and quality the site asks for.** `deviceSizes` is the union of Next's defaults and the site's own list, `qualities` is `[75, 85, 90, 92]`, and AVIF sits beside WebP. A width or quality that is missing from these lists is answered with **HTTP 400**, and the browser then shows a blank frame — that single class of miss was why photographs disappeared from every card at once. Local imagery keeps responsive optimisation; a picture the optimiser refuses falls back to the raw file before the placeholder, and only a genuinely broken address reaches the placeholder.
- Product images from public Supabase storage load directly from its CDN, avoiding the extra dependency on Vercel image transformations. Any `https://` address and any local file is used as it is — a valid address is never swapped for a placeholder behind the customer's back. Broken/invalid images fall back to a local placeholder; this cannot recover a deleted original or a private/paused bucket. Existing remote originals now use Supabase egress and may be larger than optimized thumbnails.
- **The storefront plays as it did before the repair.** Product photographs turn over on their own again, each card on its own small offset; the product gallery turns over every two seconds by itself, with the masked reveal around it; the hero and bridal films load with their own `<source>` tags and keep playing, retrying on the first touch; the splash plays on every route; the service worker registers in every environment. Manual control (thumbnails, arrow keys, drag/swipe) is untouched, and the gallery still contains rather than crops a garment.
- **A collection shows the products the admin put in it.** "New In" and "Top Sales" are the two choices in the admin dropdown, and the counts on the home page match the catalogue. The homepage sale strip still falls back to genuinely discounted pieces when the admin has picked none.
- Browser resizes uploads before sending; server caps uploads at 4 MiB (below Vercel's 4.5 MB payload cap with multipart headroom), decodes the actual image, rotates and produces a WebP up to 1920px. MIME labels alone are not trusted. Existing images are not bulk rewritten or deleted.
- Removed confirmed orphan root copies/stubs and duplicate hook/middleware entries. No Supabase products, orders, storage objects or referenced public assets were deleted. Git history preserves removed source copies.
- Correct page-specific canonical URLs, safe JSON-LD escaping, stock-aware structured data and a fresh dynamic sitemap. Production fallback URL does not advertise localhost.
- Consistent legacy-schema fallback for reads, as forgiving as it was before: a database that refuses a query leaves the page standing instead of taking the whole site down. Shared request-level catalogue reads and pagination. Product routes do not depend on database availability at build time.
- Added an atomic shared Postgres rate limiter and additive migration. **The live migration is not applied.** Legacy installs retain in-memory protection with warnings until it is applied. Only set `NSC_REQUIRE_SHARED_RATE_LIMIT=true` after confirming setup; then an unavailable shared limiter fails closed.
- Notification failures/unconfigured channels now warn in server logs; admin setup checks show whether a channel is configured. This does not deliver a notification without actual provider credentials, verify sender domains, or implement a durable retry queue.
- One supported `src/proxy.js`, sensible image quality and scoped cache cleanup.
- Added tests for collections, images, safe JSON-LD, auth, origin checks, limiter behavior, desktop/mobile gallery/cart flows and upload rejection/transcoding. The browser tests use synthetic data and do not place real orders.

## The Shoes department

- `shoes` is a full department: its own collection page (`/collections/shoes`), its own card on the home grid, its own entry in the footer, the shop filters, the search overlay, the sitemap and the admin dropdown. It needs no database migration — `products.category` is a plain text column that the app validates against `CATEGORY_SLUGS`.
- Its photograph (`public/collections/shoes.jpg`) is the house 900 × 1200 crop, framed so the shoes sit in the middle of the picture where the site's `object-position` rules expect them.
- Its card takes the full width of the grid (`kind: 'feature'`). The grid is six columns — seasonal cards take two, the two picks take three — so a ninth department would otherwise leave four empty columns in the last row. A full-width band fills them and gives the new department the room it needs.
- `SIZE_PRESETS.shoes` carries UK sizes, and the admin's category error message now counts the list instead of naming a fixed number.
- The desktop top bar is deliberately unchanged: it already carries ten names and breaks into two lines between 1240 and 1300 pixels, so "Shoes" is marked `menuOnly` and appears in the opening menu, the footer, the home grid and the shop filters.

## Still requires production access/verification

1. Deploy the reviewed branch via the normal GitHub/Vercel workflow. A local build is not a deployment; a preview is not the production domain.
2. Confirm custom-domain assignment, Vercel plan/quotas, production environment values and deployment logs.
3. Review the existing Supabase schema/RLS/order RPCs using `supabase/audit.sql`; the original production SQL definitions were not present in the repository. Export/version them after review. We intentionally did not invent or overwrite transactional stock/order functions. If `products.category` turns out to be an enum or to carry a CHECK constraint rather than plain text, the new `shoes` value needs one additive `ALTER` before products can be filed under it.
4. Apply the additive shared-limiter migration, then verify permissions and concurrent requests before enabling strict mode.
5. Check a real product image on desktop/mobile, then perform an explicitly authorized test order with the owner. Real storage originals, order placement, tracking, stock transitions and notification delivery are not verified by fixture tests.

## Rollback

Revert the repair commit through the usual pull request flow and redeploy. No commerce data migration is required for the frontend changes. The rate-limit migration only adds isolated counters/functions; leaving it installed does not alter prices, stock or orders.

## Deployment regression check

A follow-up build with configured but unreachable Supabase reproduced a prerender failure that the no-credentials build missed. The shared layout is now explicitly dynamic, so catalogue requests run at request time, not during Vercel builds. CI builds with a deliberately unreachable database URL to catch this regression. Schema fallback retries accept a known missing-column error code, or a message that names the column as missing — a network error whose text merely happens to contain the column name does not qualify.

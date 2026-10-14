# Repair scope — 14 October 2026

## Code changes

- Upgraded Next.js to 16.3.8 and patched sharp/source-map dependencies. Production npm audit returned zero known vulnerabilities at verification time.
- Product images from public Supabase storage load directly from its CDN, avoiding the extra dependency on Vercel image transformations. Local imagery retains responsive Next image optimization. Broken/invalid images fall back to a local placeholder; this cannot recover a deleted original or a private/paused bucket. Existing remote originals now use Supabase egress and may be larger than optimized thumbnails.
- Product gallery is manual-first, uses contain rather than cropping clothing, has previous/next/keyboard/swipe controls and optional load-aware autoplay. No reveal animation hides the critical gallery. Product pages no longer display the homepage splash. Grid image changes wait for loaded hover images.
- Browser resizes uploads before sending; server caps uploads at 4 MiB (below Vercel's 4.5 MB payload cap with multipart headroom), decodes the actual image, rotates and produces a WebP up to 1920px. MIME labels alone are not trusted. Existing images are not bulk rewritten or deleted.
- Shared collection rules fix the homepage/sale-page mismatch. Top Sales means genuinely discounted products, ordered by discount; New Arrivals means the newest 30 published products across departments. Category counts follow these rules.
- Removed confirmed orphan root copies/stubs and duplicate hook/middleware entries. No Supabase products, orders, storage objects or referenced public assets were deleted. Git history preserves removed source copies.
- Correct page-specific canonical URLs, safe JSON-LD escaping, stock-aware structured data and a fresh dynamic sitemap. Production fallback URL does not advertise localhost.
- Consistent legacy-schema fallback for reads; configured database failures now produce an error/retry page instead of pretending the catalogue is empty. Shared request-level catalogue reads and pagination. Product routes do not depend on database availability at build time.
- Added an atomic shared Postgres rate limiter and additive migration. **The live migration is not applied.** Legacy installs retain in-memory protection with warnings until it is applied. Only set `NSC_REQUIRE_SHARED_RATE_LIMIT=true` after confirming setup; then an unavailable shared limiter fails closed.
- Notification failures/unconfigured channels now warn in server logs; admin setup checks show whether a channel is configured. This does not deliver a notification without actual provider credentials, verify sender domains, or implement a durable retry queue.
- One supported `src/proxy.js`, lazy near-viewport videos, poster-only data-saver/reduced-motion behavior, sensible image quality, production-only PWA registration and scoped cache cleanup.
- Added tests for collections, images, safe JSON-LD, auth, origin checks, limiter behavior, desktop/mobile gallery/cart flows and upload rejection/transcoding. The browser tests use synthetic data and do not place real orders.

## Still requires production access/verification

1. Deploy the reviewed branch via the normal GitHub/Vercel workflow. A local build is not a deployment; a preview is not the production domain.
2. Confirm custom-domain assignment, Vercel plan/quotas, production environment values and deployment logs.
3. Review the existing Supabase schema/RLS/order RPCs using `supabase/audit.sql`; the original production SQL definitions were not present in the repository. Export/version them after review. We intentionally did not invent or overwrite transactional stock/order functions.
4. Apply the additive shared-limiter migration, then verify permissions and concurrent requests before enabling strict mode.
5. Check a real product image on desktop/mobile, then perform an explicitly authorized test order with the owner. Real storage originals, order placement, tracking, stock transitions and notification delivery are not verified by fixture tests.

## Rollback

Revert the repair commit through the usual pull request flow and redeploy. No commerce data migration is required for the frontend changes. The rate-limit migration only adds isolated counters/functions; leaving it installed does not alter prices, stock or orders.

## Deployment regression check

A follow-up build with configured but unreachable Supabase reproduced a prerender failure that the no-credentials build missed. The shared layout is now explicitly dynamic, so catalogue requests run at request time, not during Vercel builds. CI builds with a deliberately unreachable database URL to catch this regression. Schema fallback retries now require a known missing-column error code, not merely a column name in a failed fetch URL.

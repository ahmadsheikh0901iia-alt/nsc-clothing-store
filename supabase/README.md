# Supabase: production safety first

The original repository references `supabase-setup.sql`, but did not include it. **This folder is not a replacement for that missing commerce schema.** Do not delete/recreate an existing project or paste guessed order/stock functions over production.

- `audit.sql` is read-only metadata inspection: table/RLS state, columns, RPC signatures/execute grants and the image bucket configuration. It does not select customer data.
- `migrations/202610140001_shared_rate_limits.sql` adds an isolated counter table and two service-role-only functions. Review and apply in the correct project's SQL editor or through the existing Supabase migration workflow. It does not touch products/orders or existing RPCs.
- The application calls `place_order`, `track_order`, `set_order_status`, `admin_stats`. Their actual definitions must be exported from the existing project and reviewed/versioned before claiming a reproducible full backend setup. Verify anon/authenticated users cannot call administrative or stock-changing RPCs directly.
- Only published products should be publicly readable. Orders, messages, subscriber lists, admin logs and rate-limit counters must not be publicly accessible. `product-images` must expose public read URLs but not anonymous upload/delete access.
- Production keys belong in Vercel environment variables. Secret/service-role credentials must never be prefixed `NEXT_PUBLIC_`, committed to git, or shared in chat.
- After applying the limiter migration, use admin setup checks and server logs, verify parallel requests share counters, then set `NSC_REQUIRE_SHARED_RATE_LIMIT=true` and redeploy. Without that migration, compatibility fallback is only per-instance protection.

For a new empty database, stop here: restore the reviewed real schema/backup first. Neither audit.sql nor the rate-limit migration creates the store's order/product backend.

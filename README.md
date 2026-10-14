# NSC Clothing Store

Next.js App Router storefront, Supabase catalogue/storage, cash-on-delivery ordering and password-protected administration. Node 22.

## Run locally

```sh
npm ci
cp .env.example .env.local
# Set private values in .env.local, never in tracked files.
npm run dev:phone
```

Without Supabase configuration the catalogue is intentionally empty. It is **not** a copy of production data. On Vercel choose the **Next.js** preset, repository root, `npm run build`, and default output directory. No separate cPanel hosting or `vercel.json` is necessary. Configure the environment variables privately in Vercel and redeploy when changing `NEXT_PUBLIC_*` values.

Active application code lives in **src/**. The obsolete root-level component/page copies were removed to avoid editing files the application never imports.

## Verify

```sh
npm test
npm run build
npm audit --omit=dev
# Browser dependencies (one-time):
npx playwright install --with-deps chromium
# Terminal 1: ONLY synthetic local data, never the production database
npm run test:server
# Terminal 2:
npm run test:e2e
```

Browser tests use desktop and mobile Chromium viewports; this is not a claim of physical iOS/Safari testing. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can point to an existing Chromium binary. The test server overrides Supabase/password/notification configuration with fixtures; do not deploy or publicly expose it.

## Production setup and remaining external checks

See [repair notes](docs/repair-notes.md) and [database setup](supabase/README.md). `/admin` includes authenticated **Store setup checks**; no secret values or customer rows are returned.

Vercel is hosting. Its Hobby plan is restricted to personal/non-commercial use; verify plan eligibility before using it for this commercial store. No code change bypasses that policy. Domain renewal, provider quotas and database/storage configuration remain account-level responsibilities.

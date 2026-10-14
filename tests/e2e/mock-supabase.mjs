// Loaded ONLY by the E2E server via NODE_OPTIONS. Never imported by the app.
// No real keys, production database, notifications, or customer records are used.
const original = globalThis.fetch;
export const fixtureProduct = {
  id: '00000000-0000-4000-8000-000000000001', slug: 'fixture-suit', name: 'Gallery Test Suit',
  category: 'festival', price: 4500, compare_at_price: 6000, description: 'Browser test sample only.',
  fabric: 'Cotton', images: [
    'https://fixture.supabase.co/storage/v1/object/public/product-images/first.jpg',
    'https://fixture.supabase.co/storage/v1/object/public/product-images/second.jpg',
    'https://fixture.supabase.co/storage/v1/object/public/product-images/missing.jpg',
  ], sizes: ['S', 'M'], colors: ['Black'], in_stock: true, stock_count: 5,
  published: true, featured: true, collection: '', created_at: '2026-10-01T00:00:00Z',
};
globalThis.fetch = async function(input, init) {
  const address = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(address);
  if (url.hostname !== 'fixture.supabase.co') return original(input, init);
  let body = [];
  if (url.pathname.includes('/rest/v1/products')) {
    const slug = url.searchParams.get('slug');
    const found = !slug || slug === 'eq.fixture-suit';
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : {}));
    const single = headers.get('accept')?.includes('object+json');
    body = single ? (found ? fixtureProduct : null) : found ? [fixtureProduct] : [];
  } else if (url.pathname.includes('/rpc/nsc_take_rate_limit')) {
    body = { ok: true, remaining: 10, retryAfter: 0 };
  } else if (url.pathname.includes('/storage/v1/bucket/product-images')) {
    body = { id: 'product-images', name: 'product-images', public: true };
  } else if (url.pathname.includes('/storage/v1/object/')) {
    body = { Key: 'product-images/fixture.webp' };
  } else if (url.pathname.includes('/rpc/admin_stats')) {
    body = {};
  }
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

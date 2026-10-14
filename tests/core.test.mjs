import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeJsonLd, imageList } from '../src/lib/utils.js';
import { safeImageSource, MAX_UPLOAD_BYTES } from '../src/lib/images.js';
import { collectionProducts, categoryCounts } from '../src/lib/catalogue.js';
import { createMemoryLimiter } from '../src/lib/rate-limit-core.js';
import { sameOrigin } from '../src/lib/origin.js';
import { createToken, verifyToken } from '../src/lib/admin-token.js';

const products = [
  { id: '1', category: 'festival', price: 50, compare_at_price: 100, created_at: '2026-01-01' },
  { id: '2', category: 'shawls', price: 80, compare_at_price: 100, created_at: '2026-10-01' },
  { id: '3', category: 'top-sales', price: 100, compare_at_price: null, created_at: '2026-02-01' },
];
test('new arrivals uses all departments, newest first, max 30', () => {
  assert.deepEqual(collectionProducts(products, 'new-arrivals').map((p) => p.id), ['2', '3', '1']);
  assert.equal(collectionProducts(Array.from({ length: 40 }, () => products[0]), 'new-arrivals').length, 30);
});
test('sale collections and homepage counts agree; false discounts excluded', () => {
  assert.deepEqual(collectionProducts(products, 'top-sales').map((p) => p.id), ['1', '2']);
  assert.equal(categoryCounts(products)['top-sales'], 2);
  assert.equal(categoryCounts(products)['new-arrivals'], 3);
  assert.equal(collectionProducts(products, 'shawls').length, 1);
});
test('structured data cannot escape its script and round-trips unchanged', () => {
  const input = { name: '</script><script>alert(1)</script>&', description: 'A > B' };
  const json = serializeJsonLd(input);
  assert.ok(!json.includes('<'));
  assert.deepEqual(JSON.parse(json), input);
});
test('image arrays are trimmed, deduplicated and reject non-strings', () => {
  assert.deepEqual(imageList({ images: [' /a.jpg ', '/a.jpg', {}, null, ''] }), ['/a.jpg']);
  assert.deepEqual(imageList({ images: '["/b.jpg"]' }), ['/b.jpg']);
});
test('image sources are public storage or local; invalid and private URLs fall back', () => {
  assert.equal(safeImageSource(' /products/a.jpg '), '/products/a.jpg');
  const good = 'https://demo.supabase.co/storage/v1/object/public/product-images/a.jpg';
  assert.equal(safeImageSource(good), good);
  for (const bad of ['javascript:alert(1)', '//evil.com/x', '/\\evil.com', 'https://evil.com/x', 'https://demo.supabase.co/storage/v1/object/sign/a', null, {}]) {
    assert.equal(safeImageSource(bad), '/products/placeholder.jpg');
  }
  assert.ok(MAX_UPLOAD_BYTES + 10000 < 4500000);
});
test('local limiter enforces boundary, reset, expiry and bounded memory', () => {
  let time = 0;
  const limiter = createMemoryLimiter({ now: () => time, maxKeys: 2 });
  assert.equal(limiter.take('a', 2, 1000).ok, true);
  assert.equal(limiter.take('a', 2, 1000).ok, true);
  assert.equal(limiter.take('a', 2, 1000).ok, false);
  limiter.take('b', 1, 1000);
  assert.equal(limiter.take('c', 1, 1000).ok, false);
  limiter.reset('a');
  assert.equal(limiter.take('a', 1, 1000).ok, true);
  time = 1001;
  assert.equal(limiter.take('a', 1, 1000).ok, true);
});
test('cross-origin mutations fail; same-origin and safe methods work', () => {
  const request = (origin, method = 'POST') => new Request('https://store.test/api/orders', { method, headers: { host: 'store.test', origin } });
  assert.equal(sameOrigin(request('https://store.test')), true);
  assert.equal(sameOrigin(request('https://evil.test')), false);
  assert.equal(sameOrigin(request('null')), false);
  assert.equal(sameOrigin(request('https://evil.test', 'GET')), true);
});
test('admin sessions require valid signatures and are revoked by password rotation', async () => {
  process.env.ADMIN_PASSWORD = 'test-only-strong-password';
  const token = await createToken();
  assert.equal(await verifyToken(token), true);
  assert.equal(await verifyToken(token + 'tampered'), false);
  assert.equal(await verifyToken(undefined), false);
  process.env.ADMIN_PASSWORD = 'different-test-password';
  assert.equal(await verifyToken(token), false);
  delete process.env.ADMIN_PASSWORD;
});

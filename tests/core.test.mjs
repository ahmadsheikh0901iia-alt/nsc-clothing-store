import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { serializeJsonLd, imageList } from '../src/lib/utils.js';
import { safeImageSource, MAX_UPLOAD_BYTES } from '../src/lib/images.js';
import { collectionProducts, categoryCounts, missingColumn } from '../src/lib/catalogue.js';
import { CATEGORIES, SIZE_PRESETS, CATEGORY_SLUGS } from '../src/lib/constants.js';
import { createMemoryLimiter } from '../src/lib/rate-limit-core.js';
import { sameOrigin } from '../src/lib/origin.js';
import { createToken, verifyToken } from '../src/lib/admin-token.js';

const products = [
  { id: '1', category: 'festival', price: 50, compare_at_price: 100, created_at: '2026-01-01' },
  { id: '2', category: 'shawls', price: 80, compare_at_price: 100, created_at: '2026-10-01' },
  { id: '3', category: 'top-sales', price: 100, compare_at_price: null, created_at: '2026-02-01' },
  { id: '4', category: 'new-arrivals', price: 90, compare_at_price: null, created_at: '2026-05-01' },
];
test('a collection shows the products the admin put in it', () => {
  assert.deepEqual(collectionProducts(products, 'new-arrivals').map((p) => p.id), ['4']);
  assert.deepEqual(collectionProducts(products, 'top-sales').map((p) => p.id), ['3']);
  assert.deepEqual(collectionProducts(products, 'shawls').map((p) => p.id), ['2']);
});
test('new arrivals keeps its display limit of thirty', () => {
  const many = Array.from({ length: 40 }, (_, i) => ({ ...products[3], id: String(i) }));
  assert.equal(collectionProducts(many, 'new-arrivals', '', 30).length, 30);
});
test('counts follow each product\'s own category', () => {
  assert.equal(categoryCounts(products)['top-sales'], 1);
  assert.equal(categoryCounts(products)['new-arrivals'], 1);
  assert.equal(categoryCounts(products)['shawls'], 1);
  assert.equal(categoryCounts(products)['festival'], 1);
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
test('image sources keep every address the browser can open; junk falls back', () => {
  assert.equal(safeImageSource(' /products/a.jpg '), '/products/a.jpg');
  const storage = 'https://demo.supabase.co/storage/v1/object/public/product-images/a.jpg';
  assert.equal(safeImageSource(storage), storage);
  /* Koi bhi https host — tasveer kahin bhi ho, dikhni chahiye. */
  assert.equal(safeImageSource('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
  for (const bad of ['javascript:alert(1)', '//evil.com/x', '/\\evil.com', 'http://insecure.example/a.jpg', '', null, {}]) {
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
test('the Shoes department is complete: a category, its sizes, and a picture that exists', () => {
  const shoes = CATEGORIES.find((c) => c.slug === 'shoes');
  assert.ok(shoes, 'shoes must be a department');
  assert.ok(CATEGORY_SLUGS.includes('shoes'), 'shoes must be a valid category slug');
  assert.ok(SIZE_PRESETS.shoes?.length, 'shoes needs its own sizes');
  assert.ok(shoes.image.startsWith('/'), 'the department needs a local picture');
  assert.ok(
    existsSync(join(process.cwd(), 'public', shoes.image)),
    `the picture must exist on disk: public${shoes.image}`
  );
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

test('legacy schema fallback does not swallow network or prerender errors', () => {
  assert.equal(missingColumn({ code: '42703', message: 'column products.collection does not exist' }, 'collection'), true);
  assert.equal(missingColumn({ code: 'PGRST204', message: "Could not find the 'sort_order' column" }, 'sort_order'), true);
  assert.equal(missingColumn({ message: 'fetch failed: https://example.test/products?order=sort_order' }, 'sort_order'), false);
  assert.equal(missingColumn({ code: '42501', message: 'permission denied on collection' }, 'collection'), false);
});

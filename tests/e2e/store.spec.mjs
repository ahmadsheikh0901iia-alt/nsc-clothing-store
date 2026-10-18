import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const photo = readFileSync('public/products/womens-stitched-01.jpg');

test.beforeEach(async ({ page }) => {
  await page.route('https://fixture.supabase.co/**', async (route) => {
    if (route.request().url().endsWith('missing.jpg')) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ status: 200, contentType: 'image/jpeg', body: photo });
  });
  await page.route('https://fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: '' }));
});

test('product image visible, contained, stable, keyboard/manual navigation and broken-image fallback', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/shop/fixture-suit');
  const image = page.locator('.pdp-slide');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(image).toHaveCSS('object-fit', 'contain');
  await expect(image).toHaveAttribute('src', /first\.jpg/);
  // The gallery turns over by itself — every two seconds, on its own.
  await expect.poll(() => image.getAttribute('src'), { timeout: 10000 }).toMatch(/second\.jpg/);
  // The customer can also take over: thumbnails and arrow keys.
  await page.getByRole('button', { name: 'Show image 1 of 3' }).click();
  await expect(image).toHaveAttribute('src', /first\.jpg/);
  await page.locator('.pdp-slides').focus();
  await page.keyboard.press('ArrowRight');
  await expect(image).toHaveAttribute('src', /second\.jpg/);
  await page.keyboard.press('ArrowLeft');
  await expect(image).toHaveAttribute('src', /first\.jpg/);
  await page.getByRole('button', { name: 'Show image 3 of 3' }).click();
  await expect(image).toHaveAttribute('src', /placeholder/);
  await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('a collection shows the products the admin put in it', async ({ page }) => {
  const cases = [
    ['/collections/new-arrivals', 'Gallery Test New Arrival'],
    ['/collections/top-sales', 'Gallery Test Top Sale'],
  ];
  for (const [path, name] of cases) {
    await page.goto(path);
    await expect(page.locator('.card-name').filter({ hasText: name })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `http://localhost:3100${path}`);
  }
});

test('checkout requires selected size and preserves the chosen item', async ({ page }) => {
  await page.goto('/shop/fixture-suit');
  await expect(page.getByRole('button', { name: 'Select a size', exact: true }).first()).toBeDisabled();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await expect(page.getByRole('button', { name: 'M', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Object.values(localStorage).some((v) => v.includes('fixture-suit')))).toBe(true);
  await page.goto('/cart');
  await expect(page.getByText('Gallery Test Suit').first()).toBeVisible();
});

test('API protects admin and cross-origin writes; validates empty orders', async ({ request }) => {
  const denied = await request.get('/api/admin/products');
  expect(denied.status()).toBe(401);
  const cross = await request.post('/api/admin/login', { headers: { origin: 'https://evil.test' }, data: { password: 'x' } });
  expect(cross.status()).toBe(403);
  const invalid = await request.post('/api/orders', { data: {} });
  expect(invalid.status()).toBe(400);
});

test('admin rejects oversized and fake uploads and transcodes valid images', async ({ request }) => {
  const login = await request.post('/api/admin/login', { data: { password: 'fixture-password-only' } });
  expect(login.status()).toBe(200);
  const bad = await request.post('/api/admin/upload', { multipart: {
    file: { name: 'fake.avif', mimeType: 'image/avif', buffer: Buffer.from('not an image') },
  } });
  expect(bad.status()).toBe(415);
  const large = await request.post('/api/admin/upload', { multipart: {
    file: { name: 'large.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(4 * 1024 * 1024 + 1) },
  } });
  expect(large.status()).toBe(413);
  const good = await request.post('/api/admin/upload', { multipart: {
    file: { name: 'suit.jpg', mimeType: 'image/jpeg', buffer: photo },
  } });
  expect(good.status()).toBe(200);
  expect((await good.json()).url).toMatch(/\.webp$/);
});

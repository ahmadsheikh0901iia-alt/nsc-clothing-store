/** Only local files and public Supabase storage URLs can be product images. */
export function safeImageSource(value) {
  if (typeof value !== 'string') return '/products/placeholder.jpg';
  const source = value.trim();
  if (source.startsWith('/') && !source.startsWith('//') && !source.includes('\\')) return source;
  try {
    const url = new URL(source);
    if (url.protocol === 'https:' && /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname)
      && !url.username && !url.password && !url.port
      && url.pathname.startsWith('/storage/v1/object/public/')) return url.href;
  } catch { /* invalid input uses the local fallback */ }
  return '/products/placeholder.jpg';
}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const UPLOAD_LABEL = '4 MB';

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * @param {Request} request
 * @returns {boolean} true = mehfooz, false = bahar se aayi hai
 */
export function sameOrigin(request) {
  if (!MUTATING.has(request.method)) return true;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // Kuch aam haalat mein browser Origin bhejta hi nahi (jaise
  // seedha address bar se). Un par rok lagane ka matlab nahi.
  if (!origin) return true;

  let from;
  try {
    from = new URL(origin);
  } catch {
    return false;
  }

  // Apna hi host? Theek hai.
  if (host && from.host === host) return true;

  // Live domain — .env se, taake proxy ke peechay bhi chale.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      if (new URL(site).host === from.host) return true;
    } catch {
      /* ghalat URL — nazar-andaz */
    }
  }

  // Development mein localhost apni jagah theek hai.
  if (process.env.NODE_ENV !== 'production') {
    if (from.hostname === 'localhost' || from.hostname === '127.0.0.1') return true;
  }

  return false;
}


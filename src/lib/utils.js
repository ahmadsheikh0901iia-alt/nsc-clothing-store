/* ═══════════════════════════════════════════════════════════════
   SMALL HELPERS
   Deliberately dependency-free — this file imports nothing.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Joins class names, dropping anything falsy.
 *   cn('card', isActive && 'is-active')  →  "card is-active"
 */
export function cn(...args) {
  return args.filter(Boolean).join(' ');
}

/** "Women's Stitched Lawn" → "womens-stitched-lawn" */
export function slugify(str = '') {
  return String(str)
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Splits a heading into words so each can animate independently. */
export function toWords(str = '') {
  return String(str).split(' ').filter(Boolean);
}

/** Keeps a number inside a range. */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/** Percentage off, rounded. Returns null when there is no discount. */
export function discountPct(price, compareAt) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Normalises whatever a column holds into a plain array of strings.
 * Copes with a real array, a JSON string, or a comma-separated string —
 * so it keeps working however you end up storing the data in Supabase.
 */
export function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        /* fall through */
      }
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** All image URLs for a product. */
export function imageList(product) {
  return toArray(product?.images);
}

/** Cover image, with a local fallback so a grid never shows a hole. */
export function primaryImage(product) {
  return imageList(product)[0] || '/products/placeholder.jpg';
}

/** Second image, used for the hover cross-fade on product cards. */
export function secondaryImage(product) {
  const list = imageList(product);
  return list[1] || null;
}

/** Stable id for a cart line: one product + one size + one colour. */
export function lineId(productId, size, color) {
  return `${productId}::${size || 'one'}::${color || 'default'}`;
}

/** Trims a string to a length without cutting a word in half. */
export function truncate(str = '', max = 120) {
  const s = String(str);
  if (s.length <= max) return s;
  return `${s.slice(0, s.lastIndexOf(' ', max))}…`;
}

/** True when the visitor has asked their OS to reduce motion. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ═══════════════════════════════════════════════════════════════
   WHATSAPP KI LIKHAI SE SAAF TEXT
   ───────────────────────────────────────────────────────────────
   Product ke naam aur tafseel aksar seedha WhatsApp se copy kar ke
   daali jati hai, aur us ke sath us ki apni likhai bhi aa jati
   hai:

       *SORAYA SKY EMBROIDERED 3PC by NSC ✨*
       *F E S T I V E  C O L L E C T I O N*
       CHEST: *S(19) M(21) L(23) XL(24)*

   Safhe par ye chal jata hai. Magar jab koi is product ka link
   WhatsApp ya Facebook par bhejta hai, to wahan ka preview yehi
   kachcha text uthata hai — taare, nayi lines, sab. Preview
   bad-numa aata hai, aur bad-numa preview par koi click nahi
   karta.

   Ye qatar sirf PREVIEW ke liye saaf karti hai. Database mein
   naam jaisa hai waisa hi rehta hai — aap ka likha hua kuch nahi
   badalta, aur admin panel mein wohi nazar aata hai jo aap ne
   daala tha.
   ═══════════════════════════════════════════════════════════════ */
export function cleanText(input = '', max = 0) {
  let out = String(input || '')
    /* WhatsApp ki likhai: *mota*, _terha_, ~kata hua~, ```code``` */
    .replace(/```/g, ' ')
    .replace(/[*_~`]/g, '');

  /* "F E S T I V E  C O L L E C T I O N" jaise faile hue lafz jor
     dein. Ye khali jagahein simatne se PEHLE hona zaroori hai:
     lafzon ke DARMIYAN do khali jagahein hoti hain aur harfon ke
     darmiyan ek — pehle simat gayin to dono ka farq mit jata hai
     aur do lafz ek ban jate hain. */
  out = out.replace(/\b(?:[A-Za-z] ){2,}[A-Za-z]\b/g, (m) => m.replace(/ /g, ''));

  /* Ab nayi line, tab aur kai khali jagahein — sab ek khali jagah */
  out = out.replace(/\s+/g, ' ').trim();

  if (max > 0 && out.length > max) {
    /* Lafz ke beech mein na kaatein */
    const cut = out.slice(0, max);
    const space = cut.lastIndexOf(' ');
    out = (space > max * 0.6 ? cut.slice(0, space) : cut).trim() + '…';
  }

  return out;
}

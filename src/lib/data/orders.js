/* ═══════════════════════════════════════════════════════════════
   ★★★  ORDER DATA LAYER  ★★★
   ───────────────────────────────────────────────────────────────
   Dono order forms — poora checkout aur chhota "Order now" wala
   panel — sirf yahin se guzarte hain.

   PEHLE: ye file order ko console par likh kar jhoota "ok" de
   deti thi. Agar customer WhatsApp na bhejta to order hamesha ke
   liye gum.

   AB: order server ke /api/orders par jata hai, wahan database
   ki apni price se total dobara gina jata hai, stock kaata jata
   hai, aur order table mein likha jata hai. Kamiyabi ka safha
   SIRF tab dikhta hai jab ye sab ho chuka ho. Na ho sake to
   saaf error milta hai aur cart bacha rehta hai.

   WhatsApp ab RABTE ka zariya hai — RECORD ka nahi.
   ═══════════════════════════════════════════════════════════════ */

/** Parhne mein aasan order number, e.g. "NSC-7QK2M9". */
export function generateOrderNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NSC-${out}`;
}

/* Server ke chhote code ko aadmi ki zabaan mein badalta hai.
   Ye jumle customer parhta hai, is liye poori site ki tarah
   English mein hain. */
function readableError(payload) {
  const code = payload?.error;
  switch (code) {
    case 'empty_cart':
      return 'Your bag is empty.';
    case 'not_found':
      /* Ye sab se uljhane wala jawab tha. Asal mein hota ye hai ke
         bag browser mein mehfooz reh jata hai, aur us dauran wo
         product dukan se nikal jata hai (aap ne hata diya, ya wo
         kabhi poori tarah save hua hi nahi). Purana jumla customer
         ko kehta tha "khud nikal do" — ab site khud nikal deti hai
         aur sirf batati hai. */
      return 'One piece in your bag is no longer in the shop, so it has been taken out. Check the total and place the order again.';
    case 'sold_out':
      return payload?.name
        ? `“${payload.name}” has just sold out. Remove it from the bag, or message us on WhatsApp.`
        : 'One of these pieces has sold out.';
    case 'not_enough_stock':
      return payload?.name
        ? `Only ${payload.available ?? 0} left of “${payload.name}”. Lower the quantity and try again.`
        : 'That quantity is not available.';
    case 'invalid':
      return payload?.message || 'Some details are still missing.';
    case 'rate_limited':
      return 'Too many attempts. Try again in two minutes, or message us on WhatsApp.';
    case 'not_configured':
      return 'The store cannot take orders right now. Please message us on WhatsApp and we will take it there.';
    default:
      return 'The order could not be saved. Try again, or message us on WhatsApp.';
  }
}

/**
 * Order mehfooz karta hai.
 *
 * Sirf ye batata hai ke kaun si cheez aur kitni — price server
 * khud database se nikalta hai, is liye browser se total badla
 * nahi ja sakta.
 *
 * @param {Object} order
 * @param {string} order.customer_name
 * @param {string} order.phone
 * @param {string} [order.email]
 * @param {string} order.address
 * @param {string} order.city
 * @param {string} [order.notes]
 * @param {string} [order.source]     'checkout' ya 'quick-order'
 * @param {string} [order.website]    honeypot — hamesha khali
 * @param {Array}  order.items        [{ slug, size, color, qty }]
 * @returns {Promise<{ok: boolean, orderNumber: string, subtotal?: number,
 *                    shipping?: number, total?: number, items?: Array,
 *                    error?: string}>}
 */
export async function createOrder(order) {
  const payload = {
    customer_name: order.customer_name,
    phone: order.phone,
    email: order.email || '',
    address: order.address,
    city: order.city,
    notes: order.notes || '',
    source: order.source || 'checkout',
    website: order.website || '',
    items: (order.items || []).map((line) => ({
      slug: line.slug,
      size: line.size || null,
      color: line.color || null,
      qty: Number(line.qty) || 1,
    })),
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      /* `code` aur `slug` bhi sath jate hain: checkout in se wo
         line khud bag se nikal deta hai jo ab dukan mein nahi. */
      return {
        ok: false,
        orderNumber: '',
        error: readableError(data),
        code: data?.error || 'server',
        slug: data?.slug || '',
        name: data?.name || '',
      };
    }

    return {
      ok: true,
      orderNumber: data.orderNumber,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      items: data.items,
    };
  } catch {
    // Internet toot gaya, ya server tak baat hi nahi pohnchi.
    return {
      ok: false,
      orderNumber: '',
      code: 'offline',
      error: 'The connection dropped. Try again — your bag is safe.',
    };
  }
}

/**
 * Newsletter.
 * @param {string} email
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function subscribeToNewsletter(email) {
  const clean = String(email || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(clean)) {
    return { ok: false, error: 'That email does not look right.' };
  }

  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, error: readableError(data) };
    }
    return { ok: true, already: Boolean(data.already) };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}

/**
 * Contact form ka paigham mehfooz karta hai. Nakaam ho jaye to
 * bhi form WhatsApp khol deta hai — paigham kisi soorat zaya
 * nahi hota.
 * @param {{name: string, phone?: string, subject?: string, message: string}} input
 */
export async function saveMessage(input) {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: Boolean(data.ok) };
  } catch {
    return { ok: false };
  }
}

/**
 * Order dhoondta hai — number aur phone ke aakhri chaar digit se.
 * @param {string} orderNumber
 * @param {string} phoneLast4
 */
export async function trackOrder(orderNumber, phoneLast4) {
  try {
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, phoneLast4 }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error:
          data?.error === 'rate_limited'
            ? 'Too many attempts. Please try again in a few minutes.'
            : 'No order matches that number and phone. Please check both and try again.',
      };
    }
    return { ok: true, order: data.order };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}

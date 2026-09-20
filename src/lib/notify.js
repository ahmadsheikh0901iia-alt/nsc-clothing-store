import { formatPKR, STORE } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
   AAP KO ITTILA
   ───────────────────────────────────────────────────────────────
   Order save hote hi ye function chalta hai — SERVER par, customer
   ke kisi bhi amal se bilkul azad. Customer tab band kar de, phone
   band ho jaye, WhatsApp na bheje — aap ko phir bhi pata chal
   jayega. Pehle yehi sab se kamzor kari thi.

   Do raaste, dono ikhtiyari. Jo set hoga wo chalega, jo nahi hoga
   wo chup chaap chhoot jayega — order kabhi is wajah se nakaam
   nahi hota.

     TELEGRAM   sab se tez aur muft. Phone par turant ping.
                TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID

     EMAIL      Resend ke zariye.
                RESEND_API_KEY + OWNER_EMAIL + (MAIL_FROM)

   Dono mein se ek bhi na ho to bhi site theek chalti hai — bas
   aap ko /admin khol kar dekhna parega.
   ═══════════════════════════════════════════════════════════════ */

/** Baahar ki koi service 6 second se zyada intezar nahi karwa sakti. */
const TIMEOUT_MS = 6000;

async function postJson(url, body, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/* ── TELEGRAM ─────────────────────────────────────────────────── */

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;

  return postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chat,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

/* ── EMAIL (Resend) ───────────────────────────────────────────── */

async function sendEmail(subject, html) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL || STORE.email;
  if (!key || !to) return false;

  return postJson(
    'https://api.resend.com/emails',
    {
      from: process.env.MAIL_FROM || 'NSC Store <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    },
    { Authorization: `Bearer ${key}` }
  );
}

/* ── HTML ko mehfooz banana ───────────────────────────────────── */

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════════════════════
   NAYA ORDER
   ═══════════════════════════════════════════════════════════════ */

/**
 * @param {Object} order  place_order ka nateeja + customer ki tafseel
 */
export async function notifyNewOrder(order) {
  const lines = (order.items || [])
    .map((i) => {
      const extra = [i.size, i.color].filter(Boolean).join(', ');
      return `• ${i.name}${extra ? ` (${extra})` : ''} × ${i.qty} — ${formatPKR(
        i.price * i.qty
      )}`;
    })
    .join('\n');

  const waNumber = String(order.phone || '').replace(/\D/g, '');
  const wa = waNumber
    ? `\n\nWhatsApp: https://wa.me/${waNumber.startsWith('0') ? `92${waNumber.slice(1)}` : waNumber}`
    : '';

  const adminUrl = `${String(STORE.url || '').replace(/\/$/, '')}/admin`;

  const text =
    `<b>NAYA ORDER — ${esc(order.order_number)}</b>\n\n` +
    `${esc(order.customer_name)}\n` +
    `${esc(order.phone)}\n` +
    `${esc(order.address)}, ${esc(order.city)}\n` +
    (order.notes ? `\nNote: ${esc(order.notes)}\n` : '') +
    `\n${esc(lines)}\n\n` +
    `Subtotal: ${formatPKR(order.subtotal)}\n` +
    `Delivery: ${order.shipping === 0 ? 'Free' : formatPKR(order.shipping)}\n` +
    `<b>Total: ${formatPKR(order.total)}</b> (cash on delivery)` +
    `${esc(wa)}\n\n${esc(adminUrl)}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;color:#1b1a16">
      <p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8a6f31;margin:0 0 6px">
        Naya order
      </p>
      <h1 style="font-size:24px;margin:0 0 20px;font-weight:500">${esc(order.order_number)}</h1>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:5px 0;color:#6b665c;width:110px">Naam</td><td>${esc(order.customer_name)}</td></tr>
        <tr><td style="padding:5px 0;color:#6b665c">Phone</td><td>${esc(order.phone)}</td></tr>
        <tr><td style="padding:5px 0;color:#6b665c">Pata</td><td>${esc(order.address)}, ${esc(order.city)}</td></tr>
        ${order.notes ? `<tr><td style="padding:5px 0;color:#6b665c">Note</td><td>${esc(order.notes)}</td></tr>` : ''}
      </table>
      <hr style="border:0;border-top:1px solid #e3ddd0;margin:18px 0">
      <pre style="font-family:inherit;font-size:14px;white-space:pre-wrap;margin:0">${esc(lines)}</pre>
      <hr style="border:0;border-top:1px solid #e3ddd0;margin:18px 0">
      <p style="font-size:18px;margin:0"><strong>${formatPKR(order.total)}</strong>
        <span style="color:#6b665c;font-size:13px"> — cash on delivery</span></p>
      <p style="margin:24px 0 0">
        <a href="${esc(adminUrl)}" style="background:#1b1a16;color:#f7f4ee;padding:11px 20px;text-decoration:none;font-size:14px;display:inline-block">
          Admin panel kholein
        </a>
      </p>
    </div>`;

  const [telegram, email] = await Promise.all([
    sendTelegram(text),
    sendEmail(`Naya order ${order.order_number} — ${formatPKR(order.total)}`, html),
  ]);

  return { telegram, email };
}

/* ═══════════════════════════════════════════════════════════════
   NAYA PAIGHAM (contact form)
   ═══════════════════════════════════════════════════════════════ */

export async function notifyNewMessage(message) {
  const text =
    `<b>NAYA PAIGHAM</b>\n\n` +
    `${esc(message.name)}${message.phone ? ` — ${esc(message.phone)}` : ''}\n` +
    `Subject: ${esc(message.subject)}\n\n${esc(message.body)}`;

  await sendTelegram(text);
}

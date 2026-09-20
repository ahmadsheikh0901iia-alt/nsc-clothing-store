import { DELIVERY, formatPKR, STORE } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
   ORDER KA SAFAR
   ───────────────────────────────────────────────────────────────
   Paanch halaten, ek hi jagah likhi hui. Admin panel, tracking
   page, database ka check constraint aur WhatsApp ke paighamat —
   sab isi file se chalte hain, is liye kabhi aapas mein ikhtilaf
   nahi ho sakta.

   `next` batata hai ke is halat se aage kaun si halat par jaya
   ja sakta hai. Admin panel ke buttons isi list se bante hain,
   is liye ghalat qadam uthana mumkin hi nahi.
   ═══════════════════════════════════════════════════════════════ */

export const ORDER_STATUSES = [
  {
    key: 'pending',
    label: 'New',
    labelEn: 'Pending',
    step: 1,
    tone: 'warn',
    stamp: null,
    blurb: 'Order is in. Call the customer to confirm before anything is packed.',
    blurbEn: 'We have your order. We will call to confirm the details before anything is packed.',
    next: ['confirmed', 'cancelled'],
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    labelEn: 'Confirmed',
    step: 2,
    tone: 'info',
    stamp: 'confirmed_at',
    blurb: 'Customer confirmed. Pack it and hand it to the courier.',
    blurbEn: 'Confirmed. Your pieces are being checked and packed.',
    next: ['shipped', 'pending', 'cancelled'],
  },
  {
    key: 'shipped',
    label: 'Shipped',
    labelEn: 'Shipped',
    step: 3,
    tone: 'info',
    stamp: 'shipped_at',
    blurb: 'Parcel is with the courier. Send the tracking number.',
    blurbEn: 'On its way. The courier has your parcel.',
    next: ['delivered', 'confirmed', 'cancelled'],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    labelEn: 'Delivered',
    step: 4,
    tone: 'ok',
    stamp: 'delivered_at',
    blurb: 'Customer has it. The seven-day exchange window starts now.',
    blurbEn: 'Delivered. Your seven-day exchange window starts from this date.',
    next: ['shipped'],
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    labelEn: 'Cancelled',
    step: 0,
    tone: 'error',
    stamp: 'cancelled_at',
    blurb: 'Order cancelled. The stock has gone back on the shelf.',
    blurbEn: 'This order was cancelled. Nothing has been charged.',
    next: ['pending'],
  },
];

/** Sirf wo chaar jo aage barhne wali qatar banate hain. */
export const STATUS_LADDER = ['pending', 'confirmed', 'shipped', 'delivered'];

export const STATUS_KEYS = ORDER_STATUSES.map((s) => s.key);

export const getStatus = (key) =>
  ORDER_STATUSES.find((s) => s.key === key) || ORDER_STATUSES[0];

/** Us halat ka waqt jab wo pohanchi thi. */
export const stampFor = (order, key) => {
  const s = getStatus(key);
  return s.stamp ? order?.[s.stamp] || null : order?.created_at || null;
};

/* ═══════════════════════════════════════════════════════════════
   WHATSAPP KE PAIGHAMAT
   Har halat ka apna paigham, pehle se likha hua. Admin panel mein
   ek button dabane par WhatsApp usi number par, usi paigham ke
   sath khul jata hai — kuch type nahi karna parta.
   ═══════════════════════════════════════════════════════════════ */

const lines = (order) =>
  (order.items || [])
    .map((i) => {
      const extra = [i.size, i.color].filter(Boolean).join(', ');
      return `• ${i.name}${extra ? ` (${extra})` : ''} × ${i.qty}`;
    })
    .join('\n');

const firstName = (order) => String(order.customer_name || '').trim().split(' ')[0] || '';

export function messageFor(status, order) {
  if (!order) return '';
  const name = firstName(order);
  const no = order.order_number;
  const total = formatPKR(order.total);

  switch (status) {
    case 'confirmed':
      return (
        `Assalam o alaikum ${name}!\n\n` +
        `Aap ka order ${no} confirm ho gaya hai — shukriya.\n\n` +
        `${lines(order)}\n\n` +
        `Total: ${total} (cash on delivery)\n` +
        `Pata: ${order.address}, ${order.city}\n\n` +
        `Parcel ${DELIVERY.window} mein pohanch jayega. Jaise hi nikla, ` +
        `tracking number isi number par bhej doonga.\n\n— ${STORE.name}`
      );

    case 'shipped': {
      const courier = order.courier ? `\nCourier: ${order.courier}` : '';
      const tracking = order.tracking_number
        ? `\nTracking: ${order.tracking_number}`
        : '';
      return (
        `Assalam o alaikum ${name}!\n\n` +
        `Aap ka order ${no} aaj dispatch ho gaya hai.${courier}${tracking}\n\n` +
        `Rider aap ke number par call karega. Parcel milne par ${total} ` +
        `cash mein ada karna hai.\n\n` +
        `Kisi bhi waqt is number par message kar sakte hain.\n\n— ${STORE.name}`
      );
    }

    case 'delivered':
      return (
        `Assalam o alaikum ${name}!\n\n` +
        `Order ${no} aap tak pohanch gaya — shukriya ke aap ne ` +
        `${STORE.name} chuna.\n\n` +
        `Agar size ya shade mein koi masla ho to saat din ke andar ` +
        `bata dein, hum badal denge.\n\n` +
        `Agar pasand aaya ho to ek tasveer bhej dijiye — hum apne ` +
        `customers ki tasveerein share karna pasand karte hain.\n\n— ${STORE.name}`
      );

    case 'cancelled':
      return (
        `Assalam o alaikum ${name}!\n\n` +
        `Aap ka order ${no} mansookh kar diya gaya hai. Agar ye ghalti ` +
        `se hua ho ya aap dobara order karna chahein to bas is message ` +
        `ka jawab de dijiye.\n\n— ${STORE.name}`
      );

    default:
      return (
        `Assalam o alaikum ${name}!\n\n` +
        `${STORE.name} se baat ho rahi hai. Aap ka order ${no} mila hai:\n\n` +
        `${lines(order)}\n\n` +
        `Total: ${total} (cash on delivery)\n` +
        `Pata: ${order.address}, ${order.city}\n\n` +
        `Kya main ye order confirm kar doon?`
      );
  }
}

/** Pakistani number ko wa.me ki shakal mein badalta hai. */
export function toWhatsAppNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  return digits;
}

/** Customer ke number par, paigham pehle se likha hua. */
export function whatsAppFor(status, order) {
  const number = toWhatsAppNumber(order?.phone);
  if (!number) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(messageFor(status, order))}`;
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import Reveal from '@/components/motion/Reveal';
import { createOrder } from '@/lib/data/orders';
import { DELIVERY, formatPKR, STORE, whatsappLink } from '@/lib/constants';
import { ArrowRight, CheckIcon, WhatsAppIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  CHECKOUT
 *  ─────────────────────────────────────────────────────────────
 *  Tafseelat leta hai, jaanchta hai, aur `createOrder()` ke
 *  hawale kar deta hai — jo ab asal mein server ke /api/orders
 *  par jata hai, jahan order database mein likha jata hai aur
 *  stock kam hota hai.
 *
 *  Do baatein jo pehle se mukhtalif hain:
 *
 *  · Kamiyabi ka safha SIRF tab dikhta hai jab order waqai
 *    mehfooz ho chuka ho. Na ho sake to wajah saaf likhi jati
 *    hai aur bag jyun ka tyun bacha rehta hai — koi khamoshi
 *    se gum hone wala order nahi.
 *
 *  · Total ab server se aata hai, browser se nahi. Jo yahan
 *    likha nazar aata hai wohi database mein darj hai.
 *
 *  WhatsApp ab bhi maujood hai, magar ab wo ek NAQAL hai —
 *  ittminan ke liye — record nahi. Record pehle hi mehfooz ho
 *  chuka hota hai.
 * ═══════════════════════════════════════════════════════════════
 */

const EMPTY = {
  customer_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  notes: '',
};

/* Screen se bahar, is liye na dikhta hai na tab se milta hai. */
export const HONEYPOT = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  opacity: 0,
  pointerEvents: 'none',
};

export default function CheckoutForm() {
  const { items, hydrated, subtotal, shipping, total, clearCart, removeItem } = useStore();

  const [form, setForm] = useState(EMPTY);
  const [website, setWebsite] = useState(''); // honeypot — insan isay kabhi nahi bharta
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [failure, setFailure] = useState('');
  const [placed, setPlaced] = useState(null);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
    if (status === 'error') setStatus('idle');
  };

  const validate = () => {
    const next = {};
    if (!form.customer_name.trim()) next.customer_name = 'Please enter your name.';

    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) next.phone = 'Enter a valid phone number.';

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'That email does not look right.';
    }
    if (!form.address.trim()) next.address = 'We need a delivery address.';
    if (!form.city.trim()) next.city = 'Which city?';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!validate()) {
      // Move focus to the first problem so keyboard users are not lost.
      const first = document.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    setStatus('sending');
    setFailure('');

    /* Server ko sirf ye batana hai ke kya chahiye — kitne ka hai,
       ye wo khud database se ginega. */
    const result = await createOrder({
      ...form,
      website,
      source: 'checkout',
      items: items.map((l) => ({
        slug: l.slug,
        size: l.size,
        color: l.color,
        qty: l.qty,
      })),
    });

    if (result.ok) {
      setPlaced({
        ...form,
        orderNumber: result.orderNumber,
        items: result.items || [],
        subtotal: result.subtotal,
        shipping: result.shipping,
        total: result.total,
      });
      setStatus('done');
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      /* ── JO CHEEZ AB DUKAN MEIN NAHI ──
         `not_found` ka matlab hai: bag mein ek aisi cheez hai jo
         database mein maujood nahi. Ye us waqt hota hai jab bag
         browser mein mehfooz reh jaye aur us dauran product hata
         diya jaye.

         Pehle site sirf error dikhati thi aur customer wahin
         phans jata tha — na usay pata hota tha ke kaun si cheez
         kharab hai, na wo nikaal sakta tha. Ab site khud wo line
         bag se nikal deti hai. Agla "Place order" chal jata hai. */
      if (result.code === 'not_found' && result.slug) {
        items
          .filter((l) => l.slug === result.slug)
          .forEach((l) => removeItem(l.id));
      }
      setStatus('error');
      setFailure(result.error || 'Order could not be saved. Please try again.');
    }
  };

  /* ── Success screen ─────────────────────────────────────────── */

  if (status === 'done' && placed) {
    const summary = placed.items
      .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.qty}`)
      .join('\n');

    const message = `Assalam o alaikum! I have just placed an order on the website.\n\nOrder: ${placed.orderNumber}\nName: ${placed.customer_name}\nPhone: ${placed.phone}\nAddress: ${placed.address}, ${placed.city}\n\n${summary}\n\nTotal: ${formatPKR(placed.total)}`;

    return (
      <Reveal className="empty" from="none">
        <span
          className="row"
          style={{
            width: 62,
            height: 62,
            borderRadius: '999px',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            justifyContent: 'center',
          }}
        >
          <CheckIcon width={26} height={26} />
        </span>

        <h2 className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3rem)' }}>
          Order confirmed
        </h2>

        <p className="lede" style={{ textAlign: 'center' }}>
          Thank you, {placed.customer_name.split(' ')[0]}. Your reference is{' '}
          <strong className="gold num">{placed.orderNumber}</strong>. It is saved
          with us — we will call {placed.phone} within a few hours to confirm
          before it ships.
        </p>

        <div
          className="summary"
          style={{ position: 'static', maxWidth: 460, width: '100%', textAlign: 'left' }}
        >
          {placed.items.map((i, n) => (
            <div className="total-row" key={n}>
              <span className="muted">
                {i.name} × {i.qty}
              </span>
              <span className="num">{formatPKR(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="hr" />
          <div className="total-row">
            <span className="muted">Delivery</span>
            <span className="num">
              {placed.shipping === 0 ? 'Free' : formatPKR(placed.shipping)}
            </span>
          </div>
          <div className="total-row">
            <span className="caps">Total</span>
            <strong>{formatPKR(placed.total)}</strong>
          </div>
        </div>

        <div className="row wrap" style={{ justifyContent: 'center', gap: '0.75rem' }}>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-gold"
          >
            <WhatsAppIcon width={17} height={17} />
            Send a copy on WhatsApp
          </a>
          <Link href={`/order?ref=${encodeURIComponent(placed.orderNumber)}`} className="btn btn-outline">
            Track this order
            <ArrowRight className="arrow" width={15} height={15} />
          </Link>
          <Link href="/shop" className="btn btn-outline">
            Keep shopping
          </Link>
        </div>

        <p className="faint" style={{ fontSize: '0.8125rem', maxWidth: '48ch' }}>
          Keep your reference. You can check where the parcel has got to at any
          time on the track page — no account needed, just the reference and the
          last four digits of your number.
        </p>
      </Reveal>
    );
  }

  /* ── Empty bag ──────────────────────────────────────────────── */

  if (hydrated && items.length === 0) {
    return (
      <div className="empty">
        <p className="display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>
          There is nothing to check out
        </p>
        <Link href="/shop" className="btn btn-primary">
          Browse the shop
          <ArrowRight className="arrow" width={16} height={16} />
        </Link>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────────────── */

  return (
    <form className="checkout" onSubmit={onSubmit} noValidate>
      <div className="col" style={{ gap: '2rem' }}>
        <div>
          <h2 className="display" style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>
            Delivery details
          </h2>

          <div className="form-grid">
            <Field
              id="name"
              label="Full name *"
              value={form.customer_name}
              onChange={set('customer_name')}
              error={errors.customer_name}
              autoComplete="name"
              className="span-2"
            />
            <Field
              id="phone"
              label="Phone *"
              type="tel"
              placeholder="03xx xxxxxxx"
              value={form.phone}
              onChange={set('phone')}
              error={errors.phone}
              autoComplete="tel"
            />
            <Field
              id="email"
              label="Email (optional)"
              type="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
            />
            <Field
              id="address"
              label="Address *"
              value={form.address}
              onChange={set('address')}
              error={errors.address}
              autoComplete="street-address"
              className="span-2"
            />
            <Field
              id="city"
              label="City *"
              value={form.city}
              onChange={set('city')}
              error={errors.city}
              autoComplete="address-level2"
            />

            <div className="field span-2">
              <label className="label" htmlFor="notes">
                Order notes (optional)
              </label>
              <textarea
                id="notes"
                className="textarea"
                value={form.notes}
                onChange={set('notes')}
                placeholder="Landmark, preferred delivery time, stitching instructions…"
              />
            </div>

            {/* ── Honeypot ──
                Aankh se nazar nahi aata aur keyboard se bhi nahi
                milta, is liye asal customer isay kabhi nahi bharta.
                Bot har khana bharta hai — aur wahin pakra jata hai. */}
            <div aria-hidden="true" style={HONEYPOT}>
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="display" style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
            Payment
          </h2>
          <div
            className="row"
            style={{
              gap: '0.9rem',
              padding: '1.15rem',
              border: '1px solid var(--gold)',
              background: 'var(--ink-2)',
            }}
          >
            <CheckIcon width={19} height={19} style={{ color: 'var(--gold)' }} />
            <div>
              <p style={{ fontSize: '0.95rem' }}>Cash on delivery</p>
              <p className="faint" style={{ fontSize: '0.8125rem' }}>
                Pay the courier when your parcel arrives, {DELIVERY.window} from
                now. Available nationwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      <aside className="summary">
        <h2 className="caps" style={{ fontFamily: 'var(--font-sans)' }}>
          Your order
        </h2>

        <div className="col" style={{ gap: '1rem' }}>
          {items.map((line) => (
            <div className="row" key={line.id} style={{ gap: '0.85rem' }}>
              <div style={{ width: 54, flex: 'none', overflow: 'hidden' }}>
                <Image quality={92} src={line.image} alt="" width={108} height={144} sizes="54px" />
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.3 }}>{line.name}</p>
                <p className="line-meta">
                  {[line.size, line.color].filter(Boolean).join(' · ')} × {line.qty}
                </p>
              </div>
              <span className="num" style={{ fontSize: '0.9rem' }}>
                {formatPKR(line.price * line.qty)}
              </span>
            </div>
          ))}
        </div>

        <div className="hr" />

        <div className="total-row">
          <span className="muted">Subtotal</span>
          <span className="num">{formatPKR(subtotal)}</span>
        </div>
        <div className="total-row">
          <span className="muted">Delivery</span>
          <span className="num">{shipping === 0 ? 'Free' : formatPKR(shipping)}</span>
        </div>
        <div className="hr" />
        <div className="total-row">
          <span className="caps">Total</span>
          <strong>{formatPKR(total)}</strong>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={status === 'sending' || items.length === 0}
        >
          {status === 'sending' ? 'Placing order…' : 'Place order'}
        </button>

        {status === 'error' && (
          <p className="field-error" role="alert">
            {failure}{' '}
            <a
              href={whatsappLink(
                `Assalam o alaikum! Website par order karte hue masla aa raha hai. Main ${STORE.name} se ye cheezein lena chahta/chahti hoon.`
              )}
              target="_blank"
              rel="noreferrer"
              className="link-wipe gold"
            >
              Send it on WhatsApp
            </a>
          </p>
        )}

        <p className="faint" style={{ fontSize: '0.75rem' }}>
          By placing this order you agree to be contacted on the number above to
          confirm delivery.
        </p>
      </aside>
    </form>
  );
}

/* ── A single labelled input ─────────────────────────────────── */

function Field({ id, label, error, className = '', ...rest }) {
  return (
    <div className={`field ${className}`}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={error ? { borderColor: 'var(--error)' } : undefined}
        {...rest}
      />
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

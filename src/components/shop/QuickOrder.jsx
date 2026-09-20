'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useBodyLock from '@/hooks/useBodyLock';
import { createOrder } from '@/lib/data/orders';
import { DELIVERY, formatPKR, shippingFor, STORE, whatsappLink } from '@/lib/constants';
import { CheckIcon, CloseIcon, WhatsAppIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ORDER FORM
 *  ─────────────────────────────────────────────────────────────
 *  Jis ne faisla kar liya usay pehle cart seekhne ki zaroorat
 *  nahi honi chahiye. Ye chhota rasta hai: product par "Order
 *  now", paanch khane, ho gaya — na account, na bag, na doosra
 *  safha.
 *
 *  Ye wohi `createOrder()` istemal karta hai jo poora checkout
 *  karta hai, is liye dono ka order bilkul ek jaisa mehfooz hota
 *  hai — price database se, stock kam, aur aap ko ittila.
 *
 *  Screen par jo total dikhta hai wo andaza hai; kamiyabi ke
 *  baad jo dikhta hai wo server ka gina hua asal total hai.
 * ═══════════════════════════════════════════════════════════════
 */

const EMPTY = {
  customer_name: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
};

const HONEYPOT = {
  position: 'absolute',
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  opacity: 0,
  pointerEvents: 'none',
};

export default function QuickOrder({ open, onClose, lines = [], title = 'Order now' }) {
  const [form, setForm] = useState(EMPTY);
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [failure, setFailure] = useState('');
  const [placed, setPlaced] = useState(null);

  const panelRef = useRef(null);
  const firstFieldRef = useRef(null);

  useBodyLock(open);

  /* Screen par dikhane ke liye — asal hisab server karta hai. */
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  /* Reset to a clean form each time the panel is opened afresh. */
  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setWebsite('');
    setErrors({});
    setStatus('idle');
    setFailure('');
    setPlaced(null);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [open]);

  /* Escape closes; Tab is trapped inside the panel while it is up. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([tabindex="-1"]), select, textarea'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
    if (status === 'error') setStatus('idle');
  };

  const validate = () => {
    const next = {};
    if (!form.customer_name.trim()) next.customer_name = 'Please enter your name.';
    if (form.phone.replace(/\D/g, '').length < 10) {
      next.phone = 'Enter a valid phone number — we call to confirm.';
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
      panelRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setStatus('sending');
    setFailure('');

    const result = await createOrder({
      ...form,
      email: '',
      website,
      source: 'quick-order',
      items: lines.map((l) => ({
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
    } else {
      setStatus('error');
      setFailure(result.error || 'Order could not be saved. Please try again.');
    }
  };

  const summaryText = (o) =>
    `Assalam o alaikum! I have just placed an order on the website.\n\nOrder: ${
      o.orderNumber
    }\nName: ${o.customer_name}\nPhone: ${o.phone}\nAddress: ${o.address}, ${o.city}\n\n${o.items
      .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.qty}`)
      .join('\n')}\n\nTotal: ${formatPKR(o.total)}`;

  return (
    <>
      <div
        className="scrim"
        data-open={open ? 'true' : 'false'}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="order-panel"
        data-open={open ? 'true' : 'false'}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        ref={panelRef}
      >
        <header className="order-head">
          <span className="caps gold">
            {status === 'done' ? 'Confirmed' : 'Cash on delivery'}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close order form"
            tabIndex={open ? 0 : -1}
          >
            <CloseIcon />
          </button>
        </header>

        {/* ── Success ─────────────────────────────────────────── */}
        {status === 'done' && placed ? (
          <div className="order-body order-done">
            <span className="order-tick" aria-hidden="true">
              <CheckIcon width={24} height={24} />
            </span>

            <h2 className="display" style={{ fontSize: 'clamp(1.7rem,4vw,2.4rem)' }}>
              Order confirmed
            </h2>

            <p className="muted">
              Thank you, {placed.customer_name.split(' ')[0]}. Your reference is{' '}
              <strong className="gold num">{placed.orderNumber}</strong>. It is
              saved with us — we will call {placed.phone} within a few hours to
              confirm before dispatch.
            </p>

            <div className="order-totals">
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
                <span className="caps">Total</span>
                <strong className="num">{formatPKR(placed.total)}</strong>
              </div>
            </div>

            <a
              href={whatsappLink(summaryText(placed))}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold btn-block"
              tabIndex={open ? 0 : -1}
            >
              <WhatsAppIcon width={17} height={17} />
              Send a copy on WhatsApp
            </a>

            <Link
              href={`/order?ref=${encodeURIComponent(placed.orderNumber)}`}
              className="btn btn-outline btn-block"
              tabIndex={open ? 0 : -1}
            >
              Track this order
            </Link>

            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
              Keep shopping
            </button>

            <p className="faint" style={{ fontSize: '0.78rem' }}>
              Keep your reference number — you can check where the parcel has reached
              with it at any time.
            </p>
          </div>
        ) : (
          /* ── Form ──────────────────────────────────────────── */
          <form className="order-body" onSubmit={onSubmit} noValidate>
            {/* What is being ordered */}
            <div className="order-lines">
              {lines.map((l, n) => (
                <div className="order-line" key={l.id || n}>
                  <div className="order-line-img">
                    <Image
                quality={92} src={l.image} alt="" width={112} height={150} sizes="56px" />
                  </div>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <p className="order-line-name">{l.name}</p>
                    <p className="line-meta">
                      {[l.size, l.color].filter(Boolean).join(' · ')}
                      {l.qty > 1 ? ` · ×${l.qty}` : ''}
                    </p>
                  </div>
                  <span className="num" style={{ fontSize: '0.875rem' }}>
                    {formatPKR(l.price * l.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span className="muted">Subtotal</span>
                <span className="num">{formatPKR(subtotal)}</span>
              </div>
              <div className="total-row">
                <span className="muted">Delivery</span>
                <span className="num">
                  {shipping === 0 ? 'Free' : formatPKR(shipping)}
                </span>
              </div>
              <div className="hr" />
              <div className="total-row">
                <span className="caps">Pay on delivery</span>
                <strong className="num">{formatPKR(total)}</strong>
              </div>
            </div>

            {/* Where it goes */}
            <div className="form-grid">
              <OrderField
                id="qo-name"
                label="Full name *"
                inputRef={firstFieldRef}
                value={form.customer_name}
                onChange={set('customer_name')}
                error={errors.customer_name}
                autoComplete="name"
                className="span-2"
                tabIndex={open ? 0 : -1}
              />
              <OrderField
                id="qo-phone"
                label="Phone *"
                type="tel"
                inputMode="tel"
                placeholder="03xx xxxxxxx"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
                tabIndex={open ? 0 : -1}
              />
              <OrderField
                id="qo-city"
                label="City *"
                value={form.city}
                onChange={set('city')}
                error={errors.city}
                autoComplete="address-level2"
                tabIndex={open ? 0 : -1}
              />
              <OrderField
                id="qo-address"
                label="Delivery address *"
                value={form.address}
                onChange={set('address')}
                error={errors.address}
                autoComplete="street-address"
                className="span-2"
                tabIndex={open ? 0 : -1}
              />

              <div className="field span-2">
                <label className="label" htmlFor="qo-notes">
                  Notes (optional)
                </label>
                <textarea
                  id="qo-notes"
                  className="textarea"
                  rows={2}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Landmark, preferred delivery time, stitching instructions…"
                  tabIndex={open ? 0 : -1}
                />
              </div>

              {/* Honeypot — insan ke liye nahi hai */}
              <div aria-hidden="true" style={HONEYPOT}>
                <label htmlFor="qo-website">Website</label>
                <input
                  id="qo-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-block btn-lg"
              disabled={status === 'sending' || lines.length === 0}
              tabIndex={open ? 0 : -1}
            >
              {status === 'sending'
                ? 'Placing order…'
                : `Place order — ${formatPKR(total)}`}
            </button>

            {status === 'error' && (
              <p className="field-error" role="alert">
                {failure}{' '}
                <a
                  href={whatsappLink(
                    `Assalam o alaikum! Website par order karte hue masla aa raha hai. Main ${STORE.name} se ye cheez lena chahta/chahti hoon:\n\n${lines
                      .map((l) => `• ${l.name}${l.size ? ` (${l.size})` : ''} × ${l.qty}`)
                      .join('\n')}`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="link-wipe gold"
                  tabIndex={open ? 0 : -1}
                >
                  Send it on WhatsApp
                </a>
              </p>
            )}

            <p className="faint" style={{ fontSize: '0.78rem' }}>
              No payment now. You pay the courier in cash when the parcel
              reaches you, {DELIVERY.window} from now. We call the number above
              first to confirm. Prefer the full checkout?{' '}
              <Link href="/checkout" className="link-wipe gold" tabIndex={open ? 0 : -1}>
                Use the cart instead
              </Link>
              .
            </p>
          </form>
        )}
      </aside>
    </>
  );
}

/* ── A single labelled input ─────────────────────────────────── */

function OrderField({ id, label, error, className = '', inputRef, ...rest }) {
  return (
    <div className={`field ${className}`}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
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

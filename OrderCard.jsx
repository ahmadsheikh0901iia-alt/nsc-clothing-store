'use client';

import { useEffect, useState } from 'react';
import { formatPKR } from '@/lib/constants';
import {
  ORDER_STATUSES,
  STATUS_LADDER,
  getStatus,
  stampFor,
  whatsAppFor,
} from '@/lib/order-status';
import {
  CheckIcon,
  ChevronDown,
  PhoneIcon,
  TrashIcon,
  TruckIcon,
  WhatsAppMark,
} from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  EK ORDER
 *  ─────────────────────────────────────────────────────────────
 *  Upar wali qatar hi is panel ka dil hai. Har order chaar
 *  manzilon se guzarta hai — Naya, Confirm, Nikal gaya, Pohanch
 *  gaya — aur sunehri lakeer manzil ke sath sath aage barhti
 *  hai. Har manzil ke neeche wo waqt likha hota hai jab wo
 *  manzil aayi thi.
 *
 *  Wo waqt hum yahan nahi likhte — database khud darj karta hai
 *  jab status badalta hai. Isi liye ye kabhi ghalat nahi ho
 *  sakta, chahe do log ek sath panel khol kar baithe hon.
 *
 *  Buttons bhi khud nahi sochte: har halat ke aage kya ho sakta
 *  hai, wo order-status.js mein likha hai. Is liye ghalat qadam
 *  uthaya hi nahi ja sakta.
 * ═══════════════════════════════════════════════════════════════
 */

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute pehle`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ghante pehle`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} din pehle`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function clockPK(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function OrderCard({ order, onPatch, onDelete, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const [courier, setCourier] = useState(order.courier || '');
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [note, setNote] = useState(order.notes_internal || '');
  const [savedFlash, setSavedFlash] = useState(false);

  // Server se nayi shakal aaye to khane bhi usi ke mutabiq.
  useEffect(() => {
    setCourier(order.courier || '');
    setTracking(order.tracking_number || '');
    setNote(order.notes_internal || '');
  }, [order.courier, order.tracking_number, order.notes_internal]);

  const status = getStatus(order.status);
  const cancelled = order.status === 'cancelled';
  const reached = cancelled ? 0 : status.step;

  const run = async (patch, tag) => {
    setBusy(tag);
    setError('');
    const result = await onPatch(order.order_number, patch);
    setBusy(null);

    if (!result.ok) {
      setError(
        result.error === 'not_enough_stock'
          ? `Stock nahi bacha${result.name ? ` — ${result.name}` : ''}. Pehle stock barhayein.`
          : 'That did not work. Please try again.'
      );
      return false;
    }

    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
    return true;
  };

  const openWhatsApp = async () => {
    const link = whatsAppFor(order.status, { ...order, courier, tracking_number: tracking });
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
    if (!order.whatsapp_sent) await run({ whatsappSent: true }, 'wa');
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const count = items.reduce((n, i) => n + (Number(i.qty) || 0), 0);

  return (
    <article
      className="ad-order"
      data-status={order.status}
      data-open={open ? 'true' : 'false'}
      data-saved={savedFlash ? 'true' : 'false'}
    >
      {/* ── Sar ── */}
      <button
        type="button"
        className="ad-order-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ad-order-id">
          <span className="ad-num">{order.order_number}</span>
          <span className="ad-order-when">{timeAgo(order.created_at)}</span>
        </span>

        <span className="ad-order-who">
          <span className="ad-order-name">{order.customer_name}</span>
          <span className="ad-order-city">{order.city}</span>
        </span>

        <span className="ad-order-sum">
          <span className="ad-num ad-order-total">{formatPKR(order.total)}</span>
          <span className="ad-order-count">
            {count} cheez{count === 1 ? '' : 'ein'}
          </span>
        </span>

        <span className={`ad-pill ad-pill-${status.tone}`}>{status.label}</span>

        <span className="ad-chev" aria-hidden="true">
          <ChevronDown width={16} height={16} />
        </span>
      </button>

      {/* ── Safar ki qatar ── */}
      <div className="ad-track" aria-hidden={cancelled ? 'true' : undefined}>
        {cancelled ? (
          <p className="ad-track-cancelled">
            Mansookh {order.cancelled_at ? `— ${clockPK(order.cancelled_at)}` : ''} · stock
            wapas shelf par
          </p>
        ) : (
          <ol className="ad-steps" style={{ '--reached': reached }}>
            <span className="ad-steps-rail" aria-hidden="true">
              <i style={{ transform: `scaleX(${Math.max(0, (reached - 1) / 3)})` }} />
            </span>

            {STATUS_LADDER.map((key) => {
              const step = getStatus(key);
              const done = step.step <= reached;
              const now = step.step === reached;
              const at = stampFor(order, key);

              return (
                <li
                  key={key}
                  className="ad-step"
                  data-done={done ? 'true' : 'false'}
                  data-now={now ? 'true' : 'false'}
                >
                  <span className="ad-step-dot" aria-hidden="true">
                    {done && <CheckIcon width={11} height={11} />}
                  </span>
                  <span className="ad-step-label">{step.label}</span>
                  <span className="ad-step-time">{done && at ? clockPK(at) : '—'}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* ── Tafseel ── */}
      <div className="ad-order-body" hidden={!open}>
        <div className="ad-order-grid">
          {/* Customer */}
          <div className="ad-block">
            <p className="ad-block-title">Customer</p>
            <dl className="ad-kv">
              <div>
                <dt>Name</dt>
                <dd>{order.customer_name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${String(order.phone).replace(/\s/g, '')}`} className="ad-link">
                    <PhoneIcon width={13} height={13} />
                    <span className="ad-num">{order.phone}</span>
                  </a>
                </dd>
              </div>
              {order.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{order.email}</dd>
                </div>
              )}
              <div>
                <dt>Address</dt>
                <dd>
                  {order.address}
                  <br />
                  {order.city}
                </dd>
              </div>
              {order.notes && (
                <div>
                  <dt>Note</dt>
                  <dd className="ad-note-quote">{order.notes}</dd>
                </div>
              )}
              <div>
                <dt>Placed</dt>
                <dd>
                  {clockPK(order.created_at)}
                  {order.source === 'quick-order' ? ' · Order now' : ' · Checkout'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Saman */}
          <div className="ad-block">
            <p className="ad-block-title">Items</p>
            <ul className="ad-lines">
              {items.map((line, i) => (
                <li key={`${line.slug}-${i}`}>
                  <span className="ad-line-name">
                    {line.name}
                    {(line.size || line.color) && (
                      <span className="ad-line-variant">
                        {[line.size, line.color].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                  <span className="ad-num ad-line-qty">×{line.qty}</span>
                  <span className="ad-num ad-line-price">
                    {formatPKR(line.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="ad-totals">
              <div>
                <dt>Subtotal</dt>
                <dd className="ad-num">{formatPKR(order.subtotal)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd className="ad-num">
                  {Number(order.shipping) === 0 ? 'Free' : formatPKR(order.shipping)}
                </dd>
              </div>
              <div className="ad-totals-final">
                <dt>Total</dt>
                <dd className="ad-num">{formatPKR(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Courier — sirf jab kaam ki baat ho */}
        {['confirmed', 'shipped', 'delivered'].includes(order.status) && (
          <div className="ad-block ad-block-wide">
            <p className="ad-block-title">
              <TruckIcon width={14} height={14} /> Courier
            </p>
            <div className="ad-row-fields">
              <div className="ad-field">
                <label className="ad-label" htmlFor={`courier-${order.order_number}`}>
                  Courier
                </label>
                <input
                  id={`courier-${order.order_number}`}
                  className="ad-input"
                  value={courier}
                  placeholder="Leopards / TCS / M&P"
                  onChange={(e) => setCourier(e.target.value)}
                  onBlur={() => {
                    if (courier !== (order.courier || '')) run({ courier }, 'courier');
                  }}
                />
              </div>
              <div className="ad-field">
                <label className="ad-label" htmlFor={`track-${order.order_number}`}>
                  Tracking number
                </label>
                <input
                  id={`track-${order.order_number}`}
                  className="ad-input ad-num"
                  value={tracking}
                  placeholder="CN-000000000"
                  onChange={(e) => setTracking(e.target.value)}
                  onBlur={() => {
                    if (tracking !== (order.tracking_number || '')) {
                      run({ trackingNumber: tracking }, 'tracking');
                    }
                  }}
                />
              </div>
            </div>
            <p className="ad-hint">
              Both of these go into the WhatsApp message automatically, and the
              customer sees them on the tracking page too.
            </p>
          </div>
        )}

        {/* Private note */}
        <div className="ad-block ad-block-wide">
          <p className="ad-block-title">Private note</p>
          <textarea
            className="ad-input ad-textarea"
            rows={2}
            value={note}
            placeholder="For your eyes only — the customer never sees this."
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if (note !== (order.notes_internal || '')) run({ notesInternal: note }, 'note');
            }}
          />
        </div>
      </div>

      {/* ── Amal ── */}
      <div className="ad-order-actions">
        {status.next.map((key) => {
          const step = getStatus(key);
          const isBack = !cancelled && step.step > 0 && step.step < status.step;
          return (
            <button
              key={key}
              type="button"
              className={`ad-btn ${
                key === 'cancelled'
                  ? 'ad-btn-danger'
                  : isBack
                    ? 'ad-btn-ghost'
                    : 'ad-btn-gold'
              }`}
              disabled={busy !== null}
              onClick={() => run({ status: key }, key)}
            >
              {busy === key
                ? 'Working…'
                : key === 'cancelled'
                  ? 'Cancel order'
                  : isBack
                    ? `${step.label} par wapas`
                    : `${step.label} kar dein`}
            </button>
          );
        })}

        {/* ── Mitane ka button ──
            Sirf cancelled order par. Ye button chhupa dena hifazat
            NAHI hai — jo shakhs seedha API par request bhej de, us
            ke liye button maujood hi nahi tha. Asli jaanch server
            par hoti hai: wahan order ka status dobara parha jata
            hai aur `cancelled` na ho to kuch nahi mitta. Ye sirf
            aap ki nazar se chalta hua order hatana hai. */}
        {cancelled && typeof onDelete === 'function' && (
          <button
            type="button"
            className="ad-btn ad-btn-danger"
            disabled={busy !== null}
            onClick={() => onDelete(order)}
            title="Delete this cancelled order for good"
          >
            <TrashIcon width={14} height={14} />
            Delete
          </button>
        )}

        <span className="ad-spacer" />

        <button
          type="button"
          className="ad-btn ad-btn-wa"
          onClick={openWhatsApp}
          disabled={busy !== null}
          title="WhatsApp opens with the message already written"
        >
          <WhatsAppMark width={15} height={15} />
          {order.whatsapp_sent ? 'Send again' : 'Message on WhatsApp'}
          {order.whatsapp_sent && (
            <span className="ad-sent" aria-label="already sent">
              <CheckIcon width={11} height={11} />
            </span>
          )}
        </button>
      </div>

      {error && (
        <p className="ad-order-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}

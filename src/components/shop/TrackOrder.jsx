'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { trackOrder } from '@/lib/data/orders';
import { formatPKR, STORE, whatsappLink } from '@/lib/constants';
import { STATUS_LADDER, getStatus, stampFor } from '@/lib/order-status';
import {
  ArrowRight,
  CheckIcon,
  SearchIcon,
  TruckIcon,
  WhatsAppMark,
} from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ORDER TRACKING
 *  ─────────────────────────────────────────────────────────────
 *  Wohi chaar manzilein jo admin panel mein hain, wohi waqt, wohi
 *  tarteeb — magar customer ki nazar se. Dono ek hi file
 *  (order-status.js) se chalte hain, is liye aap jo /admin mein
 *  dekhte hain aur customer jo yahan dekhta hai, wo kabhi alag
 *  nahi ho sakte.
 * ═══════════════════════════════════════════════════════════════
 */

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

export default function TrackOrder({ initialRef = '' }) {
  const [ref, setRef] = useState(initialRef);
  const [last4, setLast4] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | found | error
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);

  const last4Ref = useRef(null);

  // Checkout se aane par order number pehle se bhara hota hai,
  // is liye focus seedha agle khane par.
  useEffect(() => {
    if (initialRef) last4Ref.current?.focus();
  }, [initialRef]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading') return;

    if (!ref.trim() || last4.replace(/\D/g, '').length < 4) {
      setStatus('error');
      setMessage('We need both the order number and the last four digits of your phone.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const result = await trackOrder(ref.trim(), last4);

    if (result.ok) {
      setOrder(result.order);
      setStatus('found');
    } else {
      setOrder(null);
      setStatus('error');
      setMessage(result.error);
    }
  };

  const current = order ? getStatus(order.status) : null;
  const cancelled = order?.status === 'cancelled';
  const reached = cancelled ? 0 : current?.step || 0;

  return (
    <div className="trk">
      {/* ── Form ── */}
      <form className="trk-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label className="label" htmlFor="trk-ref">
            Order number
          </label>
          <input
            id="trk-ref"
            className="input num"
            value={ref}
            onChange={(e) => {
              setRef(e.target.value.toUpperCase());
              if (status === 'error') setStatus('idle');
            }}
            placeholder="NSC-XXXXXX"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="trk-phone">
            Last 4 digits of your phone
          </label>
          <input
            id="trk-phone"
            ref={last4Ref}
            className="input num"
            value={last4}
            onChange={(e) => {
              setLast4(e.target.value.replace(/\D/g, '').slice(0, 4));
              if (status === 'error') setStatus('idle');
            }}
            placeholder="2459"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          <SearchIcon width={15} height={15} />
          {status === 'loading' ? 'Looking…' : 'Find my order'}
        </button>
      </form>

      {status === 'error' && (
        <div className="trk-miss" role="alert">
          <p>{message}</p>
          <a
            href={whatsappLink(
              `Hello! I would like to ask about my order${ref ? ` — ${ref}` : ''}.`
            )}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
          >
            <WhatsAppMark width={16} height={16} />
            Message us on WhatsApp
          </a>
        </div>
      )}

      {/* ── Nateeja ── */}
      {status === 'found' && order && (
        <article className="trk-card">
          <header className="trk-card-head">
            <div>
              <p className="eyebrow">Order</p>
              <p className="trk-ref num">{order.order_number}</p>
            </div>
            <span className={`trk-pill trk-pill-${current.tone}`}>
              {current.labelEn || current.label}
            </span>
          </header>

          {/* Customer ko wo jumla dikhta hai jo us ke liye likha gaya,
              na ke wo jo admin ke liye hai. */}
          <p className="trk-blurb">{current.blurbEn || current.blurb}</p>

          {/* ── Safar ── */}
          {cancelled ? (
            <p className="trk-cancelled">
              This order was cancelled
              {order.cancelled_at ? ` — ${clockPK(order.cancelled_at)}` : ''}. If that
              was not meant to happen, let us know.
            </p>
          ) : (
            <ol className="trk-steps">
              <span className="trk-rail" aria-hidden="true">
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
                    className="trk-step"
                    data-done={done ? 'true' : 'false'}
                    data-now={now ? 'true' : 'false'}
                  >
                    <span className="trk-dot" aria-hidden="true">
                      {done && <CheckIcon width={11} height={11} />}
                    </span>
                    <span className="trk-step-label">{step.labelEn || step.label}</span>
                    <span className="trk-step-time">{done && at ? clockPK(at) : '—'}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {/* ── Courier ── */}
          {order.tracking_number && (
            <div className="trk-courier">
              <TruckIcon width={17} height={17} />
              <div>
                <p className="caps faint">
                  {order.courier || 'Courier'} — tracking
                </p>
                <p className="num trk-tracking">{order.tracking_number}</p>
              </div>
            </div>
          )}

          {/* ── Saman ── */}
          <ul className="trk-lines">
            {(order.items || []).map((line, i) => (
              <li key={`${line.slug}-${i}`}>
                <span>
                  {line.name}
                  {(line.size || line.color) && (
                    <span className="trk-variant">
                      {[line.size, line.color].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
                <span className="num faint">×{line.qty}</span>
                <span className="num">{formatPKR(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>

          <div className="trk-totals">
            <div>
              <span className="muted">Delivery</span>
              <span className="num">
                {Number(order.shipping) === 0 ? 'Free' : formatPKR(order.shipping)}
              </span>
            </div>
            <div className="trk-total-final">
              <span className="caps">
                {order.status === 'delivered' ? 'Paid' : 'Cash on delivery'}
              </span>
              <strong className="num">{formatPKR(order.total)}</strong>
            </div>
          </div>

          <footer className="trk-card-foot">
            <a
              href={whatsappLink(
                `Hello! I wanted to ask about order ${order.order_number}.`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              <WhatsAppMark width={16} height={16} />
              Ask about this order
            </a>
            <Link href="/shop" className="btn btn-outline">
              Shop
              <ArrowRight className="arrow" width={15} height={15} />
            </Link>
          </footer>
        </article>
      )}

      <p className="faint trk-note">
        Your order number appeared on screen when you ordered, and it is in the
        WhatsApp message too. If you cannot find it, message {STORE.phone} and we
        will look it up in our records.
      </p>
    </div>
  );
}

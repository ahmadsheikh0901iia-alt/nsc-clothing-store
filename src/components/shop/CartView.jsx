'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import Reveal from '@/components/motion/Reveal';
import { formatPKR, SHIPPING } from '@/lib/constants';
import { MinusIcon, PlusIcon, TrashIcon, ArrowRight } from '@/components/ui/Icons';

/**
 * The full-page bag. Same data as the drawer, laid out with room to
 * review a larger order before checking out.
 */
export default function CartView() {
  const { items, hydrated, subtotal, shipping, total, setQty, removeItem, clearCart } =
    useStore();

  // Until localStorage has been read, render a neutral placeholder so
  // the server and client HTML match and React does not warn.
  if (!hydrated) {
    return (
      <div className="empty">
        <p className="muted">Loading your bag…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <p className="display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>
          Your bag is empty
        </p>
        <p className="muted" style={{ maxWidth: '42ch' }}>
          Once you add something it stays here, even if you close the tab and
          come back tomorrow.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Start shopping
          <ArrowRight className="arrow" width={16} height={16} />
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, SHIPPING.freeOver - subtotal);

  return (
    <div className="checkout">
      {/* ── Lines ── */}
      <div>
        <div className="row-between" style={{ marginBottom: '1.5rem' }}>
          <span className="caps faint">
            {items.length} line{items.length === 1 ? '' : 's'}
          </span>
          <button type="button" className="btn btn-ghost" onClick={clearCart}>
            Empty bag
          </button>
        </div>

        <div className="col" style={{ gap: '1.5rem' }}>
          {items.map((line) => (
            <Reveal key={line.id} className="line" y={16} style={{ gridTemplateColumns: '110px 1fr' }}>
              <Link href={`/shop/${line.slug}`} className="line-media">
                <Image
                quality={92} src={line.image} alt={line.name} width={220} height={294} sizes="110px" />
              </Link>

              <div className="line-info">
                <Link href={`/shop/${line.slug}`} className="line-name">
                  {line.name}
                </Link>
                <span className="line-meta">
                  {[line.size, line.color].filter(Boolean).join(' · ') || 'One size'}
                </span>
                <span className="num muted" style={{ fontSize: '0.9rem' }}>
                  {formatPKR(line.price)} each
                </span>

                <div className="line-foot">
                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      aria-label={`Reduce quantity of ${line.name}`}
                    >
                      <MinusIcon width={14} height={14} />
                    </button>
                    <span>{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      aria-label={`Increase quantity of ${line.name}`}
                    >
                      <PlusIcon width={14} height={14} />
                    </button>
                  </div>

                  <div className="row" style={{ gap: '1rem' }}>
                    <span className="num">{formatPKR(line.price * line.qty)}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 34, height: 34, color: 'var(--bone-faint)' }}
                      onClick={() => removeItem(line.id)}
                      aria-label={`Remove ${line.name}`}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Summary ── */}
      <aside className="summary">
        <h2 className="caps" style={{ fontFamily: 'var(--font-sans)' }}>
          Summary
        </h2>

        <div className="col" style={{ gap: '0.75rem' }}>
          <div className="total-row">
            <span className="muted">Subtotal</span>
            <span className="num">{formatPKR(subtotal)}</span>
          </div>
          <div className="total-row">
            <span className="muted">Delivery</span>
            <span className="num">{shipping === 0 ? 'Free' : formatPKR(shipping)}</span>
          </div>
          {remaining > 0 && (
            <p className="faint" style={{ fontSize: '0.8125rem' }}>
              Spend {formatPKR(remaining)} more for free delivery.
            </p>
          )}
        </div>

        <div className="hr" />

        <div className="total-row">
          <span className="caps">Total</span>
          <strong>{formatPKR(total)}</strong>
        </div>

        <Link href="/checkout" className="btn btn-primary btn-block btn-lg">
          Proceed to checkout
          <ArrowRight className="arrow" width={16} height={16} />
        </Link>

        <Link href="/shop" className="btn btn-ghost">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}

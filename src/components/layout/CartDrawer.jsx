'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import useBodyLock from '@/hooks/useBodyLock';
import { formatPKR, SHIPPING } from '@/lib/constants';
import {
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
} from '@/components/ui/Icons';

/**
 * Slide-over bag.
 * Opens automatically when something is added, and shows how much
 * more the customer needs to spend to reach free delivery — the one
 * nudge that reliably lifts basket size.
 */
export default function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    shipping,
    total,
    cartOpen,
    setCartOpen,
    setQty,
    removeItem,
  } = useStore();

  useBodyLock(cartOpen);

  const close = () => setCartOpen(false);
  const remaining = Math.max(0, SHIPPING.freeOver - subtotal);

  return (
    <>
      <div
        className="scrim"
        data-open={cartOpen ? 'true' : 'false'}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className="drawer"
        data-open={cartOpen ? 'true' : 'false'}
        aria-hidden={!cartOpen}
        aria-label="Shopping bag"
      >
        {/* ── Head ── */}
        <div className="drawer-head">
          <div className="row" style={{ gap: '0.75rem' }}>
            <span className="caps">Your Bag</span>
            <span className="caps faint num">({count})</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={close}
            aria-label="Close bag"
            tabIndex={cartOpen ? 0 : -1}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Body ── */}
        {items.length === 0 ? (
          <div className="drawer-body">
            <div className="empty" style={{ margin: 'auto' }}>
              <p className="display" style={{ fontSize: '1.6rem' }}>
                Your bag is empty
              </p>
              <p className="muted" style={{ fontSize: '0.9rem', maxWidth: '30ch' }}>
                Nothing here yet. Have a look through the new season.
              </p>
              <Link
                href="/shop"
                className="btn btn-outline"
                onClick={close}
                tabIndex={cartOpen ? 0 : -1}
              >
                Browse the shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="drawer-body">
            {/* Free-delivery progress */}
            <div
              className="row"
              style={{
                gap: '0.65rem',
                fontSize: '0.8125rem',
                color: 'var(--bone-dim)',
                paddingBottom: '0.35rem',
              }}
            >
              <TruckIcon width={17} height={17} />
              {remaining > 0 ? (
                <span>
                  Add <strong className="gold">{formatPKR(remaining)}</strong> for free
                  delivery
                </span>
              ) : (
                <span className="gold">You have earned free delivery</span>
              )}
            </div>

            {items.map((line) => (
              <div className="line" key={line.id}>
                <Link
                  href={`/shop/${line.slug}`}
                  className="line-media"
                  onClick={close}
                  tabIndex={cartOpen ? 0 : -1}
                >
                  <Image
                    quality={92}
                    src={line.image}
                    alt={line.name}
                    width={168}
                    height={224}
                    sizes="84px"
                  />
                </Link>

                <div className="line-info">
                  <Link
                    href={`/shop/${line.slug}`}
                    className="line-name"
                    onClick={close}
                    tabIndex={cartOpen ? 0 : -1}
                  >
                    {line.name}
                  </Link>

                  <span className="line-meta">
                    {[line.size, line.color].filter(Boolean).join(' · ') || 'One size'}
                  </span>

                  <span className="num" style={{ fontSize: '0.9rem' }}>
                    {formatPKR(line.price)}
                  </span>

                  <div className="line-foot">
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.qty - 1)}
                        aria-label={`Reduce quantity of ${line.name}`}
                        tabIndex={cartOpen ? 0 : -1}
                      >
                        <MinusIcon width={14} height={14} />
                      </button>
                      <span aria-live="polite">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.id, line.qty + 1)}
                        aria-label={`Increase quantity of ${line.name}`}
                        tabIndex={cartOpen ? 0 : -1}
                      >
                        <PlusIcon width={14} height={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 34, height: 34, color: 'var(--bone-faint)' }}
                      onClick={() => removeItem(line.id)}
                      aria-label={`Remove ${line.name} from bag`}
                      tabIndex={cartOpen ? 0 : -1}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Foot ── */}
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="total-row">
              <span className="caps faint">Subtotal</span>
              <span className="num">{formatPKR(subtotal)}</span>
            </div>
            <div className="total-row">
              <span className="caps faint">Delivery</span>
              <span className="num">
                {shipping === 0 ? 'Free' : formatPKR(shipping)}
              </span>
            </div>
            <div className="hr" />
            <div className="total-row">
              <span className="caps">Total</span>
              <strong>{formatPKR(total)}</strong>
            </div>

            <Link
              href="/checkout"
              className="btn btn-primary btn-block"
              onClick={close}
              tabIndex={cartOpen ? 0 : -1}
            >
              Checkout
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={close}
              tabIndex={cartOpen ? 0 : -1}
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

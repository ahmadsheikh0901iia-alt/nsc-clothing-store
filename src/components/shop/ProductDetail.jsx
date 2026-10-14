'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from '@/components/ui/StoreImage';
import Link from 'next/link';
import QuickOrder from '@/components/shop/QuickOrder';
import ShareButton from '@/components/shop/ShareButton';
import WhatsAppShare from '@/components/shop/WhatsAppShare';
import { useStore } from '@/context/StoreContext';
import {
  colorHex,
  colorName,
  DELIVERY,
  formatPKR,
  getCategory,
  SHIPPING,
  STORE,
  whatsappLink,
} from '@/lib/constants';
import { discountPct, imageList, primaryImage, toArray } from '@/lib/utils';
import {
  MinusIcon,
  PlusIcon,
  TruckIcon,
  RefreshIcon,
  ShieldIcon,
  WhatsAppIcon,
} from '@/components/ui/Icons';

const STEP_MS = 5000;

const HOLD_MS = 6000;

const DRAG_PULL = 0.38;

const DRAG_CAP = 0.15;

export default function ProductDetail({ product }) {
  const { addItem, hydrated } = useStore();

  const images = imageList(product);
  const sizes = toArray(product.sizes);
  const colors = toArray(product.colors);

  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [loadedImage, setLoadedImage] = useState('');

  const [dir, setDir] = useState('next');
  const [holdShots, setHoldShots] = useState(false);

  const [hand, setHand] = useState('off');
  const [drag, setDrag] = useState(0);
  const [live, setLive] = useState(false);
  const [awake, setAwake] = useState(true);
  const galleryRef = useRef(null);
  const grab = useRef(null);
  const settleRef = useRef(0);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState(colors.length === 1 ? colorName(colors[0]) : null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState('details');
  const [orderOpen, setOrderOpen] = useState(false);

  const show = useCallback((next, how = 'next') => {
    setDir(how);
    setActive(next);
  }, []);

  const count = images.length;

  useEffect(() => {
    const el = galleryRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setLive(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => setAwake(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  useEffect(() => {
    if (!autoplay || loadedImage !== images[active] || count < 2 || holdShots || hand === 'drag' || !live || !awake) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const t = window.setTimeout(() => {
      setDir('next');
      setActive((v) => (v + 1) % count);
    }, STEP_MS);

    return () => window.clearTimeout(t);
  }, [active, count, holdShots, hand, live, awake, autoplay, loadedImage, images[active]]);

  useEffect(() => {
    if (!holdShots) return undefined;
    const t = window.setTimeout(() => setHoldShots(false), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [holdShots, active]);

  useEffect(() => () => window.clearTimeout(settleRef.current), []);

  const onPointerDown = (e) => {
    if (count < 2) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const w = e.currentTarget.clientWidth || 1;
    grab.current = { id: e.pointerId, x: e.clientX, y: e.clientY, w, live: false };
    window.clearTimeout(settleRef.current);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {

    }
  };

  const onPointerMove = (e) => {
    const g = grab.current;
    if (!g || e.pointerId !== g.id) return;

    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;

    if (!g.live) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        grab.current = null;
        return;
      }
      g.live = true;
      setHand('drag');
      setHoldShots(true);
    }

    const cap = g.w * DRAG_CAP;
    setDrag(Math.max(-cap, Math.min(cap, dx * DRAG_PULL)));
  };

  const onPointerUp = (e) => {
    const g = grab.current;
    if (!g || e.pointerId !== g.id) return;
    grab.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {

    }

    if (!g.live) return;

    const dx = e.clientX - g.x;
    const need = Math.max(38, g.w * 0.12);

    setDrag(0);
    setHoldShots(true);

    if (dx <= -need) {

      setHand('off');
      setDir('next');
      setActive((v) => (v + 1) % count);
    } else if (dx >= need) {
      setHand('off');
      setDir('prev');
      setActive((v) => (v - 1 + count) % count);
    } else {

      setHand('settle');
      settleRef.current = window.setTimeout(() => setHand('off'), 320);
    }
  };

  const onGalleryKey = (e) => {
    if (count < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHoldShots(true);
      show((active + 1) % count, 'next');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHoldShots(true);
      show((active - 1 + count) % count, 'prev');
    }
  };

  const category = getCategory(product.category);
  const off = discountPct(product.price, product.compare_at_price);
  const soldOut = product.in_stock === false || product.stock_count === 0;

  const needsSize = sizes.length > 1 && !size;
  const needsColor = colors.length > 0 && !color;
  const blocked = !hydrated || soldOut || needsSize || needsColor;

  const blockedLabel = () => {
    if (soldOut) return 'Sold out';
    if (needsSize) return 'Select a size';
    if (needsColor) return 'Select a colour';
    return null;
  };

  const orderLine = {
    id: `${product.id}::${size || 'one'}::${color || 'default'}`,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: primaryImage(product),
    size,
    color,
    qty,
  };

  const waMessage = `Assalam o alaikum! I would like to order:\n\n${product.name}\n${
    size ? `Size: ${size}\n` : ''
  }${color ? `Colour: ${color}\n` : ''}Quantity: ${qty}\nPrice: ${formatPKR(
    product.price
  )}\n\n${STORE.url}/shop/${product.slug}`;

  const sections = [
    { key: 'details', label: 'Description', body: product.description },
    {
      key: 'fabric',
      label: 'Fabric & Care',
      body: `${product.fabric || 'Details on request.'} Dry clean recommended for embroidered pieces. Wash cotton and lawn separately in cold water for the first two washes. Do not bleach. Press on the reverse.`,
    },
    {
      key: 'delivery',
      label: 'Delivery & Returns',
      body: `Delivered in ${DELIVERY.window} anywhere in Pakistan, dispatched from ${DELIVERY.from}. Delivery is ${formatPKR(SHIPPING.flatRate)}, free over ${formatPKR(SHIPPING.freeOver)}. Cash on delivery everywhere — you pay the courier at your door. Seven-day exchange on unworn items with tags attached; message ${STORE.phone} on WhatsApp to arrange it.`,
    },
  ];

  return (
    <div className="pdp">

      <div className="pdp-gallery" ref={galleryRef}>
        <div className="pdp-main">

          <div
            className="pdp-slides"
            data-dir={dir}
            data-hand={hand}
            style={{ '--drag': `${drag}px` }}
            role={count > 1 ? 'group' : undefined}
            aria-roledescription={count > 1 ? 'carousel' : undefined}
            aria-label={
              count > 1
                ? `${product.name} — ${count} photographs. Swipe, drag, or use the left and right arrow keys.`
                : undefined
            }
            tabIndex={count > 1 ? 0 : undefined}
            onKeyDown={count > 1 ? onGalleryKey : undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <Image
              key={images[active] || active}
              className="pdp-slide"
              quality={85}
              src={images[active] || '/products/placeholder.jpg'}
              alt={`${product.name} — view ${active + 1}`}
              width={900}
              height={1200}
              priority={active === 0}
              loading="eager"
              onLoad={() => setLoadedImage(images[active])}
              draggable={false}
              sizes="(max-width: 900px) 100vw, 55vw"
            />

          </div>

          {count > 1 && (
            <div className="pdp-bars" aria-hidden="true">
              {images.map((src, i) => (
                <span key={src} className="pdp-bar" data-on={i === active ? 'true' : 'false'} />
              ))}
            </div>
          )}
        </div>

        {count > 1 && (
          <div className="pdp-controls" aria-label="Gallery controls">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setHoldShots(true); show((active - 1 + count) % count, 'prev'); }}>Previous photo</button>
            <span aria-live="polite">{active + 1} / {count}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setHoldShots(true); show((active + 1) % count); }}>Next photo</button>
            <button type="button" className="btn btn-outline btn-sm" aria-pressed={autoplay} onClick={() => setAutoplay(!autoplay)}>{autoplay ? 'Pause slideshow' : 'Play slideshow'}</button>
          </div>
        )}

        {count > 1 && (
          <div className="pdp-thumbs">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="pdp-thumb"
                aria-pressed={active === i}
                aria-label={`Show image ${i + 1} of ${count}`}
                onClick={() => {
                  setHoldShots(true);
                  show(i, i >= active ? 'next' : 'prev');
                }}
              >
                <Image
                quality={85} src={src} alt="" width={150} height={200} sizes="74px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdp-info">
        <div>
          <Link href={`/collections/${product.category}`} className="caps gold link-wipe">
            {category?.name || product.category}
          </Link>
          <h1
            className="display"
            style={{ fontSize: 'clamp(1.9rem,4vw,3rem)', marginTop: '0.6rem' }}
          >
            {product.name}
          </h1>
        </div>

        <div className="pdp-price">
          {formatPKR(product.price)}
          {product.compare_at_price > product.price && (
            <span className="was">{formatPKR(product.compare_at_price)}</span>
          )}
          {off && <span className="badge badge-gold">−{off}%</span>}
        </div>

        {sizes.length > 0 && (
          <div className="field">
            <span className="label">
              Size{size ? ` — ${size}` : ''}
            </span>
            <div className="option-row">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="option"
                  disabled={!hydrated}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="field">
            <span className="label">
              Colour{color ? ` — ${color}` : ''}
            </span>
            <div className="option-row">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="option"
                  disabled={!hydrated}
                  aria-pressed={color === colorName(c)}
                  onClick={() => setColor(colorName(c))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span
                    className="swatch-dot"
                    style={{ background: colorHex(c), width: 11, height: 11 }}
                    aria-hidden="true"
                  />
                  {colorName(c)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="buy">
          <div className="row wrap" style={{ gap: '0.7rem' }}>
            <div className="qty">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Reduce quantity"
              >
                <MinusIcon width={15} height={15} />
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
              >
                <PlusIcon width={15} height={15} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-gold grow buy-primary"
              disabled={blocked}
              onClick={() => setOrderOpen(true)}
            >
              {blockedLabel() || `Order now — ${formatPKR(product.price * qty)}`}
            </button>
          </div>

          <div className="buy-alt">

            <button
              type="button"
              className="btn btn-outline"
              disabled={blocked}
              onClick={() => addItem(product, { size, color, qty })}
            >
              Add to bag
            </button>

            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <WhatsAppIcon width={17} height={17} />
              WhatsApp
            </a>

            <ShareButton product={product} variant="full" />
          </div>

          <div className="buy-share">
            <WhatsAppShare product={product} size={size} color={color} />
          </div>

          <p className="buy-note faint">
            Cash on delivery · no payment until the parcel is in your hand
          </p>
        </div>

        {product.stock_count > 0 && product.stock_count <= 5 && (
          <p className="gold" style={{ fontSize: '0.85rem' }}>
            Only {product.stock_count} left in stock.
          </p>
        )}

        <div className="trust-row">
          {[
            { Icon: TruckIcon, t: DELIVERY.short },
            { Icon: RefreshIcon, t: '7-day exchange' },
            { Icon: ShieldIcon, t: 'Cash on delivery' },
          ].map(({ Icon, t }) => (
            <div className="col" key={t} style={{ gap: '0.5rem' }}>
              <Icon width={19} height={19} style={{ color: 'var(--gold)' }} />
              <span className="caps faint">{t}</span>
            </div>
          ))}
        </div>

        <div className="accordion">
          {sections.map((sec) => (
            <div className="acc-item" key={sec.key}>
              <button
                type="button"
                className="acc-btn"
                aria-expanded={open === sec.key}
                onClick={() => setOpen(open === sec.key ? null : sec.key)}
              >
                {sec.label}
                <span className="pm" aria-hidden="true" />
              </button>
              <div className="acc-panel" data-open={open === sec.key ? 'true' : 'false'}>
                <div>
                  <p>{sec.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <QuickOrder
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        lines={[orderLine]}
        title={`Order ${product.name}`}
      />
    </div>
  );
}

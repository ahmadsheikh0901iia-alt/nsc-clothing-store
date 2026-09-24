'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import QuickOrder from '@/components/shop/QuickOrder';
import ShareButton from '@/components/shop/ShareButton';
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

/**
 * Product page — gallery, buy box and details.
 *
 * The size and colour selectors are required before adding to the
 * bag when a product actually offers a choice; the button stays
 * disabled and explains why, rather than silently adding the wrong
 * variant.
 */
export default function ProductDetail({ product }) {
  const { addItem } = useStore();

  const images = imageList(product);
  const sizes = toArray(product.sizes);
  const colors = toArray(product.colors);

  const [active, setActive] = useState(0);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState(colors.length === 1 ? colorName(colors[0]) : null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState('details');
  const [orderOpen, setOrderOpen] = useState(false);

  const category = getCategory(product.category);
  const off = discountPct(product.price, product.compare_at_price);
  const soldOut = product.in_stock === false || product.stock_count === 0;

  const needsSize = sizes.length > 1 && !size;
  const needsColor = colors.length > 0 && !color;
  const blocked = soldOut || needsSize || needsColor;

  /* One label for both buttons, so a blocked state explains itself
     in the same words wherever the customer happens to press. */
  const blockedLabel = () => {
    if (soldOut) return 'Sold out';
    if (needsSize) return 'Select a size';
    if (needsColor) return 'Select a colour';
    return null;
  };

  /* The single cart-shaped row handed to the order form. */
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
      {/* ── Gallery ── */}
      <div className="pdp-gallery">
        <Reveal mask className="pdp-main">
          <Image
            quality={92}
            src={images[active] || '/products/placeholder.jpg'}
            alt={`${product.name} — view ${active + 1}`}
            width={900}
            height={1200}
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
          />
        </Reveal>

        {images.length > 1 && (
          <div className="pdp-thumbs">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="pdp-thumb"
                aria-pressed={active === i}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                onClick={() => setActive(i)}
              >
                <Image
                quality={92} src={src} alt="" width={150} height={200} sizes="74px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Buy box ── */}
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

        {/* Size */}
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
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colour */}
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

        {/* ── Buy ──
            Ordering outright is the loudest thing on the page, because
            it is the shortest path: five fields, cash on delivery, no
            cart to understand. The bag stays for anyone building up a
            larger order, and WhatsApp for anyone who would rather talk
            to a person. */}
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
            {/* The primary button already explains a blocked state, so
                this one keeps its own label rather than repeating it. */}
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

            {/* Is market mein product share hona hi bikne ka sab
                se bara zariya hai — koi apni behen ko bhejta hai
                aur order wahin se banta hai. */}
            <ShareButton product={product} variant="full" />
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

        {/* Reassurance */}
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

        {/* Accordion */}
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

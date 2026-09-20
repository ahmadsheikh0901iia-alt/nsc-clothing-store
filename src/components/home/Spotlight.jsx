'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { useStore } from '@/context/StoreContext';
import { colorHex, DELIVERY, formatPKR, getCategory } from '@/lib/constants';
import { imageList, toArray } from '@/lib/utils';
import { ArrowRight, TruckIcon, RefreshIcon, ShieldIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  PRODUCT SPOTLIGHT
 *  Split layout: the photograph is sticky and holds still while the
 *  copy scrolls past it. The size and colour selectors are real —
 *  they drive state and the add-to-bag button uses whatever is
 *  chosen, so this is a working buy box, not a picture of one.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Spotlight({ product }) {
  const { addItem } = useStore();

  const images = imageList(product);
  const sizes = toArray(product?.sizes);
  const colors = toArray(product?.colors);

  const [active, setActive] = useState(0);
  const [size, setSize] = useState(sizes[0] || null);
  const [color, setColor] = useState(colors[0] || null);

  if (!product) return null;

  const category = getCategory(product.category);

  return (
    <section className="section container band-top">
      <div className="sec-head">
        <div>
          <Reveal from="none">
            <span className="eyebrow">In Focus</span>
          </Reveal>
          <WordReveal
            as="h2"
            style={{ marginTop: '1rem' }}
            segments={[{ text: 'One piece,' }, { text: 'closely.', em: true }]}
          />
        </div>
      </div>

      <div className="spotlight">
        {/* ── Sticky image ── */}
        <Reveal className="spotlight-media" mask>
          <Image
            quality={92}
            src={images[active] || images[0]}
            alt={product.name}
            width={900}
            height={1200}
            sizes="(max-width: 900px) 100vw, 50vw"
          />

          {images.length > 1 && (
            <div className="spotlight-thumbs">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className="spotlight-thumb"
                  aria-pressed={active === i}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActive(i)}
                >
                  <Image
                quality={92} src={src} alt="" width={120} height={160} sizes="46px" />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {/* ── Scrolling copy ── */}
        <div className="spotlight-copy">
          <Reveal>
            <span className="caps gold">{category?.name || product.category}</span>
            <h3
              className="display"
              style={{ fontSize: 'clamp(1.9rem,4vw,3rem)', marginTop: '0.75rem' }}
            >
              {product.name}
            </h3>
            <div className="pdp-price" style={{ marginTop: '0.9rem' }}>
              {formatPKR(product.price)}
              {product.compare_at_price > product.price && (
                <span className="was">{formatPKR(product.compare_at_price)}</span>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="lede">{product.description}</p>
          </Reveal>

          {/* ── Size ── */}
          {sizes.length > 0 && (
            <Reveal delay={0.12} className="field">
              <span className="label">Size — {size}</span>
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
            </Reveal>
          )}

          {/* ── Colour ── */}
          {colors.length > 0 && (
            <Reveal delay={0.16} className="field">
              <span className="label">Colour — {color}</span>
              <div className="option-row">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="option"
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span
                      className="swatch-dot"
                      style={{ background: colorHex(c), width: 11, height: 11 }}
                      aria-hidden="true"
                    />
                    {c}
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {/* ── Buy ── */}
          <Reveal delay={0.2} className="col" style={{ gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              onClick={() => addItem(product, { size, color, qty: 1 })}
            >
              Add to bag — {formatPKR(product.price)}
            </button>
            <Link href={`/shop/${product.slug}`} className="btn btn-outline btn-block">
              Full details
              <ArrowRight className="arrow" width={15} height={15} />
            </Link>
          </Reveal>

          {/* ── Specs ── */}
          <Reveal delay={0.24}>
            <ul className="spec-list">
              <li>
                <span className="k">Fabric</span>
                <span className="v">{product.fabric || '—'}</span>
              </li>
              <li>
                <span className="k">Category</span>
                <span className="v">{category?.name || product.category}</span>
              </li>
              <li>
                <span className="k">Availability</span>
                <span className="v">
                  {product.in_stock === false
                    ? 'Sold out'
                    : product.stock_count
                      ? `${product.stock_count} in stock`
                      : 'In stock'}
                </span>
              </li>
            </ul>
          </Reveal>

          {/* ── Reassurance ── */}
          <Reveal delay={0.28} className="trust-row">
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}

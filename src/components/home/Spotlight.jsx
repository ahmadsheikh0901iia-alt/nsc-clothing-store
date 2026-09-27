'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { useStore } from '@/context/StoreContext';
import { colorHex, colorName, DELIVERY, formatPKR, getCategory } from '@/lib/constants';
import { imageList, primaryImage, toArray } from '@/lib/utils';
import { ArrowRight, TruckIcon, RefreshIcon, ShieldIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  PRODUCT SPOTLIGHT — "In Focus"
 *  Split layout: the photograph is sticky and holds still while the
 *  copy scrolls past it. The size and colour selectors are real —
 *  they drive state and the add-to-bag button uses whatever is
 *  chosen, so this is a working buy box, not a picture of one.
 *
 *  ── TASVEEREIN AB KHUD BADALTI HAIN ──
 *  Pehle chaar tasveerein thin aur wo sirf neeche wale chhote
 *  murabbon ko DABANE par badalti thin. Jo grahak wo murabbe
 *  dekhta hi nahi (aur phone par wo tasveer ke kone mein 46px ke
 *  hote hain) us ke liye ye khana ek jami hui tasveer tha.
 *
 *  Ab chaaron tasveerein ek doosre ke oopar rakhi hui hain aur har
 *  4.4 second baad agli narmi se ubhar aati hai — sath hi bohat
 *  dheema zoom, jo tasveer ko zinda rakhta hai.
 *
 *  ── DO BAATEIN JAAN BOOJH KAR AISE HAIN ──
 *
 *  1. Chaaron tasveerein ek sath DOM mein hain, ek hi `src` badal
 *     kar nahi. `src` badalne se har dafa nayi tasveer download
 *     hoti aur us ke aane tak khana safed jhalakta — phone ke
 *     dheeme internet par ye jhalak saaf nazar aati hai. Ek dafa
 *     chaar tasveerein aa jayen to us ke baad badalna sirf
 *     `opacity` ka kaam hai, jo GPU karta hai.
 *
 *  2. Murabba dabane par khud chalna DAS second ke liye ruk jata
 *     hai. Grahak ne jo tasveer khud chuni hai wo usay dekhne ka
 *     waqt milna chahiye — warna do second baad site us ki pasand
 *     ko khud badal deti, jo bilkul bura lagta hai.
 * ═══════════════════════════════════════════════════════════════
 */

/** Ek tasveer kitni der samne rehti hai. */
const STEP_MS = 4400;

/** Murabba dabane ke baad kitni der khud na chalna. */
const PAUSE_MS = 10000;

export default function Spotlight({ product }) {
  const { addItem } = useStore();

  const images = imageList(product);
  const sizes = toArray(product?.sizes);
  const colors = toArray(product?.colors);

  const shots = images.slice(0, 4);
  const shotCount = shots.length;
  /* Jis product par ek bhi tasveer na ho — us par bhi khana khali
     na dikhe. `primaryImage` apna placeholder de deta hai. */
  const slides = shotCount ? shots : [primaryImage(product)];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [awake, setAwake] = useState(true);
  const pauseRef = useRef(0);

  /* Ek se zyada shakl ho to grahak khud chunta hai — pehle yahan
     pehli qeemat khud ba khud lag jati thi, aur order us rang ka
     chala jata tha jo kisi ne maanga hi nahi tha. */
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState(
    colors.length === 1 ? colorName(colors[0]) : null
  );

  /* Tab peeche chala jaye to timer chalane ka koi faida nahi. */
  useEffect(() => {
    const sync = () => setAwake(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  /* Khud chalna — zanjeer, interval nahi: har tasveer ko poora
     waqt milta hai, chahe wo khud aayi ho ya grahak ne chuni ho. */
  useEffect(() => {
    if (shotCount < 2 || paused || !awake) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const t = window.setTimeout(
      () => setActive((v) => (v + 1) % shotCount),
      STEP_MS
    );
    return () => window.clearTimeout(t);
  }, [active, shotCount, paused, awake]);

  useEffect(() => () => window.clearTimeout(pauseRef.current), []);

  if (!product) return null;

  const category = getCategory(product.category);

  const pick = (k) => {
    setActive(k);
    setPaused(true);
    window.clearTimeout(pauseRef.current);
    pauseRef.current = window.setTimeout(() => setPaused(false), PAUSE_MS);
  };

  /* Jab tak chunna baaqi hai, button khud bata deta hai kya chahiye. */
  const needsSize = sizes.length > 1 && !size;
  const needsColor = colors.length > 0 && !color;
  const blocked = needsSize || needsColor;
  const blockedLabel = needsSize ? 'Select a size' : needsColor ? 'Select a colour' : null;

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
          <span className="spot-slides">
            {slides.map((src, k) => (
              <Image
                key={src || k}
                className="spot-slide"
                data-on={k === active ? 'true' : 'false'}
                quality={92}
                src={src}
                alt={k === 0 ? product.name : ''}
                width={900}
                height={1200}
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            ))}
          </span>

          {shotCount > 1 && (
            <div className="spotlight-thumbs">
              {shots.map((src, k) => (
                <button
                  key={src}
                  type="button"
                  className="spotlight-thumb"
                  aria-pressed={active === k}
                  aria-label={`View image ${k + 1}`}
                  onClick={() => pick(k)}
                >
                  <Image quality={92} src={src} alt="" width={120} height={160} sizes="46px" />
                </button>
              ))}
            </div>
          )}

          {/* Kitni tasveer guzar chuki — chhoti sunehri patti */}
          {shotCount > 1 && (
            <span className="spot-bars" aria-hidden="true">
              {shots.map((src, k) => (
                <span key={src} className="spot-bar" data-on={k === active ? 'true' : 'false'} />
              ))}
            </span>
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
              <span className="label">Colour{color ? ` — ${color}` : ''}</span>
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
            </Reveal>
          )}

          {/* ── Buy ── */}
          <Reveal delay={0.2} className="col" style={{ gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-block"
              disabled={blocked}
              onClick={() => {
                if (blocked) return;
                addItem(product, { size, color, qty: 1 });
              }}
            >
              {blockedLabel || `Add to bag — ${formatPKR(product.price)}`}
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

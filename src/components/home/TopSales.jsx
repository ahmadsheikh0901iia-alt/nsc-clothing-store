'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPKR } from '@/lib/constants';
import { discountPct, primaryImage } from '@/lib/utils';

/**
 * ═══════════════════════════════════════════════════════════════
 *  TOP SALES — EK GHOOMTA HUA 3D DAIRA
 *  ─────────────────────────────────────────────────────────────
 *  Home page par pehla kaam ye hai ke dekhne wale ko FAURAN pata
 *  chale: is dukaan par abhi sale lagi hui hai.
 *
 *  ── YE WAQAI 3D HAI ──
 *  Cards ek khayali silinder ke gird lagaye gaye hain. Har card
 *  apni jagah par ghuma kar aage dhakela jata hai:
 *
 *      rotateY(k × step) translateZ(r)
 *
 *  aur poora daira ulti simt ghooma diya jata hai. Nateeja: cards
 *  waqai gehrai mein aate jate hain — peeche wale chhote aur
 *  dhundle, samne wala bara aur saaf. Ye tasveer ka dhoka nahi,
 *  browser ka apna 3D hai.
 *
 *  ── KOI LIBRARY NAHI ──
 *  Na three.js, na GSAP. Sirf `perspective`, `transform-style` aur
 *  `rotateY` — jo har phone ka browser khud samajhta hai. Bundle
 *  mein ek byte ka izafa nahi, aur chalne mein GPU ka kaam.
 *
 *  ── KHUD CHALTA HAI, MAGAR ANDHA NAHI ──
 *  Har 3.4 second baad agla card. Ruk jata hai jab:
 *    · ungli ya cursor us par ho
 *    · keyboard us ke andar ho
 *    · section screen par na ho (IntersectionObserver)
 *    · safha peeche chala jaye (tab badal jaye)
 *    · grahak ne apne phone mein harkat kam karne ka kaha ho
 *
 *  ── PHONE PAR DAIRA NAHI ──
 *  350px par ghoomta hua silinder bekar hai — cards ya to bahut
 *  chhote hon ge ya ek doosre par charh jayen ge. Wahan ye ek
 *  khiskne wali qatar ban jata hai jo khud aage barhti hai, aur
 *  har card andar aate waqt halka sa 3D mein sidha hota hai.
 *  Dono soorat mein: khud chalta hua, 3D, aur istemal ke qabil.
 * ═══════════════════════════════════════════════════════════════
 */

const STEP_MS = 3400;

export default function TopSales({ products = [] }) {
  const items = products.slice(0, 8);
  const n = items.length;

  const [i, setI] = useState(0);
  const [ring, setRing] = useState(false); // daira ya qatar
  const [live, setLive] = useState(false); // screen par hai?
  const [held, setHeld] = useState(false); // ungli / cursor / keyboard

  const stageRef = useRef(null);
  const railRef = useRef(null);

  /* Daira sirf bari screen par. 860px ek naap hai jahan card
     itna bara reh jata hai ke gehrai ka matlab bane. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)');
    const sync = () => setRing(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  /* Screen par na ho to ghoomne ka koi faida nahi — phone ki
     battery bhi ek cheez hai. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setLive(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => setLive(e.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback((next) => {
    if (n === 0) return;
    setI(((next % n) + n) % n);
  }, [n]);

  /* Khud chalna */
  useEffect(() => {
    if (n < 2 || !live || held) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const t = window.setInterval(() => setI((v) => (v + 1) % n), STEP_MS);
    const onHide = () => {
      if (document.hidden) window.clearInterval(t);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [n, live, held]);

  /* Qatar wali shakl mein card ko khud samne le aana */
  useEffect(() => {
    if (ring) return;
    const rail = railRef.current;
    const card = rail?.children?.[i];
    if (!rail || !card) return;
    rail.scrollTo({
      left: card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, [i, ring]);

  if (n === 0) return null;

  const hold = {
    onMouseEnter: () => setHeld(true),
    onMouseLeave: () => setHeld(false),
    onFocusCapture: () => setHeld(true),
    onBlurCapture: () => setHeld(false),
    onTouchStart: () => setHeld(true),
  };

  return (
    <section className="tsale" aria-labelledby="tsale-title">
      {/* Peeche se guzarti hui sunehri roshni */}
      <span className="tsale-glow" aria-hidden="true" />

      <div className="container tsale-head">
        <span className="tsale-flag">
          <span className="tsale-flag-dot" aria-hidden="true" />
          Sale is on
        </span>

        <h2 id="tsale-title" className="display tsale-title">
          Top Sales
        </h2>

        <p className="lede tsale-lede">
          Jo abhi sab se zyada ja raha hai — aur jis par abhi daam kam hai.
          Cash on delivery, poore Pakistan mein.
        </p>
      </div>

      <div
        className="tsale-stage"
        data-mode={ring ? 'ring' : 'rail'}
        ref={stageRef}
        {...hold}
      >
        {ring ? (
          <div
            className="tsale-ring"
            style={{ '--n': n, '--i': i }}
            role="list"
          >
            {items.map((p, k) => (
              <Card key={p.id} product={p} k={k} active={k === i} inRing />
            ))}
          </div>
        ) : (
          <div className="tsale-rail no-scrollbar" ref={railRef} role="list">
            {items.map((p, k) => (
              <Card key={p.id} product={p} k={k} active={k === i} />
            ))}
          </div>
        )}
      </div>

      <div className="container tsale-foot">
        <div className="tsale-dots" role="tablist" aria-label="Choose a piece">
          {items.map((p, k) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              className="tsale-dot"
              aria-selected={k === i}
              aria-label={p.name}
              onClick={() => go(k)}
            />
          ))}
        </div>

        <Link href="/collections/top-sales" className="btn btn-gold tsale-all">
          See everything on sale
        </Link>
      </div>
    </section>
  );
}

/* ── Ek card ── */
function Card({ product, k, active, inRing = false }) {
  const off = discountPct(product.price, product.compare_at_price);
  const soldOut = product.in_stock === false || product.stock_count === 0;

  return (
    <article
      className="tsale-card"
      role="listitem"
      style={inRing ? { '--k': k } : undefined}
      data-on={active ? 'true' : 'false'}
    >
      <Link href={`/shop/${product.slug}`} className="tsale-link">
        <span className="tsale-shot">
          <Image
            quality={90}
            src={primaryImage(product)}
            alt={product.name}
            width={900}
            height={1200}
            sizes="(max-width: 860px) 62vw, 280px"
          />
          {off ? (
            <span className="tsale-off" aria-hidden="true">
              <strong>{off}%</strong>
              <em>off</em>
            </span>
          ) : null}
          {soldOut && <span className="tsale-out">Sold out</span>}
        </span>

        <span className="tsale-body">
          <span className="tsale-name">{product.name}</span>
          <span className="tsale-price num">
            {product.compare_at_price > product.price && (
              <s>{formatPKR(product.compare_at_price)}</s>
            )}
            {formatPKR(product.price)}
          </span>
        </span>
      </Link>
    </article>
  );
}

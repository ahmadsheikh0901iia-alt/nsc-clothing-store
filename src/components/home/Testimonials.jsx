'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from '@/components/motion/Reveal';
import { TESTIMONIALS, REVIEWS_READY } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  EK WAQT MEIN EK — khud ba khud badalta hua
 *  ─────────────────────────────────────────────────────────────
 *  Bara jumla, beech mein, display italic mein. Har chand second
 *  baad agla jumla ghul kar aa jata hai. Neeche ki lakeerein
 *  progress bhi hain aur button bhi.
 *
 *  ── JO PEHLE NAHI CHALTA THA ──
 *  Pehle ye khana `prefersReducedMotion()` par ruk jata tha. Iraada
 *  theek tha, natija ghalat: Android par battery saver khud ba
 *  khud "reduce motion" laga deta hai, aur phone par ye khana
 *  hamesha ke liye pehle hi jumle par khara reh jata tha. Yani
 *  wahi shakhs, jis ke paas sab se kam sabr hai, usay sirf ek
 *  jumla nazar aata.
 *
 *  Ab ye HAR haal mein chalta hai. Jise harkat se taklif ho, us ke
 *  liye ghulna band ho jata hai — jumla badal jata hai, magar
 *  harkat ke baghair. Ye theek bhi hai: badalna maloomat hai,
 *  ghulna sirf sajawat.
 *
 *  ── TEEN CHEEZEIN JO IS KO SAMBHALTI HAIN ──
 *  1. Sab jumle ek hi jagah par, ek dusre ke oopar. Sirf
 *     `data-active` badalta hai — DOM se kuch nikalta nahi, is
 *     liye qad achanak nahi kudta.
 *  2. Jis par nazar nahi, us par `aria-hidden` — screen reader ko
 *     ek waqt mein ek hi jumla milta hai.
 *  3. Hover par ruk jata hai (laptop), aur phone par haath se
 *     lakeer dabane ke baad kuch der theher jata hai, taake wo
 *     jumla poora parha ja sake.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Testimonials({ items = TESTIMONIALS, interval = 5600 }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const holdTimer = useRef(null);

  const go = useCallback(
    (next) => setIndex(((next % items.length) + items.length) % items.length),
    [items.length]
  );

  /* Chalti rehti hai. Rukti sirf tab hai jab koi parh raha ho. */
  useEffect(() => {
    if (held || items.length < 2) return undefined;
    const t = window.setTimeout(() => go(index + 1), interval);
    return () => window.clearTimeout(t);
  }, [index, held, go, interval, items.length]);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  /* Haath se badla gaya — ab das second khamoshi, phir dobara
     khud chalna shuru. Warna jumla parhne se pehle hi nikal jata. */
  const pick = (i) => {
    go(i);
    setHeld(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHeld(false), 10000);
  };

  if (!items.length) return null;

  return (
    <section
      className="section container band-top"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
    >
      <Reveal from="none" className="text-center">
        <span className="eyebrow eyebrow-plain">
          {REVIEWS_READY ? 'Word of mouth' : 'In our own words'}
        </span>
      </Reveal>

      <div className="quotes" style={{ marginTop: '2.5rem' }}>
        {items.map((item, i) => (
          <figure
            className="quote"
            key={`${item.label || item.name}-${i}`}
            data-active={i === index ? 'true' : 'false'}
            aria-hidden={i !== index}
          >
            <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="who">
              {item.name
                ? `${item.name} — ${item.place}${item.bought ? ` · ${item.bought}` : ''}`
                : item.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="quote-dots" role="tablist" aria-label="Statements">
        {items.map((item, i) => (
          <button
            key={`${item.label || item.name}-dot-${i}`}
            type="button"
            className="quote-dot"
            data-active={i === index && !held ? 'true' : undefined}
            data-on={i === index ? 'true' : undefined}
            style={{ '--quote-span': `${interval}ms` }}
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${i + 1} of ${items.length}`}
            onClick={() => pick(i)}
          />
        ))}
      </div>
    </section>
  );
}

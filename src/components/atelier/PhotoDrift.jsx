'use client';

import Image from 'next/image';
import useOnScreen from '@/hooks/useOnScreen';

/**
 * ═══════════════════════════════════════════════════════════════
 *  PHOTO DRIFT — chalti hui tasveeron ki qatar
 *  ─────────────────────────────────────────────────────────────
 *  Wohi chaal jo ribbon ki hai, magar lafzon ki jagah tasveerein.
 *  Do qatarein ulti simton mein chalti hain, is liye nazar kabhi
 *  ek raftar par theherti nahi — aur safha ruka hua nahi lagta.
 *
 *  Teen baatein jo is ko sasta lagne se bachati hain:
 *
 *    1. Har tasveer ka apna hasil hai — koi 3:4, koi 4:5, koi
 *       chaurai mein. Barabar khanon ki qatar catalogue lagti hai;
 *       ghair-barabar qatar dais lagti hai.
 *    2. Aam halat mein tasveerein thori si dabi hoi hain. Jis par
 *       ungli rakhein wohi poori roshan hoti hai.
 *    3. Qatar ke dono kinare safhe mein ghul jate hain (mask
 *       motion.css mein hai), is liye kuch kata hua nazar nahi
 *       aata.
 *
 *  Content do dafa likha jata hai — doosri naqal sirf dekhne ke
 *  liye hai, is liye `aria-hidden`. Track theek aadha chalta hai,
 *  is liye chakkar mein koi jor nazar nahi aata.
 * ═══════════════════════════════════════════════════════════════
 */
export default function PhotoDrift({ items = [], duration = 64, reverse = false }) {
  // Hooks hamesha pehle — `items` khali ho to bhi tarteeb na tootay.
  const ref = useOnScreen();

  if (!items.length) return null;

  const row = (prefix, hidden) => (
    <div className="drift-row" aria-hidden={hidden ? 'true' : undefined}>
      {items.map((it, i) => (
        <figure className="drift-shot" key={`${prefix}-${i}`} data-size={i % 3}>
          <Image
            quality={92}
            src={it.src}
            alt={hidden ? '' : it.alt || ''}
            width={900}
            height={1200}
            sizes="(max-width: 700px) 55vw, 320px"
            loading="lazy"
          />
        </figure>
      ))}
    </div>
  );

  return (
    <div className="marquee drift" ref={ref} data-run="true">
      <div
        className="marquee-track"
        data-direction={reverse ? 'reverse' : undefined}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        {row('a', false)}
        {row('b', true)}
      </div>
    </div>
  );
}

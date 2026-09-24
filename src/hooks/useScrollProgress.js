'use client';

import { useEffect, useRef } from 'react';
import { subscribe } from '@/lib/scroll';
import { clamp, prefersReducedMotion } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   PHONE KI PATTI, AUR WO JHATKA JO WAHAN SE AATA THA
   ───────────────────────────────────────────────────────────────
   Har phone ke browser mein uper pata likhne wali patti hoti hai
   jo neeche scroll karte waqt chhup jati hai aur uper karte hi
   wapas aa jati hai. Jis lamhe wo hilti hai, `window.innerHeight`
   ki qeemat badal jati hai — taqreeban sau pixel ka farq.

   Yahan ka poora hisaab usi qeemat par khara tha. Natija: patti
   hilte hi har chalti hui cheez ka hisaab ek dam badal jata,
   aur tasveerein apni jagah se chhalaang laga deti thin. Yehi wo
   "atakna" tha jo sirf phone par mehsoos hota tha — laptop par
   kabhi nahi, kyunke wahan patti hilti hi nahi.

   Ab qad ek dafa naap kar rakh liya jata hai, aur sirf tab dobara
   naapa jata hai jab sach much kuch badla ho: phone ghumaya jaye,
   ya qad mein sau pixel se zyada ka farq aaye (yani asli screen
   badli, mehz patti nahi). Patti apna kaam karti rahe — hamara
   hisaab ab us se nahi hilta.
   ═══════════════════════════════════════════════════════════════ */

let vh = 0;

function viewportHeight() {
  if (vh) return vh;
  vh = window.innerHeight || document.documentElement.clientHeight || 1;
  return vh;
}

if (typeof window !== 'undefined') {
  const remeasure = (force) => {
    const now = window.innerHeight || document.documentElement.clientHeight || 1;
    /* Sau pixel se kam ka farq = patti hili hai, screen nahi. Us ko
       nazar-andaz karna hi wo jhatka khatam karta hai. */
    if (force || !vh || Math.abs(now - vh) > 100) vh = now;
  };

  window.addEventListener('resize', () => remeasure(false), { passive: true });
  window.addEventListener(
    'orientationchange',
    () => window.setTimeout(() => remeasure(true), 120),
    { passive: true }
  );
}

/**
 * Writes a scroll progress value (0 → 1) into the CSS custom property
 * `--p` on the element you attach the returned ref to.
 *
 * Because `--p` is a CSS variable it inherits, so every child element
 * can read it too — that is how a whole section animates from one
 * number without React re-rendering anything.
 *
 * Two modes:
 *
 *   'cover' (default)
 *      0 when the element's top edge is at the bottom of the screen,
 *      1 when its bottom edge has left the top of the screen.
 *      Use for parallax and anything that should react as it passes by.
 *
 *   'pin'
 *      0 when the element's top reaches the top of the screen,
 *      1 when its bottom reaches the bottom of the screen.
 *      Use for tall sections with a `position: sticky` child —
 *      the progress then maps exactly to the pinned duration.
 *
 * @param {'cover'|'pin'} mode
 * @returns {import('react').RefObject<HTMLElement>}
 */
export function useScrollProgress(mode = 'cover') {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Reduced motion: freeze at a sensible resting value and do no work.
    if (prefersReducedMotion()) {
      el.style.setProperty('--p', '0.5');
      return undefined;
    }

    let last = -1;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const h = viewportHeight();
      let p;

      if (mode === 'pin') {
        const runway = rect.height - h;
        p = runway <= 0 ? 0 : clamp(-rect.top / runway, 0, 1);
      } else {
        p = clamp((h - rect.top) / (h + rect.height), 0, 1);
      }

      // Round to 3dp — stops us writing to the DOM for sub-pixel noise.
      const rounded = Math.round(p * 1000) / 1000;
      if (rounded !== last) {
        last = rounded;
        el.style.setProperty('--p', String(rounded));
      }
    };

    return subscribe(update);
  }, [mode]);

  return ref;
}

export default useScrollProgress;

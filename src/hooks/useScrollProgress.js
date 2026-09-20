'use client';

import { useEffect, useRef } from 'react';
import { subscribe } from '@/lib/scroll';
import { clamp, prefersReducedMotion } from '@/lib/utils';

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
      el.style.setProperty('--p', mode === 'pin' ? '0.5' : '0.5');
      return undefined;
    }

    let last = -1;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      let p;

      if (mode === 'pin') {
        const runway = rect.height - vh;
        p = runway <= 0 ? 0 : clamp(-rect.top / runway, 0, 1);
      } else {
        p = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
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

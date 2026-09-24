'use client';

import { usePathname } from 'next/navigation';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ONE ENTRANCE, EVERY ROUTE
 *  ─────────────────────────────────────────────────────────────
 *  Home, a collection, a product, the cart, the policies page —
 *  all of them now arrive the same way: a short rise and fade on
 *  the site's own easing curve. Consistency is the point. A shop
 *  where each page appears differently feels assembled out of
 *  parts; one where every page arrives identically feels made.
 *
 *  ── WHY A TEMPLATE AND NOT A LAYOUT ──
 *  Next.js keeps a `layout` mounted across navigations and rebuilds
 *  a `template` on each one. Because this element is new every
 *  time, its CSS animation plays on its own — no AnimatePresence,
 *  no exit bookkeeping, no library, and nothing to go wrong on a
 *  fast double-tap.
 *
 *  ── INTERACTIVITY IS NOT GATED ──
 *  The markup is in the DOM, hit-testable and keyboard-reachable
 *  from the first frame. Only `opacity` and `transform` move, and
 *  `pointer-events` is never touched — so a tap 80ms into the
 *  animation lands on the thing under the finger, not on nothing.
 *
 *  ── ORDER MATTERS ──
 *  This sits inside the root layout, so `ScrollTop` (which puts the
 *  new page at its top) runs first and this animation second. The
 *  page therefore rises into view already at the top, never from
 *  wherever the last page happened to be scrolled to.
 *
 *  Turning it off: `prefers-reduced-motion`, NEXT_PUBLIC_LUX_ANIM=off,
 *  or `localStorage.setItem('nsc-lux','off')`. All three are handled
 *  in styles/lux-anim.css.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Template({ children }) {
  const pathname = usePathname();

  /* `key` forces a fresh element per route even where React would
     happily reuse one, and `data-route` lets the home page opt into
     a plainer fade — its hero is already moving. */
  return (
    <div className="lux-page" data-route={pathname} key={pathname}>
      {children}
    </div>
  );
}

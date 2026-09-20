/* ═══════════════════════════════════════════════════════════════
   SHARED SCROLL LOOP
   ───────────────────────────────────────────────────────────────
   Every scroll-linked element on the page subscribes here instead of
   attaching its own scroll listener. That gives us ONE listener and
   ONE requestAnimationFrame callback for the whole site, no matter
   how many animated sections are on screen.

   Why it matters: ten sections with their own listeners means ten
   layout reads per scroll event and a janky page on a mid-range
   phone. This keeps it to one.
   ═══════════════════════════════════════════════════════════════ */

/** @type {Set<Function>} */
const subscribers = new Set();

let rafId = 0;
let bound = false;

function tick() {
  rafId = 0;
  // A copy guards against a subscriber unsubscribing mid-iteration.
  for (const fn of Array.from(subscribers)) {
    try {
      fn();
    } catch {
      /* one broken subscriber must never stop the others */
    }
  }
}

/** Coalesces many scroll events into a single frame of work. */
function request() {
  if (rafId) return;
  rafId = window.requestAnimationFrame(tick);
}

function bind() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  window.addEventListener('orientationchange', request, { passive: true });
}

/**
 * Runs `fn` on every scroll / resize frame.
 * @param {Function} fn
 * @returns {Function} unsubscribe
 */
export function subscribe(fn) {
  if (typeof window === 'undefined') return () => {};
  bind();
  subscribers.add(fn);
  fn(); // paint the correct value immediately, before the first scroll
  request();
  return () => {
    subscribers.delete(fn);
  };
}

/** Forces a recalculation — call after images load or layout changes. */
export function refresh() {
  if (typeof window !== 'undefined') request();
}

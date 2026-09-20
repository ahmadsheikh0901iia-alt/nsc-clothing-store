'use client';

import { useEffect } from 'react';

/**
 * Freezes background scrolling while an overlay (cart drawer, mobile
 * menu, search) is open, and restores the exact scroll position after.
 *
 * Counts how many overlays are open so closing one while another is
 * still open does not unlock the page early.
 */
let openCount = 0;
let savedY = 0;

export function useBodyLock(active) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;

    if (openCount === 0) {
      savedY = window.scrollY;
      document.body.dataset.locked = 'true';
      document.body.style.top = `-${savedY}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    openCount += 1;

    return () => {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) {
        delete document.body.dataset.locked;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, savedY);
      }
    };
  }, [active]);
}

export default useBodyLock;

'use client';

import { useEffect } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SERVICE WORKER LAGANA, AUR INSTALL KA PARWANA PAKARNA
 *  ─────────────────────────────────────────────────────────────
 *  Kuch dikhata nahi. Do kaam karta hai, dono khamoshi se.
 *
 *  1. `public/sw.js` ko chala deta hai — usi se Chrome install ki
 *     paishkash karta hai, aur signal jane par grahak ko apni
 *     dukaan ka apna paigham milta hai (browser ka bad-numa safha
 *     nahi).
 *
 *     Safha poora khulne ka intezar kiya jata hai. Warna service
 *     worker aur safhe ki tasveerein ek hi waqt mein network
 *     kheenchte hain, aur pehli nazar aane wali cheez der se aati
 *     hai — jo is dukaan mein sab se ahem lamha hai.
 *
 *  2. `beforeinstallprompt` ko pakar leta hai. Chrome ye parwana
 *     ek hi dafa bhejta hai, aur aksar us se PEHLE ke install ka
 *     khana bane. Agar koi us waqt sun na raha ho to wo hamesha
 *     ke liye zaya ho jata hai — aur install ka button kabhi
 *     nazar nahi aata.
 *
 *     Is liye ye qatar sab se pehle sunna shuru kar deti hai aur
 *     parwana `window.__nscInstallPrompt` mein rakh deti hai.
 *     Install wala khana baad mein bane, wahin se utha leta hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function PWA() {
  useEffect(() => {
    /* ── 2: parwana, foran ── */
    const onPrompt = (e) => {
      e.preventDefault();
      window.__nscInstallPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    /* ── 1: service worker, safhe ke baad ── */
    if (!('serviceWorker' in navigator)) {
      return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }

    let done = false;
    const register = () => {
      if (done) return;
      done = true;
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* Chup reh jayein. Service worker ek izafi sahulat hai —
           na chale to site bilkul theek chalti rehti hai. */
      });
    };

    if (document.readyState === 'complete') {
      window.setTimeout(register, 1200);
    } else {
      window.addEventListener('load', () => window.setTimeout(register, 1200), {
        once: true,
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  return null;
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SAFHA HAMESHA UPAR SE SHURU
 *  ─────────────────────────────────────────────────────────────
 *  Do alag maslay thay, aur dono ki wajah alag thi. Dono ka ilaj
 *  yahan hai.
 *
 *  ── MASLA 1: naya safha kholne par ──
 *  Aap kisi lambe safhe par neeche tak jaate, phir koi link
 *  kholte — aur naya safha apne AAKHIR se khulta.
 *
 *  Wajah: `html { scroll-behavior: smooth }` poori site par laga
 *  hua tha. Safha badalte waqt browser upar jaane ki koshish
 *  karta hai, magar "smooth" us koshish ko ek animation bana
 *  deta hai. Us animation ke darmiyan purana safha gayab hota
 *  hai, safhe ki lambai achanak chhoti ho jati hai, aur adhoori
 *  harkat wahin ruk jati hai — yani neeche. Wo qatar ab base.css
 *  aur components.css dono se nikal di gayi hai.
 *
 *  ── MASLA 2: REFRESH par ──
 *  Ye alag cheez hai, aur pehli dafa mein maine ise chhora tha.
 *
 *  Jab aap F5 dabate hain, browser aap ki purani jagah khud
 *  "restore" karta hai. Aam safhon par ye achhi baat hai. Magar
 *  yahan teen cheezein us ke khilaf hain: safha khulte hi teen
 *  second ka logo (Intro) aata hai, tasveerein baad mein aa kar
 *  lambai badal deti hain, aur hero ki video apni jagah leti
 *  hai. Browser purani jagah us waqt wapas rakhta hai jab safha
 *  abhi chhota hota hai — aur wo jagah neeche, footer par jaa
 *  parti hai.
 *
 *  Is liye ab hum browser se ye kaam le hi lete hain:
 *  `history.scrollRestoration = "manual"`. Jagah wapas rakhne ka
 *  faisla ab hamara hai, browser ka nahi.
 *
 *  ── PEECHE (BACK) JANA ──
 *  Wahan purani jagah par lautna hi theek hai, is liye `popstate`
 *  ke baad hum kuch nahi chherte aur browser ko apna kaam karne
 *  dete hain.
 * ═══════════════════════════════════════════════════════════════
 */
export default function ScrollTop() {
  const pathname = usePathname();

  /* Back / forward ka safar — us par haath nahi lagana. */
  const popped = useRef(false);

  /* ── Refresh aur pehli dafa khulna ──
     Ye sab se pehle chalta hai, safhe ke bunne se bhi pehle. */
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;

    const before = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = before;
    };
  }, []);

  /* ── Back / forward ka nishan ── */
  useEffect(() => {
    const onPop = () => {
      popped.current = true;
      window.setTimeout(() => {
        popped.current = false;
      }, 700);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* ── Har safhe par, aur refresh par bhi ──
     Ek dafa foran, phir agle do frame par, phir 400 ms baad ek
     aakhri dafa: tasveerein aur hero ki video us waqt tak apni
     jagah le chuki hoti hain, aur wohi lamha hai jab purana
     browser jagah wapas khiskata tha. */
  useEffect(() => {
    if (popped.current) return undefined;

    /* Safhe ke andar ka nishana (#delivery waghera) ho to wahin
       rehne dein — warna upar. */
    const hash = window.location.hash;
    if (hash && hash !== '#top') return undefined;

    const top = () => window.scrollTo(0, 0);

    top();

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      top();
      raf2 = window.requestAnimationFrame(top);
    });
    const late = window.setTimeout(top, 400);

    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
      window.clearTimeout(late);
    };
  }, [pathname]);

  return null;
}

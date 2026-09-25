'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SAFHA HAMESHA UPAR SE SHURU
 *  ─────────────────────────────────────────────────────────────
 *  Teen alag maslay thay. Teenon ka ilaj yahan hai.
 *
 *  ── MASLA 1: `scroll-behavior: smooth` ──
 *  Poori site par laga hua tha. Safha badalte waqt browser upar
 *  jaane ki koshish karta hai, magar "smooth" us koshish ko ek
 *  animation bana deta hai. Us animation ke darmiyan purana safha
 *  gayab hota hai, safhe ki lambai chhoti ho jati hai, aur adhoori
 *  harkat wahin ruk jati hai — yani neeche. Wo qatar base.css aur
 *  components.css dono se nikal di gayi.
 *
 *  ── MASLA 2: REFRESH ──
 *  F5 par browser aap ki purani jagah khud "restore" karta hai.
 *  Yahan Intro ka teen second ka logo, baad mein aane wali
 *  tasveerein aur hero ki video lambai badalte rehte hain — aur
 *  browser purani jagah us waqt rakhta hai jab safha abhi chhota
 *  hota hai. Wo jagah footer par jaa parti hai. Is liye ab
 *  `history.scrollRestoration = "manual"` — faisla hamara.
 *
 *  ── MASLA 3: PEHLE FOOTER, PHIR UPAR ──  ← ye ab theek hua
 *  Ye sab se zyada chubhne wala tha, aur meri apni ghalti thi.
 *
 *  Upar le jaane wala kaam `useEffect` mein tha. React `useEffect`
 *  ko browser ke SAFHA BANANE KE BAAD chalata hai. Yani tarteeb ye
 *  banti thi:
 *
 *     1. aap lambe safhe par neeche thay — maslan 3000px par
 *     2. link dabaya, naya safha bana
 *     3. browser ne use USI 3000px par PAINT kar diya
 *        → aap ko FOOTER nazar aaya
 *     4. ab useEffect chala aur upar phaink diya
 *        → jhatka
 *
 *  Ab wo kaam `useLayoutEffect` mein hai. Ye safha banne se PEHLE
 *  chalta hai — DOM tayyar ho chuka hota hai magar browser ne
 *  abhi kuch dikhaya nahi hota. Is liye qadam 3 hota hi nahi:
 *  pehli hi jhalak safhe ke SHURU ki hoti hai, aur us ke uper
 *  entrance animation chalti hai. Na footer, na jhatka.
 *
 *  `useLayoutEffect` server par nahi chal sakta, is liye neeche
 *  wala chhota sa switch — server par `useEffect`, browser par
 *  `useLayoutEffect`. React ka warning bhi nahi aata.
 *
 *  ── PEECHE (BACK) JANA ──
 *  Wahan purani jagah par lautna hi theek hai, is liye `popstate`
 *  ke baad hum kuch nahi chherte. `popstate` React ke dobara
 *  banne se pehle chalta hai, is liye nishan waqt par lag jata
 *  hai.
 * ═══════════════════════════════════════════════════════════════
 */

/* Server par layout-effect maujood hi nahi. */
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ScrollTop() {
  const pathname = usePathname();

  /* Back / forward ka safar — us par haath nahi lagana. */
  const popped = useRef(false);

  /* ── Jagah wapas rakhne ka faisla hamara, browser ka nahi ── */
  useIsoLayoutEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;

    const before = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = before;
    };
  }, []);

  /* ══════════════════════════════════════════════════════════
     LINK DABATE HI UPAR — YEHI ASLI ILAJ THA
     ──────────────────────────────────────────────────────────
     Maine pehle samjha tha ke naya safha paint hone se pehle
     upar le jana kaafi hai. Live site par naap kar dekha to
     baat is se bhi buri nikli.

     Asal mein hota ye tha (asli numbers, shop ke safhe se):

         click se pehle scroll:  6361
          40ms →  6361   footer screen par
          90ms →  6361   footer screen par
         150ms →  6361   footer screen par
         250ms →  6361   footer screen par
         400ms →  6361   footer screen par
         600ms →     0   ab ja kar upar

     Wajah: Next safha badalte waqt pehle naye safhe ka saman
     internet se mangwata hai. Us aadhe second mein PURANA safha
     apni purani jagah par khara rehta hai — aur agar aap neeche
     thay, to us poore arse mein PURANE safhe ka footer screen
     par hota hai. Naye safhe ka koi bhi code us waqt tak chala
     hi nahi hota, kyunke naya safha abhi aaya hi nahi.

     Is liye ab intezaar hi nahi kiya jata. Jis lamhe aap link
     dabate hain, usi lamhe safha upar. Link dabana ye keh dena
     hai ke "main ja raha hoon" — aur jo safha chhoot raha hai wo
     apne shuru se ruksat hota hai.

     `capture` phase: React ke apne handler se pehle chalta hai,
     is liye Next ke navigation shuru karne se bhi pehle.

     Jo chhora gaya hai, jaan boojh kar:
       · nayi tab (Ctrl/Cmd/Shift click, target="_blank")
       · download wale link
       · doosri website
       · usi safhe ka andaruni nishana (#delivery waghera)
       · wohi safha dobara
     ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target?.closest?.('a');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href || href[0] === '#') return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.hash) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      window.scrollTo(0, 0);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
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
     Pehla qadam PAINT SE PEHLE — yehi wo cheez hai jo footer ki
     jhalak khatam karti hai. Us ke baad agle do frame, aur 400 ms
     par ek aakhri dafa: tasveerein aur hero ki video tab tak apni
     jagah le chuki hoti hain, aur wohi lamha hai jab purana
     browser jagah wapas khiskata tha. */
  useIsoLayoutEffect(() => {
    if (popped.current) return undefined;

    /* Safhe ke andar ka nishana (#delivery waghera) ho to wahin
       rehne dein — warna upar. */
    const hash = window.location.hash;
    if (hash && hash !== '#top') return undefined;

    /* Kuch purane engine `window.scrollTo` ko layout ke darmiyan
       nazar-andaz kar dete hain; is liye teenon par seedha bhi. */
    const top = () => {
      window.scrollTo(0, 0);
      const de = document.documentElement;
      if (de && de.scrollTop) de.scrollTop = 0;
      if (document.body && document.body.scrollTop) document.body.scrollTop = 0;
    };

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

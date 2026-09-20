'use client';

import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   IS-IN — jab cheez nazar mein aaye
   ───────────────────────────────────────────────────────────────
   Element pehli dafa nazar mein aate hi `is-in` le leta hai, aur
   harkat khatam hone ke baad `is-done` — taake GPU ki teh chhor
   di jaye.

   ── DO KHARABIYAN, DONO ASLI ──

   1. `threshold: 0.18` ka matlab hai "element ka 18% nazar mein
      ho". Laptop par section screen se chhota hota hai, so 18%
      foran poora ho jata hai. Phone par wohi section screen se
      DO GUNA lamba ho jata hai — aur us ka 18% poora hone ke
      liye poori screen bhar jani parti hai. Neeche `-8%` ka
      margin ise aur mushkil kar deta tha. Natija: kuch khane
      phone par kabhi khulte hi nahi thay.

   2. IntersectionObserver hamesha jawab nahi deta. Maine ye khud
      chalti hui site par dekha: safhe par maujood element ke
      liye bhi observer ka callback kabhi kabhi aata hi nahi.
      Aisa us waqt hota hai jab browser ka "kya nazar mein hai"
      wala hisaab ruk jaye — battery saver, safha peechay hona,
      ya kuch phone ke browser ki apni adaa. Aur jab wo ruk jaye
      to poora safha khamosh khara reh jata hai: na koi jumla
      khulta hai, na koi tasveer.

   ── AB DO RAASTAY HAIN, EK PAR BHAROSA NAHI ──

   Pehla wohi observer — tez hai aur theek hai.

   Doosra ek chhota sa pehra: jo element abhi tak khula nahi, wo
   ek list mein rehta hai, aur har chauthai second us list ko
   naap kar dekha jata hai ke kya wo ab nazar mein aa gaya. Ye
   pehra POORI SITE KE LIYE EK hai — har element ka apna nahi —
   aur jis lamhe list khali hoti hai, wo apne aap band ho jata
   hai. Yani jab sab kuch khul chuka ho to us ka koi kharch hi
   nahi rehta.

   Faida: harkat ka chalna ab kisi ek cheez par munhasir nahi.
   Observer chale to foran, na chale to chauthai second mein.

   `is-done` waqt se lagta hai, `transitionend` se nahi:
   WordReveal mein har lafz apna transition chalata hai aur wo
   sab oopar bubble karte hain, is liye pehle lafz ka khatma
   poore jumle ka khatma samajh liya jata. Sab se lamba chain
   ~2.3 second ka hai; 3.5 us se aage hai.
   ═══════════════════════════════════════════════════════════════ */

/** Jo abhi khule nahi — poori site ke liye ek hi list. */
const waiting = new Map();
let sweepTimer = 0;

function visible(el) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  return r.bottom > 0 && r.top < vh * 0.92;
}

function sweep() {
  for (const [el, show] of waiting) {
    if (visible(el)) {
      waiting.delete(el);
      show();
    }
  }
  if (waiting.size === 0 && sweepTimer) {
    window.clearInterval(sweepTimer);
    sweepTimer = 0;
  }
}

/* Jaanch ke liye — chalte hue safhe par dekha ja sakta hai ke
   pehra kaam kar raha hai ya nahi. Koi kharch nahi. */
if (typeof window !== 'undefined') {
  window.__nscReveal = { waiting, version: 3 };
}

function watch(el, show) {
  waiting.set(el, show);
  if (!sweepTimer) sweepTimer = window.setInterval(sweep, 250);
}

function unwatch(el) {
  waiting.delete(el);
  if (waiting.size === 0 && sweepTimer) {
    window.clearInterval(sweepTimer);
    sweepTimer = 0;
  }
}

/**
 * @param {Object}  options
 * @param {number}  options.threshold  kitna nazar mein ho (0–1)
 * @param {string}  options.rootMargin trigger ka daira
 * @param {boolean} options.once       pehli dafa ke baad chhor dein
 * @returns {[import('react').RefObject<HTMLElement>, boolean]}
 */
export function useInView({
  threshold = 0.18,
  rootMargin = '0px 0px -6% 0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let doneTimer = 0;
    let shown = false;

    const show = () => {
      if (shown) return;
      shown = true;
      unwatch(el);
      el.classList.add('is-in');
      setInView(true);
      doneTimer = window.setTimeout(() => el.classList.add('is-done'), 3500);
    };

    // Bohat purana browser: sab dikha dein.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in', 'is-done');
      setInView(true);
      return undefined;
    }

    /* Khud naapne wala raasta. "Nazar mein" ka matlab: element
       screen ke andar hai, aur ya to us ka `threshold` hissa
       nazar mein hai, ya wo itna lamba hai ke aisa hona mumkin
       hi nahi (phone wali kharabi). */
    const enough = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.bottom <= 0 || r.top >= vh) return false;
      const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const need = Math.min(r.height * threshold, vh * 0.16);
      return seen >= Math.max(1, need);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && enough()) {
            if (once) observer.unobserve(entry.target);
            show();
          } else if (!once && !entry.isIntersecting) {
            shown = false;
            entry.target.classList.remove('is-in', 'is-done');
            setInView(false);
            watch(el, show);
          }
        });
      },
      { threshold: [0, 0.01, 0.08, Math.min(threshold, 0.5)], rootMargin }
    );

    observer.observe(el);

    // Doosra raasta — observer ke sath sath, us ke bharose nahi.
    if (visible(el)) show();
    else watch(el, show);

    return () => {
      observer.disconnect();
      unwatch(el);
      window.clearTimeout(doneTimer);
    };
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

export default useInView;

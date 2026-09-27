'use client';

import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════
   IS-IN — jab cheez nazar mein aaye
   ───────────────────────────────────────────────────────────────
   Element pehli dafa nazar mein aate hi `is-in` le leta hai, aur
   harkat khatam hone ke baad `is-done` — taake GPU ki teh chhor
   di jaye.

   ── CHAAR KHARABIYAN, CHAARON ASLI ──

   1. `threshold: 0.18` ka matlab hai "element ka 18% nazar mein
      ho". Laptop par section screen se chhota hota hai, so 18%
      foran poora ho jata hai. Phone par wohi section screen se
      DO GUNA lamba ho jata hai — aur us ka 18% poora hone ke
      liye poori screen bhar jani parti hai. Is liye `need` ko
      screen ki 16% par band kar diya gaya hai.

   2. IntersectionObserver hamesha jawab nahi deta. Chalti hui
      site par dekha gaya: safhe par maujood element ke liye bhi
      callback kabhi kabhi aata hi nahi — battery saver, safha
      peechay hona, ya kuch phone ke browser ki apni adaa. Is
      liye ek doosra raasta bhi hai: apna pehra.

   3. **JO CHEEZ NAZAR SE OOPAR NIKAL JAYE, WO KABHI NAHI KHULTI
      THI.** Ye sab se bari kharabi thi aur sab se der tak chhupi
      rahi. Pehla naapne wala hisaab kehta tha:

          r.bottom > 0 && r.top < vh * 0.92

      Yani "screen ke andar ho". Ab socheiye: ungli se tez scroll
      (momentum scroll phone par 3000px ek jhatke mein le jata
      hai), ya `#anchor` par chhalang, ya safhe ka apna scroll
      reset. Element beech ka poora safar TAY KAR CHUKA hota hai
      magar kisi naap mein nahi aata — na observer chala, na
      pehre ka chauthai second us lamhe par para. Aur jab wo
      oopar nikal jata hai to `r.bottom <= 0` ho jata hai, aur ye
      hisaab hamesha ke liye `false` dene lagta hai.

      Natija jo grahak ne dekha: bright mode mein "In Focus" ke
      neeche se footer tak SIRF SAFED SAFHA. Cheezein wahan
      maujood thin — `opacity: 0` par khari, hamesha ke liye.
      Dark mode mein bhi wohi hota tha, magar kaali zameen par
      ghayab aur kaali zameen mein farq nazar nahi aata.

      Ab qanoon ulta hai: jo oopar nikal chuka, us ka intezar
      karne ka koi matlab nahi — dikha do.

   4. Pehra chauthai second par chalta tha aur bas. Ab wo scroll
      ke sath bhi chalta hai (ek rAF par band), is liye tez
      scroll ke darmiyan koi khana chhoot nahi sakta.

   ── AUR EK NAYI CHEEZ: `enter` ──
   Pehle pehre ka apna hisaab tha jo `threshold` ko bilkul nahi
   dekhta tha: bas "screen ke andar ho". Is ki wajah se bari
   tasveerein safhe ke SAB SE NEECHE wale kinare par chhu kar hi
   khul jati thin — animation poora chal chuka hota tha jab
   grahak wahan pohanchta. Bridal wali tasveer ka yehi masla tha:
   "koi animation nazar hi nahi aati."

   Ab dono raaste EK hi naap istemal karte hain, aur us naap mein
   `enter` bhi hai: element ka sira screen ki is bulandi se oopar
   aana zaroori hai. Default 0.92 (pehle jaisa), magar jis
   tasveer ka khulna dekha jana chahiye wo `enter={0.66}` maang
   leti hai — yani "jab tak main do-tihai screen tak na aa jaun,
   shuru na karo".

   `is-done` waqt se lagta hai, `transitionend` se nahi:
   WordReveal mein har lafz apna transition chalata hai aur wo
   sab oopar bubble karte hain, is liye pehle lafz ka khatma
   poore jumle ka khatma samajh liya jata. Sab se lamba chain
   ~2.3 second ka hai; 3.5 us se aage hai.
   ═══════════════════════════════════════════════════════════════ */

/** Jo abhi khule nahi — poori site ke liye ek hi list.
 *  el -> { test, show } */
const waiting = new Map();

let sweepTimer = 0;
let rafId = 0;
let bound = false;

function sweep() {
  for (const [el, w] of waiting) {
    let ok = false;
    try {
      ok = w.test();
    } catch {
      /* Naap na ho sake to rok kar rakhna nuqsan hai, dikhana nahi. */
      ok = true;
    }
    if (ok) {
      waiting.delete(el);
      w.show();
    }
  }
  if (waiting.size === 0) stopWatching();
}

/* Scroll par bhi naapein — magar ek frame mein ek dafa se zyada
   nahi. Scroll ka event sau dafa fi second aa sakta hai; rAF us
   ko screen ki apni raftar par le aata hai. */
function kick() {
  if (rafId) return;
  rafId = window.requestAnimationFrame(() => {
    rafId = 0;
    sweep();
  });
}

function startWatching() {
  if (typeof window === 'undefined') return;
  if (!sweepTimer) sweepTimer = window.setInterval(sweep, 250);
  if (bound) return;
  bound = true;
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick, { passive: true });
  window.addEventListener('orientationchange', kick, { passive: true });
  document.addEventListener('visibilitychange', kick);
}

function stopWatching() {
  if (typeof window === 'undefined') return;
  if (sweepTimer) {
    window.clearInterval(sweepTimer);
    sweepTimer = 0;
  }
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
  if (bound) {
    bound = false;
    window.removeEventListener('scroll', kick);
    window.removeEventListener('resize', kick);
    window.removeEventListener('orientationchange', kick);
    document.removeEventListener('visibilitychange', kick);
  }
}

function watch(el, show, test) {
  waiting.set(el, { show, test });
  startWatching();
}

function unwatch(el) {
  waiting.delete(el);
  if (waiting.size === 0) stopWatching();
}

/* Jaanch ke liye — chalte hue safhe par console mein dekha ja
   sakta hai ke kitni cheezein abhi intezar mein hain. Koi kharch
   nahi.
     window.__nscReveal.waiting.size
     window.__nscReveal.flush()      ← sab kuch foran khol do  */
if (typeof window !== 'undefined') {
  window.__nscReveal = {
    waiting,
    version: 4,
    flush() {
      for (const [el, w] of waiting) {
        waiting.delete(el);
        w.show();
      }
      stopWatching();
      return 'done';
    },
  };
}

/**
 * @param {Object}  options
 * @param {number}  options.threshold  kitna nazar mein ho (0–1)
 * @param {string}  options.rootMargin observer ka daira
 * @param {number}  options.enter      sira screen ki is bulandi se
 *                                     oopar aaye (0–1). 0.92 =
 *                                     "neeche ke kinare par hi",
 *                                     0.60 = "aadhi screen tak aa
 *                                     jaye phir chalo".
 * @param {boolean} options.once       pehli dafa ke baad chhor dein
 * @returns {[import('react').RefObject<HTMLElement>, boolean]}
 */
export function useInView({
  threshold = 0.18,
  rootMargin = '0px 0px -6% 0px',
  enter = 0.92,
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

    /* ── EK HI NAAP, DONO RAASTON KE LIYE ──
       Pehle observer ka naap aur pehre ka naap alag thay, aur
       pehra kabhi kabhi observer se pehle chal parta tha. Ab
       dono yehi poochte hain. */
    const enough = () => {
      const r = el.getBoundingClientRect();

      /* Abhi layout hi nahi hua — agli baari dekhein ge. */
      if (r.width === 0 && r.height === 0) return false;

      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      if (!vh) return true;

      /* ── YEHI WO EK QATAR HAI JO BRIGHT MODE KA SAFED SAFHA
             THEEK KARTI HAI ──
         Element ka sira screen ke oopar se guzar chuka. Ab wo ya to
         poora bhar chuka hai (lamba section), ya nikal chuka hai
         (chhota khana). Dono soorat mein intezar ka koi matlab
         nahi — dikha do.

         Pehle ye shart `r.bottom <= 0` thi, aur wo aik 1–107px ka
         sooraakh chhor deti thi: jis lamhe element ka sirf thora sa
         hissa oopar bacha ho, `seen` (1px) `need` (108px) se kam
         hota, aur agar grahak theek wahan ruk jata to wo patti
         screen ke sab se oopar khali reh jati. `r.top <= 0` wo
         sooraakh bhi band kar deti hai. */
      if (r.top <= 0) return true;

      /* Abhi bohat neeche hai. */
      if (r.top >= vh * enter) return false;

      const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const need = Math.min(r.height * threshold, vh * 0.16);
      return seen >= Math.max(1, need);
    };

    // Bohat purana browser: sab dikha dein.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in', 'is-done');
      setInView(true);
      return undefined;
    }

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
            watch(el, show, enough);
          }
        });
      },
      { threshold: [0, 0.01, 0.08, Math.min(threshold, 0.5)], rootMargin }
    );

    observer.observe(el);

    // Doosra raasta — observer ke sath sath, us ke bharose nahi.
    if (enough()) show();
    else watch(el, show, enough);

    return () => {
      observer.disconnect();
      unwatch(el);
      window.clearTimeout(doneTimer);
    };
  }, [threshold, rootMargin, enter, once]);

  return [ref, inView];
}

export default useInView;

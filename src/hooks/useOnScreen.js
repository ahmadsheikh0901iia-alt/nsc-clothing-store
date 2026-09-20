'use client';

import { useEffect, useRef } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  NAZAR MEIN HAI YA NAHI
 *  ─────────────────────────────────────────────────────────────
 *  Jis element par ye ref lage, us par `data-run="true"` ya
 *  `"false"` likhta rehta hai — is hisaab se ke wo is waqt screen
 *  par hai ya nahi.
 *
 *  `useInView` se alag kyun: wo ek dafa chal kar bhool jata hai
 *  (`once`), aur uska maqsad "aa gaya" batana hai. Ye dono simton
 *  mein kaam karta hai — kyunke ruki hui cheez ko dobara chalana
 *  bhi utna hi zaroori hai jitna chalti hui ko rokna.
 *
 *  Class ki jagah `data-` khaana is liye ke CSS is ko seedha parh
 *  leti hai aur React ko koi dobara render nahi karna parta.
 *
 *  `rootMargin` thora khula rakha hai: patti screen par aane se
 *  zara pehle chal parti hai, taake kinare par aate hi harkat
 *  shuru hoti hui na dikhe.
 * ═══════════════════════════════════════════════════════════════
 */
export default function useOnScreen({ rootMargin = '200px 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    /* ── PEHLE CHALAO, PHIR ROKO ──
       Shuru mein `data-run` likha hi nahi jata tha, aur wo
       observer ke pehle jawab ka intezar karta tha. Agar wo jawab
       kabhi aaya hi nahi — aur battery saver ya peechay khule
       hue safhe par aisa waqai hota hai — to patti hamesha ke
       liye khari reh jati thi.

       Ab pehle hi lamhe mein "chal" likh diya jata hai. Observer
       ka kaam sirf ye reh gaya hai ke jab cheez nazar se hat
       jaye to usay rok de. Yani sab se bura anjaam ye hai ke koi
       patti nazar se bahar bhi chalti rahe — us se behtar hai
       nisbat is ke ke wo nazar ke saamne bhi khari rahe. */
    el.dataset.run = 'true';

    if (typeof IntersectionObserver === 'undefined') return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) el.dataset.run = entry.isIntersecting ? 'true' : 'false';
      },
      { rootMargin, threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return ref;
}

'use client';

import { useEffect, useRef } from 'react';
import Marquee from '@/components/motion/Marquee';
import { RIBBON } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE RIBBON — AB EK 3D PATTI
 *  ─────────────────────────────────────────────────────────────
 *  Pehle ye ek saada chalta hua jumla tha. Ab wohi patti ek asli
 *  3D takhta hai, aur us mein teen cheezein sath chalti hain:
 *
 *  1. GEHRAI — do parte, ek doosre ke peeche. Peechay wali patti
 *     `translateZ(-120px)` par hai, dhundli aur ulti simt mein
 *     dheere chalti hui. Aage wali saaf aur tez. Aankh ko yahi
 *     do raftaron ka farq "gehrai" mehsoos karata hai.
 *
 *  2. SCROLL KE SATH JHUKAO — jaise jaise patti screen se guzarti
 *     hai, wo apne mehwar par jhukti hai: neeche hoti hai to
 *     upar ki taraf, beech mein aa kar seedhi, aur upar jate hue
 *     doosri taraf. Ye `--tilt` se hota hai, jo scroll par
 *     JavaScript rakhta hai aur baqi kaam CSS karti hai.
 *
 *  3. CHAMAK — pehle ki tarah, shishe par se guzarti roshni.
 *
 *  ── RAFTAAR KA KHYAL ──
 *  Scroll par har dafa hisaab nahi hota: `requestAnimationFrame`
 *  ek waqt mein ek hi baari deta hai, aur sirf ek CSS qeemat
 *  badalti hai — layout dobara nahi banta.
 *
 *  `window.innerHeight` jaan boojh kar yaad rakha jata hai. Phone
 *  par pata-patti chhupne se ye naap ~100px badal jata hai; har
 *  frame par parhte to patti har scroll par jhatka khati. Ab ye
 *  sirf tab dobara napa jata hai jab screen WAQAI badle —
 *  orientation, ya 100px se bara farq.
 *
 *  Jise harkat se taklif ho, us ke liye kuch nahi chalta: na
 *  jhukao lagta hai, na hisaab hota hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Ribbon({ items = RIBBON, duration = 48, reverse = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let vh = window.innerHeight;
    let raf = 0;

    const measure = () => {
      const box = el.getBoundingClientRect();
      /* Patti ka markaz screen ke markaz se kitna door hai:
         +1 = bilkul neeche, 0 = beech mein, -1 = bilkul upar */
      const middle = box.top + box.height / 2;
      const span = vh / 2 + box.height / 2;
      const t = span > 0 ? (middle - vh / 2) / span : 0;
      el.style.setProperty('--tilt', String(Math.max(-1, Math.min(1, t))));
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };

    const onResize = () => {
      /* Sirf asli tabdeeli — pata-patti chhupne par nahi */
      if (Math.abs(window.innerHeight - vh) < 100) return;
      vh = window.innerHeight;
      onScroll();
    };

    const onTurn = () => {
      vh = window.innerHeight;
      onScroll();
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onTurn);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onTurn);
    };
  }, []);

  return (
    <div className="ribbon ribbon-3d" ref={ref}>
      <div className="ribbon-stage">
        {/* Peechay wali parat — dhundli, ulti simt, dheemi */}
        <div className="ribbon-face ribbon-back" aria-hidden="true">
          <Marquee items={items} duration={Math.round(duration * 1.7)} reverse={!reverse} />
        </div>

        {/* Aage wali parat — yehi parhi jati hai */}
        <div className="ribbon-face ribbon-front">
          <Marquee items={items} duration={duration} reverse={reverse} />
        </div>
      </div>

      <span className="ribbon-sheen" aria-hidden="true" />
    </div>
  );
}

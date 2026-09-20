'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ScrollScene from '@/components/motion/ScrollScene';
import { WORKFLOW } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE FLOOR — paanch qadam, paanch tasveerein
 *  ─────────────────────────────────────────────────────────────
 *  Safhe ka asal hissa. Baayein taraf ek hi tasveer ka khana hai
 *  jo screen ke sath chipka rehta hai; daayein taraf paanch qadam
 *  guzarte hain. Jis qadam par nazar hoti hai, us ki tasveer khud
 *  saamne aa jati hai — baqi neeche dab jati hain.
 *
 *  Is tarah do cheezein ek sath hoti hain: parhne wala ruk kar
 *  parhta hai, aur dekhne wale ko kaam chalta hua nazar aata hai.
 *
 *  ── KAAM KESE KARTA HAI ──
 *
 *  1. Har qadam par ek IntersectionObserver baitha hai jis ka
 *     `rootMargin` screen ko beech mein ek patli lakeer bana deta
 *     hai. Jo qadam us lakeer ko chhoota hai, wohi "abhi wala"
 *     ban jata hai. Scroll par koi hisaab nahi hota — is liye
 *     ungli tez chale ya dheemi, khana kabhi hilta nahi.
 *
 *  2. Tasveerein sab ek hi jagah par, ek dusre ke oopar rakhi
 *     hain. Sirf `data-on` badalta hai; CSS opacity aur halka sa
 *     scale sambhal leti hai. Koi tasveer dobara load nahi hoti.
 *
 *  3. Bayein rail ka sunehra hissa `--p` se bharta hai — ye
 *     ScrollScene ka apna number hai, observer se alag. Do alag
 *     ishare, ek hi manzar.
 *
 *  Jise harkat se taklif ho: motion.css sab transitions band kar
 *  deti hai, aur qadam phir bhi poore parhe ja sakte hain.
 * ═══════════════════════════════════════════════════════════════
 */
export default function AtelierFlow({ steps = WORKFLOW }) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    /* Faisla hamesha ek hi tareeqe se hota hai: jo qadam screen ke
       beech ke sab se qareeb hai, wohi chalta hua qadam hai.

       Observer ka kaam sirf ye batana hai ke "ab dobara dekho" —
       kaun sa qadam chuna jaye, ye entries ki tarteeb par nahi
       chhora. Tez scroll par do qadam ek sath aa jayen to bhi
       natija wohi rehta hai jo aankh dekh rahi hai. */
    const pick = () => {
      const middle = window.innerHeight / 2;
      let best = 0;
      let bestGap = Infinity;

      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect();
        const gap = Math.abs(r.top + r.height / 2 - middle);
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      });

      setActive(best);
    };

    // Safha beech se khule (back button, ya seedha link) to bhi
    // pehli hi nazar mein theek qadam roshan ho.
    pick();

    if (typeof IntersectionObserver === 'undefined') {
      window.addEventListener('scroll', pick, { passive: true });
      return () => window.removeEventListener('scroll', pick);
    }

    // Screen ke beech mein ek patli patti — koi qadam use chhuye to
    // dobara hisaab hota hai. Scroll par har frame kaam nahi hota.
    const io = new IntersectionObserver(pick, {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    });

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <ScrollScene className="atflow" mode="cover">
      <div className="container atflow-inner">
        {/* ── Baayein: chipki hui tasveer ── */}
        <div className="atflow-media">
          <div className="atflow-stack">
            {steps.map((s, i) => (
              <span
                className="atflow-shot"
                key={s.step}
                data-on={i === active ? 'true' : 'false'}
                aria-hidden={i === active ? undefined : 'true'}
              >
                <Image
                  quality={92}
                  src={s.image}
                  alt={i === active ? s.alt : ''}
                  width={900}
                  height={1200}
                  sizes="(max-width: 900px) 100vw, 46vw"
                  priority={i === 0}
                />
              </span>
            ))}

            {/* Konon ke sunehri nishan — frame ko dais bana dete hain */}
            <span className="atflow-edge" aria-hidden="true" />

            {/* Abhi kaun sa qadam chal raha hai */}
            <span className="atflow-tag caps" aria-hidden="true">
              <b className="num">{steps[active]?.step}</b>
              {steps[active]?.note}
            </span>
          </div>
        </div>

        {/* ── Daayein: guzarte hue qadam ── */}
        <ol className="atflow-steps">
          <span className="atflow-rail" aria-hidden="true" />

          {steps.map((s, i) => (
            <li
              className="atflow-step"
              key={s.step}
              data-i={i}
              data-on={i === active ? 'true' : 'false'}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
            >
              <span className="atflow-n num" aria-hidden="true">
                {s.step}
              </span>

              <h3 className="atflow-t">{s.title}</h3>
              <p className="atflow-b">{s.body}</p>

              {/* Chhoti screen par tasveer qadam ke sath hi aati hai,
                  kyunke wahan chipkane ki jagah nahi hoti. */}
              <span className="atflow-inline" aria-hidden="true">
                <Image
                  quality={92}
                  src={s.image}
                  alt=""
                  width={900}
                  height={1200}
                  sizes="100vw"
                  loading="lazy"
                />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { subscribe } from '@/lib/scroll';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  UPAR JANE WALA BUTTON
 *  ─────────────────────────────────────────────────────────────
 *  Pehle ye footer ki aakhri qatar mein ek chhota sa "Top" tha.
 *  Phone par wo qatar tang par jati thi aur ye lafz WhatsApp ke
 *  gol button ke neeche chhup jata tha — nazar hi nahi aata tha.
 *
 *  Ab ye safhe ke neeche BAAYEIN kone mein rehta hai — WhatsApp
 *  ke theek saamne — aur bilkul usi tarah chalta hai:
 *
 *    · neeche se uthta hua aata hai jab aap fold se aage jayein
 *    · pehli dafa aate hi ek sunehri lakeer khud apna daira
 *      bana leti hai — sirf ek martaba
 *    · chhoone par apna naam khol deta hai
 *    · tez daba dein to daira bhar kar wapas khali ho jata hai
 *
 *  Ek hi scroll loop poori site mein chalta hai (lib/scroll.js),
 *  is liye ye button apna alag listener nahi lagata — phone par
 *  koi bojh nahi parta.
 * ═══════════════════════════════════════════════════════════════
 */
export default function BackToTop() {
  const { cartOpen, searchOpen, menuOpen } = useStore();

  const [past, setPast] = useState(false);
  const [signed, setSigned] = useState(false);
  const [lifting, setLifting] = useState(false);
  const drawn = useRef(false);

  /* Wohi hadd jo WhatsApp wale button ki hai, taake dono ek sath
     aayein — ek pehle ek baad mein nahi. */
  useEffect(() => {
    const update = () => setPast(window.scrollY > 420);
    update();
    return subscribe(update);
  }, []);

  /* Lakeer ek hi dafa khinchti hai, phir khamosh. */
  useEffect(() => {
    if (!past || drawn.current) return;
    drawn.current = true;
    const t = window.setTimeout(() => setSigned(true), 260);
    return () => window.clearTimeout(t);
  }, [past]);

  const hidden = cartOpen || searchOpen || menuOpen;
  const shown = past && !hidden;

  const toTop = () => {
    setLifting(true);
    window.setTimeout(() => setLifting(false), 700);

    /* `scroll-behavior: smooth` ab html par nahi hai — wo safha
       badalte waqt neeche chhor deta tha. Narmi ab sirf yahan,
       jahan sach much chahiye. Jis phone ko `behavior` samajh na
       aaye, wahan seedha upar chala jata hai — lekin chala zaroor
       jata hai. */
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={toTop}
      className="top-fab"
      data-in={shown ? 'true' : 'false'}
      data-signed={signed ? 'true' : 'false'}
      data-lift={lifting ? 'true' : 'false'}
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg className="top-fab-ring" viewBox="0 0 56 56" aria-hidden="true">
        <circle className="top-fab-ring-base" cx="28" cy="28" r="26.5" />
        <circle className="top-fab-ring-draw" cx="28" cy="28" r="26.5" pathLength="1" />
      </svg>

      <span className="top-fab-mark" aria-hidden="true">
        <ArrowRight width={19} height={19} />
      </span>

      <span className="top-fab-label">
        <span>Top</span>
      </span>
    </button>
  );
}

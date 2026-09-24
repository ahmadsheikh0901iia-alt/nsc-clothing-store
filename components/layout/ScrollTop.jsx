'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ═══════════════════════════════════════════════════════════════
 *  NAYA SAFHA HAMESHA UPAR SE SHURU
 *  ─────────────────────────────────────────────────────────────
 *  Masla ye tha: aap kisi lambe safhe par neeche tak jaate, phir
 *  koi section ya link kholte — aur naya safha apne AAKHIR se
 *  khulta. Har dafa khud scroll kar ke upar aana parta tha.
 *
 *  Wajah do thin, aur dono ka ilaj yahan hai:
 *
 *  1. `html { scroll-behavior: smooth }` poori site par laga hua
 *     tha. Safha badalte waqt browser upar jaane ki koshish karta
 *     hai, magar "smooth" us koshish ko ek animation bana deta
 *     hai. Us animation ke darmiyan purana safha gayab hota hai,
 *     safhe ki lambai achanak chhoti ho jati hai, aur adhoori
 *     harkat wahin ruk jati hai — yani neeche. Wo qatar ab
 *     base.css se nikal di gayi hai; narmi sirf "Top" button mein
 *     rakhi hai, jahan sach much chahiye.
 *
 *  2. Browser purani jagah "restore" karne ki koshish bhi karta
 *     hai. Ye qatar naye safhe par sifar par le aati hai — do
 *     dafa: foran, aur agle frame par bhi (kyunke tasveerein baad
 *     mein aati hain aur lambai badal deti hain).
 *
 *  Peeche (back) jaane par kuch nahi chherta — wahan purani jagah
 *  par lautna hi theek hai, aur browser wo khud kar leta hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function ScrollTop() {
  const pathname = usePathname();

  /* Back / forward ka safar — us par haath nahi lagana. */
  const popped = useRef(false);
  /* Pehli dafa safha khulne par kuch karne ki zaroorat nahi. */
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
      /* Agla render ho jane ke baad nishan utar dein. */
      window.setTimeout(() => {
        popped.current = false;
      }, 700);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (popped.current) return;

    /* Safhe ke andar ka nishana (#delivery waghera) ho to wahin
       rehne dein — warna upar. */
    if (window.location.hash && window.location.hash !== '#top') return;

    const top = () => window.scrollTo(0, 0);

    top();
    const raf = window.requestAnimationFrame(() => {
      top();
      window.requestAnimationFrame(top);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

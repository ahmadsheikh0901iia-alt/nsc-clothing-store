'use client';

import { useEffect, useState } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  DARWAZA — safha khulte hi logo
 *  ─────────────────────────────────────────────────────────────
 *  Har dafa jab site khulti hai ya refresh hoti hai, poore safhe
 *  par ek gehri teh aati hai aur us ke theek beech mein logo
 *  khulta hai.
 *
 *  ── TARTEEB BADLI GAYI HAI ──
 *  Pehle logo neeche se mask ke zariye "bharta" tha, aur us
 *  dauran wo adhoora nazar aata tha. Ab pehle wo POORA aata hai
 *  — narmi se ubhar kar, ek hi sanse mein — aur us ke BAAD
 *  harkat hoti hai: oopar se sunehri chamak guzarti hai aur
 *  neeche ek baal jaisi lakeer dono taraf khinchti hai.
 *
 *  ── BEECH MEIN, WAQAI BEECH MEIN ──
 *  Pehle lakeer alag se, hisaab laga kar rakhi gayi thi (`top:
 *  50% + …`), aur isi wajah se wo kabhi kabhi ek taraf ho jati
 *  thi. Ab logo aur lakeer ek hi khare column ke andar hain, aur
 *  wo column screen ke beech mein rakha jata hai. Yani dono
 *  hamesha ek hi markaz par — kisi hisaab ki zaroorat nahi.
 *
 *  ── TEEN FAISLE JO AHEM HAIN ──
 *
 *  1. Ye teh SERVER par bhi bunti hai, client par baad mein
 *     nahi. Warna ek lamhe ke liye site nazar aati, phir teh
 *     girti — jo bad-numa lagta hai.
 *
 *  2. Ghayab hone ka kaam CSS karti hai, JavaScript nahi.
 *     `animation: … forwards` teh ko khud le jata hai. Is liye
 *     agar JavaScript kisi wajah se chale hi na, tab bhi koi
 *     shakhs teh ke peechay phansa nahi rehta. JavaScript sirf
 *     baad mein is ko DOM se nikalti hai.
 *
 *  3. Jise harkat se taklif ho, us ke liye ye taqreeban foran
 *     guzar jata hai — poora intezar us par thopa nahi jata.
 *
 *  Splash par sirf nishan hai (larki + Nsc), us ke liye alag
 *  file hai: /logo-mark.png.
 * ═══════════════════════════════════════════════════════════════
 */

/** CSS ki `intro-panel` isi ke barabar hai — dono ek saath badlein. */
const SPLASH_MS = 3600;

export default function Intro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // CSS pehle hi ise nazar se hata chuki hoti hai; ye sirf
    // safai hai taake teh DOM par bojh na bane.
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => setGone(true), still ? 700 : SPLASH_MS + 300);
    return () => window.clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div className="intro" aria-hidden="true">
      <span className="intro-glow" />

      <div className="intro-stack">
        <span className="intro-mark">
          {/* next/image jaan boojh kar nahi — ye pehle frame par
              chahiye, kisi optimiser ke intezar ke baghair. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={477} height={501} decoding="sync" />
          <span className="intro-sheen" />
        </span>

        <span className="intro-rule" />
      </div>
    </div>
  );
}

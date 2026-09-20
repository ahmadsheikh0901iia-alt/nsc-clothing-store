'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { subscribe } from '@/lib/scroll';
import { STORE, whatsappLink } from '@/lib/constants';
import { WhatsAppMark } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  FLOATING WHATSAPP BUTTON
 *  ─────────────────────────────────────────────────────────────
 *  Is market mein zyadatar order WhatsApp ki baat-cheet mein tay
 *  hote hain, is liye us tak pohanchna kabhi ek angoothe se door
 *  nahi hona chahiye. Magar us ka matlab ye nahi ke kone mein
 *  wohi bhadda hara gola tanga jaye jo har doosri site par hai.
 *
 *  ── IS KA APNA MIZAAJ ──
 *
 *  Ek gehra chakkar, jis par sirf ek baal barabar sunehri lakeer.
 *  Jab ye pehli dafa nazar aata hai to wo lakeer khud ko chaar
 *  saikand mein poora likhti hai — bilkul aise jaise kaghaz par
 *  qalam se ek daira khincha jaye. Wo dastkhat ek hi dafa hoti
 *  hai. Uske baad ye khamosh baith jata hai.
 *
 *  Sath ek chhoti si sabz nabz — wohi "Open 24/7" ka wada, magar
 *  likha hua nahi, dikhaya hua.
 *
 *  Hover par naam daayein se nahi, ANDAR se khulta hai: chakkar
 *  phail kar goli ban jata hai aur "WhatsApp" us ke andar se
 *  nikal aata hai.
 *
 *  ── Aur wohi teen pabandiyan jo pehle thin ──
 *  · Hero ke oopar chhupa rehta hai (wahan scroll cue ka haq hai)
 *  · Koi bhi overlay khule to gayab
 *  · Phone par sirf nishan, naam nahi
 * ═══════════════════════════════════════════════════════════════
 */
export default function WhatsAppButton() {
  const { cartOpen, searchOpen, menuOpen } = useStore();
  const [past, setPast] = useState(false);
  const [signed, setSigned] = useState(false);
  const drawn = useRef(false);

  useEffect(() => {
    const update = () => setPast(window.scrollY > 420);
    update();
    return subscribe(update);
  }, []);

  /* Dastkhat sirf ek dafa — pehli dafa nazar aane par. */
  useEffect(() => {
    if (!past || drawn.current) return;
    drawn.current = true;
    const t = window.setTimeout(() => setSigned(true), 260);
    return () => window.clearTimeout(t);
  }, [past]);

  const hidden = cartOpen || searchOpen || menuOpen;
  const shown = past && !hidden;

  const message = `Assalam o alaikum! I found ${STORE.name} online and wanted to ask about an order.`;

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      className="wa-fab"
      data-in={shown ? 'true' : 'false'}
      data-signed={signed ? 'true' : 'false'}
      aria-label={`Message ${STORE.name} on WhatsApp — ${STORE.hoursShort}`}
      tabIndex={shown ? 0 : -1}
    >
      {/* Wo lakeer jo khud ko likhti hai */}
      <svg className="wa-fab-ring" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
        <circle className="wa-fab-ring-base" cx="28" cy="28" r="26.5" />
        <circle className="wa-fab-ring-draw" cx="28" cy="28" r="26.5" pathLength="1" />
      </svg>

      <span className="wa-fab-mark" aria-hidden="true">
        <WhatsAppMark width={21} height={21} />
      </span>

      <span className="wa-fab-label">
        <span>WhatsApp</span>
      </span>

      {/* Zinda hone ka nishan — "Open 24/7", likha nahi, dikhaya hua */}
      <span className="wa-fab-live" aria-hidden="true" />
    </a>
  );
}

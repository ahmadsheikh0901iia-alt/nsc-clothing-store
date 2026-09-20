'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ADMIN KA SHORTCUT
 *  ─────────────────────────────────────────────────────────────
 *  Site ke kisi bhi safhe par:
 *
 *      Alt + A          →  /admin
 *      a-d-m-i-n likhna →  /admin
 *
 *  Doosra tareeqa un logon ke liye hai jinhein combination yaad
 *  nahi rehta — bas "admin" type kar dein, jaise kisi list mein
 *  kuch dhoondte hain.
 *
 *  ── TEEN EHTIYAT ──
 *
 *  1. Jab aap kisi khane mein likh rahe hon — search, checkout ka
 *     form, admin ka apna password — tab ye khamosh rehta hai.
 *     Warna "admin" likhte hi safha badal jata, jo bilkul ghalat
 *     hota.
 *
 *  2. Har harf ke beech deed second se ziyada ho jaye to ginti
 *     saaf. "admin" jaan boojh kar likha jaye tab hi chalta hai,
 *     ittefaq se nahi.
 *
 *  3. Ye sirf raasta hai, chabi nahi. /admin par password ke
 *     baghair kuch nazar nahi aata — panel ka koi hissa, na data
 *     na markup, us tak jata hi nahi jo login nahi hai. Is liye
 *     shortcut ka kisi aur ko pata chal jana bhi koi khatra nahi.
 * ═══════════════════════════════════════════════════════════════
 */

const WORD = 'admin';
const GAP = 1500; // do harfon ke darmiyan zyada se zyada waqt

/** Kya is waqt user kisi khane mein likh raha hai? */
function isTyping(target) {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable === true
  );
}

export default function AdminShortcut() {
  const router = useRouter();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let typed = '';
    let last = 0;
    let timer = null;

    const go = () => {
      typed = '';
      setFlash(true);
      timer = setTimeout(() => {
        setFlash(false);
        router.push('/admin');
      }, 420);
    };

    const onKey = (e) => {
      if (isTyping(e.target)) return;

      // ── Alt + A ──
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        go();
        return;
      }

      // ── "admin" likhna ──
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key.length !== 1) return;

      const now = Date.now();
      if (now - last > GAP) typed = '';
      last = now;

      typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      if (typed === WORD) go();
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  if (!flash) return null;

  /* Ek lamhe ki tasdeeq — taake shortcut lagne ka pata chale aur
     safha achanak na badle. */
  return (
    <div className="admin-flash" role="status" aria-live="polite">
      <span>Opening admin…</span>
    </div>
  );
}

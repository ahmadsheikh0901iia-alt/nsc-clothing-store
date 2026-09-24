'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { CheckIcon, PlusIcon } from '@/components/ui/Icons';
import { STORE } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  NSC — PHONE PAR
 *  ─────────────────────────────────────────────────────────────
 *  Site ko phone ki home screen par apne icon ke sath laga dena.
 *  Khulne par na pata-patti, na browser ke button — poori screen,
 *  bilkul app ki tarah.
 *
 *  ── TEEN SOORATEIN, TEEN JAWAB ──
 *  Ye khana khud dekh leta hai ke grahak kis haal mein hai, aur
 *  usi hisaab se apni shakl badal leta hai. Ek hi khana, teen
 *  chehre — kyunke Android aur iPhone is kaam ko bilkul alag
 *  tarah karte hain:
 *
 *  1. PEHLE SE LAGI HUI — grahak abhi app hi ke andar hai.
 *     `display-mode: standalone` se pata chal jata hai. Us ko
 *     lagane ka button dikhana bewaqoofi hai, is liye ek chhoti
 *     si tasdeeq milti hai aur baat khatam.
 *
 *  2. ANDROID / CHROME — browser khud hamein ek parwana deta hai
 *     (`beforeinstallprompt`). Hum us ko rok kar mehfooz kar
 *     lete hain aur apna button dikhate hain; grahak dabata hai
 *     to wohi parwana khol dete hain. Yani install seedha yahin
 *     se, kisi menu mein dhoondhe baghair.
 *
 *  3. iPHONE — Apple ne wo parwana aaj tak nahi diya. Safari par
 *     ek hi raasta hai: Share ka nishan, phir "Add to Home
 *     Screen". Is liye wahan button ke bajaye teen qadam dikhaye
 *     jate hain, us nishan ki asli shakl ke sath — kyunke lafzon
 *     se batana ke "murabba jis mein se teer nikal raha hai"
 *     kaam nahi karta.
 *
 *  ── EK IMANDARANA BAAT ──
 *  Icon ke NEECHE jo naam likha aata hai wo phone khud likhta
 *  hai (manifest ka `short_name`). Use poori tarah hatane ka koi
 *  tareeqa maujood nahi — na Android par, na iPhone par. Is liye
 *  wo sab se chhota rakha gaya hai: sirf "NSC". Icon khud saaf
 *  hai — us par koi lafz nahi, sirf dukaan ka apna nishan.
 * ═══════════════════════════════════════════════════════════════
 */

/** iPhone / iPad — aur wo iPad bhi jo khud ko Mac batata hai. */
function isApple() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}

/** App ke tor par khuli hui hai ya browser ke andar? */
function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallApp({ heading = true }) {
  /* 'wait' = abhi faisla nahi hua; jab tak kuch dikhana nahi */
  const [mode, setMode] = useState('wait'); // wait | prompt | ios | done
  const [deferred, setDeferred] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isStandalone()) {
      setMode('done');
      return undefined;
    }

    /* Android / Chrome ka parwana. Ye event kabhi kabhi safha
       khulne se PEHLE aa jata hai, is liye layout.js mein ek
       chhoti si qatar use mehfooz kar leti hai — wo yahan padi
       mil jati hai. */
    const saved = typeof window !== 'undefined' ? window.__nscInstallPrompt : null;
    if (saved) {
      setDeferred(saved);
      setMode('prompt');
    } else {
      setMode(isApple() ? 'ios' : 'wait');
    }

    const onPrompt = (e) => {
      e.preventDefault();
      window.__nscInstallPrompt = e;
      setDeferred(e);
      setMode('prompt');
    };

    const onInstalled = () => {
      window.__nscInstallPrompt = null;
      setDeferred(null);
      setMode('done');
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred || busy) return;
    setBusy(true);
    try {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') {
        setMode('done');
      } else {
        setMessage('No problem — you can install from here whenever you like.');
      }
      window.__nscInstallPrompt = null;
      setDeferred(null);
    } catch {
      setMessage('This browser will not allow installing. Try opening the page in Chrome.');
    } finally {
      setBusy(false);
    }
  }, [deferred, busy]);

  /* Faisla hone tak khamoshi — adhoora khana dikhane se behtar
     hai kuch na dikhana. Poore safhe (/install) par phir bhi sab
     kuch dikhta hai, kyunke wahan aana hi isi maqsad se hota hai. */
  if (mode === 'wait' && !heading) return null;

  return (
    <section className="install" aria-labelledby="install-title">
      <div className="install-inner">
        {/* ── Baayein: baat ── */}
        <div className="install-copy">
          <Reveal from="none">
            <span className="eyebrow">{STORE.name} — on your phone</span>
          </Reveal>

          {heading ? (
            <WordReveal
              as="h2"
              id="install-title"
              segments={[
                { text: 'Install the NSC Shop —' },
                { text: 'fast, offline, elegant.', em: true },
              ]}
            />
          ) : (
            <h2 id="install-title" className="install-h2-plain">
              Install the NSC Shop — fast, offline, elegant.
            </h2>
          )}

          <Reveal delay={0.12}>
            <p className="lede">
              Add NSC to your Home Screen for instant access and exclusive
              offers. It opens full screen — no address bar, no browser
              buttons — and takes almost no space on your phone. No app
              store, no download.
            </p>
          </Reveal>

          {/* ── Android / Chrome ── */}
          {mode === 'prompt' && (
            <Reveal delay={0.2} className="install-act">
              <button
                type="button"
                className="btn btn-primary btn-lg install-btn"
                onClick={install}
                disabled={busy}
              >
                <span className="install-btn-mark" aria-hidden="true">
                  <PlusIcon width={16} height={16} />
                </span>
                {busy ? 'One moment…' : 'Install App'}
              </button>
              <span className="install-note">Two seconds, that is all</span>
            </Reveal>
          )}

          {/* ── iPhone / iPad ── */}
          {mode === 'ios' && (
            <Reveal delay={0.2} className="install-steps">
              <ol>
                <li>
                  <span className="n">01</span>
                  <span className="s">
                    Tap the{' '}
                    <span className="ios-mark" aria-hidden="true">
                      <ShareGlyph />
                    </span>{' '}
                    Share icon below
                  </span>
                </li>
                <li>
                  <span className="n">02</span>
                  <span className="s">
                    Scroll the list and choose <strong>Add to Home Screen</strong>
                  </span>
                </li>
                <li>
                  <span className="n">03</span>
                  <span className="s">
                    Tap <strong>Add</strong>, top right — done
                  </span>
                </li>
              </ol>
              <span className="install-note">
                Open in Safari — iPhone does not allow this from Chrome
              </span>
            </Reveal>
          )}

          {/* ── Pehle se lagi hui ── */}
          {mode === 'done' && (
            <Reveal delay={0.2} className="install-done">
              <span className="install-done-mark" aria-hidden="true">
                <CheckIcon width={18} height={18} />
              </span>
              <span>Already installed — you are in the app right now.</span>
            </Reveal>
          )}

          {/* ── Jin ka browser kuch nahi batata ── */}
          {mode === 'wait' && (
            <Reveal delay={0.2} className="install-steps">
              <ol>
                <li>
                  <span className="n">01</span>
                  <span className="s">Open your browser menu (⋮)</span>
                </li>
                <li>
                  <span className="n">02</span>
                  <span className="s">
                    Choose <strong>Install app</strong> or{' '}
                    <strong>Add to Home screen</strong>
                  </span>
                </li>
              </ol>
              <span className="install-note">
                Open this page in Chrome or Safari on a phone and it becomes
                a single-tap button
              </span>
            </Reveal>
          )}

          {message && (
            <p className="install-msg" role="status">
              {message}
            </p>
          )}
        </div>

        {/* ── Daayein: phone ──
            Ek asli phone ki shakl, jis ki home screen par NSC ka
            icon aa kar apni jagah leta hai. Poori harkat CSS ki
            hai — dekhne mein jaan hai, chalne mein kuch nahi. */}
        <Reveal from="scale" delay={0.1} className="install-stage" aria-hidden="true">
          <div className="phone">
            <span className="phone-notch" />
            <div className="phone-screen">
              <div className="phone-time">9:41</div>

              <div className="phone-grid">
                <span className="app-dummy" />
                <span className="app-dummy" />
                <span className="app-dummy" />
                <span className="app-dummy" />

                <span className="app-nsc">
                  <Image
                    src="/icon-192.png"
                    alt=""
                    width={192}
                    height={192}
                    sizes="64px"
                  />
                  <em>NSC</em>
                </span>

                <span className="app-dummy" />
                <span className="app-dummy" />
                <span className="app-dummy" />
              </div>

              <div className="phone-dock">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <span className="phone-bar" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** iOS ke Share ka asli nishan — murabba jis mein se teer nikalta hai. */
function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M8.5 6.5 12 3l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11H5.5v9h13v-9H17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

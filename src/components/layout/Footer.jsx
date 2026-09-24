'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollScene from '@/components/motion/ScrollScene';
import Reveal from '@/components/motion/Reveal';
import { subscribeToNewsletter } from '@/lib/data/orders';
import { CATEGORIES, POLICIES, SOCIALS, STORE, WHATSAPP_CHAT } from '@/lib/constants';
import { SOCIAL_ICONS } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE MONOGRAM FOOTER
 *  ─────────────────────────────────────────────────────────────
 *  Rather than the usual four grey columns, the footer is built
 *  around the brand itself: the letters N S C are set at the width
 *  of the page and act as the structure, with a faint vertical grid
 *  behind them that echoes a cutting table. The wordmark is masked
 *  and uncovers itself as the footer scrolls into view — the same
 *  progress-driven technique used everywhere else on the site, so
 *  the page ends the way it began.
 *
 *  Newsletter ab asal mein kaam karta hai: email `subscribers`
 *  table mein jati hai. Pehle ye "Joined ✓" dikha kar email
 *  phenk deta tha — jo privacy policy ke us wade ke bhi khilaf
 *  tha jahan likha hai ke nikalna ek click ka kaam hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | already | error
  const [problem, setProblem] = useState('');
  const [clock, setClock] = useState('');

  // Live Pakistan time. The store answers around the clock, so the
  // clock is not opening hours — it is proof someone is awake.
  useEffect(() => {
    const tick = () => {
      try {
        setClock(
          new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Karachi',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(new Date())
        );
      } catch {
        setClock('');
      }
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || state === 'sending') return;

    setState('sending');
    setProblem('');

    const result = await subscribeToNewsletter(email.trim());

    if (result.ok) {
      setState(result.already ? 'already' : 'done');
      setEmail('');
      window.setTimeout(() => setState('idle'), 5000);
    } else {
      setState('error');
      setProblem(result.error || 'That did not go through. Please try again in a moment.');
    }
  };

  const year = new Date().getFullYear();

  return (
    <ScrollScene as="footer" mode="cover" className="footer">
      {/* Faint vertical rules behind everything */}
      <div className="footer-grid-lines" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="footer-inner container">
        {/* ── Top: newsletter + link columns ── */}
        <div className="footer-top">
          <Reveal className="footer-news">
            <span className="eyebrow">The List</span>
            <h2
              className="display"
              style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.9rem)', marginTop: '1rem' }}
            >
              Told first, every time.
            </h2>
            <p className="muted" style={{ marginTop: '0.9rem', fontSize: '0.95rem' }}>
              New arrivals and restocks, the day they land. Nothing else, ever —
              and one click to leave.
            </p>

            <form onSubmit={onSubscribe}>
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'error') setState('idle');
                }}
                autoComplete="email"
                aria-invalid={state === 'error' ? 'true' : undefined}
              />
              <button type="submit" disabled={state === 'sending'}>
                {state === 'sending'
                  ? 'Sending'
                  : state === 'done' || state === 'already'
                    ? 'Joined ✓'
                    : 'Join'}
              </button>
            </form>

            {state === 'done' && (
              <p className="gold" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                You are on the list. Welcome.
              </p>
            )}

            {state === 'already' && (
              <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                You were already on the list — nothing to do.
              </p>
            )}

            {state === 'error' && (
              <p
                style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--error)' }}
                role="alert"
              >
                {problem}
              </p>
            )}
          </Reveal>

          <Reveal className="footer-cols" delay={0.1}>
            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/collections/${c.slug}`}>{c.name}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/shop">View everything</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Store</h4>
              <ul>
                <li>
                  <Link href="/about">Our atelier</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/cart">Your bag</Link>
                </li>
                <li>
                  <Link href="/order">Track an order</Link>
                </li>
                <li>
                  <Link href="/install">Get the app</Link>
                </li>
                <li>
                  <a href={WHATSAPP_CHAT} target="_blank" rel="noreferrer">
                    Order on WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Help</h4>
              <ul>
                {POLICIES.map((p) => (
                  <li key={p.id}>
                    <Link href={`/policies#${p.id}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Reach Us</h4>
              <ul>
                <li>
                  <a href={`tel:${STORE.phone.replace(/\s/g, '')}`}>{STORE.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
                </li>
                <li>{STORE.city}</li>
                <li className="gold">{STORE.hours}</li>
              </ul>
            </div>
          </Reveal>
        </div>

        {/* ── The oversized wordmark ──
            Uncovered from the bottom up as the footer arrives, using the
            same masked reveal the hero images use. */}
        <div className="footer-mark">
          <Reveal mask aria-hidden="true">
            <span className="footer-word">NSC</span>
          </Reveal>
        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <div className="row" style={{ gap: '1.25rem' }}>
            <Image
              quality={92}
              src="/logo-gold.png"
              alt=""
              width={709}
              height={524}
              style={{ height: 24, width: 'auto', opacity: 0.8 }}
            />
            <span>
              © {year} {STORE.name}
            </span>
          </div>

          <div className="row" style={{ gap: '1.5rem' }}>
            {clock && (
              <span className="footer-clock" title="Local time in Pakistan">
                <span className="dot" aria-hidden="true" />
                {STORE.hoursShort} · Pakistan {clock}
              </span>
            )}

            {SOCIALS.length > 0 && (
              <nav className="footer-socials" aria-label="Social links">
                {SOCIALS.map((s) => {
                  const Mark = SOCIAL_ICONS[s.icon];
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="social-btn"
                      aria-label={s.label}
                      title={s.label}
                    >
                      {Mark ? <Mark width={17} height={17} /> : s.short}
                    </a>
                  );
                })}
              </nav>
            )}

          </div>
        </div>
      </div>
    </ScrollScene>
  );
}

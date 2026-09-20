'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { STORE } from '@/lib/constants';
import { ArrowRight, ShieldIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ADMIN LOGIN
 *  ─────────────────────────────────────────────────────────────
 *  Ek khana, ek button. Password kabhi browser mein mehfooz nahi
 *  hota — server use jaanch kar barah ghante ki chitthi cookie
 *  mein rakh deta hai, aur wo cookie JavaScript ki pohanch se
 *  bahar hai.
 *
 *  Agar .env.local mein kuch reh gaya ho to ye safha seedha wohi
 *  bata deta hai, taake "kaam kyun nahi kar raha" ka jawab
 *  dhoondna na pare.
 * ═══════════════════════════════════════════════════════════════
 */
export default function AdminLogin({ passwordSet = true, databaseSet = true }) {
  const router = useRouter();
  const inputRef = useRef(null);

  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | error
  const [message, setMessage] = useState('');

  const ready = passwordSet && databaseSet;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending' || !password) return;

    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.ok) {
        setPassword('');
        router.refresh();
        return;
      }

      setStatus('error');
      setMessage(data.message || 'That password is not right.');
      setPassword('');
      inputRef.current?.focus();
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Is the dev server running?');
    }
  };

  return (
    <div className="ad-gate">
      <form className="ad-gate-box" onSubmit={onSubmit} noValidate>
        <span className="ad-gate-mark" aria-hidden="true">
          <ShieldIcon width={22} height={22} />
        </span>

        <p className="ad-eyebrow">{STORE.name}</p>
        <h1 className="ad-gate-title">Admin</h1>
        <p className="ad-gate-note">
          Orders, products and stock — all from here.
        </p>

        {!ready && (
          <div className="ad-alert ad-alert-warn" role="status">
            <strong>Finish setting up .env.local first.</strong>
            <ul>
              {!passwordSet && (
                <li>
                  <code>ADMIN_PASSWORD</code> is not set, or is shorter than 10
                  characters.
                </li>
              )}
              {!databaseSet && (
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_URL</code> ya{' '}
                  <code>SUPABASE_SERVICE_ROLE_KEY</code> is missing.
                </li>
              )}
            </ul>
            <p>
              After editing the file, stop the dev server and start it again —
              <code>.env</code> is only read at startup.
            </p>
          </div>
        )}

        <div className="ad-field">
          <label className="ad-label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            ref={inputRef}
            className="ad-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            disabled={!ready || status === 'sending'}
            aria-invalid={status === 'error' ? 'true' : undefined}
            autoFocus
          />
          {status === 'error' && (
            <span className="ad-error" role="alert">
              {message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="ad-btn ad-btn-gold ad-btn-block"
          disabled={!ready || status === 'sending' || !password}
        >
          {status === 'sending' ? 'Checking…' : 'Sign in'}
          {status !== 'sending' && <ArrowRight width={15} height={15} />}
        </button>

        <Link href="/" className="ad-gate-back">
          Back to the site
        </Link>
      </form>
    </div>
  );
}

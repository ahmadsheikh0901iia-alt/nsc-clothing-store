'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THEME
 *  ─────────────────────────────────────────────────────────────
 *  Three states, not two:
 *
 *    'system'  follow the phone / laptop setting  ← the default
 *    'light'   the visitor chose light
 *    'dark'    the visitor chose dark
 *
 *  Only 'light' and 'dark' are ever written to <html data-theme>,
 *  because CSS should never have to ask what the OS is doing —
 *  see the note at the top of styles/tokens.css.
 *
 *  The very first stamp happens BEFORE React loads, in the inline
 *  script in app/layout.js. This provider picks up from there, so
 *  the page never flashes the wrong colour.
 * ═══════════════════════════════════════════════════════════════
 */

export const THEME_KEY = 'nsc-theme';

const ThemeContext = createContext(null);

/** Reads the OS preference. Falls back to dark, which is the base design. */
function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Stamps the resolved theme onto <html> and the browser chrome. */
function paint(resolved) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;

  // The page ships two <meta name="theme-color"> tags, one per OS
  // preference, so the browser chrome is right even before this runs.
  // Once we know the answer, drop the media conditions and state it.
  const color = resolved === 'light' ? '#f7f4ee' : '#0a0a09';
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.removeAttribute('media');
    m.setAttribute('content', color);
  });
}

export function ThemeProvider({ children }) {
  // 'system' until the browser tells us otherwise, so the server and
  // the first client render agree and React does not complain.
  const [choice, setChoice] = useState('system');
  const [resolved, setResolved] = useState('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {
      /* private mode, or storage blocked — fall through to system */
    }
    const next = saved === 'light' || saved === 'dark' ? saved : 'system';
    setChoice(next);
    const r = next === 'system' ? systemTheme() : next;
    setResolved(r);
    paint(r);
    setReady(true);
  }, []);

  // Follow the OS while the visitor has not made a choice of their own.
  useEffect(() => {
    if (choice !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      const r = mq.matches ? 'light' : 'dark';
      setResolved(r);
      paint(r);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [choice]);

  const setTheme = useCallback((next) => {
    setChoice(next);
    const r = next === 'system' ? systemTheme() : next;
    setResolved(r);
    paint(r);
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      /* nothing to do — the choice still holds for this visit */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === 'light' ? 'dark' : 'light');
  }, [resolved, setTheme]);

  const value = useMemo(
    () => ({ choice, resolved, ready, setTheme, toggle }),
    [choice, resolved, ready, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

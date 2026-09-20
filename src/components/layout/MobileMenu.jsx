'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import useBodyLock from '@/hooks/useBodyLock';
import { NAV_LINKS, STORE } from '@/lib/constants';
import ThemeToggle from '@/components/layout/ThemeToggle';

/**
 * Full-screen navigation for tablet and phone.
 * Each line swings up from below in sequence — the same cascade the
 * rest of the site uses, so the menu feels part of the page rather
 * than a separate widget bolted on.
 */
export default function MobileMenu() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useStore();

  useBodyLock(menuOpen);

  // Close the menu whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  return (
    <div className="menu" data-open={menuOpen ? 'true' : 'false'} aria-hidden={!menuOpen}>
      <nav className="menu-list" aria-label="Mobile">
        {NAV_LINKS.map((link, i) => (
          <span className="menu-item" key={link.href}>
            <Link
              href={link.href}
              style={{ '--i': i }}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              {link.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="menu-theme">
        <span className="caps faint">Appearance</span>
        <ThemeToggle variant="segment" tabIndex={menuOpen ? 0 : -1} />
      </div>

      <div className="menu-foot">
        <a href={`tel:${STORE.phone.replace(/\s/g, '')}`} tabIndex={menuOpen ? 0 : -1}>
          {STORE.phone}
        </a>
        <a href={`mailto:${STORE.email}`} tabIndex={menuOpen ? 0 : -1}>
          {STORE.email}
        </a>
        <span>{STORE.city}</span>
      </div>
    </div>
  );
}

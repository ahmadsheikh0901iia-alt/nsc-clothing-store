'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import useBodyLock from '@/hooks/useBodyLock';
import ProductCard from '@/components/shop/ProductCard';
import { CATEGORIES, getCategory } from '@/lib/constants';
import { CloseIcon, SearchIcon } from '@/components/ui/Icons';

/**
 * Full-screen search.
 *
 * Matches against name, category label, fabric and description, so
 * "lawn", "shawl", "unstitched" and "chikankari" all find something.
 * Results update as you type — there is no search button to press.
 *
 * ── Keyboard ──────────────────────────────────────────────────
 * CartDrawer aur QuickOrder mein Tab pehle se andar qaid tha,
 * yahan nahi tha — keyboard se chalane wala shakhs khuli hui
 * search ke peeche wale safhe mein nikal jata tha aur phir
 * nazar na aane wali cheezon par focus ghoomta rehta tha.
 *
 * Ab teen cheezein theek hain: aria-modal, Tab ka daira, aur
 * band karte hi focus wapas usi button par jahan se search
 * khuli thi.
 */
export default function SearchOverlay({ products = [] }) {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const returnTo = useRef(null);

  useBodyLock(searchOpen);

  // Focus the field as it opens; clear it as it closes.
  useEffect(() => {
    if (!searchOpen) {
      const t = window.setTimeout(() => setQuery(''), 250);
      // Jahan se khuli thi, focus wahin wapas.
      if (returnTo.current?.isConnected) returnTo.current.focus();
      returnTo.current = null;
      return () => window.clearTimeout(t);
    }

    returnTo.current = document.activeElement;
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  /* Tab ka daira — search khuli ho to focus bahar nahi ja sakta. */
  useEffect(() => {
    if (!searchOpen) return undefined;

    const onKey = (e) => {
      if (e.key !== 'Tab' || !boxRef.current) return;

      const focusable = [
        ...boxRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea'
        ),
      ].filter((el) => el.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) => {
        const label = getCategory(p.category)?.name || p.category || '';
        return [p.name, label, p.category, p.fabric, p.description]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q));
      })
      .slice(0, 12);
  }, [query, products]);

  const showEmpty = query.trim().length >= 2 && results.length === 0;

  return (
    <div
      className="search"
      data-open={searchOpen ? 'true' : 'false'}
      aria-hidden={!searchOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="search-box" ref={boxRef}>
        <div className="row-between" style={{ marginBottom: '2rem' }}>
          <span className="eyebrow">Search</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            tabIndex={searchOpen ? 0 : -1}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="search-field">
          <SearchIcon width={22} height={22} style={{ color: 'var(--bone-faint)' }} />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            value={query}
            placeholder="Lawn, shawl, kurta…"
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            tabIndex={searchOpen ? 0 : -1}
          />
        </div>

        {/* Suggestions before anything is typed */}
        {query.trim().length < 2 && (
          <>
            <p className="caps faint" style={{ marginTop: '2rem' }}>
              Browse by category
            </p>
            <div className="search-suggest">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="chip"
                  onClick={() => setSearchOpen(false)}
                  tabIndex={searchOpen ? 0 : -1}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </>
        )}

        {showEmpty && (
          <p className="search-empty">
            Nothing matched <em className="gold">“{query}”</em>. Try “lawn”,
            “unstitched”, “shawl” or “bedsheet”.
          </p>
        )}

        {results.length > 0 && (
          <>
            <p className="caps faint" style={{ marginTop: '2.25rem' }}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </p>
            <div
              className="search-results"
              onClick={() => setSearchOpen(false)}
              role="presentation"
            >
              {results.map((p) => (
                <ProductCard key={p.id} product={p} sizes="220px" />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Stagger from '@/components/motion/Stagger';
import ProductCard from '@/components/shop/ProductCard';
import { CATEGORIES, STORE, whatsappLink } from '@/lib/constants';
import { WhatsAppMark } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';

/**
 * The catalogue browser: category filters, sort, and the grid.
 *
 * Everything runs in the browser against the list it is given, so
 * filtering is instant — no page reload, no request. With a larger
 * catalogue you would move this to server-side filtering, and the
 * data functions in lib/data/products.js are already shaped for it.
 */

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price ↑' },
  { key: 'price-desc', label: 'Price ↓' },
  { key: 'name', label: 'A–Z' },
];

export default function ShopBrowser({ products = [], initialCategory = null, showFilters = true }) {
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');

  /* With nothing in the catalogue at all, a filter rail and a sort
     dropdown are furniture around an empty room. Show the shelf
     itself instead, and a way to be told when it fills. */
  const bare = products.length === 0;

  const visible = useMemo(() => {
    let list = category ? products.filter((p) => p.category === category) : [...products];

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
    }
    return list;
  }, [products, category, sort]);

  // Only offer filters for categories that actually have stock.
  const available = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return CATEGORIES.filter((c) => present.has(c.slug));
  }, [products]);

  if (bare) {
    return (
      <section className="container section-tight">
        <div className="shelf-empty">
          <span className="eyebrow">Arriving soon</span>

          <h2 className="display" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
            The shelf is being photographed.
          </h2>

          <p className="muted" style={{ maxWidth: '52ch' }}>
            Every piece is shot twice before it is listed — once for the drape,
            once close enough to count the stitches. Until then, the whole stock
            is on WhatsApp and we will happily send photographs of anything you
            are after.
          </p>

          <div className="shelf-empty-cats">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/collections/${c.slug}`} className="chip">
                {c.name}
              </Link>
            ))}
          </div>

          <div className="row wrap" style={{ gap: '0.75rem', justifyContent: 'center' }}>
            <a
              href={whatsappLink(
                `Assalam o alaikum! I am looking for something from ${STORE.name} — could you send me some photographs?`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              <WhatsAppMark width={17} height={17} />
              Ask for photographs
            </a>
            <Link href="/contact" className="btn btn-outline">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {showFilters && (
        <div className="toolbar">
          <div className="container toolbar-inner">
            <div className="filter-rail no-scrollbar">
              <button
                type="button"
                className="chip"
                data-active={category === null ? 'true' : undefined}
                onClick={() => setCategory(null)}
              >
                All ({products.length})
              </button>
              {available.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className="chip"
                  data-active={category === c.slug ? 'true' : undefined}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="row hide-mobile" style={{ gap: '0.6rem', flex: 'none' }}>
              <label htmlFor="sort" className="caps faint">
                Sort
              </label>
              <select
                id="sort"
                className="select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ width: 'auto', paddingBlock: '0.5rem' }}
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <section className={cn('container', 'section-tight')}>
        <p className="caps faint" style={{ marginBottom: '1.75rem' }} aria-live="polite">
          {visible.length} piece{visible.length === 1 ? '' : 's'}
        </p>

        {visible.length === 0 ? (
          <div className="empty">
            <p className="display" style={{ fontSize: '1.8rem' }}>
              Nothing here yet
            </p>
            <p className="muted" style={{ maxWidth: '40ch' }}>
              This category is being restocked. Have a look at everything else in
              the meantime.
            </p>
            <button type="button" className="btn btn-outline" onClick={() => setCategory(null)}>
              Show all products
            </button>
          </div>
        ) : (
          <Stagger className="product-grid">
            {visible.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 4}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ))}
          </Stagger>
        )}

        {visible.length > 0 && (
          <div className="text-center" style={{ marginTop: 'clamp(3rem,6vw,5rem)' }}>
            <p className="muted" style={{ marginBottom: '1.25rem' }}>
              Looking for something you cannot find here?
            </p>
            <Link href="/contact" className="btn btn-outline">
              Ask us directly
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

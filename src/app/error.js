'use client';

import Link from 'next/link';

/**
 * Catches any unexpected error inside a page and shows a calm screen
 * with a way out, instead of a blank white page.
 */
export default function Error({ error, reset }) {
  return (
    <section className="container" style={{ paddingBlock: 'clamp(8rem, 20vh, 14rem)' }}>
      <div className="empty">
        <p className="eyebrow eyebrow-plain">Something went wrong</p>

        <h1 className="display" style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>
          A stitch dropped.
        </h1>

        <p className="lede" style={{ textAlign: 'center' }}>
          Sorry — that page failed to load. Try again, and if it keeps happening
          let us know.
        </p>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre
            style={{
              maxWidth: '70ch',
              overflowX: 'auto',
              padding: '1rem',
              background: 'var(--ink-2)',
              border: '1px solid var(--line)',
              fontSize: '0.8rem',
              color: 'var(--error)',
              textAlign: 'left',
            }}
          >
            {error.message}
          </pre>
        )}

        <div className="row wrap" style={{ justifyContent: 'center', gap: '0.75rem' }}>
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Try again
          </button>
          <Link href="/" className="btn btn-outline">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

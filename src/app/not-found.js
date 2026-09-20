import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="container" style={{ paddingBlock: 'clamp(8rem, 20vh, 14rem)' }}>
      <div className="empty">
        <p className="eyebrow eyebrow-plain">Error 404</p>

        <h1
          className="display"
          style={{ fontSize: 'var(--t-display)', marginBlock: '0.5rem 0.75rem' }}
        >
          This page has been <em className="gold" style={{ fontStyle: 'italic' }}>unpicked</em>.
        </h1>

        <p className="lede" style={{ textAlign: 'center' }}>
          The link may be old, or the piece may have sold out and been retired.
          Try one of the departments below.
        </p>

        <div
          className="row wrap"
          style={{ justifyContent: 'center', gap: '0.6rem', marginTop: '0.5rem' }}
        >
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="chip">
              {c.name}
            </Link>
          ))}
        </div>

        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to home
        </Link>
      </div>
    </section>
  );
}

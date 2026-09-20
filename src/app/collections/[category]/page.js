import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import Stagger from '@/components/motion/Stagger';
import ShopBrowser from '@/components/shop/ShopBrowser';
import { getProductsByCategory } from '@/lib/data/products';
import {
  CATEGORIES,
  CATEGORY_LIMITS,
  getCategory,
  getSubCollection,
  subCollections,
} from '@/lib/constants';
import { ArrowUpRight } from '@/components/ui/Icons';

/** Pre-renders one static page per category at build time. */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { category } = await params;
  const q = await searchParams;

  const cat = getCategory(category);
  if (!cat) return { title: 'Collection not found' };

  const sub = getSubCollection(category, typeof q?.c === 'string' ? q.c : '');

  return {
    title: sub ? `${sub.name} — ${cat.name}` : cat.name,
    description: sub
      ? `${sub.name} at NSC Clothing Store — ${sub.blurb}`
      : `${cat.name} at NSC Clothing Store — ${cat.blurb}`,
  };
}

/* ═══════════════════════════════════════════════════════════════
   /collections/[category]
   ───────────────────────────────────────────────────────────────
   Kuch departments ke andar aur taqseem hai — Winter aur Summer,
   ya Gents aur Women's. Wo taqseem `SUB_COLLECTIONS` se aati hai.

   Jab tak koi collection chuna na jaye, safha poore department ka
   maal dikhata hai aur upar do bare darwazay rakhta hai. Ek chunte
   hi wohi safha us collection ka ban jata hai — nayi route ki
   zaroorat nahi, `?c=winter` kaafi hai. Is ka faida: link bhejne
   par wohi hissa khulta hai jo aap ne dekha tha.

   Jis category ke andar taqseem nahi, wahan ye poora hissa
   khamoshi se ghayab rehta hai.
   ═══════════════════════════════════════════════════════════════ */

export default async function CollectionPage({ params, searchParams }) {
  const { category } = await params;
  const q = await searchParams;

  const cat = getCategory(category);
  if (!cat) notFound();

  /* Kuch khanon ke andar mausam ki taqseem hai (Winter / Summer),
     kuch ke andar nahi. Jahan nahi, wahan ye poora hissa khud ba
     khud ghayab rehta hai. */
  const subs = subCollections(category);
  const active = getSubCollection(category, typeof q?.c === 'string' ? q.c : '');

  /* New Arrivals par tees ki had lagti hai — dikhane ki had, mitane
     ki nahi. Baqi khanon par koi had nahi. */
  const products = await getProductsByCategory(
    category,
    active?.slug || '',
    CATEGORY_LIMITS[category] || 0
  );

  const others = CATEGORIES.filter((c) => c.slug !== category);

  return (
    <>
      {/* ── Header with the category's own photograph ── */}
      <header className="page-head container">
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            {active ? (
              <>
                <Link href={`/collections/${category}`}>{cat.name}</Link>
                <span aria-hidden="true">/</span>
                <span>{active.name}</span>
              </>
            ) : (
              <span>{cat.name}</span>
            )}
          </nav>
        </Reveal>

        <div
          className="grid-2"
          style={{ marginTop: '2rem', alignItems: 'end', gap: 'clamp(1.5rem,4vw,4rem)' }}
        >
          <div>
            <Reveal from="none">
              <span className="eyebrow">
                {active ? cat.name : `${cat.group} — ${cat.index}`}
              </span>
            </Reveal>
            <WordReveal
              as="h1"
              style={{ marginTop: '1rem', fontSize: 'var(--t-display)' }}
              text={active ? active.name : cat.name}
            />
            <Reveal delay={0.12}>
              <p className="lede" style={{ marginTop: '1.25rem' }}>
                {active ? active.blurb : cat.blurb}
              </p>
            </Reveal>

            {active && (
              <Reveal delay={0.18}>
                <Link
                  href={`/collections/${category}`}
                  className="link-arrow"
                  style={{ marginTop: '1.5rem', display: 'inline-flex' }}
                >
                  All of {cat.name}
                </Link>
              </Reveal>
            )}
          </div>

          <Reveal mask className="media ratio-wide" delay={0.1}>
            <Image
              quality={92}
              src={active ? active.image : cat.image}
              alt={active ? active.name : cat.name}
              width={900}
              height={1200}
              priority
              sizes="(max-width: 900px) 100vw, 45vw"
            />
          </Reveal>
        </div>
      </header>

      {/* ── Do darwazay: Winter / Summer, ya Gents / Women's ──
             Sirf tab, jab koi collection chuna hua na ho — warna
             safha khud us collection ka hai. */}
      {subs.length > 0 && !active && (
        <section className="section-tight container">
          <Reveal from="none">
            <span className="eyebrow">Choose a collection</span>
          </Reveal>

          <Stagger className="subcol-grid" step={0.08}>
            {subs.map((s) => (
              <Link
                key={s.slug}
                href={`/collections/${category}?c=${s.slug}`}
                className="subcol"
                aria-label={`${s.name} — ${s.blurb}`}
              >
                <span className="subcol-shot" aria-hidden="true">
                  <Image
                    quality={92}
                    src={s.image}
                    alt=""
                    width={900}
                    height={1200}
                    sizes="(max-width: 720px) 100vw, 50vw"
                  />
                </span>

                <span className="subcol-body">
                  <span className="subcol-name">{s.name}</span>
                  <span className="subcol-blurb">{s.blurb}</span>
                </span>

                <span className="subcol-go" aria-hidden="true">
                  <ArrowUpRight width={16} height={16} />
                </span>
              </Link>
            ))}
          </Stagger>
        </section>
      )}

      {/* ── Collection ke andar: doosre par jaane ka raasta ── */}
      {subs.length > 0 && active && (
        <section className="section-tight container">
          <div className="row wrap" style={{ gap: '0.6rem' }}>
            <Link href={`/collections/${category}`} className="chip">
              All {cat.name}
            </Link>
            {subs.map((s) => (
              <Link
                key={s.slug}
                href={`/collections/${category}?c=${s.slug}`}
                className="chip"
                data-on={s.slug === active.slug ? 'true' : 'false'}
                aria-current={s.slug === active.slug ? 'page' : undefined}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* The browser is reused here, pre-filtered and without the
          category rail, since the page itself is the filter. */}
      <ShopBrowser products={products} showFilters={false} />

      {/* ── Jump to another department ── */}
      <section className="section-tight container band-top">
        <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>
          Other departments
        </p>
        <div className="row wrap" style={{ gap: '0.6rem' }}>
          {others.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="chip">
              {c.name}
            </Link>
          ))}
          <Link href="/shop" className="chip">
            View everything
          </Link>
        </div>
      </section>
    </>
  );
}

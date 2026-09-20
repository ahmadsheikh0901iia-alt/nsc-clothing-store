import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import Stagger from '@/components/motion/Stagger';
import ProductCard from '@/components/shop/ProductCard';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * Featured collection.
 * A three-column grid that staggers in as it crosses the viewport;
 * each card lifts, swaps to its second photograph and reveals a
 * quick-add bar on hover.
 */
export default function Featured({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="section container band-top">
      <div className="sec-head">
        <div>
          <Reveal from="none">
            <span className="eyebrow">Selected</span>
          </Reveal>
          <WordReveal
            as="h2"
            style={{ marginTop: '1rem' }}
            segments={[{ text: 'This week at' }, { text: 'the front.', em: true }]}
          />
        </div>

        <Reveal className="sec-side" delay={0.1}>
          <p className="lede">
            Chosen from the new intake — the pieces we would keep for
            ourselves.
          </p>
          <Link href="/shop" className="link-arrow">
            View all products
            <ArrowRight className="arrow" width={15} height={15} />
          </Link>
        </Reveal>
      </div>

      <Stagger className="product-grid">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={i < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ))}
      </Stagger>
    </section>
  );
}

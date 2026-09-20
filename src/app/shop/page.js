import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import ShopBrowser from '@/components/shop/ShopBrowser';
import Ribbon from '@/components/home/Ribbon';
import { getProducts } from '@/lib/data/products';
import { CATEGORIES } from '@/lib/constants';

export const metadata = {
  title: 'Shop All',
  description:
    'Every piece in the NSC Clothing Store catalogue — stitched and unstitched clothing, men’s suiting lengths, shawls and bedsheets.',
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <header className="page-head container">
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Shop</span>
          </nav>
        </Reveal>

        <WordReveal
          as="h1"
          style={{ marginTop: '1.5rem', fontSize: 'var(--t-display)' }}
          segments={[{ text: 'The full' }, { text: 'catalogue.', em: true }]}
        />

        <Reveal delay={0.15}>
          <p className="lede" style={{ marginTop: '1.25rem' }}>
            {products.length > 0
              ? `${products.length} piece${products.length === 1 ? '' : 's'} across ${CATEGORIES.length} departments. Filter by category, sort by price, and everything you add is kept in your bag between visits.`
              : `The shelf is being photographed. ${CATEGORIES.length} departments are opening — join the WhatsApp community below and you will know the moment the first pieces go up.`}
          </p>
        </Reveal>
      </header>

      <ShopBrowser products={products} />

      <Ribbon duration={55} reverse />
    </>
  );
}

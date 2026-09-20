import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import CartView from '@/components/shop/CartView';

export const metadata = {
  title: 'Your Bag',
  description: 'Review the pieces in your NSC Clothing Store bag before checkout.',
};

export default function CartPage() {
  return (
    <>
      <header className="page-head container">
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Bag</span>
          </nav>
        </Reveal>

        <WordReveal
          as="h1"
          style={{ marginTop: '1.5rem', fontSize: 'var(--t-display)' }}
          text="Your bag."
        />
      </header>

      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <CartView />
      </section>
    </>
  );
}

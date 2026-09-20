import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import CheckoutForm from '@/components/shop/CheckoutForm';

export const metadata = {
  title: 'Checkout',
  description: 'Complete your NSC Clothing Store order. Cash on delivery nationwide.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <header className="page-head container">
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/cart">Bag</Link>
            <span aria-hidden="true">/</span>
            <span>Checkout</span>
          </nav>
        </Reveal>

        <WordReveal
          as="h1"
          style={{ marginTop: '1.5rem', fontSize: 'var(--t-display)' }}
          text="Checkout."
        />
      </header>

      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <CheckoutForm />
      </section>
    </>
  );
}

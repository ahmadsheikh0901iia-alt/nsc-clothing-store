import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import TrackOrder from '@/components/shop/TrackOrder';
import { DELIVERY, STORE } from '@/lib/constants';

export const metadata = {
  title: 'Track your order',
  description: `See where your ${STORE.name} parcel has reached — with your order number and the last four digits of your phone.`,
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════
 *  /order — ORDER KAHAN POHANCHA
 *  ─────────────────────────────────────────────────────────────
 *  Pehle customer ke paas order number to hota tha, magar use
 *  dekhne ki koi jagah nahi thi — har sawal WhatsApp par aata
 *  tha.
 *
 *  Account banane ki zaroorat jaan boojh kar nahi rakhi gayi.
 *  Cash on delivery wale store par account banwana khareedar ko
 *  bhagata hai. Do cheezein kaafi hain: order number, aur usi
 *  number ke aakhri chaar digit jo order par diya tha. Sirf
 *  order number se koi doosron ke pate nahi parh sakta.
 * ═══════════════════════════════════════════════════════════════
 */
export default async function TrackPage({ searchParams }) {
  const params = await searchParams;
  const ref = typeof params?.ref === 'string' ? params.ref : '';

  return (
    <>
      <header className="page-head container">
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Your order</span>
          </nav>
        </Reveal>

        <WordReveal
          as="h1"
          style={{ marginTop: '1.5rem', fontSize: 'var(--t-display)' }}
          segments={[{ text: 'Where your' }, { text: 'parcel is.', em: true }]}
        />

        <Reveal delay={0.15}>
          <p className="lede" style={{ marginTop: '1.25rem' }}>
            Enter your order number and the last four digits of your phone. No
            account needed. Delivery usually takes {DELIVERY.window}.
          </p>
        </Reveal>
      </header>

      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <TrackOrder initialRef={ref} />
      </section>
    </>
  );
}

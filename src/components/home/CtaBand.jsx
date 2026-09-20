import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { STORE, WHATSAPP_CHAT } from '@/lib/constants';
import { ArrowRight, WhatsAppIcon } from '@/components/ui/Icons';

/**
 * Closing call to action. Two routes out of the page: browse the
 * shop, or message on WhatsApp — which is how most orders in
 * Pakistan actually start.
 */
export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <Reveal from="none">
          <span className="eyebrow eyebrow-plain">Ready when you are</span>
        </Reveal>

        <WordReveal
          as="h2"
          style={{ marginTop: '1.5rem' }}
          segments={[{ text: 'Find the piece' }, { text: 'you keep.', em: true }]}
        />

        <Reveal delay={0.15}>
          <p
            className="lede"
            style={{ margin: '1.5rem auto 0', textAlign: 'center' }}
          >
            Free delivery over Rs 5,000. Cash on delivery nationwide. Seven-day
            exchange, no questions asked.
          </p>
        </Reveal>

        <Reveal
          delay={0.25}
          className="row wrap"
          style={{ justifyContent: 'center', marginTop: '2.5rem', gap: '0.75rem' }}
        >
          <Link href="/shop" className="btn btn-primary btn-lg">
            Shop everything
            <ArrowRight className="arrow" width={16} height={16} />
          </Link>
          <a
            href={WHATSAPP_CHAT}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-lg"
          >
            <WhatsAppIcon width={17} height={17} />
            Message us
          </a>
        </Reveal>
      </div>
    </section>
  );
}

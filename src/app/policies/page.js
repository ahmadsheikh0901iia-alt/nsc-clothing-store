import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { DELIVERY, POLICIES, STORE, whatsappLink } from '@/lib/constants';
import { ArrowRight, WhatsAppMark } from '@/components/ui/Icons';

export const metadata = {
  title: 'Delivery, Returns & Privacy',
  description: `How ordering from ${STORE.name} works — ${DELIVERY.window} delivery, cash on delivery, seven-day exchange, and what we do with your details.`,
};

/**
 * ═══════════════════════════════════════════════════════════════
 *  POLICIES
 *  ─────────────────────────────────────────────────────────────
 *  The page a cautious customer opens before their first order.
 *  Written as plain sentences rather than legal boilerplate,
 *  because boilerplate reassures nobody — it just proves someone
 *  pasted it in.
 *
 *  Every word comes from POLICIES in lib/constants.js. Change a
 *  price, a window or a rule there and it is corrected here, in
 *  the assurance band, and anywhere else it is quoted.
 * ═══════════════════════════════════════════════════════════════
 */
export default function PoliciesPage() {
  return (
    <>
      <header className="container section-tight">
        <Reveal from="none">
          <span className="eyebrow">Before you order</span>
        </Reveal>

        <WordReveal
          as="h1"
          className="display"
          style={{ fontSize: 'var(--t-display)', marginTop: '1rem' }}
          segments={[{ text: 'How this' }, { text: 'works.', em: true }]}
        />

        <Reveal delay={0.12}>
          <p className="lede" style={{ marginTop: '1.5rem', maxWidth: '62ch' }}>
            No small print and no surprises. If something here is not clear,
            message us and a person will answer — that is the whole policy
            behind the policies.
          </p>
        </Reveal>

        {/* Jump links, so a phone does not have to scroll five screens
            to reach the one answer it came for. */}
        <Reveal delay={0.2}>
          <nav className="policy-jump" aria-label="Jump to a section">
            {POLICIES.map((p) => (
              <a key={p.id} href={`#${p.id}`} className="chip">
                {p.title}
              </a>
            ))}
          </nav>
        </Reveal>
      </header>

      <div className="container section-tight band-top">
        {POLICIES.map((policy, i) => (
          <section className="policy" id={policy.id} key={policy.id}>
            <div className="policy-head">
              <span className="policy-n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2>{policy.title}</h2>
                <p className="policy-intro">{policy.intro}</p>
              </div>
            </div>

            <ul className="policy-list">
              {policy.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* ── Anything not covered ── */}
      <section className="container section-tight band-top">
        <div className="policy-ask">
          <div>
            <h2 className="display" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>
              Still not sure?
            </h2>
            <p className="muted" style={{ marginTop: '0.75rem', maxWidth: '48ch' }}>
              Ask before you order rather than after. We are on WhatsApp at any
              hour, and we would far rather answer a question than arrange an
              exchange.
            </p>
          </div>

          <div className="row wrap" style={{ gap: '0.75rem' }}>
            <a
              href={whatsappLink(
                `Assalam o alaikum! I had a question about ordering from ${STORE.name}.`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              <WhatsAppMark width={17} height={17} />
              Ask on WhatsApp
            </a>
            <Link href="/contact" className="btn btn-outline">
              Contact page
              <ArrowRight className="arrow" width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

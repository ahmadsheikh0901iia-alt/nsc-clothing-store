import Stagger from '@/components/motion/Stagger';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import { ASSURANCES } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ASSURANCE
 *  ─────────────────────────────────────────────────────────────
 *  The four sentences that decide whether a first-time visitor
 *  fills in the order form. Deliberately written out in full rather
 *  than compressed into icons and two-word labels: "cash on
 *  delivery" reassures far less than saying that nothing leaves
 *  your pocket before the parcel reaches your hand.
 *
 *  Edit the promises in ASSURANCES in lib/constants.js — and keep
 *  them true, because this is the part of the page a customer will
 *  hold you to.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Assurance() {
  return (
    <section className="section container band-top">
      <div className="sec-head">
        <div>
          <Reveal from="none">
            <span className="eyebrow">Before you order</span>
          </Reveal>
          <WordReveal
            as="h2"
            style={{ marginTop: '1rem' }}
            segments={[{ text: 'Four things we' }, { text: 'promise.', em: true }]}
          />
        </div>
      </div>

      <Stagger className="assure-grid" step={0.09}>
        {ASSURANCES.map((item) => (
          <article className="assure" key={item.index}>
            <span className="assure-n" aria-hidden="true">
              {item.index}
            </span>
            <h3 className="assure-t">{item.title}</h3>
            <p className="assure-b">{item.body}</p>
          </article>
        ))}
      </Stagger>
    </section>
  );
}

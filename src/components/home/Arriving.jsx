import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import Stagger from '@/components/motion/Stagger';
import WordReveal from '@/components/motion/WordReveal';
import { CATEGORIES, SOCIALS, STORE } from '@/lib/constants';
import { ArrowRight, WhatsAppMark } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ARRIVING
 *  ─────────────────────────────────────────────────────────────
 *  Shown in place of the featured grid while the catalogue is
 *  empty — which is the state the site is in until the Supabase
 *  products land.
 *
 *  The alternative was to hide the section, but a home page that
 *  skips straight from the departments to the fabric story reads
 *  as unfinished. This says the shelf is being stocked, names what
 *  is coming, and turns the wait into a reason to join the
 *  WhatsApp community — which is where the launch gets announced.
 *
 *  It disappears on its own the moment a single published product
 *  exists. Nothing to remove later.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Arriving() {
  const community = SOCIALS.find((s) => s.icon === 'whatsapp');

  return (
    <section className="section container band-top">
      <div className="sec-head">
        <div>
          <Reveal from="none">
            <span className="eyebrow">The first drop</span>
          </Reveal>
          <WordReveal
            as="h2"
            style={{ marginTop: '1rem' }}
            segments={[{ text: 'Being photographed' }, { text: 'right now.', em: true }]}
          />
        </div>

        <Reveal className="sec-side" delay={0.1}>
          <p className="lede">
            Every piece is shot twice before it goes up — once for the drape and
            once close enough to count the stitches. That takes a few days, and
            we would rather you saw the cloth properly than quickly.
          </p>
        </Reveal>
      </div>

      {/* What is coming, department by department */}
      <Stagger className="arriving-grid" step={0.07}>
        {CATEGORIES.map((cat) => (
          <Link
            href={`/collections/${cat.slug}`}
            className="arriving-cell"
            key={cat.slug}
          >
            <span className="arriving-n num">{cat.index}</span>
            <h3>{cat.name}</h3>
            <p>{cat.blurb}</p>
            <span className="caps gold arriving-status">Arriving soon</span>
          </Link>
        ))}
      </Stagger>

      {/* The wait, turned into a reason to follow */}
      {community && (
        <Reveal className="arriving-cta" delay={0.15}>
          <div>
            <h3 className="display" style={{ fontSize: 'clamp(1.45rem,2.6vw,2rem)' }}>
              Be told first.
            </h3>
            <p className="muted" style={{ marginTop: '0.6rem', maxWidth: '46ch' }}>
              {community.note}. No daily messages — just the drop, and the
              restocks that sell out fastest.
            </p>
          </div>

          <div className="row wrap" style={{ gap: '0.75rem' }}>
            <a
              href={community.href}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold"
            >
              <WhatsAppMark width={17} height={17} />
              Join the community
            </a>
            <Link href="/contact" className="btn btn-outline">
              Ask for something
              <ArrowRight className="arrow" width={16} height={16} />
            </Link>
          </div>
        </Reveal>
      )}

      <p className="faint arriving-note">
        Looking for a specific piece before it is listed? Message{' '}
        {STORE.phone} — most of the stock is on the shelf before it is on the
        site.
      </p>
    </section>
  );
}

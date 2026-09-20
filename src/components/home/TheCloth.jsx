'use client';

import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import Stagger from '@/components/motion/Stagger';
import WordReveal from '@/components/motion/WordReveal';
import { CLOTH } from '@/lib/constants';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE CLOTH ROOM
 *  ─────────────────────────────────────────────────────────────
 *  This replaced a horizontal lookbook rail. That rail slid the
 *  photographs sideways as you scrolled, which flattened them into
 *  a strip and fought the page — you could not look at any one
 *  picture because they were all moving.
 *
 *  So this section does the opposite: it holds still. Two frames,
 *  a shelf of real colours underneath, and nothing that moves
 *  except the quiet reveal every other section already uses.
 *
 *  The swatch hexes come from CLOTH.swatches in constants.js and
 *  were sampled out of the photograph itself, so a dot on screen
 *  is the actual colour of that bolt. Reshoot the photo and you
 *  must resample them — a swatch that lies is worse than none.
 * ═══════════════════════════════════════════════════════════════
 */
export default function TheCloth() {
  const { eyebrow, title, body, image, detail, href, meta, swatches } = CLOTH;

  return (
    <section className="section container band-top cloth">
      <div className="sec-head">
        <div>
          <Reveal from="none">
            <span className="eyebrow">{eyebrow}</span>
          </Reveal>
          <WordReveal
            as="h2"
            style={{ marginTop: '1rem' }}
            segments={[
              { text: 'Eleven greys' },
              { text: 'before breakfast.', em: true },
            ]}
          />
        </div>

        <Reveal className="sec-side" delay={0.1}>
          <p className="lede">{body}</p>
          <Link href={href} className="link-arrow">
            See the suiting lengths
            <ArrowRight className="arrow" width={15} height={15} />
          </Link>
        </Reveal>
      </div>

      {/* ── Two frames: the shelf, and the selvedge up close ── */}
      <div className="cloth-frames">
        <Reveal className="media cloth-wide" mask>
          <Image
            quality={92}
            src={image}
            alt="Folded suiting lengths on the shelf"
            width={900}
            height={1200}
            sizes="(max-width: 900px) 100vw, 62vw"
          />
        </Reveal>

        <div className="cloth-side">
          <Reveal className="media cloth-detail" mask delay={0.12}>
            <Image
              quality={92}
              src={detail}
              alt="The woven selvedge on a suiting length"
              width={900}
              height={1200}
              sizes="(max-width: 900px) 100vw, 32vw"
            />
          </Reveal>

          <dl className="cloth-meta">
            {meta.map((m) => (
              <Reveal className="cloth-meta-row" key={m.k} from="none" delay={0.2}>
                <dt>{m.k}</dt>
                <dd>{m.v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>

      {/* ── The shelf, as colours ── */}
      <div className="cloth-shelf">
        <div className="cloth-shelf-head">
          <span className="caps faint">On the shelf</span>
          <span className="caps faint">{swatches.length} shades</span>
        </div>

        <Stagger className="cloth-swatches" step={0.045}>
          {swatches.map((s) => (
            <div className="swatch" key={s.name}>
              <span
                className="swatch-chip"
                style={{ background: s.hex }}
                aria-hidden="true"
              />
              <span className="swatch-name">{s.name}</span>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

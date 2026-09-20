'use client';

import Link from 'next/link';
import Image from 'next/image';
import ScrollScene from '@/components/motion/ScrollScene';
import WordReveal from '@/components/motion/WordReveal';
import Reveal from '@/components/motion/Reveal';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ANATOMY — the signature section
 *  ─────────────────────────────────────────────────────────────
 *  This is the reference film translated into a scroll interaction.
 *
 *  In the film, an assembled suit slowly separates into its parts
 *  along hairline callout lines, holds, then reassembles. Here, the
 *  section is three viewports tall with a pinned stage inside it.
 *  As you scroll through that runway, `--p` runs 0 → 1 and each
 *  piece travels its own distance and rotation, the connector lines
 *  draw themselves in, and the labels fade up.
 *
 *  Because everything is a function of scroll position rather than a
 *  timer, scrolling back up runs the whole thing in reverse exactly.
 *  That is what makes it feel like a physical mechanism instead of a
 *  video that got triggered.
 * ═══════════════════════════════════════════════════════════════
 */

const PIECES = [
  {
    key: 'shirt',
    src: '/products/womens-stitched-01-detail.jpg',
    alt: 'Block-print shirt front with mirror-cut placket',
  },
  {
    key: 'dupatta',
    src: '/products/womens-stitched-01-dupatta.jpg',
    alt: 'The printed dupatta of the same three piece',
  },
  {
    key: 'trouser',
    src: '/products/womens-stitched-01-trouser.jpg',
    alt: 'The matching trouser with its lace daaman',
  },
];

const LABELS = [
  {
    at: 'tl',
    n: '01',
    t: 'The Shirt',
    d: 'Mirror-cut placket, lace-edged sleeve.',
  },
  {
    at: 'tr',
    n: '02',
    t: 'The Dupatta',
    d: 'Printed cotton net, 2.5m, border matched to the daaman.',
  },
  {
    at: 'bl',
    n: '03',
    t: 'The Trouser',
    d: 'Dyed cotton, cut on the straight grain.',
  },
];

export default function Anatomy() {
  return (
    <ScrollScene className="anatomy" mode="pin">
      <div className="anatomy-pin">
        <div className="anatomy-inner">
          {/* ── Copy ── */}
          <div className="anatomy-copy">
            <Reveal from="none">
              <span className="eyebrow">Anatomy of a Three Piece</span>
            </Reveal>

            <WordReveal
              as="h2"
              segments={[{ text: 'Every suit is' }, { text: 'three decisions.', em: true }]}
            />

            <Reveal delay={0.15}>
              <p className="lede">
                Shirt, dupatta, trouser. Each is cut, embroidered and finished
                separately, then matched by hand before it is folded. Scroll to
                take one apart.
              </p>
            </Reveal>

            {/* Live progress readout */}
            <div className="anatomy-meter" aria-hidden="true">
              <span className="val">Assembled</span>
              <span className="track" />
              <span className="val">Apart</span>
            </div>

            <Reveal delay={0.25} style={{ marginTop: '2rem' }}>
              <Link href="/collections/womens-stitched" className="link-arrow">
                See the three-piece range
                <ArrowRight className="arrow" width={15} height={15} />
              </Link>
            </Reveal>
          </div>

          {/* ── Stage ── */}
          <div className="anatomy-stage">
            {PIECES.map((piece) => (
              <div className="anatomy-piece" data-piece={piece.key} key={piece.key}>
                <Image
                  quality={92}
                  src={piece.src}
                  alt={piece.alt}
                  width={900}
                  height={1200}
                  sizes="(max-width: 1024px) 60vw, 30vw"
                />
              </div>
            ))}

            {/* Hairline callouts — drawn in as the pieces separate.
                Coordinates are percentages of the stage box. */}
            <svg
              className="anatomy-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="8" y1="10" x2="38" y2="24" pathLength="1" />
              <line x1="92" y1="20" x2="70" y2="42" pathLength="1" />
              <line x1="8" y1="92" x2="26" y2="74" pathLength="1" />
            </svg>

            {LABELS.map((label) => (
              <div className="anatomy-label" data-at={label.at} key={label.n}>
                <span className="n">{label.n}</span>
                <span className="t">{label.t}</span>
                <span className="d">{label.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}

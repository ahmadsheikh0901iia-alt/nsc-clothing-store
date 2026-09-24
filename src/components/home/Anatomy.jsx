'use client';

import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import useInView from '@/hooks/useInView';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  ENSUITE — the feature gallery
 *  ─────────────────────────────────────────────────────────────
 *  Three photographs of the same three-piece. Each one arrives
 *  broken into nine tiles that fly in from their own direction and
 *  reassemble into the picture.
 *
 *  ── WHAT THIS REPLACED, AND WHY ──
 *  This section used to be a 320vh runway with a `position: sticky`
 *  stage inside it: the page stopped moving and three overlapping
 *  cut-outs drifted apart as you scrolled. Two things were wrong
 *  with it.
 *
 *  It scroll-jacked. The whole effect was a function of scroll
 *  position, which means the page had to hold still for three
 *  screens' worth of scrolling before it let you past. On a phone
 *  that reads as "the site has frozen".
 *
 *  And the arithmetic could not hold on a phone. Progress was
 *  computed from `window.innerHeight`, and a phone's address bar
 *  slides away as you scroll — changing that number by about a
 *  hundred pixels mid-animation. The pieces snapped every time the
 *  bar moved.
 *
 *  ── WHAT IT DOES NOW ──
 *  Nothing here is tied to scroll position. The section is ordinary
 *  page flow, ordinary height. An IntersectionObserver adds one
 *  class when a frame comes into view, and CSS does the rest, once.
 *  Scroll velocity is never touched, so the page feels the same
 *  under your thumb as any other page — which is the whole point of
 *  "touch scrolling works naturally".
 *
 *  ── PERFORMANCE ──
 *  Every tile animates `transform` and `opacity` only. Both are
 *  composited on the GPU, so no tile ever triggers layout or paint
 *  — the browser moves finished textures around. Nine tiles across
 *  three pictures is 27 layers, which is why `will-change` is
 *  granted for the run and then **dropped**: `useInView` adds
 *  `is-done` when the animation is over and `.lux-tile` releases the
 *  hint there. Holding 27 permanent layers is how a phone runs out
 *  of GPU memory and starts stuttering on every later scroll.
 *
 *  Layout shift is zero by construction: the frame owns a fixed
 *  `aspect-ratio` and the tiles are absolutely positioned inside it,
 *  so the box occupies its final size before a single tile moves.
 *
 *  Nine tiles of the same photograph are nine <Image> tags with an
 *  identical `src` and `sizes`, so they resolve to one URL and the
 *  picture is downloaded once.
 *
 *  ── STILL A LINK ──
 *  The anchor wraps the whole frame and sits above the tiles, so
 *  each photograph is clickable throughout the animation, not only
 *  after it. Tiles are `pointer-events: none`.
 *
 *  ── NO LIBRARY ──
 *  GSAP/ScrollTrigger, Framer Motion and Lottie were all considered
 *  and none is used. Everything above is CSS plus one observer the
 *  project already had. Reasoning is in CHANGELOG.md.
 * ═══════════════════════════════════════════════════════════════
 */

const PIECES = [
  {
    key: 'shirt',
    n: '01',
    t: 'The Shirt',
    d: 'Mirror-cut placket, lace-edged sleeve.',
    src: '/products/womens-stitched-01-detail.jpg',
    alt: 'Block-print shirt front with mirror-cut placket',
  },
  {
    key: 'dupatta',
    n: '02',
    t: 'The Dupatta',
    d: 'Printed cotton net, 2.5m, border matched to the daaman.',
    src: '/products/womens-stitched-01-dupatta.jpg',
    alt: 'The printed dupatta of the same three piece',
  },
  {
    key: 'trouser',
    n: '03',
    t: 'The Trouser',
    d: 'Dyed cotton, cut on the straight grain.',
    src: '/products/womens-stitched-01-trouser.jpg',
    alt: 'The matching trouser with its lace daaman',
  },
];

const HREF = '/collections/womens-stitched';

const GRID = 3;                 // 3 x 3 = nine tiles
const TILES = GRID * GRID;

/**
 * Where each tile starts before it flies home.
 *
 * Deliberately arithmetic, not `Math.random()`. The brief asks for
 * deterministic, testable animation — and a random scatter would
 * also differ between the server render and the client, which React
 * reports as a hydration mismatch. The same index always produces
 * the same offset, on every device and every reload.
 */
function scatter(i, pieceIndex) {
  const col = i % GRID;
  const row = (i / GRID) | 0;

  // distance from the middle tile, -1 .. 1
  const dx = (col - (GRID - 1) / 2) / ((GRID - 1) / 2);
  const dy = (row - (GRID - 1) / 2) / ((GRID - 1) / 2);

  // a small fixed wobble, so the scatter is not a perfect starburst
  const wob = ((i * 37 + pieceIndex * 13) % 11) / 11 - 0.5;

  return {
    '--tx': `${(dx * 46 + wob * 16).toFixed(1)}%`,
    '--ty': `${(dy * 40 + wob * 14).toFixed(1)}%`,
    '--rot': `${(wob * 9).toFixed(2)}deg`,
    '--sc': (0.82 + Math.abs(wob) * 0.1).toFixed(3),
    // middle tiles land first, corners last — the picture knits
    // itself outward from its own centre
    '--delay': `${(0.062 * (Math.abs(dx) + Math.abs(dy)) * 2.4 + pieceIndex * 0.09).toFixed(3)}s`,
  };
}

function Frame({ piece, index }) {
  const [ref] = useInView({ threshold: 0.2, once: true });

  return (
    <figure className="lux-figure" ref={ref}>
      <Link href={HREF} className="lux-frame" aria-label={`${piece.t} — see the range`}>
        {Array.from({ length: TILES }, (_, i) => {
          const col = i % GRID;
          const row = (i / GRID) | 0;
          return (
            <span
              className="lux-tile"
              key={i}
              style={{
                ...scatter(i, index),
                left: `${(col * 100) / GRID}%`,
                top: `${(row * 100) / GRID}%`,
              }}
            >
              <Image
                quality={90}
                src={piece.src}
                alt={i === 0 ? piece.alt : ''}
                width={900}
                height={1200}
                sizes="(max-width: 860px) 76vw, 30vw"
                style={{ left: `${-col * 100}%`, top: `${-row * 100}%` }}
              />
            </span>
          );
        })}

        {/* A hairline that draws itself across the picture once the
            tiles have landed — the same gold rule the rest of the
            site uses, here as the full stop on the animation. */}
        <span className="lux-rule" aria-hidden="true" />
      </Link>

      <figcaption>
        <span className="n">{piece.n}</span>
        <span className="t">{piece.t}</span>
        <span className="d">{piece.d}</span>
      </figcaption>
    </figure>
  );
}

export default function Anatomy() {
  return (
    <section className="lux-gallery section container band-top" id="ensuite">
      <div className="lux-gallery-head">
        <Reveal from="none">
          <span className="eyebrow">Anatomy of a Three Piece</span>
        </Reveal>

        <WordReveal
          as="h2"
          style={{ marginTop: '1rem' }}
          segments={[{ text: 'Every suit is' }, { text: 'three decisions.', em: true }]}
        />

        <Reveal delay={0.12}>
          <p className="lede">
            Shirt, dupatta, trouser. Each is cut, embroidered and finished
            separately, then matched by hand before it is folded.
          </p>
        </Reveal>
      </div>

      <div className="lux-rail">
        {PIECES.map((piece, i) => (
          <Frame piece={piece} index={i} key={piece.key} />
        ))}
      </div>

      <Reveal delay={0.16} className="lux-gallery-foot">
        <Link href={HREF} className="link-arrow">
          See the three-piece range
          <ArrowRight className="arrow" width={15} height={15} />
        </Link>
      </Reveal>
    </section>
  );
}

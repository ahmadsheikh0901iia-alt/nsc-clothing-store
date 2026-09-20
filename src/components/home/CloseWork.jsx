'use client';

import Link from 'next/link';
import Image from 'next/image';
import ScrollScene from '@/components/motion/ScrollScene';
import WordReveal from '@/components/motion/WordReveal';
import Reveal from '@/components/motion/Reveal';
import { CLOSE_WORK } from '@/lib/constants';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  CLOSE WORK — the trust section
 *  ─────────────────────────────────────────────────────────────
 *  The single thing a customer cannot do online is touch the cloth,
 *  and that is the reason most of them hesitate. So this section
 *  does the next best thing: a loupe travels across the garment as
 *  you scroll and magnifies what is under it, while the specs of
 *  the fabric name themselves one by one alongside.
 *
 *  Everything moves off the one `--p` value the ScrollScene writes,
 *  so it is a single number driving the whole scene — no timers, no
 *  re-renders, and scrolling back up reverses it exactly.
 *
 *  Change the photographs and the spec list in CLOSE_WORK in
 *  lib/constants.js. Point `wide` at a full shot and `macro` at a
 *  tight crop of the same piece.
 * ═══════════════════════════════════════════════════════════════
 */
export default function CloseWork() {
  const { wide, macro, eyebrow, title, body, specs, href } = CLOSE_WORK;

  return (
    <ScrollScene className="close-work section container band-top">
      <div className="cw-grid">
        {/* ── The plate ──
            The wide shot gets the site's usual uncovering reveal; the
            loupe sits outside that wrapper because it carries its own
            circular clip and the two would fight. */}
        <div className="cw-plate">
          <Reveal className="cw-wide" mask>
            <Image
              quality={92}
              src={wide}
              alt="The full garment, photographed for drape"
              width={900}
              height={1200}
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          </Reveal>

          {/* Position, and the crop inside it, are both functions of
              scroll position — see .cw-loupe in sections.css. */}
          <div className="cw-loupe" aria-hidden="true">
            <Image
                quality={92} src={macro} alt="" width={900} height={1200} sizes="340px" />
          </div>

          <span className="cw-scan" aria-hidden="true" />

          <span className="cw-mag caps" aria-hidden="true">
            Macro · true colour
          </span>
        </div>

        {/* ── The specs ── */}
        <div className="cw-side">
          <Reveal from="none">
            <span className="eyebrow">{eyebrow}</span>
          </Reveal>

          <WordReveal
            as="h2"
            style={{ marginTop: '0.9rem' }}
            segments={[{ text: title.split(' ')[0] }, { text: title.split(' ').slice(1).join(' '), em: true }]}
          />

          <Reveal delay={0.12}>
            <p className="lede" style={{ marginTop: '1.35rem' }}>
              {body}
            </p>
          </Reveal>

          <dl className="cw-specs">
            {specs.map((spec, i) => (
              <div
                className="cw-spec"
                key={spec.k}
                /* Each row resolves out of the hairline as the loupe
                   reaches roughly the part of the cloth it describes. */
                style={{ '--at': 0.16 + i * 0.08 }}
              >
                <dt>{spec.k}</dt>
                <dd>{spec.v}</dd>
              </div>
            ))}
          </dl>

          <Reveal delay={0.2} style={{ marginTop: '2rem' }}>
            <Link href={href} className="link-arrow">
              See it in the collection
              <ArrowRight className="arrow" width={15} height={15} />
            </Link>
          </Reveal>
        </div>
      </div>
    </ScrollScene>
  );
}

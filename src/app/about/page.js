import Link from 'next/link';
import Image from 'next/image';
import ScrollScene from '@/components/motion/ScrollScene';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import Stagger from '@/components/motion/Stagger';
import AtelierFlow from '@/components/atelier/AtelierFlow';
import PhotoDrift from '@/components/atelier/PhotoDrift';
import AutoVideo from '@/components/motion/AutoVideo';
import Ribbon from '@/components/home/Ribbon';
import CtaBand from '@/components/home/CtaBand';
import { ATELIER, STATS } from '@/lib/constants';

export const metadata = {
  title: 'The Atelier',
  description:
    'How NSC Clothing Store makes and finishes its clothing — fabric sourcing, pattern cutting, hand embroidery, and nationwide delivery from Faisalabad and Gujranwala.',
};

/* ═══════════════════════════════════════════════════════════════
   /about — THE ATELIER
   ───────────────────────────────────────────────────────────────
   Ye safha maal nahi bechta. Ye wo jagah hai jahan khareedne wala
   ye faisla karta hai ke is ghar par bharosa karna hai ya nahi —
   is liye yahan tehreer kam aur kaam ziyada dikhna chahiye.

   Chhe teh, oopar se neeche:

     1. Film    — poora safha, khamosh, dheemi. Sar par lafz.
     2. Usool   — ghar ka ek jumla, do tasveeron ke darmiyan jo
                  scroll ke sath ek dusre ke mukhalif chalti hain.
     3. Ginti   — chaar aadad, bina shor ke.
     4. Bahaao  — tasveeron ki do qatarein, ulti simton mein.
     5. Farsh   — paanch qadam, paanch tasveerein, chipki hui.
     6. Takhti  — chaurai bhar ki ek tasveer, phir teen usool.

   Har hissa apna saman ATELIER se uthata hai (lib/constants.js).
   Tehreer badalni ho to wahan badlein — yahan kuch nahi likha.
   ═══════════════════════════════════════════════════════════════ */

export default function AboutPage() {
  const { eyebrow, title, lede, creed, creedShots, drift, driftBack, plate, values } =
    ATELIER;

  return (
    <>
      {/* ═══ 1. FILM ═══════════════════════════════════════════ */}
      <ScrollScene className="atopen" mode="cover">
        <div className="atopen-media" aria-hidden="true">
          {/* Saada `<video autoplay>` phone par aksar khari reh jati
              hai — battery saver, ya safha tab peechay khulna. Ye
              wohi AutoVideo hai jo home page par bhi lagta hai: har
              us lamhe par dobara koshish karta hai jab chalne ka
              imkaan bane, aur pehle chhoone par zaroor chal parta
              hai. Nazar se hat jaye to khud ruk bhi jata hai. */}
          <AutoVideo
            eager
            poster="/media/atelier-poster.jpg"
            sources={[
              { src: '/media/atelier-loop.webm', type: 'video/webm' },
              { src: '/media/atelier-loop.mp4', type: 'video/mp4' },
            ]}
          />
        </div>
        <span className="atopen-scrim" aria-hidden="true" />

        <div className="container atopen-inner">
          <Reveal from="none">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Atelier</span>
            </nav>
          </Reveal>

          <Reveal from="none" delay={0.1}>
            <span className="eyebrow" style={{ marginTop: '2rem', display: 'block' }}>
              {eyebrow}
            </span>
          </Reveal>

          <WordReveal
            as="h1"
            className="atopen-title"
            delay={0.2}
            step={0.05}
            segments={[{ text: title.lead }, { text: title.em, em: true }]}
          />

          <Reveal className="atopen-lede" delay={0.6} y={20}>
            <p className="lede">{lede}</p>
          </Reveal>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll</span>
          <span className="rail" />
        </div>
      </ScrollScene>

      {/* ═══ 2. THE HOUSE RULE ═════════════════════════════════ */}
      <ScrollScene className="creed" mode="cover">
        <div className="container creed-inner">
          <Reveal mask className="creed-shot creed-shot-a">
            <Image
              src={creedShots[0].src}
              alt={creedShots[0].alt}
              width={900}
              height={1200}
              sizes="(max-width: 900px) 40vw, 260px"
            />
          </Reveal>

          <blockquote className="creed-quote">
            <WordReveal as="p" className="creed-q" text={creed.quote} step={0.045} />
            <Reveal delay={0.3}>
              <cite className="creed-by caps">{creed.by}</cite>
            </Reveal>
          </blockquote>

          <Reveal mask className="creed-shot creed-shot-b" delay={0.12}>
            <Image
              src={creedShots[1].src}
              alt={creedShots[1].alt}
              width={900}
              height={1200}
              sizes="(max-width: 900px) 40vw, 260px"
            />
          </Reveal>
        </div>
      </ScrollScene>

      {/* ═══ 3. FOUR NUMBERS ═══════════════════════════════════ */}
      <section className="container section-tight">
        <Stagger className="stat-row">
          {STATS.map((s) => (
            <div className="stat" key={s.k}>
              <p className="v num">{s.v}</p>
              <p className="k">{s.k}</p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ═══ 4. TWO DRIFTING ROWS ══════════════════════════════ */}
      <section className="drift-band" aria-label="From the studio">
        <PhotoDrift items={drift} duration={68} />
        <PhotoDrift items={driftBack} duration={82} reverse />
      </section>

      {/* ═══ 5. THE FLOOR ═════════════════════════════════════ */}
      <section className="container section-tight atflow-head">
        <Reveal from="none">
          <span className="eyebrow">How it is made</span>
        </Reveal>
        <WordReveal
          as="h2"
          style={{ marginTop: '1rem' }}
          segments={[{ text: 'From bolt' }, { text: 'to box.', em: true }]}
        />
        <Reveal delay={0.12}>
          <p className="lede" style={{ marginTop: '1.25rem', maxWidth: '52ch' }}>
            Five stages, none of them rushed — the same order of work whether the
            piece is a five-thousand-rupee kurta or a formal that takes three days
            of hand embroidery.
          </p>
        </Reveal>
      </section>

      <AtelierFlow />

      {/* ═══ 6. THE PLATE ═════════════════════════════════════ */}
      <ScrollScene className="atplate" mode="cover">
        <Reveal mask className="atplate-shot">
          <Image
            src={plate.src}
            alt={plate.alt}
            width={1536}
            height={1024}
            sizes="100vw"
          />
        </Reveal>
        <span className="atplate-wash" aria-hidden="true" />
        <Reveal className="atplate-cap container" delay={0.2}>
          <p className="display">{plate.caption}</p>
        </Reveal>
      </ScrollScene>

      {/* ═══ THREE RULES ══════════════════════════════════════ */}
      <section className="section container">
        <div className="sec-head">
          <div>
            <Reveal from="none">
              <span className="eyebrow">What we hold to</span>
            </Reveal>
            <WordReveal
              as="h2"
              style={{ marginTop: '1rem' }}
              segments={[{ text: 'Three rules,' }, { text: 'kept.', em: true }]}
            />
          </div>
        </div>

        <Stagger className="grid-3 rules">
          {values.map((v, i) => (
            <div key={v.t} className="rule">
              <span className="rule-n num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="hr" />
              <h3 className="display">{v.t}</h3>
              <p className="muted">{v.b}</p>
            </div>
          ))}
        </Stagger>
      </section>

      <Ribbon duration={56} />
      <CtaBand />
    </>
  );
}

'use client';

import Link from 'next/link';
import ScrollScene from '@/components/motion/ScrollScene';
import WordReveal from '@/components/motion/WordReveal';
import Reveal from '@/components/motion/Reveal';
import AutoVideo from '@/components/motion/AutoVideo';
import { STORE } from '@/lib/constants';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  HERO
 *  ─────────────────────────────────────────────────────────────
 *  Poora safha. Peechay aap ki apni film chalti hai — ek suit,
 *  andhere studio mein latka hua, dheere se saans leta hua.
 *
 *  ── DO FILMEIN, EK HI FOOTAGE ──
 *  Asal footage khari (portrait) hai. Laptop par khari film ko
 *  chaurey khane mein daalein to ya to kinare kat jate hain ya
 *  suit ka aadha hissa bahar reh jata hai. Is liye laptop ke
 *  liye ek chaura frame banaya gaya hai jis mein suit beech
 *  mein poora nazar aata hai aur dono taraf wohi andhera studio
 *  phaila diya gaya hai jo film ke apne peechay hai — jor kahin
 *  nazar nahi aata. Phone ke liye asli khari film jati hai, jo
 *  wahan poori screen bharti hai.
 *
 *  Film khamosh hai, chalti rehti hai, aur loop par jor nahi
 *  khata: aakhri lamha pehle lamhe mein ghul jata hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Hero() {
  return (
    <ScrollScene className="hero" mode="cover">
      {/* ── Film ── */}
      <div className="hero-media">
        <AutoVideo
          eager
          poster="/media/hero-poster.jpg"
          mobilePoster="/media/hero-poster-portrait.jpg"
          sources={[
            { src: '/media/hero-loop.webm', type: 'video/webm' },
            { src: '/media/hero-loop.mp4', type: 'video/mp4' },
          ]}
          mobileSources={[
            { src: '/media/hero-loop-portrait.webm', type: 'video/webm' },
            { src: '/media/hero-loop-portrait.mp4', type: 'video/mp4' },
          ]}
          aria-hidden="true"
        />
      </div>

      <div className="hero-scrim" />

      {/* ── Content ── */}
      <div className="hero-inner container">
        <Reveal className="hero-eyebrow" from="none" delay={0.15}>
          <span className="eyebrow">{STORE.name}</span>
        </Reveal>

        <WordReveal
          as="h1"
          className="hero-title"
          delay={0.25}
          step={0.055}
          segments={[
            { text: 'Cloth that outlives' },
            { text: 'the season.', em: true },
          ]}
        />

        <div className="hero-foot">
          <Reveal className="hero-lede" delay={0.7} y={20}>
            <p className="lede">
              Stitched and unstitched pieces, hand-finished shawls, and block-print
              bedsheets woven to last. Made in Pakistan, delivered to your door,
              paid for when it arrives.
            </p>
          </Reveal>

          <Reveal className="hero-cta" delay={0.85} y={20}>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Shop the collection
              <ArrowRight className="arrow" width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <span className="rail" />
      </div>
    </ScrollScene>
  );
}

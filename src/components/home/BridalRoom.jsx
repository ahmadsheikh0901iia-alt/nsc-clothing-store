'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollScene from '@/components/motion/ScrollScene';
import AutoVideo from '@/components/motion/AutoVideo';
import WordReveal from '@/components/motion/WordReveal';
import Reveal from '@/components/motion/Reveal';
import Stagger from '@/components/motion/Stagger';
import { BRIDAL } from '@/lib/constants';
import { ArrowRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE BRIDAL ROOM
 *  ─────────────────────────────────────────────────────────────
 *  Site ka sab se mehnga piece deserve karta hai ke usay saada
 *  grid mein na rakha jaye. Ye section ek hi dress ko poora
 *  safha deta hai.
 *
 *  Teen tehein, ek dosre ke oopar:
 *
 *    1. Film — portrait, sunehri hairline ke andar. Chalti tabhi
 *       hai jab wo screen par aati hai, aur ruk jati hai jab
 *       nazar se hat jati hai. Ye poora intezam ab AutoVideo
 *       karta hai — wohi jo hero par bhi lagta hai — is liye
 *       phone par bhi film waise hi chalti hai jaise laptop par.
 *
 *    2. Copy — eyebrow, headline lafz-ba-lafz khulta hua, aur
 *       kaam ki tafseel jo ek ek kar ke aati hai.
 *
 *    3. Tasveer — neeche, thori si ubhri hui, scroll ke sath
 *       narmi se safar karti hui. Yehi teh section ko "do cheezein
 *       side by side" se nikal kar tarteeb deti hai.
 *
 *  ── VIDEO KYUN IS TARAH ──
 *  `preload="none"` aur IntersectionObserver ka jora: browser
 *  video ko chhoota bhi nahi jab tak visitor us tak na pohanche.
 *  Home page pehle jitna hi tez rehta hai, chahe film kitni hi
 *  bari ho.
 *
 *  Sab kuch BRIDAL se aata hai — lib/constants.js mein. Wahan
 *  badlein, yahan khud badal jayega.
 * ═══════════════════════════════════════════════════════════════
 */
export default function BridalRoom() {
  const [ready, setReady] = useState(false);

  const { eyebrow, title, lede, body, specs, note, href, cta, video, poster, still, stillAlt } =
    BRIDAL;

  return (
    <ScrollScene className="bridal" mode="cover">
      {/* Peechay halka sa sunehri ujala — section ko apna kamra deta hai */}
      <span className="bridal-glow" aria-hidden="true" />

      <div className="container bridal-inner">
        {/* ── Upar: film aur copy ── */}
        <div className="bridal-top">
          {/* Film */}
          <div className="bridal-film" data-ready={ready ? 'true' : 'false'}>
            <div className="bridal-film-frame">
              {/* Poster ek alag teh hai, film ke neeche — aur wo
                  hamesha nazar aata hai. Film us ke oopar narmi se
                  khulti hai. Is tarah khana ek lamhe ke liye bhi
                  khali nahi rehta: na dheeme internet par, na us
                  browser mein jo autoplay rok deta hai. */}
              <span
                className="bridal-film-poster"
                aria-hidden="true"
                style={{ backgroundImage: `url(${poster})` }}
              />

              <AutoVideo
                poster={poster}
                sources={[
                  { src: `${video}.webm`, type: 'video/webm' },
                  { src: `${video}.mp4`, type: 'video/mp4' },
                ]}
                aria-label={`${title.lead} ${title.em}`}
                onReady={() => setReady(true)}
              />

              {/* Shishe par se guzarti hui chamak */}
              <span className="bridal-film-sheen" aria-hidden="true" />

              {/* Dohra sunehri kinara aur konon ke nishan */}
              <span className="bridal-film-edge" aria-hidden="true" />
            </div>

            <span className="bridal-film-tag caps" aria-hidden="true">
              {note}
            </span>
          </div>

          {/* Copy */}
          <div className="bridal-copy">
            <Reveal from="none">
              <span className="eyebrow">{eyebrow}</span>
            </Reveal>

            <WordReveal
              as="h2"
              className="bridal-title"
              segments={[{ text: title.lead }, { text: title.em, em: true }]}
            />

            <Reveal delay={0.12}>
              <p className="lede bridal-lede">{lede}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <p className="bridal-body">{body}</p>
            </Reveal>

            <Stagger className="bridal-specs" step={0.07}>
              {specs.map((spec) => (
                <div className="bridal-spec" key={spec.k}>
                  <span className="bridal-spec-k">{spec.k}</span>
                  <span className="bridal-spec-v">{spec.v}</span>
                </div>
              ))}
            </Stagger>

            <Reveal delay={0.24} className="bridal-cta">
              <Link href={href} className="btn btn-gold btn-lg">
                {cta}
                <ArrowRight className="arrow" width={16} height={16} />
              </Link>
            </Reveal>
          </div>
        </div>

        {/* ── Neeche: chaurai bhar ki tasveer ──
            ── IS TASVEER MEIN "KOI ANIMATION NAZAR NAHI AATI THI" ──
            Animation maujood thi — poore do second ka mask uncover
            aur 2.4 second ka zoom. Masla ye tha ke wo CHAL CHUKI
            HOTI THI jab tak grahak yahan pohanchta.

            `useInView` ka pehra element ko "nazar mein" samajh leta
            tha jaise hi us ka SIRA screen ke sab se neeche wale
            kinare (92% bulandi) ko chhoo leta. Ek 16:9 ki plate us
            waqt sirf ek patli si jhalak hoti hai — aur do second
            baad, jab wo asal mein screen par aati hai, uncover
            khatam ho chuka hota hai. Tasveer bas "wahan hoti thi".

            Do cheezein badli hain:

              enter={0.62}  tasveer ka sira do-tihai screen tak aaye,
                            PHIR animation shuru ho. Yehi asal fix hai.
              delay={0.42}   us ke baad bhi ek lamha thehar kar —
                            grahak ne "thora wait le kar" kaha tha.

            Aur `bridal-plate` ki apni harkat sections.css mein ab
            zyada khuli hai: neeche se uncover, halka sa oopar aana,
            aur guzarti hui sunehri lakeer. */}
        <Reveal className="bridal-plate" mask delay={0.42} enter={0.62} threshold={0.26}>
          <Image
            quality={92}
            src={still}
            alt={stillAlt}
            width={1536}
            height={1024}
            sizes="(max-width: 1100px) 100vw, 1100px"
          />
          <span className="bridal-plate-wash" aria-hidden="true" />
          <span className="bridal-plate-sweep" aria-hidden="true" />
        </Reveal>
      </div>
    </ScrollScene>
  );
}

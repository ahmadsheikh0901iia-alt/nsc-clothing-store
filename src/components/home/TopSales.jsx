'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPKR } from '@/lib/constants';
import { discountPct, primaryImage } from '@/lib/utils';

/**
 * ═══════════════════════════════════════════════════════════════
 *  TOP SALES — EK GHOOMTA HUA 3D DAIRA
 *  ─────────────────────────────────────────────────────────────
 *  Home page par pehla kaam ye hai ke dekhne wale ko FAURAN pata
 *  chale: is dukaan par abhi sale lagi hui hai. Is liye ye khana
 *  khud chalta hai — kisi button ka intezar nahi karta.
 *
 *  ── YE WAQAI 3D HAI ──
 *  Cards ek khayali silinder ke gird lagaye gaye hain. Har card
 *  apni jagah par ghuma kar aage dhakela jata hai:
 *
 *      rotateY(k × step) translateZ(r)
 *
 *  aur poora daira ulti simt ghooma diya jata hai. Nateeja: cards
 *  waqai gehrai mein aate jate hain — peeche wale chhote aur
 *  dhundle, samne wala bara aur saaf. Ye tasveer ka dhoka nahi,
 *  browser ka apna 3D hai. Samne wala card thora aur aage bhi
 *  aata hai (`--pop`), aur poore daire ka nuqta-e-nazar bohat
 *  dheere dheere sarakta rehta hai — is liye khana kabhi bilkul
 *  jama hua nahi lagta.
 *
 *  ── KOI LIBRARY NAHI ──
 *  Na three.js, na GSAP. Sirf `perspective`, `transform-style` aur
 *  `rotateY` — jo har phone ka browser khud samajhta hai. Bundle
 *  mein ek byte ka izafa nahi, aur chalne mein GPU ka kaam.
 *
 *  ═══════════════════════════════════════════════════════════════
 *  TEEN KHARABIYAN JIN KI WAJAH SE YE "KHUD AAGE NAHI BARHTA THA"
 *  ═══════════════════════════════════════════════════════════════
 *
 *  1. PHONE PAR EK DAFA CHHOO LENE SE HAMESHA KE LIYE RUK JATA THA.
 *     `onTouchStart` `held` ko `true` kar deta tha — aur usay
 *     `false` karne wala koi nahi tha. Na `onTouchEnd`, na
 *     `onTouchCancel`. Yani grahak ne safhe par ek dafa ungli
 *     rakhi, aur daira us ke baad kabhi khud nahi chala. Ab
 *     ungli uthne par gin kar dhai second baad chal parta hai
 *     (foran nahi — warna ungli uthte hi card badalna jhatka
 *     lagta hai).
 *
 *  2. LAPTOP PAR CURSOR KAHIN BHI HO TO RUK JATA THA. `hold`
 *     poore `.tsale-stage` par laga tha — aur wo stage poori
 *     chaurai aur 430px qad ka hai. Grahak scroll kar ke is khane
 *     par aata hai aur us ka cursor qudrati taur par beech mein
 *     hota hai — yani stage ke oopar. Daira shuru hi nahi hota.
 *     Ab rukna sirf CARD par aane se hai, ya keyboard us ke andar
 *     hone se. Poora khana chhoo lene se nahi.
 *
 *  3. HATH SE SCROLL KARNE PAR CARD "SHADE MEIN" CHALA JATA THA.
 *     Qatar wali shakl (phone) mein `i` sirf button dabane se
 *     badalta tha. Grahak ungli se qatar khiskata, teesra card
 *     beech mein aa jata — magar `i` abhi bhi 0 hota, is liye
 *     `data-on` pehle card par rehta aur jo card samne tha wo
 *     `opacity: 0.5` par khara rehta. Ab qatar ka scroll khud
 *     bata deta hai ke beech mein kaun hai.
 *
 *  ── RUKTA KAB HAI ──
 *  Har 4.4 second baad agla card. Ruk jata hai jab:
 *    · cursor kisi CARD par ho, ya keyboard us ke andar
 *    · ungli qatar par rakhi ho (uthne ke 2.5 sec baad chalu)
 *    · khana screen par na ho (IntersectionObserver)
 *    · safha peeche chala jaye (tab badal jaye)
 *    · grahak ne apne phone mein harkat kam karne ka kaha ho
 *
 *  Waqt ka hisaab `setInterval` se nahi, `setTimeout` ki zanjeer
 *  se hai: ek qadam ka timer agle qadam par naya lagta hai. Faida
 *  ye ke button dabane par poora 4.4 second milta hai — pehle
 *  interval apni chaal par chalta rehta tha aur kabhi kabhi
 *  grahak ke dabane ke foran baad hi card khisak jata tha.
 *
 *  ── PHONE PAR DAIRA NAHI ──
 *  350px par ghoomta hua silinder bekar hai — cards ya to bahut
 *  chhote hon ge ya ek doosre par charh jayen ge. Wahan ye ek
 *  khiskne wali qatar ban jata hai jo khud aage barhti hai, aur
 *  har card apni taraf ke hisab se halka sa 3D mein muurta hai.
 *  Dono soorat mein: khud chalta hua, 3D, aur istemal ke qabil.
 * ═══════════════════════════════════════════════════════════════
 */

/** Ek card kitni der samne rehta hai.
 *
 *  Pehle 4400ms tha. Grahak ne poori site par do second maanga, is
 *  liye ab 2000ms hai — aur yehi ek number poore khane ki raftar
 *  chalata hai.
 *
 *  Is ke sath sections.css mein teen waqt bhi chhote kiye gaye
 *  hain, warna harkat apne hi qadam se lambi reh jati: daire ka
 *  ghoomna 1.25s se 0.85s, card ka dhundla se roshan hona 0.85s se
 *  0.55s, aur chamak 2.55s se 1.37s. Jo harkat qadam se lambi ho
 *  wo adhoori kat jati hai — aur adhoori kati harkat jhatke ki
 *  tarah dikhti hai. */
const STEP_MS = 2000;

/** Ungli uthne ke baad kitni der ruk kar phir chalna hai. Qadam ke
 *  hisab se chhota kiya gaya: 2.5 second ka intezar ab poore ek
 *  qadam se lamba tha. */
const RELEASE_MS = 1600;

/** Khud scroll karne ke baad itni der qatar ka scroll na sunein —
 *  warna hamara apna smooth scroll `i` ko peeche kheench leta hai.
 *  Smooth scroll khud ~400ms leta hai, is liye 650 kaafi hai; 900
 *  ab qadam ka aadha se zyada hissa kha jata tha. */
const LOCK_MS = 650;

export default function TopSales({ products = [] }) {
  const items = products.slice(0, 8);
  const n = items.length;

  const [i, setI] = useState(0);
  const [ring, setRing] = useState(false); // daira ya qatar
  const [live, setLive] = useState(false); // screen par hai?
  const [awake, setAwake] = useState(true); // tab samne hai?
  const [held, setHeld] = useState(false); // ungli / cursor / keyboard

  const stageRef = useRef(null);
  const railRef = useRef(null);
  const lockRef = useRef(0);
  const releaseRef = useRef(0);

  /* Daira sirf bari screen par. 860px ek naap hai jahan card
     itna bara reh jata hai ke gehrai ka matlab bane. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)');
    const sync = () => setRing(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  /* Screen par na ho to ghoomne ka koi faida nahi — phone ki
     battery bhi ek cheez hai. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setLive(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => setLive(e.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Tab badal jaye to ruk jayen. Pehle ye `setInterval` ke andar
     se handle hota tha aur interval sirf ek dafa saaf hota tha. */
  useEffect(() => {
    const sync = () => setAwake(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  /* Unmount par baqi timer saaf. */
  useEffect(() => () => window.clearTimeout(releaseRef.current), []);

  const go = useCallback(
    (next) => {
      if (n === 0) return;
      setI(((next % n) + n) % n);
    },
    [n]
  );

  /* ── KHUD CHALNA ──
     Zanjeer, interval nahi: `i` badalne par naya timer lagta hai,
     is liye har qadam ko poora 4.4 second milta hai — chahe wo
     qadam khud chal kar aaya ho ya grahak ke dabane se. */
  useEffect(() => {
    if (n < 2 || !live || !awake || held) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const t = window.setTimeout(() => setI((v) => (v + 1) % n), STEP_MS);
    return () => window.clearTimeout(t);
  }, [i, n, live, awake, held]);

  /* ── Qatar: card ko khud samne le aana ──
     Pehle ye har dafa `scrollTo` chala deta tha, chahe card pehle
     se theek jagah par ho. Us se apna hi scroll event chalta aur
     neeche wala naapne wala uljh jata. Ab pehle dekha jata hai ke
     harkat ki zaroorat hai ya nahi. */
  useEffect(() => {
    if (ring) return;
    const rail = railRef.current;
    const card = rail?.children?.[i];
    if (!rail || !card) return;

    const left = card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2;
    if (Math.abs(rail.scrollLeft - left) < 4) return;

    lockRef.current = Date.now() + LOCK_MS;
    rail.scrollTo({ left, behavior: 'smooth' });
  }, [i, ring]);

  /* ── Qatar ka scroll khud bata deta hai ke beech mein kaun hai ──
     Yehi wo cheez thi jis ki kami se hath se khiskaya hua card
     "shade mein" reh jata tha. */
  useEffect(() => {
    if (ring) return undefined;
    const rail = railRef.current;
    if (!rail) return undefined;

    let raf = 0;

    const measure = () => {
      raf = 0;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k < rail.children.length; k += 1) {
        const c = rail.children[k];
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      }
      setI((v) => (v === best ? v : best));
    };

    const onScroll = () => {
      if (Date.now() < lockRef.current) return; // apna hi scroll chal raha hai
      if (raf) return;
      raf = window.requestAnimationFrame(measure);
    };

    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      rail.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ring, n]);

  if (n === 0) return null;

  /* Ungli: rakhne par rok, uthne par thori der baad chalu. */
  const release = () => {
    window.clearTimeout(releaseRef.current);
    releaseRef.current = window.setTimeout(() => setHeld(false), RELEASE_MS);
  };

  const stageTouch = {
    onTouchStart: () => {
      window.clearTimeout(releaseRef.current);
      setHeld(true);
    },
    onTouchEnd: release,
    onTouchCancel: release,
  };

  /* Sirf CARD par — poore stage par nahi. Wajah oopar likhi hai. */
  const cardHold = {
    onMouseEnter: () => setHeld(true),
    onMouseLeave: () => setHeld(false),
    onFocusCapture: () => setHeld(true),
    onBlurCapture: () => setHeld(false),
  };

  /* Daire mein: samne wale se kitna door hai (gol hisaab se). */
  const gap = (k) => {
    const d = Math.abs(k - i);
    return Math.min(d, n - d);
  };

  return (
    <section className="tsale" aria-labelledby="tsale-title">
      {/* Peeche se guzarti hui sunehri roshni */}
      <span className="tsale-glow" aria-hidden="true" />

      <div className="container tsale-head">
        <span className="tsale-flag">
          <span className="tsale-flag-dot" aria-hidden="true" />
          Sale is on
        </span>

        <h2 id="tsale-title" className="display tsale-title">
          Top Sales
        </h2>

        <p className="lede tsale-lede">
          Jo abhi sab se zyada ja raha hai — aur jis par abhi daam kam hai.
          Cash on delivery, poore Pakistan mein.
        </p>
      </div>

      <div
        className="tsale-stage"
        data-mode={ring ? 'ring' : 'rail'}
        data-held={held ? 'true' : 'false'}
        ref={stageRef}
        {...stageTouch}
      >
        {ring ? (
          <div className="tsale-ring" style={{ '--n': n, '--i': i }} role="list">
            {items.map((p, k) => (
              <Card
                key={p.id}
                product={p}
                k={k}
                active={k === i}
                gap={gap(k)}
                inRing
                hold={cardHold}
              />
            ))}
          </div>
        ) : (
          <div className="tsale-rail no-scrollbar" ref={railRef} role="list">
            {items.map((p, k) => (
              <Card
                key={p.id}
                product={p}
                k={k}
                active={k === i}
                gap={gap(k)}
                side={Math.sign(k - i)}
                hold={cardHold}
              />
            ))}
          </div>
        )}
      </div>

      <div className="container tsale-foot">
        <div className="tsale-dots" role="tablist" aria-label="Choose a piece">
          {items.map((p, k) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              className="tsale-dot"
              aria-selected={k === i}
              aria-label={p.name}
              onClick={() => go(k)}
            />
          ))}
        </div>

        <Link href="/collections/top-sales" className="btn btn-gold tsale-all">
          See everything on sale
        </Link>
      </div>
    </section>
  );
}

/* ── Ek card ──
   `data-gap` se CSS ko pata chalta hai ke ye card samne wale se
   kitna door hai: paas wale thore roshan, door wale thore dhundle.
   Ek hi `opacity: 0.5` sab par lagane se daira chapta lagta tha. */
function Card({ product, k, active, gap = 0, side, inRing = false, hold }) {
  const off = discountPct(product.price, product.compare_at_price);
  const soldOut = product.in_stock === false || product.stock_count === 0;

  return (
    <article
      className="tsale-card"
      role="listitem"
      style={inRing ? { '--k': k } : undefined}
      data-on={active ? 'true' : 'false'}
      data-gap={gap > 2 ? '3' : String(gap)}
      data-side={side == null ? undefined : String(side)}
      {...hold}
    >
      <Link href={`/shop/${product.slug}`} className="tsale-link">
        <span className="tsale-shot">
          <Image
            quality={90}
            src={primaryImage(product)}
            alt={product.name}
            width={900}
            height={1200}
            sizes="(max-width: 860px) 62vw, 280px"
          />
          {off ? (
            <span className="tsale-off" aria-hidden="true">
              <strong>{off}%</strong>
              <em>off</em>
            </span>
          ) : null}
          {soldOut && <span className="tsale-out">Sold out</span>}
          {/* Samne aate waqt shishe par se guzarti hui chamak */}
          <span className="tsale-sheen" aria-hidden="true" />
        </span>

        <span className="tsale-body">
          <span className="tsale-name">{product.name}</span>
          <span className="tsale-price num">
            {product.compare_at_price > product.price && (
              <s>{formatPKR(product.compare_at_price)}</s>
            )}
            {formatPKR(product.price)}
          </span>
        </span>
      </Link>
    </article>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe } from '@/lib/scroll';

/* ═══════════════════════════════════════════════════════════════
   AUTO VIDEO — wo film jo phone par bhi WAQAI chalti hai
   ───────────────────────────────────────────────────────────────
   `<video autoplay muted playsinline>` kaaghaz par kaafi hona
   chahiye. Asal duniya mein nahi hota. Phone par teen alag
   wajuhaat se film khari reh jati hai:

     1. Battery saver / Low Power Mode — browser autoplay rok
        deta hai, chahe film muted ho.
     2. `muted` sirf attribute ho aur property na ho — kuch
        browser attribute ko nazar-andaz kar dete hain.
     3. Safha us waqt khula ho jab tab peechay ho; browser film
        shuru hi nahi karta, aur wapas aane par dobara koshish
        bhi nahi karta.

   Is liye yahan ek hi dafa "play" keh kar chhora nahi jata. Har
   us lamhe par dobara koshish hoti hai jab chalne ka imkaan
   paida hota hai: film load hone par, safha nazar mein aane par,
   tab wapas samne aane par, aur — sab se ahem — jab visitor
   PEHLI DAFA screen ko chhoota hai. Wo chhoona browser ke liye
   "user gesture" hai, aur us ke baad har browser film chalne
   deta hai.

   ── PHONE KI APNI FILM ──
   Landscape film phone par bekar lagti hai: cover karte hue
   kinare kat jate hain. Is liye do files di ja sakti hain. HTML
   mein hamesha desktop wali likhi jati hai (JavaScript na chale
   to bhi kuch to chale), aur phone par pehle hi lamhe mein
   doosri laga di jati hai. `preload="metadata"` ki wajah se us
   se pehle mushkil se chand KB utarte hain.

   ── JO NAZAR MEIN NAHI ──
   Film us waqt ruk jati hai jab wo screen se hat jati hai. Ye
   sirf battery ka masla nahi — chalti hui video har frame par
   decode hoti hai, aur wohi cheez scroll ko atakta banati hai.
   ═══════════════════════════════════════════════════════════════ */

const isBrowser = () => typeof window !== 'undefined';

/* ═══════════════════════════════════════════════════════════════
   PEHRA — observer ke bharose nahi
   ───────────────────────────────────────────────────────────────
   Film ka chalna aur rukna pehle sirf IntersectionObserver par
   tha. Magar wo hamesha jawab nahi deta — battery saver mein, ya
   jab safha peechay khula ho. Us soorat mein film ya to chalti hi
   nahi, ya nazar se hat jane ke baad bhi chalti reh jati hai.

   Is liye yahan bhi wohi usool laga hai jo `useInView` par lagaya
   gaya tha: doosra raasta, poori site ke liye EK. Site ka apna
   scroll loop (ek listener, ek rAF) har harkat par naap leta hai,
   aur us ke sath ek dheema pehra bhi chalta hai un lamhon ke liye
   jab koi scroll hi na kare. Jis lamhe aakhri film safhe se hat
   jati hai, dono khud band ho jate hain.
   ═══════════════════════════════════════════════════════════════ */

const watched = new Set();
let stopScroll = null;
let slowTimer = 0;

function nearView(el) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  return r.bottom > -140 && r.top < vh + 140;
}

function patrol() {
  for (const entry of watched) {
    const { el, play, pause } = entry;
    if (!el.isConnected) {
      watched.delete(entry);
      // eslint-disable-next-line no-continue
      continue;
    }
    if (nearView(el)) {
      if (el.paused) play();
    } else if (!el.paused) {
      pause();
    }
  }
  if (watched.size === 0) release();
}

function release() {
  if (stopScroll) {
    stopScroll();
    stopScroll = null;
  }
  if (slowTimer) {
    window.clearInterval(slowTimer);
    slowTimer = 0;
  }
}

function guard(entry) {
  watched.add(entry);
  if (!stopScroll) stopScroll = subscribe(patrol);
  if (!slowTimer) slowTimer = window.setInterval(patrol, 500);
}

function unguard(entry) {
  watched.delete(entry);
  if (watched.size === 0) release();
}

export default function AutoVideo({
  /** [{ src, type }] — desktop; HTML mein yehi likhi jati hain */
  sources = [],
  /** [{ src, type }] — phone ki apni film (marzi ki baat hai) */
  mobileSources = null,
  poster = '',
  mobilePoster = '',
  /** is chaurai tak phone samjha jayega */
  maxMobile = 767,
  /** hero ke liye true — film foran maangi jati hai */
  eager = false,
  /** nazar se hatne par rok dein */
  pauseOffscreen = true,
  className = '',
  style,
  onReady,
  ...rest
}) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  const ready = useRef(false);

  /** Har koshish ka ek hi darwaza. */
  const play = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    /* Property bhi, attribute bhi — dono. Kuch browser sirf
       property dekhte hain, aur unmuted film kabhi khud nahi
       chalti. */
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  /* ── Phone ki film, aur pehli koshish ── */
  useEffect(() => {
    const v = ref.current;
    if (!v || !isBrowser()) return undefined;

    const small = window.matchMedia(`(max-width: ${maxMobile}px)`).matches;

    if (small && Array.isArray(mobileSources) && mobileSources.length) {
      /* Jo shakal ye browser parh sakta ho, wohi. `canPlayType`
         khali string deta hai jab jawab "nahi" ho. */
      const pick =
        mobileSources.find((s) => s.type && v.canPlayType(s.type)) || mobileSources[0];
      if (pick?.src && !v.currentSrc.endsWith(pick.src)) {
        if (mobilePoster) v.poster = mobilePoster;
        v.src = pick.src;
        v.load();
      }
    }

    v.preload = eager ? 'auto' : 'metadata';
    if (eager && v.readyState === 0) v.load();
    play();

    /* Chand dafa aur — pehli koshish aksar us waqt hoti hai jab
       film ke paas abhi ek frame bhi nahi hota. */
    const timers = [220, 700, 1600, 3200].map((ms) => window.setTimeout(play, ms));

    const onVisible = () => {
      if (document.visibilityState === 'visible') play();
    };
    document.addEventListener('visibilitychange', onVisible);

    /* Pehla chhoona = user gesture. Us ke baad har browser maan
       jata hai. Ek hi dafa, phir listener khud hat jata hai. */
    const nudge = () => play();
    const opts = { passive: true, once: true, capture: true };
    ['touchstart', 'pointerdown', 'mousedown', 'keydown', 'scroll'].forEach((e) =>
      window.addEventListener(e, nudge, opts)
    );

    return () => {
      timers.forEach(window.clearTimeout);
      document.removeEventListener('visibilitychange', onVisible);
      ['touchstart', 'pointerdown', 'mousedown', 'keydown', 'scroll'].forEach((e) =>
        window.removeEventListener(e, nudge, opts)
      );
    };
  }, [eager, maxMobile, mobilePoster, mobileSources, play]);

  /* ── Sirf jab nazar mein ho ──
     Do raaste, aur kisi ek par bharosa nahi: observer (tez), aur
     us ke sath site ka apna pehra (upar dekhein). Dono ek hi kaam
     karte hain, is liye dono ka chalna be-zarar hai. */
  useEffect(() => {
    const v = ref.current;
    if (!v || !pauseOffscreen) {
      if (v) play();
      return undefined;
    }

    const entry = {
      el: v,
      play: () => {
        if (v.readyState === 0) v.load();
        play();
      },
      pause: () => v.pause(),
    };
    guard(entry);

    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e) return;
          if (e.isIntersecting) entry.play();
          else if (!v.paused) entry.pause();
        },
        { threshold: 0.01, rootMargin: '120px 0px' }
      );
      io.observe(v);
    }

    return () => {
      if (io) io.disconnect();
      unguard(entry);
    };
  }, [pauseOffscreen, play]);

  const settle = () => {
    if (ready.current) return;
    ready.current = true;
    onReady?.();
  };

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      poster={poster || undefined}
      muted
      loop
      playsInline
      autoPlay
      preload={eager ? 'auto' : 'metadata'}
      disablePictureInPicture
      onLoadedData={() => {
        settle();
        play();
      }}
      onCanPlay={() => {
        settle();
        play();
      }}
      onError={() => {
        setFailed(true);
        settle();
      }}
      data-failed={failed ? 'true' : undefined}
      {...rest}
    >
      {sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} />
      ))}
    </video>
  );
}

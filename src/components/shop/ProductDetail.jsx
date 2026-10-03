'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import QuickOrder from '@/components/shop/QuickOrder';
import ShareButton from '@/components/shop/ShareButton';
import WhatsAppShare from '@/components/shop/WhatsAppShare';
import { useStore } from '@/context/StoreContext';
import {
  colorHex,
  colorName,
  DELIVERY,
  formatPKR,
  getCategory,
  SHIPPING,
  STORE,
  whatsappLink,
} from '@/lib/constants';
import { discountPct, imageList, primaryImage, toArray } from '@/lib/utils';
import {
  MinusIcon,
  PlusIcon,
  TruckIcon,
  RefreshIcon,
  ShieldIcon,
  WhatsAppIcon,
} from '@/components/ui/Icons';

/**
 * Product page — gallery, buy box and details.
 *
 * The size and colour selectors are required before adding to the
 * bag when a product actually offers a choice; the button stays
 * disabled and explains why, rather than silently adding the wrong
 * variant.
 *
 * ═══════════════════════════════════════════════════════════════
 *  GALLERY — HATH SE BHI, KHUD BHI
 * ═══════════════════════════════════════════════════════════════
 *  Grahak ki shikayat do thin, aur dono wajib:
 *
 *    1. "pics khud change hoti hain magar 5 second baad" — ab do
 *       second baad.
 *
 *    2. "main chahta hoon ke main usko apne hath se bhi forward
 *       karun" — pehle tasveer badalne ka ek hi raasta tha: neeche
 *       ke chhote murabbe dabana. Phone par wo murabbe 74px ke
 *       hote hain aur tasveer poori chaurai ki — har koi tasveer
 *       par hi ungli pherta hai, aur wahan kuch nahi hota tha.
 *
 *  ── UNGLI KA JAWAB FORAN MILTA HAI ──
 *  Pointer Events istemal hue hain, touch/mouse/pen ke alag alag
 *  handler nahi — ek hi raasta teenon ke liye. Ungli chalte waqt
 *  tasveer us ke sath sarakti hai, magar DABAI HUI: jitna ungli
 *  chali us ka 38%, aur 15% chaurai par ruk jati. Wajah ye ke ye
 *  ek ishara hai, parda nahi — tasveer ko ungli ke sath poora
 *  kheench dene se wo kone se nikal jati aur peeche khali jagah
 *  nazar aati.
 *
 *  Chhornay par: agar ungli kaafi chali (38px ya chaurai ka 12%,
 *  jo bara ho) to agli tasveer aa jati hai, apni simt se sarak kar.
 *  Na chali ho to tasveer narmi se apni jagah wapas aa jati hai.
 *
 *  ── EK HI TASVEER DOM MEIN RAHTI HAI ──
 *  Saari tasveerein ek qatar mein rakh kar qatar sarkane ka raasta
 *  jaan boojh kar NAHI liya gaya, halanke drag us mein aasan hota.
 *  Do wajah: chhe tasveer ka product har dafa chhe tasveerein
 *  utarta, jo is market ke phone aur internet par bhaari hai; aur
 *  aakhri se pehli par wapas aate waqt poori qatar ulti taraf
 *  sarakti, jo do second ke qadam par har chakkar mein ek jhatka
 *  ban jata. Ab bhi ek hi tasveer rehti hai, bilkul pehle ki
 *  tarah.
 *
 *  ── RUKTA KAB HAI ──
 *  Hath se kuch bhi karne par chhe second — ungli phernay, murabba
 *  dabane, ya keyboard ke teer se. Us ke baad khud chal parta hai.
 *
 *  Cursor gallery par aane se ab NAHI rukta. Pehle rukta tha, aur
 *  wo ghalti thi: laptop par tasveer safhe ke beech mein hoti hai,
 *  cursor qudrati taur par wahin rehta hai, aur khana kabhi shuru
 *  hi nahi hota. Jo cheez khud chalni chahiye wo cursor ke rehmo
 *  karam par nahi honi chahiye.
 * ═══════════════════════════════════════════════════════════════
 */

/** Ek tasveer kitni der samne rehti hai — poori site par ek hi naap. */
const STEP_MS = 2000;

/** Hath se kuch karne ke baad kitni der khud na chalna. */
const HOLD_MS = 6000;

/** Ungli ka asar tasveer par kitna — poora nahi, dabaya hua. */
const DRAG_PULL = 0.38;

/** Tasveer ungli ke sath chaurai ke is hisse se zyada nahi sarakti. */
const DRAG_CAP = 0.15;

export default function ProductDetail({ product }) {
  const { addItem } = useStore();

  const images = imageList(product);
  const sizes = toArray(product.sizes);
  const colors = toArray(product.colors);

  const [active, setActive] = useState(0);
  /* Tasveer kis taraf se aaye — aage jaye to daayein se, peeche
     jaye to baayein se. Aankh ko simt se pata chalta hai ke wo
     aage barh rahi hai ya wapas. */
  const [dir, setDir] = useState('next');
  const [holdShots, setHoldShots] = useState(false);
  /* 'off' = khud chal raha hai · 'drag' = ungli lagi hui hai
     · 'settle' = ungli uth gayi, tasveer apni jagah wapas ja rahi */
  const [hand, setHand] = useState('off');
  const [drag, setDrag] = useState(0);
  const [live, setLive] = useState(false);
  const [awake, setAwake] = useState(true);
  const galleryRef = useRef(null);
  const grab = useRef(null);
  const settleRef = useRef(0);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState(colors.length === 1 ? colorName(colors[0]) : null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState('details');
  const [orderOpen, setOrderOpen] = useState(false);

  /* ── TASVEEREIN KHUD BADALTI HAIN ──
     Pehle grahak ko har tasveer khud dabani parti thi, aur aksar
     wo pehli hi dekh kar chala jata tha. Ab saari tasveerein baari
     baari khud aati hain — side se sarak kar, taake harkat nazar
     aaye aur pata chale ke aur bhi hain.

     Ruk jati hain jab: ungli ya cursor gallery par ho, grahak ne
     khud koi tasveer chun li ho (das second ke liye), gallery
     screen par na ho, safha peeche chala jaye, ya phone mein
     harkat kam karne ka kaha gaya ho. */
  const show = useCallback((next, how = 'next') => {
    setDir(how);
    setActive(next);
  }, []);

  const count = images.length;

  /* Gallery screen par hai ya nahi. Pehle ye ek `let onScreen`
     tha jo timer ke andar parha jata tha; ab state hai, taake
     timer dobara lagta rahe aur chalte chalte mar na jaye. */
  useEffect(() => {
    const el = galleryRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setLive(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Tab peeche chala jaye to ghoomne ka koi faida nahi. */
  useEffect(() => {
    const sync = () => setAwake(!document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  /* ── KHUD CHALNA ──
     Zanjeer, interval nahi: `active` badalne par naya timer lagta
     hai, is liye har tasveer ko poore do second milte hain — chahe
     wo khud aayi ho, ungli se aayi ho ya murabbe se.

     Ahem: har rukne ki wajah (`hand`, `live`, `awake`, `holdShots`)
     effect ki dependency hai. Purane interval mein `onScreen` sirf
     ek local variable tha jo callback ke andar parha jata — agar us
     lamhe gallery screen par na hoti to kuch na hota, aur kyunke
     `active` bhi nahi badalta, zanjeer wahin khatam ho jati. State
     banane se wo khud dobara lag jati hai. */
  useEffect(() => {
    if (count < 2 || holdShots || hand === 'drag' || !live || !awake) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const t = window.setTimeout(() => {
      setDir('next');
      setActive((v) => (v + 1) % count);
    }, STEP_MS);

    return () => window.clearTimeout(t);
  }, [active, count, holdShots, hand, live, awake]);

  /* Hath se kuch kiya — chhe second khamoshi, phir dobara khud. */
  useEffect(() => {
    if (!holdShots) return undefined;
    const t = window.setTimeout(() => setHoldShots(false), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [holdShots, active]);

  useEffect(() => () => window.clearTimeout(settleRef.current), []);

  /* ── UNGLI / CURSOR SE SARKANA ── */
  const onPointerDown = (e) => {
    if (count < 2) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const w = e.currentTarget.clientWidth || 1;
    grab.current = { id: e.pointerId, x: e.clientX, y: e.clientY, w, live: false };
    window.clearTimeout(settleRef.current);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* purana browser — capture ke baghair bhi chal jata hai */
    }
  };

  const onPointerMove = (e) => {
    const g = grab.current;
    if (!g || e.pointerId !== g.id) return;

    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;

    /* Pehli harkat faisla karti hai: safha oopar neeche jana chahta
       hai ya tasveer daayein baayein. Agar ungli zyada seedhi gayi
       hai to ye hamara ishara nahi — safhe ko scroll karne dein.
       Is faisle ke baghair tasveer har us dafa hilti jab grahak
       sirf safha scroll kar raha hota. */
    if (!g.live) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        grab.current = null;
        return;
      }
      g.live = true;
      setHand('drag');
      setHoldShots(true);
    }

    const cap = g.w * DRAG_CAP;
    setDrag(Math.max(-cap, Math.min(cap, dx * DRAG_PULL)));
  };

  const onPointerUp = (e) => {
    const g = grab.current;
    if (!g || e.pointerId !== g.id) return;
    grab.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (!g.live) return;

    const dx = e.clientX - g.x;
    const need = Math.max(38, g.w * 0.12);

    setDrag(0);
    setHoldShots(true);

    if (dx <= -need) {
      /* Nayi tasveer mount hoti hai, is liye CSS ki sarakne wali
         harkat khud chal parti hai — `hand` foran 'off'. */
      setHand('off');
      setDir('next');
      setActive((v) => (v + 1) % count);
    } else if (dx >= need) {
      setHand('off');
      setDir('prev');
      setActive((v) => (v - 1 + count) % count);
    } else {
      /* Itna nahi chali ke tasveer badle — wapas apni jagah par.
         'settle' is liye zaroori hai: tasveer ka element wohi
         rehta hai, aur `hand` ko seedha 'off' karne se us par
         pehle wali slide-in harkat DOBARA chal parti, jo ghalat
         taraf se aati aur jhatka lagta. 'settle' harkat band rakh
         kar sirf narm transition se wapas le aata hai. */
      setHand('settle');
      settleRef.current = window.setTimeout(() => setHand('off'), 320);
    }
  };

  const onGalleryKey = (e) => {
    if (count < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHoldShots(true);
      show((active + 1) % count, 'next');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHoldShots(true);
      show((active - 1 + count) % count, 'prev');
    }
  };

  const category = getCategory(product.category);
  const off = discountPct(product.price, product.compare_at_price);
  const soldOut = product.in_stock === false || product.stock_count === 0;

  const needsSize = sizes.length > 1 && !size;
  const needsColor = colors.length > 0 && !color;
  const blocked = soldOut || needsSize || needsColor;

  /* One label for both buttons, so a blocked state explains itself
     in the same words wherever the customer happens to press. */
  const blockedLabel = () => {
    if (soldOut) return 'Sold out';
    if (needsSize) return 'Select a size';
    if (needsColor) return 'Select a colour';
    return null;
  };

  /* The single cart-shaped row handed to the order form. */
  const orderLine = {
    id: `${product.id}::${size || 'one'}::${color || 'default'}`,
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: primaryImage(product),
    size,
    color,
    qty,
  };

  const waMessage = `Assalam o alaikum! I would like to order:\n\n${product.name}\n${
    size ? `Size: ${size}\n` : ''
  }${color ? `Colour: ${color}\n` : ''}Quantity: ${qty}\nPrice: ${formatPKR(
    product.price
  )}\n\n${STORE.url}/shop/${product.slug}`;

  const sections = [
    { key: 'details', label: 'Description', body: product.description },
    {
      key: 'fabric',
      label: 'Fabric & Care',
      body: `${product.fabric || 'Details on request.'} Dry clean recommended for embroidered pieces. Wash cotton and lawn separately in cold water for the first two washes. Do not bleach. Press on the reverse.`,
    },
    {
      key: 'delivery',
      label: 'Delivery & Returns',
      body: `Delivered in ${DELIVERY.window} anywhere in Pakistan, dispatched from ${DELIVERY.from}. Delivery is ${formatPKR(SHIPPING.flatRate)}, free over ${formatPKR(SHIPPING.freeOver)}. Cash on delivery everywhere — you pay the courier at your door. Seven-day exchange on unworn items with tags attached; message ${STORE.phone} on WhatsApp to arrange it.`,
    },
  ];

  return (
    <div className="pdp">
      {/* ── Gallery ── */}
      <div className="pdp-gallery" ref={galleryRef}>
        <Reveal mask className="pdp-main">
          {/* `key` har tasveer ke sath badalta hai, is liye CSS ki
              sarakne wali harkat har dafa naye sire se chalti hai.
              Do tasveerein ek sath nahi rakhi jatin — ek hi rehti
              hai, is liye phone par bojh utna hi hai jitna pehle.

              Ungli ke sare handler yahan hain, `.pdp-main` par nahi:
              ye khana theek tasveer ke barabar hai, is liye ishara
              wahin se shuru hota hai jahan grahak ka hath hai. */}
          <div
            className="pdp-slides"
            data-dir={dir}
            data-hand={hand}
            style={{ '--drag': `${drag}px` }}
            role={count > 1 ? 'group' : undefined}
            aria-roledescription={count > 1 ? 'carousel' : undefined}
            aria-label={
              count > 1
                ? `${product.name} — ${count} photographs. Swipe, drag, or use the left and right arrow keys.`
                : undefined
            }
            tabIndex={count > 1 ? 0 : undefined}
            onKeyDown={count > 1 ? onGalleryKey : undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <Image
              key={images[active] || active}
              className="pdp-slide"
              quality={92}
              src={images[active] || '/products/placeholder.jpg'}
              alt={`${product.name} — view ${active + 1}`}
              width={900}
              height={1200}
              priority={active === 0}
              draggable={false}
              sizes="(max-width: 900px) 100vw, 55vw"
            />

            {/* ── AGLI TASVEER PEHLE SE UTAR LEIN ──
                Do second ka qadam is market ke internet par ek
                nayi musibat khol deta hai: jab tak agli tasveer
                utarti hai, qadam guzar chuka hota hai — aur grahak
                ko ek lamhe ke liye khali khana nazar aata hai.
                3.6 second mein ye gunjaish thi, 2 mein nahi.

                Is liye sirf AGLI tasveer yahan chhupi hui rakhi
                jati hai, taake browser us ko waqt se pehle utar
                le. Saari tasveerein nahi — sirf ek, yani bojh ek
                tasveer ka hai, chhe ka nahi. Jab us ki baari aati
                hai to wo cache se foran aa jati hai. */}
            {count > 1 && (
              <Image
                className="pdp-preload"
                aria-hidden="true"
                quality={92}
                src={images[(active + 1) % count]}
                alt=""
                width={900}
                height={1200}
                draggable={false}
                sizes="(max-width: 900px) 100vw, 55vw"
              />
            )}
          </div>

          {count > 1 && (
            <div className="pdp-bars" aria-hidden="true">
              {images.map((src, i) => (
                <span key={src} className="pdp-bar" data-on={i === active ? 'true' : 'false'} />
              ))}
            </div>
          )}
        </Reveal>

        {count > 1 && (
          <div className="pdp-thumbs">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="pdp-thumb"
                aria-pressed={active === i}
                aria-label={`Show image ${i + 1} of ${count}`}
                onClick={() => {
                  setHoldShots(true);
                  show(i, i >= active ? 'next' : 'prev');
                }}
              >
                <Image
                quality={92} src={src} alt="" width={150} height={200} sizes="74px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Buy box ── */}
      <div className="pdp-info">
        <div>
          <Link href={`/collections/${product.category}`} className="caps gold link-wipe">
            {category?.name || product.category}
          </Link>
          <h1
            className="display"
            style={{ fontSize: 'clamp(1.9rem,4vw,3rem)', marginTop: '0.6rem' }}
          >
            {product.name}
          </h1>
        </div>

        <div className="pdp-price">
          {formatPKR(product.price)}
          {product.compare_at_price > product.price && (
            <span className="was">{formatPKR(product.compare_at_price)}</span>
          )}
          {off && <span className="badge badge-gold">−{off}%</span>}
        </div>

        {/* Size */}
        {sizes.length > 0 && (
          <div className="field">
            <span className="label">
              Size{size ? ` — ${size}` : ''}
            </span>
            <div className="option-row">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="option"
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colour */}
        {colors.length > 0 && (
          <div className="field">
            <span className="label">
              Colour{color ? ` — ${color}` : ''}
            </span>
            <div className="option-row">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="option"
                  aria-pressed={color === colorName(c)}
                  onClick={() => setColor(colorName(c))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span
                    className="swatch-dot"
                    style={{ background: colorHex(c), width: 11, height: 11 }}
                    aria-hidden="true"
                  />
                  {colorName(c)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Buy ──
            Ordering outright is the loudest thing on the page, because
            it is the shortest path: five fields, cash on delivery, no
            cart to understand. The bag stays for anyone building up a
            larger order, and WhatsApp for anyone who would rather talk
            to a person. */}
        <div className="buy">
          <div className="row wrap" style={{ gap: '0.7rem' }}>
            <div className="qty">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Reduce quantity"
              >
                <MinusIcon width={15} height={15} />
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
              >
                <PlusIcon width={15} height={15} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-gold grow buy-primary"
              disabled={blocked}
              onClick={() => setOrderOpen(true)}
            >
              {blockedLabel() || `Order now — ${formatPKR(product.price * qty)}`}
            </button>
          </div>

          <div className="buy-alt">
            {/* The primary button already explains a blocked state, so
                this one keeps its own label rather than repeating it. */}
            <button
              type="button"
              className="btn btn-outline"
              disabled={blocked}
              onClick={() => addItem(product, { size, color, qty })}
            >
              Add to bag
            </button>

            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <WhatsAppIcon width={17} height={17} />
              WhatsApp
            </a>

            {/* Is market mein product share hona hi bikne ka sab
                se bara zariya hai — koi apni behen ko bhejta hai
                aur order wahin se banta hai. */}
            <ShareButton product={product} variant="full" />
          </div>

          {/* ── Poori tafseel ke sath WhatsApp par ──
              Uper wala WhatsApp ka button dukaan se BAAT karne ke
              liye hai. Ye alag cheez hai: ye product ko KISI AUR
              ko bhejne ke liye hai — naam, daam, size, rang, link
              aur tasveer, sab ek hi paighaam mein.

              Pehle paighaam dikhta hai, phir WhatsApp khulta hai.
              Jo size aur rang grahak ne abhi chuna hai wohi
              paighaam mein jata hai; kuch na chuna ho to jitne
              maujood hain sab. */}
          <div className="buy-share">
            <WhatsAppShare product={product} size={size} color={color} />
          </div>

          <p className="buy-note faint">
            Cash on delivery · no payment until the parcel is in your hand
          </p>
        </div>

        {product.stock_count > 0 && product.stock_count <= 5 && (
          <p className="gold" style={{ fontSize: '0.85rem' }}>
            Only {product.stock_count} left in stock.
          </p>
        )}

        {/* Reassurance */}
        <div className="trust-row">
          {[
            { Icon: TruckIcon, t: DELIVERY.short },
            { Icon: RefreshIcon, t: '7-day exchange' },
            { Icon: ShieldIcon, t: 'Cash on delivery' },
          ].map(({ Icon, t }) => (
            <div className="col" key={t} style={{ gap: '0.5rem' }}>
              <Icon width={19} height={19} style={{ color: 'var(--gold)' }} />
              <span className="caps faint">{t}</span>
            </div>
          ))}
        </div>

        {/* Accordion */}
        <div className="accordion">
          {sections.map((sec) => (
            <div className="acc-item" key={sec.key}>
              <button
                type="button"
                className="acc-btn"
                aria-expanded={open === sec.key}
                onClick={() => setOpen(open === sec.key ? null : sec.key)}
              >
                {sec.label}
                <span className="pm" aria-hidden="true" />
              </button>
              <div className="acc-panel" data-open={open === sec.key ? 'true' : 'false'}>
                <div>
                  <p>{sec.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <QuickOrder
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        lines={[orderLine]}
        title={`Order ${product.name}`}
      />
    </div>
  );
}

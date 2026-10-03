'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import ShareButton from '@/components/shop/ShareButton';
import { colorHex, colorName, formatPKR, getCategory } from '@/lib/constants';
import {
  discountPct,
  imageList,
  primaryImage,
  toArray,
} from '@/lib/utils';

/**
 * The product card used by every grid on the site.
 *
 * Interactions:
 *  · the second photograph cross-fades in on hover
 *  · a quick-add bar rises from the bottom edge
 *  · a share mark fades in at the top corner
 *  · colour swatches and a discount flag appear when relevant
 *
 * Quick-add only fires directly when the product has a single size;
 * anything with real size choices sends the customer to the product
 * page so they pick deliberately rather than guessing.
 *
 * ── EK DHANCHE KI DURUSTI ──
 * Pehle poora card ek hi <Link> ke andar tha, aur quick-add ka
 * button us link ke ANDAR. HTML mein ye jaiz nahi — link ke andar
 * button nahi aa sakta, aur screen reader use theek nahi parhta.
 *
 * Ab do alag link hain (tasveer aur naam), aur buttons un ke bahar
 * apni jagah par. Dekhne mein bilkul wohi, magar ab durust — aur
 * share ka button bhi isi wajah se laga saka.
 */

/** Ek tasveer kitni der samne rehti hai. Poori site par ek hi naap. */
const STEP_MS = 2000;

/**
 * Har card ko apna chhota sa waqfa.
 *
 * Pehle ye waqfa `shots.length` se banta tha — yani sirf do ya teen
 * mukhtalif qeematein, aur ek grid mein bees card unhi do teen
 * waqfon mein bant jate thay. Nateeja: aadha grid ek sath jhapakta
 * tha, jo bees alag alag jhapakon se zyada bura lagta hai.
 *
 * Ab waqfa product ke slug se banta hai, is liye har card ka apna
 * hai. Hisaab jaan boojh kar arithmetic hai, `Math.random()` nahi:
 * random server aur browser par mukhtalif aata hai, aur React us
 * ko hydration mismatch keh kar shikayat karta hai.
 *
 * Daira sirf 0–319ms hai. Pehle 1200ms tak tha, magar jab qadam hi
 * 2 second ka hai to 1.2 second ka farq "do second" ko sava teen
 * second bana deta hai — ab ye farq grid ko ek sath jhapakne se
 * rokne ke liye kaafi hai, aur waqt badalne ke liye nahi.
 */
function spread(key = '') {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) % 100003;
  }
  return h % 320;
}

export default function ProductCard({ product, priority = false, sizes }) {
  const { addItem } = useStore();

  /* ── CARD KI TASVEEREIN KHUD BADALTI HAIN ──
     Pehle doosri tasveer sirf hover par aati thi — yani phone par
     kabhi nahi, aur wahi se aadhe se zyada grahak aate hain. Ab
     har card apni tasveerein khud badalta rehta hai.

     Teen ehtiyat, warna ye cheez safhe ko bhaari kar deti:

       · Sirf pehli TEEN tasveerein. Ek grid mein bees card hon to
         bees ka bees tasveerein nahi, saath.
       · Sirf wo card jo SCREEN PAR hai. Neeche paray card sotay
         rehte hain — IntersectionObserver unhein jagata hai.
       · Har card apni baari se thora hat kar badalta hai (index se
         milta hua waqfa), warna poora grid ek sath jhapakta aur
         wo bad-numa lagta.

     Aur badalti sirf opacity hai — GPU ka kaam, layout ka nahi. */
  const shots = imageList(product).slice(0, 3);
  const many = shots.length > 1;

  const [shot, setShot] = useState(0);
  const mediaRef = useRef(null);

  useEffect(() => {
    if (!many) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const el = mediaRef.current;
    let onScreen = true;
    let io;

    if (el && typeof IntersectionObserver !== 'undefined') {
      onScreen = false;
      io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0.35 });
      io.observe(el);
    }

    /* Har card thora sa alag waqt par — ek hi lamhe mein poora
       grid nahi palatta. Dekhein `spread()` oopar. */
    const t = window.setInterval(() => {
      if (!onScreen || document.hidden) return;
      setShot((v) => (v + 1) % shots.length);
    }, STEP_MS + spread(product?.slug));

    return () => {
      window.clearInterval(t);
      io?.disconnect();
    };
  }, [many, shots.length, product?.slug]);

  if (!product) return null;

  const cover = primaryImage(product);
  const productSizes = toArray(product.sizes);
  const colors = toArray(product.colors);
  const off = discountPct(product.price, product.compare_at_price);
  const category = getCategory(product.category);
  const soldOut = product.in_stock === false || product.stock_count === 0;

  /* ── Bag mein seedha daalna ──
     Pehle yahan pehla size aur pehla rang khud ba khud chun liya
     jata tha. Grahak ne kabhi kaha hi nahi ke usay Maroon chahiye
     — aur order Maroon ka chala jata tha.

     Pehle sirf size dekha jata tha. Ab rang bhi: jahan chunne ko
     kuch hai — do se zyada size ya do se zyada rang — wahan ye
     jagah "Choose options" ban jati hai jo product ke safhe par le
     jati hai. Jahan ek hi shakl hai (jaise shawl), wahan pehle ki
     tarah ek hi dabane par bag mein chala jata hai. */
  const mustChoose = productSizes.length > 1 || colors.length > 1;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, {
      size: productSizes[0] || null,
      color: colors.length ? colorName(colors[0]) : null,
      qty: 1,
    });
  };

  const imageSizes = sizes || '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw';

  return (
    <article className="card group">
      <div
        className="card-media"
        ref={mediaRef}
        data-many={many ? 'true' : 'false'}
        data-shot={shot}
        /* Laptop par hover ab bhi foran doosri tasveer dikhata hai —
           wo purana tajurba jaan boojh kar rakha hai. */
        onMouseEnter={() => { if (many && shot === 0) setShot(1); }}
      >
        <Link href={`/shop/${product.slug}`} className="card-shot" aria-label={product.name}>
          {/* Pehli tasveer hamesha maujood — yehi card ki bunyad
              hai aur Google isi ko parhta hai. */}
          <Image
            quality={92}
            src={cover}
            alt={product.name}
            width={900}
            height={1200}
            priority={priority}
            sizes={imageSizes}
            style={{ opacity: soldOut ? 0.55 : 1 }}
          />

          {/* Baqi tasveerein us ke uper — jis ki baari ho wohi
              nazar aati hai. */}
          {many &&
            shots.slice(1).map((src, k) => (
              <Image
                key={src}
                quality={92}
                className="card-alt"
                data-on={shot === k + 1 ? 'true' : 'false'}
                src={src}
                alt=""
                width={900}
                height={1200}
                sizes={imageSizes}
                aria-hidden="true"
              />
            ))}
        </Link>

        {/* Flags */}
        <div className="card-flags">
          {soldOut && <span className="badge badge-out">Sold out</span>}
          {!soldOut && off && <span className="badge badge-gold">−{off}%</span>}
          {!soldOut && !off && product.featured && <span className="badge">New</span>}
        </div>

        {/* Share — hover par khulta hai, phone par hamesha maujood */}
        <ShareButton product={product} variant="icon" className="card-share" />

        {/* Quick add */}
        {!soldOut && (
          <div className="card-quick">
            {!mustChoose ? (
              <button
                type="button"
                className="btn btn-primary btn-sm btn-block"
                onClick={handleQuickAdd}
              >
                Quick add
              </button>
            ) : (
              <Link
                href={`/shop/${product.slug}`}
                className="btn btn-outline btn-sm btn-block"
                style={{ background: 'rgba(10,10,9,.55)' }}
              >
                Choose options
              </Link>
            )}
          </div>
        )}
      </div>

      <Link href={`/shop/${product.slug}`} className="card-body" tabIndex={-1}>
        <div style={{ minWidth: 0 }}>
          <h3 className="card-name">{product.name}</h3>
          <p className="card-cat">{category?.name || product.category}</p>

          {colors.length > 0 && (
            <div
              className="swatches"
              aria-label={`Colours: ${colors.map(colorName).join(', ')}`}
            >
              {colors.slice(0, 5).map((c) => (
                <span
                  key={c}
                  className="swatch-dot"
                  style={{ background: colorHex(c) }}
                  title={colorName(c)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card-price num">
          {product.compare_at_price > product.price && (
            <span className="card-was">{formatPKR(product.compare_at_price)}</span>
          )}
          {formatPKR(product.price)}
        </div>
      </Link>
    </article>
  );
}

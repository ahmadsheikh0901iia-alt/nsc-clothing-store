'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import ShareButton from '@/components/shop/ShareButton';
import { colorHex, colorName, formatPKR, getCategory } from '@/lib/constants';
import {
  discountPct,
  primaryImage,
  secondaryImage,
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
export default function ProductCard({ product, priority = false, sizes }) {
  const { addItem } = useStore();

  if (!product) return null;

  const cover = primaryImage(product);
  const alt = secondaryImage(product);
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
      <div className="card-media">
        <Link href={`/shop/${product.slug}`} className="card-shot" aria-label={product.name}>
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

          {alt && (
            <Image
              quality={92}
              className="card-alt"
              src={alt}
              alt=""
              width={900}
              height={1200}
              sizes={imageSizes}
              aria-hidden="true"
            />
          )}
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

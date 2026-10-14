'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from '@/components/ui/StoreImage';
import { useStore } from '@/context/StoreContext';
import ShareButton from '@/components/shop/ShareButton';
import { colorHex, colorName, formatPKR, getCategory } from '@/lib/constants';
import {
  discountPct,
  imageList,
  primaryImage,
  toArray,
} from '@/lib/utils';

export default function ProductCard({ product, priority = false, sizes }) {
  const { addItem } = useStore();

  const shots = imageList(product).slice(0, 3);
  const many = shots.length > 1;

  const [shot, setShot] = useState(0);
  const [ready, setReady] = useState({});
  const mediaRef = useRef(null);

  if (!product) return null;

  const cover = primaryImage(product);
  const productSizes = toArray(product.sizes);
  const colors = toArray(product.colors);
  const off = discountPct(product.price, product.compare_at_price);
  const category = getCategory(product.category);
  const soldOut = product.in_stock === false || product.stock_count === 0;

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

        onMouseEnter={() => { if (many && ready[shots[1]] && shot === 0) setShot(1); }}
        onMouseLeave={() => setShot(0)}
      >
        <Link href={`/shop/${product.slug}`} className="card-shot" aria-label={product.name}>

          <Image
            quality={85}
            src={cover}
            alt={product.name}
            width={900}
            height={1200}
            priority={priority}
            sizes={imageSizes}
            style={{ opacity: soldOut ? 0.55 : 1 }}
          />

          {many &&
            shots.slice(1, 2).map((src, k) => (
              <Image
                key={src}
                quality={85}
                className="card-alt"
                data-on={shot === k + 1 ? 'true' : 'false'}
                src={src}
                onLoad={() => setReady((r) => ({ ...r, [src]: true }))}
                alt=""
                width={900}
                height={1200}
                sizes={imageSizes}
                aria-hidden="true"
              />
            ))}
        </Link>

        <div className="card-flags">
          {soldOut && <span className="badge badge-out">Sold out</span>}
          {!soldOut && off && <span className="badge badge-gold">−{off}%</span>}
          {!soldOut && !off && product.featured && <span className="badge">New</span>}
        </div>

        <ShareButton product={product} variant="icon" className="card-share" />

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

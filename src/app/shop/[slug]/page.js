import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/motion/Reveal';
import Stagger from '@/components/motion/Stagger';
import ProductDetail from '@/components/shop/ProductDetail';
import ProductCard from '@/components/shop/ProductCard';
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/data/products';
import { formatPKR, getCategory, STORE } from '@/lib/constants';
import { primaryImage } from '@/lib/utils';

/** Pre-renders a static page for every product at build time. */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: `${product.name} — ${formatPKR(product.price)}`,
      description: product.description?.slice(0, 200),
      images: [{ url: primaryImage(product) }],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const category = getCategory(product.category);

  /* Structured data — helps the product show correctly in Google
     results with its price and availability. */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [primaryImage(product)],
    brand: { '@type': 'Brand', name: STORE.name },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'PKR',
      availability:
        product.in_stock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="page-head container" style={{ paddingBottom: 0 }}>
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/collections/${product.category}`}>
              {category?.name || product.category}
            </Link>
          </nav>
        </Reveal>
      </div>

      <section className="container" style={{ paddingBlock: 'clamp(2rem,4vw,3rem)' }}>
        <ProductDetail product={product} />
      </section>

      {related.length > 0 && (
        <section className="section container band-top">
          <div className="sec-head">
            <h2 className="display">You may also like</h2>
            <Link href="/shop" className="link-arrow">
              View all
            </Link>
          </div>

          <Stagger className="product-grid">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ))}
          </Stagger>
        </section>
      )}
    </>
  );
}

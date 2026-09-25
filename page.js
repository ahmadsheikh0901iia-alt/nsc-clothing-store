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
import { cleanText, primaryImage } from '@/lib/utils';

/** Pre-renders a static page for every product at build time. */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/* ═══════════════════════════════════════════════════════════════
   JAB KOI IS PRODUCT KA LINK BHEJTA HAI
   ───────────────────────────────────────────────────────────────
   WhatsApp, Facebook aur baqi sab link bhejte hi us safhe ko khud
   khol kar us ke <head> se teen cheezein uthate hain: naam,
   tafseel aur tasveer. Wahi preview ka card banta hai.

   Ye kaam SERVER par hota hai — safha bhejne se pehle ye tags
   HTML mein likhe ja chuke hote hain. JavaScript se baad mein
   lagaye jayein to preview banane wala unhein kabhi nahi dekhta,
   kyunke wo JavaScript chalata hi nahi.

   ── JO KHARAB THA ──
   Chaar cheezein, aur chaaron ka asar nazar aa raha tha:

   1. Naam aur tafseel seedha database se jate thay — taare,
      nayi lines aur "F E S T I V E" jaise faile hue lafz ke sath,
      kyunke aksar product WhatsApp se copy kar ke daale gaye hain.
      Preview mein wohi kachcha text nazar aata tha.

   2. `og:url` tha hi nahi. Kuch app is ke baghair card banane se
      inkaar kar dete hain.

   3. `og:type` tha hi nahi. Product ke liye `product` hona chahiye,
      warna wo aam safha samjha jata hai.

   4. Twitter ke tags har product par wohi thay jo poori site ke
      hain — yani har product "NSC Clothing Store" ke naam se jata
      tha, apne naam se nahi. Wajah: neeche wala `openGraph` jar
      wale layout ke `openGraph` ko poora badal deta hai, magar
      `twitter` ko haath nahi lagata, to wo wahan se guzar aata
      tha.

   `cleanText()` sirf preview ke liye saaf karti hai — database
   mein aap ka likha hua jaisa hai waisa hi rehta hai.
   ═══════════════════════════════════════════════════════════════ */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const base = STORE.url.replace(/\/$/, '');
  const url = `${base}/shop/${product.slug}`;

  const name = cleanText(product.name, 70) || 'NSC Clothing Store';
  const price = formatPKR(product.price);
  const category = getCategory(product.category)?.name;

  /* Tafseel: pehle product ki apni, saaf kar ke. Jin do-chaar
     product ki tafseel khali hai, un ke liye ek sanjeeda jumla
     jo un ke apne khanon se banta hai — khali preview se behtar. */
  const described = cleanText(product.description, 180);
  const description =
    described ||
    [
      name,
      category ? `— ${category}` : '',
      `· ${price}`,
      '· Cash on delivery all over Pakistan.',
    ]
      .filter(Boolean)
      .join(' ');

  const image = primaryImage(product);
  const sold = product.in_stock === false || product.stock_count === 0;

  return {
    title: name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },

    openGraph: {
      /* `type` yahan nahi — Next ke apne khanon mein `product`
         maujood nahi hai. Wo neeche `other` se jata hai, aur us
         soorat mein do og:type nahi bante. */
      title: `${name} — ${price}`,
      description,
      url,
      siteName: STORE.name,
      locale: 'en_PK',
      images: [
        {
          url: image,
          alt: name,
        },
      ],
    },

    /* Har product ka apna card. Pehle ye khana khali tha, is liye
       jar wale layout ka site-wala card har product par chala
       jata tha. */
    twitter: {
      card: 'summary_large_image',
      title: `${name} — ${price}`,
      description,
      images: [image],
    },

    other: {
      'og:type': 'product',
      'product:price:amount': String(product.price),
      'product:price:currency': 'PKR',
      'product:availability': sold ? 'oos' : 'instock',
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

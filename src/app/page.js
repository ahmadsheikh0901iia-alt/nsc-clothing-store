import Hero from '@/components/home/Hero';
import Ribbon from '@/components/home/Ribbon';
import TopSales from '@/components/home/TopSales';
import Anatomy from '@/components/home/Anatomy';
import Categories from '@/components/home/Categories';
import Featured from '@/components/home/Featured';
import Arriving from '@/components/home/Arriving';
import BridalRoom from '@/components/home/BridalRoom';
import CloseWork from '@/components/home/CloseWork';
import Spotlight from '@/components/home/Spotlight';
import Workflow from '@/components/home/Workflow';
import Assurance from '@/components/home/Assurance';
import Testimonials from '@/components/home/Testimonials';
import CtaBand from '@/components/home/CtaBand';
import InstallApp from '@/components/layout/InstallApp';
import {
  getCategoryCounts,
  getFeaturedProducts,
  getTopSaleProducts,
} from '@/lib/data/products';

/* ═══════════════════════════════════════════════════════════════
   HOME
   A server component: it fetches the data, then hands it to the
   section components. Only the sections that need interactivity
   (hero film, close-work loupe, spotlight selectors) run on the
   client — everything else is rendered on the server, which is why
   the page paints fast.

   The page reads correctly whether the catalogue has a hundred
   products or none: with an empty catalogue the featured grid is
   replaced by the "arriving" panel and the spotlight simply steps
   aside, so nothing ever renders as a blank hole.
   ═══════════════════════════════════════════════════════════════ */

export default async function HomePage() {
  const [featured, counts, onSale] = await Promise.all([
    getFeaturedProducts(8),
    getCategoryCounts(),
    getTopSaleProducts(8),
  ]);

  const spotlight = featured[0];

  return (
    <>
      {/* 1 — Full-viewport hero with the film behind it */}
      <Hero />

      {/* 2 — SALE. Hero ke theek baad, kyunke yehi wo baat hai jo
             dekhne wale ko sab se pehle rokni chahiye. Ghoomta hua
             3D daira, khud chalta hua. Koi sale na ho to ye khana
             khud ko chhupa leta hai. */}
      <TopSales products={onSale} />

      {/* 3 — The signature scroll piece: a suit taken apart */}
      <Anatomy />

      {/* 4 — Aath khane: chhe mausam ke, do chunav */}
      <Categories counts={counts} />

      {/* 5 — Ghar ki muhr wali patti, ab 3D mein aur category ke
             THEEK NEECHE. Yahan ye saans lene ki jagah hai: uper
             khane chunne ka kaam, neeche daam — beech mein ek
             halki si patti. */}
      <Ribbon />

      {/* 6 — Featured grid, or the arriving panel while the shelf
             is still being photographed */}
      {featured.length > 0 ? <Featured products={featured} /> : <Arriving />}

      {/* 7 — The loupe: proof of the cloth, right after the prices */}
      <CloseWork />

      {/* 8 — The bridal room: one dress, its own screen */}
      <BridalRoom />

      {/* 9 — Sticky-image product spotlight with working selectors */}
      {spotlight && <Spotlight product={spotlight} />}

      {/* 10 — The atelier workflow timeline */}
      <Workflow />

      {/* 11 — The four promises, immediately before we ask for the order */}
      <Assurance />

      {/* 12 — What people say */}
      <Testimonials />

      {/* 13 — NSC phone par.
             Jaan boojh kar yahan: grahak ne is waqt tak dukaan dekh
             li hai, cloth ka kaam dekh liya hai aur logon ki baat
             parh li hai. Ab "apne phone par laga lein" ek paishkash
             lagti hai — safhe ke shuru mein wo sirf ek rukawat
             hoti. Jis phone par ye ho hi nahi sakta, wahan ye khana
             khud ko chhupa leta hai. */}
      <InstallApp heading />

      {/* 14 — Closing call to action (newsletter lives in the footer) */}
      <CtaBand />
    </>
  );
}

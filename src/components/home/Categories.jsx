import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import Stagger from '@/components/motion/Stagger';
import { CATEGORIES, DELIVERY, STORE } from '@/lib/constants';
import { ArrowUpRight } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  KHANE — aath card, ek hi grid
 *  ─────────────────────────────────────────────────────────────
 *  Chhe mausam ke khane, aur do chunav (New Arrivals, Top Sales).
 *  Sab ek hi list se aate hain — `CATEGORIES` — is liye naya khana
 *  banane ke liye sirf wahan ek qatar likhni parti hai; ye safha
 *  khud samajh leta hai.
 *
 *  ── GRID KA HISAAB ──
 *  Aath cheezein teen ke column mein 3 + 3 + 2 banti hain, aur
 *  aakhri qatar mein ek khali khana chhor deti hain. Wo khali
 *  khana ghalti lagta hai, tarteeb nahi.
 *
 *  Is liye grid chhe patriyon par bani hai: mausam wala card do
 *  patri leta hai (yani teen fi qatar), aur chunav wala teen (yani
 *  do fi qatar). Dono qatarein poori bharti hain, aur do chunav
 *  thore bare ho kar apne aap "alag" lagne lagte hain — us ke liye
 *  koi alag khana banane ki zaroorat nahi pari.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Categories({ counts = {} }) {
  return (
    <section className="section container">
      <div className="sec-head">
        <div>
          <Reveal from="none">
            <span className="eyebrow">Departments</span>
          </Reveal>
          <WordReveal
            as="h2"
            style={{ marginTop: '1rem' }}
            segments={[{ text: 'Eight ways to' }, { text: 'dress a season.', em: true }]}
          />
        </div>

        <Reveal className="sec-side" delay={0.1}>
          <p className="lede">
            Ready to wear, or ready to cut. Stocked in {STORE.cities[0]} and{' '}
            {STORE.cities[1]}, delivered anywhere in Pakistan in{' '}
            {DELIVERY.window}.
          </p>
        </Reveal>
      </div>

      <Stagger className="cat-grid">
        {CATEGORIES.map((cat) => (
          <Link
            href={`/collections/${cat.slug}`}
            className="cat-cell"
            data-kind={cat.kind || 'department'}
            key={cat.slug}
            aria-label={`${cat.name} — ${cat.blurb}`}
          >
            <div className="cat-cell-img" aria-hidden="true">
              <Image
                quality={92}
                src={cat.image}
                alt=""
                width={900}
                height={1200}
                sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <span className="idx num">{cat.index}</span>

            <div>
              <span className="grp">{cat.group}</span>
              <h3>{cat.name}</h3>
              <p>{cat.blurb}</p>
              <p
                className="caps faint"
                style={{ marginTop: '0.75rem', opacity: 1, transform: 'none' }}
              >
                {counts[cat.slug]
                  ? `${counts[cat.slug]} piece${counts[cat.slug] === 1 ? '' : 's'}`
                  : 'Arriving soon'}
              </p>
            </div>

            <span className="go" aria-hidden="true">
              <ArrowUpRight width={16} height={16} />
            </span>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}

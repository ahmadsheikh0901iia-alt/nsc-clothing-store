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
 *
 *  ── TARTEEB: DO CHUNAV PEHLE ──
 *  New In aur Top Sales ab sab se oopar hain, baqi chhe mausam wale
 *  un ke neeche.
 *
 *  Ye tarteeb `CATEGORIES` mein nahi badli gayi, kyunke wo list
 *  poori site chalati hai — collection ke safhe, admin ka form,
 *  sitemap, sab. Wahan ulat pher karne se har jagah asar parta.
 *  Tarteeb sirf YAHAN, is grid ke liye, lagti hai.
 *
 *  Grid ka hisaab is tarteeb mein bhi poora baithta hai: do chunav
 *  teen-teen patri lete hain (6 = pehli qatar bhar gayi), aur chhe
 *  mausam wale do-do (6 + 6 = do poori qatarein). Koi khali khana
 *  nahi.
 *
 *  Number ab list ka `index` nahi — nazar ka. `01` sab se oopar
 *  wale card par lagta hai, warna card "07" se shuru hote aur
 *  ginti ulti lagti.
 * ═══════════════════════════════════════════════════════════════
 */

/** Jo do card oopar chahiye — isi tarteeb mein. */
const LEAD = ['new-arrivals', 'top-sales'];

function ordered(list) {
  const lead = LEAD.map((slug) => list.find((c) => c.slug === slug)).filter(Boolean);
  const rest = list.filter((c) => !LEAD.includes(c.slug));
  return [...lead, ...rest];
}

export default function Categories({ counts = {} }) {
  const cards = ordered(CATEGORIES);

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
        {cards.map((cat, n) => (
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

            <span className="idx num">{String(n + 1).padStart(2, '0')}</span>

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

import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import WordReveal from '@/components/motion/WordReveal';
import ContactForm from '@/components/shop/ContactForm';
import { SOCIALS, STORE, WHATSAPP_CHAT } from '@/lib/constants';
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/ui/Icons';

export const metadata = {
  title: 'Contact',
  description: `Get in touch with NSC Clothing Store — ${STORE.phone} · ${STORE.email}`,
};

export default function ContactPage() {
  return (
    <>
      <header className="page-head container">
        <Reveal from="none">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Contact</span>
          </nav>
        </Reveal>

        <WordReveal
          as="h1"
          style={{ marginTop: '1.5rem', fontSize: 'var(--t-display)' }}
          segments={[{ text: 'Talk to' }, { text: 'a person.', em: true }]}
        />

        <Reveal delay={0.15}>
          <p className="lede" style={{ marginTop: '1.25rem' }}>
            Sizing questions, stitching requests, wholesale, or where your parcel
            has got to — message us and you will get a straight answer.
          </p>
        </Reveal>
      </header>

      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <div className="contact-grid">
          {/* ── Details ── */}
          <Reveal className="col" style={{ gap: '2rem' }}>
            <div className="contact-list">
              <a href={`tel:${STORE.phone.replace(/\s/g, '')}`}>
                <span className="k row" style={{ gap: '0.6rem' }}>
                  <PhoneIcon width={16} height={16} />
                  Phone
                </span>
                <span className="v num">{STORE.phone}</span>
              </a>

              <a href={WHATSAPP_CHAT} target="_blank" rel="noreferrer">
                <span className="k row" style={{ gap: '0.6rem' }}>
                  <WhatsAppIcon width={16} height={16} />
                  WhatsApp
                </span>
                <span className="v num">{STORE.phone}</span>
              </a>

              <a href={`mailto:${STORE.email}`}>
                <span className="k row" style={{ gap: '0.6rem' }}>
                  <MailIcon width={16} height={16} />
                  Email
                </span>
                <span className="v">{STORE.email}</span>
              </a>

              <div>
                <span className="k row" style={{ gap: '0.6rem' }}>
                  <PinIcon width={16} height={16} />
                  Based in
                </span>
                <span className="v">{STORE.city}</span>
              </div>

              <div>
                <span className="k">Hours</span>
                <span className="v">{STORE.hours}</span>
              </div>
            </div>

            {SOCIALS.length > 0 && (
              <div>
                <p className="eyebrow" style={{ marginBottom: '1rem' }}>
                  Elsewhere
                </p>
                <div className="row wrap" style={{ gap: '0.6rem' }}>
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="chip"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                padding: 'clamp(1.25rem,3vw,2rem)',
                border: '1px solid var(--line)',
                background: 'var(--ink-2)',
              }}
            >
              <p className="eyebrow" style={{ marginBottom: '0.9rem' }}>
                Fastest route
              </p>
              <p className="muted" style={{ fontSize: '0.95rem' }}>
                WhatsApp is the quickest way to reach us. Send a photo of what
                you are after and we will tell you what we have on the shelf.
              </p>
            </div>
          </Reveal>

          {/* ── Form ── */}
          <Reveal delay={0.1}>
            <h2 className="display" style={{ fontSize: '1.7rem', marginBottom: '1.5rem' }}>
              Send a message
            </h2>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

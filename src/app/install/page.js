import Link from 'next/link';
import InstallApp from '@/components/layout/InstallApp';
import Reveal from '@/components/motion/Reveal';
import { ArrowRight } from '@/components/ui/Icons';
import { STORE } from '@/lib/constants';

export const metadata = {
  title: 'Get the app',
  description: `Install the ${STORE.name} shop on your phone's Home Screen — full screen, instant, and offline-ready. No app store, no download.`,
  alternates: { canonical: '/install' },
};

/**
 * /install — poora safha.
 *
 * Wohi khana jo home page ke neeche aata hai, magar yahan akela,
 * taake WhatsApp ya Instagram par seedha is ka link bheja ja sake:
 * nscclothingstore.com/install
 */
export default function InstallPage() {
  return (
    <div className="install-page">
      <InstallApp heading />

      <div className="container install-tail">
        <Reveal>
          <div className="install-facts">
            <div>
              <span className="n">01</span>
              <h3>Almost no space</h3>
              <p>
                A typical shopping app costs you 50 to 200 MB. This one is
                under a megabyte, because it is the website itself wearing
                the app&rsquo;s clothes — the photographs stay where they
                already are.
              </p>
            </div>
            <div>
              <span className="n">02</span>
              <h3>Always current</h3>
              <p>
                New pieces, new prices, the state of your order — all of it
                live. You will never see an &ldquo;update available&rdquo;
                notice, because there is nothing to update.
              </p>
            </div>
            <div>
              <span className="n">03</span>
              <h3>Works when signal drops</h3>
              <p>
                Lose your connection and you get our page, with our mark on
                it — not the browser&rsquo;s blank error screen.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="install-back">
          <Link href="/shop" className="link-arrow">
            Browse the shop
            <ArrowRight className="arrow" width={15} height={15} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

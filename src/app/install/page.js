import Link from 'next/link';
import InstallApp from '@/components/layout/InstallApp';
import Reveal from '@/components/motion/Reveal';
import { ArrowRight } from '@/components/ui/Icons';
import { STORE } from '@/lib/constants';

export const metadata = {
  title: 'Get the app',
  description: `${STORE.name} ko apne phone ki home screen par lagayein — apne nishan ke sath, poori screen par, bilkul app ki tarah. Koi store nahi, koi download nahi.`,
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
              <h3>Jagah taqreeban kuch nahi</h3>
              <p>
                Ek aam app pachaas se do sau MB leti hai. Ye ek MB se bhi
                kam — kyunke ye app ka bhes badla hui website hai, aur
                tasveerein wahin rehti hain jahan hain.
              </p>
            </div>
            <div>
              <span className="n">02</span>
              <h3>Hamesha taza</h3>
              <p>
                Naya product, naya daam, order ka haal — sab foran. Kabhi
                "update karein" wala paigham nahi aayega, kyunke update
                karne ko kuch hota hi nahi.
              </p>
            </div>
            <div>
              <span className="n">03</span>
              <h3>Signal chala jaye tab bhi</h3>
              <p>
                Network tootne par browser ka khali safha nahi — apni
                dukaan ka apna paigham, apne nishan ke sath.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="install-back">
          <Link href="/shop" className="link-arrow">
            Dukaan dekhein
            <ArrowRight className="arrow" width={15} height={15} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

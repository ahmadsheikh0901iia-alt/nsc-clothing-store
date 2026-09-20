'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { subscribe } from '@/lib/scroll';
import { NAV_LINKS, STORE } from '@/lib/constants';
import { BagIcon, SearchIcon } from '@/components/ui/Icons';
import MobileMenu from '@/components/layout/MobileMenu';
import ThemeToggle from '@/components/layout/ThemeToggle';

/**
 * Sticky header.
 *
 * Upar ki qatar mein wo naam nahi aate jin par `menuOnly` laga ho
 * (abhi sirf "Shop All"). Wajah: gyarah naam is qatar ke liye bohat
 * thay, aur pehla naam logo ke oopar chara jata tha. Wo raasta
 * khatam nahi hua — burger wale menu mein bhi hai aur footer mein
 * bhi, aur `/shop` ka safha waise ka waisa hai.
 *
 * Three behaviours, all driven by the shared scroll loop:
 *  · transparent while sitting over the hero, solid once past it
 *  · slides out of the way when you scroll down, returns on scroll up
 *  · always solid on inner pages, which have no hero behind it
 */
export default function Header() {
  const pathname = usePathname();
  const { count, openCart, openSearch, menuOpen, openMenu, setMenuOpen } = useStore();

  const isHome = pathname === '/';
  const [solid, setSolid] = useState(!isHome);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    setSolid(!isHome);
    setHidden(false);
    lastY.current = window.scrollY;
  }, [isHome]);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setSolid(!isHome || y > 40);

      // Only start hiding well past the fold, and never while an
      // overlay is open (the page is locked, so y can jump).
      const goingDown = y > lastY.current;
      setHidden(goingDown && y > 320 && !menuOpen);
      lastY.current = y;
    };
    return subscribe(update);
  }, [isHome, menuOpen]);

  return (
    <>
      <header
        className="header"
        data-solid={solid ? 'true' : 'false'}
        data-hidden={hidden ? 'true' : 'false'}
      >
        <div className="header-inner">
          {/* ── Logo ──
              Pehle yahan poora artwork tha — nishan, "Nsc", aur
              us ke sath "Clothing store" ka likha hua hissa, sab
              ek hi tasveer mein. Header mein us tasveer ki
              oonchai 34px hoti hai, jis par wo likha hua hissa
              taqreeban teen pixel ka reh jata tha: parha nahi
              jata tha, bas ek dhabba lagta tha, aur poora logo
              tera nazar aata tha kyunke artwork ka wazan ek
              taraf hai.

              Ab do alag cheezein hain. Nishan (larki + Nsc)
              tasveer hai — saaf kata hua, apne kinaron tak, is
              liye wo khane ke beech mein theek baithta hai. Aur
              naam CSS ka likha hua hai: har naap par seedha,
              saaf, aur screen ki apni roshnai mein. */}
          <Link href="/" className="header-logo" aria-label={`${STORE.name} — home`}>
            <Image
              quality={92}
              className="header-mark"
              src="/logo-mark.png"
              alt=""
              width={906}
              height={952}
              priority
            />
            <span className="header-word">
              <strong>NSC</strong>
              <em>Clothing Store</em>
            </span>
          </Link>

          {/* ── Desktop navigation ── */}
          <nav className="nav" aria-label="Main">
            {NAV_LINKS.filter((link) => !link.menuOnly).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link link-wipe"
                data-active={
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'true'
                    : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="header-actions">
            <ThemeToggle />

            <button
              type="button"
              className="icon-btn"
              onClick={openSearch}
              aria-label="Search products"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={openCart}
              aria-label={`Open bag, ${count} item${count === 1 ? '' : 's'}`}
            >
              <BagIcon />
              {count > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>

            <button
              type="button"
              className="burger"
              data-open={menuOpen ? 'true' : 'false'}
              onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
}

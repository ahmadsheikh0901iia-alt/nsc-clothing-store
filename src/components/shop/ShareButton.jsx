'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { STORE, formatPKR } from '@/lib/constants';
import {
  CheckIcon,
  CloseIcon,
  LinkIcon,
  ShareMark,
  FacebookIcon,
  WhatsAppMark,
} from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SHARE
 *  ─────────────────────────────────────────────────────────────
 *  Is market mein product share hona hi bikne ka sab se bara
 *  zariya hai — koi apni behen ko WhatsApp par bhejta hai, aur
 *  order wahin se banta hai. Ab wo link seedha site se jata hai,
 *  screenshot ki shakal mein nahi.
 *
 *  ── TEEN ASLI KHARABIYAN, TEEN ASLI WAJUHAAT ──
 *
 *  1. Panel par `hidden` laga hua tha, magar CSS mein us par
 *     `display: flex` bhi tha. Browser ka apna `[hidden] {
 *     display: none }` kisi bhi class se KAMZOR hota hai — is
 *     liye `hidden` ka koi asar hi nahi tha aur panel hamesha
 *     maujood rehta tha.
 *
 *  2. Laptop par ye nazar nahi aata tha, kyunke card ka share
 *     hissa hover se pehle ghayab rehta hai. Phone par hover
 *     hota hi nahi — wahan sab kuch hamesha nazar mein tha, aur
 *     wo "hamesha khula" panel seedha product ki tasveer par aa
 *     baitha.
 *
 *  3. Phone ke liye maine ise neeche se uthne wala sheet bana
 *     diya (`position: fixed`), magar wo card ke andar hi para
 *     tha. Card par transform lagta hai, aur transform wala koi
 *     bhi baap `fixed` ka matlab badal deta hai: wo screen ke
 *     bajaye USI CARD ke hisaab se lagta hai. Natija: sheet
 *     card ke barabar chaura, aur screen se neeche.
 *
 *  Is liye ab sheet `document.body` mein bheja jata hai —
 *  portal se — taake us par kisi card ke transform ka asar na
 *  ho. Aur "bahar chhoona" ka matlab ab dono se bahar hai:
 *  button se bhi, sheet se bhi.
 * ═══════════════════════════════════════════════════════════════
 */
export default function ShareButton({ product, variant = 'icon', className = '' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef(null);
  const popRef = useRef(null);
  const copyTimer = useRef(null);

  /* `navigator.share` aur "ungli wali screen" — dono sirf browser
     mein pata chalte hain, server par nahi. */
  useEffect(() => {
    setMounted(true);
    setNative(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    const mq = window.matchMedia('(hover: none), (max-width: 767px)');
    const sync = () => setSheet(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => {
      mq.removeEventListener?.('change', sync);
      window.clearTimeout(copyTimer.current);
    };
  }, []);

  // Bahar chhoona, Escape, ya scroll — panel band.
  useEffect(() => {
    if (!open) return undefined;

    const onDown = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => setOpen(false);

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    if (!sheet) window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open, sheet]);

  if (!product) return null;

  const base = String(STORE.url || '').replace(/\/$/, '');
  const url = `${base}/shop/${product.slug}`;
  const title = product.name;
  const text = `${product.name} — ${formatPKR(product.price)} · ${STORE.name}`;

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onShare = async (e) => {
    stop(e);

    if (native) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* customer ne band kar diya, ya share nakaam — panel dikha dein */
      }
    }
    setOpen((v) => !v);
  };

  const copy = async (e) => {
    stop(e);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard na chale to purana tareeqa
      const field = document.createElement('input');
      field.value = url;
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
      } catch {
        /* kuch na ho to chhor dein */
      }
      field.remove();
    }
  };

  const routes = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      Icon: WhatsAppMark,
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      Icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  const panel = (
    <>
      {sheet && (
        <button
          type="button"
          className="share-veil"
          aria-label="Close"
          onClick={(e) => {
            stop(e);
            setOpen(false);
          }}
        />
      )}

      <div className="share-pop" role="menu" ref={popRef} data-sheet={sheet ? 'true' : 'false'}>
        <span className="share-pop-title caps">Send this piece</span>

        {routes.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="share-route"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <Icon width={16} height={16} />
            {label}
          </a>
        ))}

        <button type="button" className="share-route" onClick={copy} role="menuitem">
          {copied ? <CheckIcon width={16} height={16} /> : <LinkIcon width={16} height={16} />}
          {copied ? 'Link copied' : 'Copy link'}
        </button>

        <button
          type="button"
          className="share-close"
          onClick={(e) => {
            stop(e);
            setOpen(false);
          }}
          aria-label="Close"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
    </>
  );

  return (
    <div
      className={`share ${variant === 'full' ? 'share-full' : 'share-icon'} ${className}`}
      data-open={open ? 'true' : 'false'}
      data-sheet={sheet ? 'true' : 'false'}
      ref={wrapRef}
    >
      <button
        type="button"
        className="share-trigger"
        onClick={onShare}
        aria-expanded={native ? undefined : open}
        aria-label={`Share ${product.name}`}
        title="Share"
      >
        <ShareMark width={variant === 'full' ? 16 : 15} height={variant === 'full' ? 16 : 15} />
        {variant === 'full' && <span>Share</span>}
      </button>

      {/* Sirf khulne par — warna DOM mein hota hi nahi.
          Phone ka sheet `document.body` mein jata hai, taake card ka
          transform us ke `fixed` ko apne qabu mein na le le.
          Laptop ka popover wahin rehta hai jahan button hai. */}
      {!native && open && !sheet && panel}
      {!native && open && sheet && mounted && createPortal(panel, document.body)}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toShareProduct } from '@/lib/share';
import { buildShareMessage, getWhatsAppShareUrl } from '@/lib/utils';
import { CheckIcon, CloseIcon, WhatsAppIcon } from '@/components/ui/Icons';

/**
 * ═══════════════════════════════════════════════════════════════
 *  PREVIEW & SHARE ON WHATSAPP
 *  ─────────────────────────────────────────────────────────────
 *  Do dabaane ka raasta, jaan boojh kar:
 *
 *     1. "Preview & Share on WhatsApp"  →  paighaam samne aata hai
 *     2. "Open WhatsApp"                →  WhatsApp khulta hai,
 *                                          paighaam likha hua
 *
 *  Kabhi khud se nahi bhejta. WhatsApp khulta hai, paighaam tayyar
 *  hota hai, aur "send" aap dabate hain. Ye jaan boojh kar hai —
 *  ek ghalat paighaam jo khud chala jaye, wapas nahi aata.
 *
 *  ── DO SHAKLEIN, EK HI COMPONENT ──
 *  · Product ke safhe par: apna button khud dikhata hai.
 *  · Admin mein product save karne ke baad: button ki zaroorat
 *    nahi, panel khud khulta hai. Us soorat mein `open` bahar se
 *    diya jata hai aur button nahi banta.
 *
 *  ── JO NAHI HO SAKTA, AUR US KA ILAJ ──
 *  `wa.me` ke zariye tasveer ki FILE nahi lag sakti — WhatsApp
 *  aisa koi raasta deta hi nahi. Do cheezein ki gayi hain:
 *
 *    · tasveer ka poora pata paighaam mein likha jata hai
 *    · product ka safha Open Graph ke nishan rakhta hai, is liye
 *      WhatsApp khud link se tasveer utha kar card bana deta hai
 *
 *  ── POPUP BAND HO TO ──
 *  Kuch browser naya window khulne nahi dete. Us soorat mein
 *  `window.open` khaali haath lautta hai — tab paighaam khud
 *  clipboard par chala jata hai aur ye baat saaf likh di jati
 *  hai. Grahak ka kaam ruk kar khatam nahi hota.
 * ═══════════════════════════════════════════════════════════════
 */
export default function WhatsAppShare({
  product,
  size = null,
  color = null,
  label = 'Preview & Share on WhatsApp',
  className = '',
  buttonClassName = 'btn btn-outline',
  /* Bahar se chalana ho (admin) — tab button nahi banta. */
  open: openProp,
  onClose,
  /* Panel ke uper ek chhoti si sath ki baat */
  hint = null,
}) {
  const controlled = typeof openProp === 'boolean';

  const [openSelf, setOpenSelf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const boxRef = useRef(null);
  const copyTimer = useRef(null);

  const open = controlled ? openProp : openSelf;

  useEffect(() => {
    setMounted(true);
    return () => window.clearTimeout(copyTimer.current);
  }, []);

  const close = useCallback(() => {
    setCopied(false);
    setBlocked(false);
    if (controlled) onClose?.();
    else setOpenSelf(false);
  }, [controlled, onClose]);

  /* Escape se band, aur khulte hi panel par focus — taake
     keyboard wala wahin pahunche jahan baat ho rahi hai. */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => boxRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, close]);

  if (!product) return null;

  const share = toShareProduct(product, { size, color });
  const message = buildShareMessage(share);
  const href = getWhatsAppShareUrl(share);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* Purana tareeqa — jahan clipboard ki ijazat na ho */
      const field = document.createElement('textarea');
      field.value = message;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy');
      } catch {
        field.remove();
        return false;
      }
      field.remove();
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2400);
    return true;
  };

  const openWhatsApp = async () => {
    const win = window.open(href, '_blank', 'noopener,noreferrer');
    if (!win) {
      setBlocked(true);
      await copy();
      return;
    }
    close();
  };

  const panel = (
    <div
      className="wshare-veil"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="wshare"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wshare-title"
        tabIndex={-1}
        ref={boxRef}
      >
        <header className="wshare-head">
          <h2 id="wshare-title">Share on WhatsApp</h2>
          <button type="button" className="wshare-x" onClick={close} aria-label="Close">
            <CloseIcon width={16} height={16} />
          </button>
        </header>

        {hint && <p className="wshare-hint">{hint}</p>}

        <div className="wshare-body">
          <div className="wshare-shot">
            {share.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={share.imageUrl} alt="" loading="lazy" />
            ) : (
              <span className="wshare-shot-none">Image not available</span>
            )}
          </div>

          <pre className="wshare-msg">{message}</pre>
        </div>

        {blocked && (
          <p className="wshare-warn" role="status">
            Your browser blocked the new window. The message is copied — open
            WhatsApp yourself and paste it.
          </p>
        )}

        <footer className="wshare-foot">
          <button type="button" className="btn btn-outline wshare-copy" onClick={copy}>
            {copied && <CheckIcon width={15} height={15} />}
            {copied ? 'Copied' : 'Copy message'}
          </button>

          <button type="button" className="btn btn-gold wshare-go" onClick={openWhatsApp}>
            <WhatsAppIcon width={17} height={17} />
            Open WhatsApp
          </button>
        </footer>

        <p className="wshare-note">
          Nothing is sent on its own — WhatsApp opens with the message ready and
          you press send.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {!controlled && (
        <button
          type="button"
          className={`${buttonClassName} ${className}`.trim()}
          onClick={() => setOpenSelf(true)}
        >
          <WhatsAppIcon width={17} height={17} />
          {label}
        </button>
      )}

      {open && mounted && createPortal(panel, document.body)}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ICONS
   Inline SVG — no icon library, no extra network request, and they
   inherit the surrounding text colour automatically.
   Every icon is drawn on a 24×24 grid with a 1.25 stroke to match
   the hairline weight used across the design.
   ═══════════════════════════════════════════════════════════════ */

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

export const BagIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowRight = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowUpRight = (p) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const ChevronDown = (p) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronLeft = (p) => (
  <svg {...base} {...p}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 13h10l1-13" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m5 13 4.5 4.5L19 7" />
  </svg>
);

export const WhatsAppIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.6-4A8 8 0 1 1 20 11.5Z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.4-.8-1 .8a5 5 0 0 1-2.1-2.1l.8-1L11 9.5c-.5 0-2 0-2 0Z" />
  </svg>
);

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

export const PhoneIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 .8-.7 1.5-1.5 1.5A16.5 16.5 0 0 1 4 6c0-.8.7-1.5 1.5-1.5H7Z" />
  </svg>
);

export const PinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 15 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.25" />
  </svg>
);

export const TruckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 7.5h10v9h-10z" />
    <path d="M12.5 11h4l3 3v2.5h-7" />
    <circle cx="6" cy="17.5" r="1.75" />
    <circle cx="16" cy="17.5" r="1.75" />
  </svg>
);

export const RefreshIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </svg>
);

export const ShieldIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 2.5v6c0 4-3 7.5-7 9.5-4-2-7-5.5-7-9.5v-6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/* ── SOCIAL MARKS ─────────────────────────────────────────────
   Drawn as solid glyphs rather than 1.25 strokes, because at the
   14–18px these run at, a hairline outline of a brand mark turns
   to mush. They fill with the surrounding text colour.           */

const solid = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false',
};

export const InstagramIcon = (p) => (
  <svg {...solid} {...p}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.8c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.75-.07Zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96Zm0 1.8a3.18 3.18 0 1 0 0 6.36 3.18 3.18 0 0 0 0-6.36Zm5.18-3.2a1.16 1.16 0 1 1 0 2.33 1.16 1.16 0 0 1 0-2.33Z" />
  </svg>
);

export const TikTokIcon = (p) => (
  <svg {...solid} {...p}>
    <path d="M16.6 2h-2.9v13.2a2.5 2.5 0 1 1-2.5-2.5c.22 0 .43.03.63.08v-2.96a5.6 5.6 0 0 0-.63-.04 5.44 5.44 0 1 0 5.44 5.44V8.9a6.4 6.4 0 0 0 3.86 1.28V7.24a3.6 3.6 0 0 1-3.5-3.6V2Z" />
  </svg>
);

export const FacebookIcon = (p) => (
  <svg {...solid} {...p}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
  </svg>
);

export const YouTubeIcon = (p) => (
  <svg {...solid} {...p}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z" />
  </svg>
);

/** Filled mark, for the floating button and the social row. */
export const WhatsAppMark = (p) => (
  <svg {...solid} {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.43 1.32 4.93L2.1 22l5.36-1.4a9.8 9.8 0 0 0 4.58 1.16h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2Zm0 17.97h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.09.81.82-3.02-.2-.31a8.15 8.15 0 0 1-1.25-4.35c0-4.5 3.68-8.17 8.2-8.17a8.14 8.14 0 0 1 5.78 2.4 8.1 8.1 0 0 1 2.4 5.78c0 4.51-3.68 8.18-8.19 8.18Zm4.49-6.12c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.39.1-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.18 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
  </svg>
);

/** Looks up a social mark by the `icon` key in SOCIALS. */
export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppMark,
};


/* ── SHARE ────────────────────────────────────────────────────
   Jaan boojh kar wo aam sa dabba-aur-teer wala nishan nahi, jo
   har doosri site par hai aur jo iPhone ka apna nishan lagta
   hai. Ye teen nuqte hain jo do lakeeron se jure hue — ek cheez
   jo ek haath se do taraf jati hai. Site ki apni baal barabar
   lakeer ke wazan par bana hai, is liye baqi nishanon ka hi
   khandaan lagta hai. */
export const ShareMark = (p) => (
  <svg {...base} {...p}>
    <circle cx="18" cy="6" r="2.6" />
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="18" cy="18" r="2.6" />
    <path d="m8.4 10.8 7.2-3.6" />
    <path d="m8.4 13.2 7.2 3.6" />
  </svg>
);

/** Link copy karne ke liye — do halqe jo ek dosre mein pirose hain. */
export const LinkIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10.5 13.5a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66l-1.5 1.5" />
    <path d="M13.5 10.5a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.5-1.5" />
  </svg>
);

/** Film chalne ka nishan. */
export const PlayIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 6.5 18 12l-9 5.5V6.5Z" />
  </svg>
);

export const SunIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.75v2.1M12 19.15v2.1M21.25 12h-2.1M4.85 12h-2.1M18.54 5.46l-1.48 1.48M6.94 17.06l-1.48 1.48M18.54 18.54l-1.48-1.48M6.94 6.94 5.46 5.46" />
  </svg>
);

export const MoonIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.2 8.2 0 1 0 9.4 9.4Z" />
  </svg>
);

export const ScissorsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="6.5" cy="17.5" r="2.5" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <path d="M8.7 8.3 19 19M19 5 8.7 15.7" />
  </svg>
);

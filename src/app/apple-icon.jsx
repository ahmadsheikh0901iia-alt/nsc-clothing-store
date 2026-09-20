import { ImageResponse } from 'next/og';

/* ═══════════════════════════════════════════════════════════════
   APPLE ICON
   ───────────────────────────────────────────────────────────────
   iPhone par jab koi "Add to Home Screen" karta hai to home
   screen par yehi nazar aata hai. Pehle ye file nahi thi, is
   liye iOS site ka ek dhundla sa screenshot laga deta tha.

   Jaan boojh kar sirf monogram — is naap par poora logo parha
   hi nahi jata.
   ═══════════════════════════════════════════════════════════════ */

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a09',
          color: '#c2a56b',
          fontSize: 62,
          letterSpacing: 4,
          borderRadius: 0,
        }}
      >
        NSC
      </div>
    ),
    size
  );
}

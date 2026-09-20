import { ImageResponse } from 'next/og';
import { DELIVERY, STORE } from '@/lib/constants';

/* ═══════════════════════════════════════════════════════════════
   OPEN GRAPH IMAGE
   ───────────────────────────────────────────────────────────────
   Jab koi site ka link WhatsApp, Facebook ya Instagram par
   share karta hai, wahan yehi tasveer nazar aati hai.

   Pehle koi tasveer thi hi nahi, is liye link saada text ki
   tarah jata tha aur koi usay khol kar dekhne par majboor nahi
   hota tha. Product pages apni tasveer bhejte hain; baqi poori
   site ke liye ye ek tasveer kaafi hai.

   Ye har request par banti nahi — Next ise build ke waqt bana
   kar rakh leta hai.
   ═══════════════════════════════════════════════════════════════ */

export const alt = `${STORE.name} — premium stitched & unstitched clothing`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a09',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Sunehri kinara — site ke hairlines ki tarah */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: '#c2a56b',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 10,
              textTransform: 'uppercase',
              color: '#c2a56b',
              display: 'flex',
            }}
          >
            {STORE.name}
          </div>

          <div
            style={{
              marginTop: 44,
              fontSize: 92,
              lineHeight: 1.02,
              color: '#efe9dd',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ display: 'flex' }}>Cloth, cut</span>
            <span style={{ display: 'flex', color: '#c2a56b', fontStyle: 'italic' }}>
              with intent.
            </span>
          </div>

          <div
            style={{
              marginTop: 32,
              fontSize: 28,
              color: '#9d978b',
              maxWidth: 780,
              lineHeight: 1.45,
              display: 'flex',
            }}
          >
            Stitched &amp; unstitched clothing, hand-finished shawls and
            block-print bedsheets. Made in Pakistan.
          </div>
        </div>

        {/* Neeche wali patti — wohi teen wade jo site par hain */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            fontSize: 24,
            color: '#efe9dd',
            borderTop: '1px solid rgba(239,233,221,0.16)',
            paddingTop: 28,
          }}
        >
          <span style={{ display: 'flex' }}>Cash on delivery</span>
          <span style={{ display: 'flex', color: '#837d70' }}>·</span>
          <span style={{ display: 'flex' }}>{DELIVERY.short}</span>
          <span style={{ display: 'flex', color: '#837d70' }}>·</span>
          <span style={{ display: 'flex' }}>7-day exchange</span>
        </div>
      </div>
    ),
    size
  );
}

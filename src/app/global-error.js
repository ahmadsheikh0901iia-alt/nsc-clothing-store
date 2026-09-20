'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  GLOBAL ERROR
 *  ─────────────────────────────────────────────────────────────
 *  `error.js` safhe ke andar ki ghalti sambhal leta hai. Magar
 *  agar layout khud gir jaye — header, theme wala script, store
 *  provider — to us waqt error.js bhi mar chuka hota hai, aur
 *  bina is file ke visitor ko bilkul saada safed safha nazar
 *  aata hai.
 *
 *  Ye file `<html>` aur `<body>` khud banati hai, kyunke jis
 *  layout ne wo banane the wohi toota hua hai. Is liye yahan
 *  koi CSS file bhi nahi — sare rang seedhe likhe gaye hain,
 *  aur wo dono theme mein parhe ja sakte hain.
 * ═══════════════════════════════════════════════════════════════
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem 1.25rem',
          background: '#0a0a09',
          color: '#efe9dd',
          fontFamily:
            '"Jost", "Futura", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
        }}
      >
        <main style={{ maxWidth: '30rem', display: 'grid', gap: '1.25rem', justifyItems: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.6875rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#c2a56b',
            }}
          >
            NSC Clothing Store
          </p>

          <h1
            style={{
              margin: 0,
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 300,
              fontSize: 'clamp(2rem, 7vw, 3.2rem)',
              lineHeight: 1.05,
            }}
          >
            Ek dhaaga{' '}
            <em style={{ color: '#c2a56b', fontStyle: 'italic' }}>utar gaya</em>.
          </h1>

          <p style={{ margin: 0, color: '#9d978b', fontSize: '1rem', lineHeight: 1.6 }}>
            The site could not load. Try once more — and if it still will not
            open, we are on WhatsApp and can take your order there.
          </p>

          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                font: 'inherit',
                fontSize: '0.875rem',
                padding: '0.75rem 1.4rem',
                background: '#c2a56b',
                color: '#0a0a09',
                border: '1px solid #c2a56b',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>

            <a
              href="https://wa.me/923226032459"
              style={{
                font: 'inherit',
                fontSize: '0.875rem',
                padding: '0.75rem 1.4rem',
                color: '#efe9dd',
                border: '1px solid rgba(239,233,221,0.28)',
                textDecoration: 'none',
              }}
            >
              WhatsApp
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre
              style={{
                maxWidth: '100%',
                overflowX: 'auto',
                padding: '0.9rem',
                background: '#161614',
                border: '1px solid rgba(239,233,221,0.12)',
                fontSize: '0.75rem',
                color: '#c07a6b',
                textAlign: 'left',
                margin: 0,
              }}
            >
              {error.message}
              {error.digest ? `\n\ndigest: ${error.digest}` : ''}
            </pre>
          )}
        </main>
      </body>
    </html>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════
 *  LOADING
 *  ─────────────────────────────────────────────────────────────
 *  Safha badalte waqt pehle bilkul kuch nahi hota tha — screen
 *  jam kar ruk jati thi aur visitor ko lagta tha ke link kaam
 *  hi nahi kiya. Dheemi mobile net par ye sab se aam wajah hoti
 *  hai jis se log site chhor dete hain.
 *
 *  Ab ek baareek sunehri lakeer upar chalti hai. Koi spinner
 *  nahi, koi bara loader nahi — site ke apne mizaj ke mutabiq,
 *  itni si harkat jo batati hai ke kaam ho raha hai.
 *
 *  Style yahin inline hai, jaan boojh kar: ye woh lamha hai jab
 *  stylesheet abhi aa bhi rahi ho sakti hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Load ho raha hai"
      style={{
        position: 'fixed',
        insetInline: 0,
        top: 0,
        height: '2px',
        overflow: 'hidden',
        zIndex: 70,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          height: '100%',
          width: '38%',
          background: 'linear-gradient(90deg, transparent, #c2a56b, transparent)',
          animation: 'nsc-load 1.1s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html:
            '@keyframes nsc-load{0%{transform:translateX(-100%)}100%{transform:translateX(365%)}}' +
            '@media (prefers-reduced-motion: reduce){[role="status"] span{animation:none;width:100%;opacity:.5}}',
        }}
      />
    </div>
  );
}

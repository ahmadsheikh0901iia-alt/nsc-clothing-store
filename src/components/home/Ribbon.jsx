import Marquee from '@/components/motion/Marquee';
import { RIBBON } from '@/lib/constants';

/**
 * ═══════════════════════════════════════════════════════════════
 *  THE RIBBON
 *  ─────────────────────────────────────────────────────────────
 *  Hero ke theek neeche chalne wali patti. Ye sirf elaan nahi —
 *  ghar ki muhr hai, is liye teen cheezein sath chalti hain:
 *
 *    1. Do sunehri baal jaisi lakeerein, upar aur neeche, jo
 *       kinaron par ja kar khud ghul jati hain.
 *    2. Bayan baari baari badalta hai: ek bara serif jumla, phir
 *       chhote sunehri capitals. Taqseem CSS `:nth-child` se hoti
 *       hai — RIBBON ki tarteeb hi us ka husn hai.
 *    3. Har chand lamhon mein ek halki chamak patti ke oopar se
 *       guzarti hai, jaise roshni shishe par se.
 *
 *  Hover par patti ruk jati hai taake jumla parha ja sake, aur
 *  jise harkat se taklif ho us ke liye motion.css sab band kar
 *  deta hai.
 * ═══════════════════════════════════════════════════════════════
 */
export default function Ribbon({ items = RIBBON, duration = 48, reverse = false }) {
  return (
    <div className="ribbon">
      <Marquee items={items} duration={duration} reverse={reverse} />
      <span className="ribbon-sheen" aria-hidden="true" />
    </div>
  );
}

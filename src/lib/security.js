import { supabaseAdmin } from '@/lib/supabase';
import { clientIp, hashIp } from '@/lib/rate-limit';

/* ═══════════════════════════════════════════════════════════════
   SECURITY — doosri parat
   ───────────────────────────────────────────────────────────────
   Pehli parat (rate limit, honeypot, input ki jaanch, RLS,
   server par price ginna) pehle se lagi hui hai. Ye file do aur
   cheezein jorti hai:

     1. ORIGIN KI JAANCH — CSRF ka ilaj
     2. AMAL KA RECORD    — kis ne, kya, kab
   ═══════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────
   1. ORIGIN
   ───────────────────────────────────────────────────────────────
   Farz karein koi shakhs ek bhaddi si site banata hai aur us mein
   chhupa hua form rakh deta hai jo aap ke /api/admin/products par
   submit hota hai. Agar us waqt aap ka admin panel usi browser
   mein khula ho, to browser aap ki cookie khud us request ke sath
   jor dega — aur server ko lagega ke ye aap ne bheja hai. Isay
   CSRF kehte hain.

   Bachao saada hai: browser har aisi request ke sath `Origin`
   bhejta hai, aur wo batata hai ke request KAHAN SE aayi. Agar wo
   humari apni site nahi, to request wahin rok di jati hai.

   `sameSite: 'strict'` cookie is ke oopar doosra taala hai — us
   soorat mein cookie jaati hi nahi. Do taale, ek hi darwaze par.
   ─────────────────────────────────────────────────────────────── */

/** Sirf ye tareeqe kuch badalte hain — baqi parhne wale hain. */
const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * @param {Request} request
 * @returns {boolean} true = mehfooz, false = bahar se aayi hai
 */
export function sameOrigin(request) {
  if (!MUTATING.has(request.method)) return true;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // Kuch aam haalat mein browser Origin bhejta hi nahi (jaise
  // seedha address bar se). Un par rok lagane ka matlab nahi.
  if (!origin) return true;

  let from;
  try {
    from = new URL(origin);
  } catch {
    return false;
  }

  // Apna hi host? Theek hai.
  if (host && from.host === host) return true;

  // Live domain — .env se, taake proxy ke peechay bhi chale.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      if (new URL(site).host === from.host) return true;
    } catch {
      /* ghalat URL — nazar-andaz */
    }
  }

  // Development mein localhost apni jagah theek hai.
  if (process.env.NODE_ENV !== 'production') {
    if (from.hostname === 'localhost' || from.hostname === '127.0.0.1') return true;
  }

  return false;
}

/* ───────────────────────────────────────────────────────────────
   2. AMAL KA RECORD
   ───────────────────────────────────────────────────────────────
   Har wo cheez jo admin panel se badalti hai, yahan darj hoti
   hai — aur har wo koshish bhi jo andar aane ki thi aur nakaam
   rahi.

   Kyun zaroori hai: agar kabhi kuch ghalat ho — koi product
   ghayab, koi order ka status ajeeb, ya koi anjaan IP se bar bar
   login ki koshish — to sawal ye nahi hota ke "kya hua", sawal
   hota hai "kab aur kahan se hua". Us ka jawab sirf record de
   sakta hai. Yaad-dasht nahi.

   IP poora nahi rakha jata — sirf uska chhota nishan, taake do
   koshishon ko jora ja sake magar kisi ka asal pata database
   mein na likha jaye.
   ─────────────────────────────────────────────────────────────── */

/**
 * @param {Request} request
 * @param {string} action   e.g. 'product.create', 'order.status', 'login.fail'
 * @param {Object} [detail] chhoti si tafseel — kabhi password nahi
 */
export async function audit(request, action, detail = {}) {
  try {
    const db = supabaseAdmin();
    if (!db) return;

    const ip = clientIp(request);

    await db.from('admin_log').insert({
      action,
      detail,
      ip_hash: await hashIp(ip),
      agent: String(request.headers.get('user-agent') || '').slice(0, 200),
    });
  } catch {
    // Record na likha ja sake to asal kaam nahi rukna chahiye.
  }
}

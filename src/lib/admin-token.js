/* ═══════════════════════════════════════════════════════════════
   ADMIN TOKEN
   ───────────────────────────────────────────────────────────────
   Admin ki login "chitthi" banata aur jaanchta hai.

   Ye jaan boojh kar Web Crypto par likha gaya hai, Node ke
   `crypto` par nahi — kyunke yehi code teen alag jagah chalta
   hai: middleware (Edge), route handlers (Node), aur server
   components. Ek hi tareeqa, teenon jagah.

   Chitthi ki shakal:  <expiry>.<random>.<signature>

   Signature ADMIN_PASSWORD se bani chabi ka HMAC hai. Password
   badalte hi purani sari chitthiyan bekar ho jati hain. Password
   khud kabhi cookie mein nahi jata.
   ═══════════════════════════════════════════════════════════════ */

const ENC = new TextEncoder();

export const ADMIN_COOKIE = 'nsc_admin';

/** Barah ghante. Is ke baad dobara password. */
export const SESSION_SECONDS = 60 * 60 * 12;

/** Password kam az kam itna lamba hona chahiye. */
export const MIN_PASSWORD_LENGTH = 10;

/** .env.local se password — aur uski sehat ki jaanch. */
export function adminPassword() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < MIN_PASSWORD_LENGTH) return null;
  return pw;
}

export function adminConfigured() {
  return adminPassword() !== null;
}

let keyPromise = null;
let keyForPassword = null;

async function signingKey() {
  const pw = adminPassword();
  if (!pw) return null;

  // Password badla to purani chabi phenk dein.
  if (keyForPassword !== pw) {
    keyForPassword = pw;
    keyPromise = crypto.subtle.importKey(
      'raw',
      ENC.encode(`nsc-admin-v1:${pw}`),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  }
  return keyPromise;
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(body) {
  const key = await signingKey();
  if (!key) return null;
  return toHex(await crypto.subtle.sign('HMAC', key, ENC.encode(body)));
}

/** Do string ko is tarah milata hai ke waqt se koi suragh na mile. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Nayi chitthi. */
export async function createToken() {
  const expiry = Date.now() + SESSION_SECONDS * 1000;
  const nonce = toHex(crypto.getRandomValues(new Uint8Array(12)));
  const body = `${expiry}.${nonce}`;
  const signature = await sign(body);
  if (!signature) return null;
  return `${body}.${signature}`;
}

/**
 * Chitthi sahi hai? Signature bhi, aur waqt bhi.
 * @param {string|undefined|null} token
 * @returns {Promise<boolean>}
 */
export async function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [expiry, nonce, signature] = parts;

  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return false;

  const expected = await sign(`${expiry}.${nonce}`);
  if (!expected) return false;

  return safeEqual(signature, expected);
}

/** Cookie ki settings — ek hi jagah, taake kahin farq na reh jaye. */
export function cookieOptions(maxAge = SESSION_SECONDS) {
  return {
    httpOnly: true,            // JavaScript is cookie ko chhu bhi nahi sakti
    secure: process.env.NODE_ENV === 'production',
    /* 'strict' — cookie kisi bhi doosri site se aane wali
       request ke sath NAHI jati, chahe wo request kuch bhi ho.
       Ye CSRF ke khilaf doosra taala hai (pehla middleware mein
       Origin ki jaanch hai).

       Ek chhoti si qeemat: agar aap /admin ka link kisi aur jagah
       (WhatsApp, email) se khol'ein to pehli dafa logged-out
       nazar aa sakta hai — ek refresh se theek. Admin panel ke
       liye ye sauda faidemand hai. */
    sameSite: 'strict',
    path: '/',
    maxAge,
  };
}

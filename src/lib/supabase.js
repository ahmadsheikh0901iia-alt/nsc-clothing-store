import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════════
   SUPABASE CLIENTS
   ───────────────────────────────────────────────────────────────
   Do client, do bilkul alag darje ki chabiyan:

     supabasePublic()  publishable (anon) key. Sirf published
                       products parh sakti hai — row level
                       security is se aage kuch nahi dikhati.
                       Browser mein jaane se koi nuqsan nahi.

     supabaseAdmin()   secret (service role) key. RLS ko poori
                       tarah nazar-andaz karta hai. YE KABHI BHI
                       kisi 'use client' file mein import nahi
                       hona chahiye. Neeche ka guard is ghalti
                       par foran error pheink deta hai.

   ── DONO NAAM QABOOL HAIN ──
   Supabase ne apni chabiyon ke naam badal diye hain:

     purana                          naya
     ─────────────────────────────   ──────────────────────────
     NEXT_PUBLIC_SUPABASE_ANON_KEY   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
     SUPABASE_SERVICE_ROLE_KEY       SUPABASE_SECRET_KEY

   Ye file dono shaklein parh leti hai. Aap ke .env.local mein
   naye naam hain — wo theek hain, kuch badalne ki zaroorat nahi.

   Dono par ek fetch wrapper laga hai jo har request ko
   `cache: 'no-store'` deta hai. Is ka matlab: admin panel se
   product add karte hi wo site par nazar aa jata hai — kisi
   rebuild ya revalidate ka intezar nahi.
   ═══════════════════════════════════════════════════════════════ */

/** Jo bhi maujood ho, wo utha lo. */
const pick = (...names) => {
  for (const value of names) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const URL = pick(process.env.NEXT_PUBLIC_SUPABASE_URL);

const ANON = pick(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SERVICE = pick(
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** Kya URL aur publishable key dono maujood hain? */
export const supabaseConfigured = Boolean(URL && ANON);

/** Kya server par secret key bhi maujood hai? */
export const supabaseAdminConfigured = Boolean(URL && SERVICE);

/**
 * Kya kami hai — admin login ka safha isi se saaf bata deta hai
 * ke `.env.local` mein kya reh gaya.
 */
export function supabaseMissing() {
  const missing = [];
  if (!URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!ANON) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (!SERVICE) missing.push('SUPABASE_SECRET_KEY');
  return missing;
}

/** Har query taza — kabhi cache se nahi. */
function freshFetch(input, init) {
  return fetch(input, { ...init, cache: 'no-store' });
}

const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: freshFetch, headers: { 'x-nsc-app': 'storefront' } },
};

let publicClient = null;

/**
 * Parhne ke liye. `null` deta hai jab keys hi set na hon — is liye
 * site keys ke baghair bhi chalti rehti hai, bas catalogue khali
 * dikhta hai.
 */
export function supabasePublic() {
  if (!supabaseConfigured) return null;
  if (!publicClient) publicClient = createClient(URL, ANON, options);
  return publicClient;
}

let adminClient = null;

/**
 * Likhne ke liye — SIRF server par.
 * @returns {import('@supabase/supabase-js').SupabaseClient|null}
 */
export function supabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'supabaseAdmin() sirf server par chal sakta hai. Isay kisi client component mein import na karein.'
    );
  }
  if (!supabaseAdminConfigured) return null;
  if (!adminClient) {
    adminClient = createClient(URL, SERVICE, {
      ...options,
      global: { fetch: freshFetch, headers: { 'x-nsc-app': 'admin' } },
    });
  }
  return adminClient;
}

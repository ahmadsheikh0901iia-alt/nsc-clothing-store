import { isAdmin } from '@/lib/admin-auth';
import { adminConfigured } from '@/lib/admin-token';
import { supabaseAdminConfigured } from '@/lib/supabase';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';

export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════════════════════
   /admin
   ───────────────────────────────────────────────────────────────
   Server par chalta hai. Cookie dekhta hai aur faisla karta hai
   ke login ka safha dikhana hai ya poora panel.

   Panel ka koi hissa — na data, na markup — us shakhs tak jata
   hi nahi jo login nahi hai. Ye "chhupa dena" nahi, "bheja hi
   nahi jata" hai, jo asal hifazat hai.
   ═══════════════════════════════════════════════════════════════ */

export default async function AdminPage() {
  const authed = await isAdmin();

  if (!authed) {
    return (
      <AdminLogin
        passwordSet={adminConfigured()}
        databaseSet={supabaseAdminConfigured}
      />
    );
  }

  return <AdminPanel />;
}

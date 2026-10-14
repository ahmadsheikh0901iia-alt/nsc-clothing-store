import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-H', '0.0.0.0', '-p', '3100'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: `--import=${resolve('tests/e2e/mock-supabase.mjs')}`,
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3100',
    NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'fixture-public-key',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    SUPABASE_SECRET_KEY: 'fixture-private-key',
    SUPABASE_SERVICE_ROLE_KEY: '',
    ADMIN_PASSWORD: 'fixture-password-only',
    TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '', RESEND_API_KEY: '',
    NSC_REQUIRE_SHARED_RATE_LIMIT: 'false',
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code || 0));

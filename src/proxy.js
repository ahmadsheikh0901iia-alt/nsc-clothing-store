import { runGate } from '@/lib/gate';

export async function proxy(request) { return runGate(request); }

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.*\\.png|media/|products/|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|woff2?)$).*)'],
};

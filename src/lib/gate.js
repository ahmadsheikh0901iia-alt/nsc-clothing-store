import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyToken } from '@/lib/admin-token';
import { sameOrigin } from '@/lib/origin';

export async function runGate(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/') && !sameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    if (!await verifyToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
      return NextResponse.json({ ok: false, error: 'unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }
  }
  const response = NextResponse.next();
  if (['/admin', '/api/', '/order'].some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return response;
}

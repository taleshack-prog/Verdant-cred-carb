import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/marketplace'];
const PRODUCER_ROUTES = ['/producer'];
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('verdant_token')?.value;
  const role  = request.cookies.get('verdant_role')?.value;

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
  if (isPublic) return NextResponse.next();

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const isAdmin    = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  const isProducer = PRODUCER_ROUTES.some(r => pathname.startsWith(r));

  if (isAdmin && role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/producer';
    return NextResponse.redirect(url);
  }

  if (isProducer && role === 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

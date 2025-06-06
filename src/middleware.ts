import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  const { pathname } = request.nextUrl;
  
  if (pathname === '/') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/m/login', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isMobile && pathname.startsWith('/desktop')) {
    const mobilePath = pathname.replace('/', '/m');
    return NextResponse.redirect(new URL(mobilePath, request.url));
  }

  if (!isMobile && pathname.startsWith('/m')) {
    const desktopPath = pathname.replace('/m', '/');
    return NextResponse.redirect(new URL(desktopPath, request.url));
  }

  if (pathname === '/login') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/m/login', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/dashboard') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/m/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     * - icons/
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
};
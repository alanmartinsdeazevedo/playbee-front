import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  const { pathname } = request.nextUrl;
  
  if (pathname === '/') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/mobile/login', request.url));
    } else {
      return NextResponse.redirect(new URL('/desktop/login', request.url));
    }
  }

  if (isMobile && pathname.startsWith('/desktop')) {
    const mobilePath = pathname.replace('/desktop', '/mobile');
    return NextResponse.redirect(new URL(mobilePath, request.url));
  }

  if (!isMobile && pathname.startsWith('/mobile')) {
    const desktopPath = pathname.replace('/mobile', '/desktop');
    return NextResponse.redirect(new URL(desktopPath, request.url));
  }

  if (pathname === '/login') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/mobile/login', request.url));
    } else {
      return NextResponse.redirect(new URL('/desktop/login', request.url));
    }
  }

  if (pathname === '/dashboard') {
    if (isMobile) {
      return NextResponse.redirect(new URL('/mobile/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/desktop/dashboard', request.url));
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
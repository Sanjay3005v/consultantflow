import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin-session');
  const { pathname } = request.nextUrl;

  // If the user is trying to access the admin page without a session, redirect to login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If the user is logged in and tries to access the login page, redirect to admin console
  if (pathname.startsWith('/admin/login') && sessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin/login'],
}

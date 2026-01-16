import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token');
  const isLoginPage = request.nextUrl.pathname === '/';
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // If trying to access dashboard without token, redirect to login
  if (isDashboard && !adminToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If already logged in and on login page, redirect to dashboard
  if (isLoginPage && adminToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware runs on server, can't access localStorage
  // Auth check is done client-side in components
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

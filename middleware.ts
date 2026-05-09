import { NextResponse, type NextRequest } from 'next/server';

import {
  DASHBOARD_AUTH_COOKIE,
  isDashboardAuthConfigured,
  verifyDashboardSessionToken,
} from '@/lib/dashboard-auth';

export async function middleware(request: NextRequest) {
  if (!isDashboardAuthConfigured()) {
    return NextResponse.redirect(new URL('/login?error=config', request.url));
  }

  const token = request.cookies.get(DASHBOARD_AUTH_COOKIE)?.value;
  const isAuthorized = await verifyDashboardSessionToken(token);
  if (isAuthorized) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/'],
};

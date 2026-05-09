import { NextResponse } from 'next/server';

import {
  DASHBOARD_AUTH_COOKIE,
  getDashboardLogoutCookieOptions,
} from '@/lib/dashboard-auth';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  response.cookies.set(DASHBOARD_AUTH_COOKIE, '', getDashboardLogoutCookieOptions());

  return response;
}

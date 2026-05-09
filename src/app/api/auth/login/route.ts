import { NextResponse } from 'next/server';

import {
  DASHBOARD_AUTH_COOKIE,
  createDashboardSessionToken,
  getDashboardAuthCookieOptions,
  isDashboardAuthConfigured,
  isValidDashboardPassword,
} from '@/lib/dashboard-auth';

function getSafeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';

  return value;
}

function redirectToLogin(request: Request, error: string) {
  const url = new URL('/login', request.url);
  url.searchParams.set('error', error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  if (!isDashboardAuthConfigured()) {
    return redirectToLogin(request, 'config');
  }

  const formData = await request.formData();
  const password = formData.get('password');
  if (typeof password !== 'string' || !isValidDashboardPassword(password)) {
    return redirectToLogin(request, 'invalid');
  }

  const nextPath = getSafeNextPath(formData.get('next'));
  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
  response.cookies.set(
    DASHBOARD_AUTH_COOKIE,
    await createDashboardSessionToken(),
    getDashboardAuthCookieOptions(),
  );

  return response;
}

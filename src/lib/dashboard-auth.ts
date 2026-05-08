import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const DASHBOARD_AUTH_COOKIE = 'thai_dashboard_auth';

const TOKEN_VERSION = 'v1';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getMissingDashboardAuthEnv(): string[] {
  const requiredEnv = {
    DASHBOARD_ACCESS_PASSWORD: process.env.DASHBOARD_ACCESS_PASSWORD,
    DASHBOARD_AUTH_SECRET: process.env.DASHBOARD_AUTH_SECRET,
  };

  return Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

export function isDashboardAuthConfigured(): boolean {
  return getMissingDashboardAuthEnv().length === 0;
}

export function getDashboardAuthCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function getDashboardLogoutCookieOptions(): Partial<ResponseCookie> {
  return {
    ...getDashboardAuthCookieOptions(),
    maxAge: 0,
  };
}

export function isValidDashboardPassword(password: string): boolean {
  const expectedPassword = process.env.DASHBOARD_ACCESS_PASSWORD;
  return Boolean(expectedPassword) && constantTimeEqual(password, expectedPassword ?? '');
}

export async function createDashboardSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = await signPayload(payload);

  return `${payload}.${signature}`;
}

export async function verifyDashboardSessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !isDashboardAuthConfigured()) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, expiresAtValue, receivedSignature] = parts;
  if (version !== TOKEN_VERSION) return false;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isInteger(expiresAt)) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = await signPayload(`${version}.${expiresAtValue}`);
  return constantTimeEqual(receivedSignature, expectedSignature);
}

async function signPayload(payload: string): Promise<string> {
  const secret = process.env.DASHBOARD_AUTH_SECRET;
  if (!secret) return '';

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let result = left.length === right.length ? 0 : 1;

  for (let index = 0; index < maxLength; index += 1) {
    const leftCode = left.charCodeAt(index) || 0;
    const rightCode = right.charCodeAt(index) || 0;
    result |= leftCode ^ rightCode;
  }

  return result === 0;
}

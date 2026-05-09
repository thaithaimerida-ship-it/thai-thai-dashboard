import { NextResponse } from 'next/server';

import { findExistingReportByPeriod } from '@/lib/google-sheets-server';
import {
  DASHBOARD_AUTH_COOKIE,
  verifyDashboardSessionToken,
} from '@/lib/dashboard-auth';
import { parsePeriodId } from '@/lib/financial-ai/period';

export const runtime = 'nodejs';

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split('=');
    if (rawName === name) {
      return rawValue.join('=');
    }
  }

  return undefined;
}

function parseBoolean(value: string): boolean {
  return value.trim().toLowerCase() === 'true';
}

function parseReportJSON(value: string): { reportJson: unknown; parseError: boolean } {
  if (!value.trim()) {
    return { reportJson: null, parseError: false };
  }

  try {
    return { reportJson: JSON.parse(value), parseError: false };
  } catch {
    return { reportJson: null, parseError: true };
  }
}

export async function GET(request: Request) {
  const token = getCookieValue(request.headers.get('cookie'), DASHBOARD_AUTH_COOKIE);
  const isAuthorized = await verifyDashboardSessionToken(token);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') ?? '';
  const parsed = parsePeriodId(period);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: `Periodo invalido: ${parsed.error}` },
      { status: 400 },
    );
  }

  const existing = await findExistingReportByPeriod(period);
  if (!existing) {
    return NextResponse.json({
      exists: false,
      period,
      locked: false,
    });
  }

  const { reportJson, parseError } = parseReportJSON(existing.Report_JSON);

  return NextResponse.json({
    exists: true,
    period,
    locked: parseBoolean(existing.Locked),
    estado: existing.Estado,
    fecha_generacion: existing.Fecha_Generacion,
    report_json: reportJson,
    parse_error: parseError,
  });
}

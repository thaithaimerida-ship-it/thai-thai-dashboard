import { NextResponse } from 'next/server';

import {
  appendClosedMonthlyReport,
  findExistingReportByPeriod,
  type NewReportesIARow,
} from '@/lib/google-sheets-server';
import {
  AnthropicRequestError,
  AnthropicTimeoutError,
  InsufficientFinancialDataError,
  InvalidAIResponseError,
  MissingAnthropicApiKeyError,
} from '@/lib/financial-ai/errors';
import {
  generateFinancialAIReport,
  type GeneratedFinancialAIReport,
} from '@/lib/financial-ai/financial-analysis-service';
import { isMonthClosed, parsePeriodId } from '@/lib/financial-ai/period';
import {
  DASHBOARD_AUTH_COOKIE,
  verifyDashboardSessionToken,
} from '@/lib/dashboard-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateRequestBody {
  periodId?: unknown;
}

type GenerateErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_PERIOD'
  | 'OPEN_PERIOD'
  | 'EXISTING_REPORT'
  | 'INSUFFICIENT_FINANCIAL_DATA'
  | 'ANTHROPIC_MISSING_KEY'
  | 'ANTHROPIC_TIMEOUT'
  | 'ANTHROPIC_REQUEST_ERROR'
  | 'INVALID_AI_RESPONSE'
  | 'GOOGLE_SHEETS_ERROR'
  | 'UNKNOWN_GENERATE_ERROR';

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

function logGenerateError(
  periodId: string,
  status: number,
  errorCode: GenerateErrorCode,
  message: string,
) {
  console.error('[financial-ai/generate-ui]', {
    periodId: periodId || 'unknown',
    status,
    error_code: errorCode,
    message,
  });
}

function jsonError(
  message: string,
  status: number,
  errorCode: GenerateErrorCode,
  periodId = '',
) {
  logGenerateError(periodId, status, errorCode, message);
  return NextResponse.json({ error: message, error_code: errorCode }, { status });
}

function isGoogleSheetsError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /google|sheet|spreadsheet|permission|unable to parse range/i.test(error.message);
}

function toStatusError(error: unknown, periodId: string) {
  if (error instanceof InsufficientFinancialDataError) {
    return jsonError(error.message, 422, 'INSUFFICIENT_FINANCIAL_DATA', periodId);
  }
  if (error instanceof MissingAnthropicApiKeyError) {
    return jsonError(
      'Falta configurar la API key de Anthropic',
      500,
      'ANTHROPIC_MISSING_KEY',
      periodId,
    );
  }
  if (error instanceof AnthropicTimeoutError) {
    return jsonError(error.message, 504, 'ANTHROPIC_TIMEOUT', periodId);
  }
  if (error instanceof AnthropicRequestError) {
    return jsonError(
      'Error al solicitar analisis financiero a Anthropic',
      502,
      'ANTHROPIC_REQUEST_ERROR',
      periodId,
    );
  }
  if (error instanceof InvalidAIResponseError) {
    return jsonError(error.message, 502, 'INVALID_AI_RESPONSE', periodId);
  }

  if (error instanceof Error && error.message.includes('Ya existe un reporte mensual cerrado')) {
    return jsonError('El reporte ya existe y quedo bloqueado', 409, 'EXISTING_REPORT', periodId);
  }

  if (isGoogleSheetsError(error)) {
    return jsonError(
      'Error al leer o guardar datos en Google Sheets',
      500,
      'GOOGLE_SHEETS_ERROR',
      periodId,
    );
  }

  return jsonError(
    'Error inesperado al generar reporte financiero IA',
    500,
    'UNKNOWN_GENERATE_ERROR',
    periodId,
  );
}

async function readBody(request: Request): Promise<GenerateRequestBody | null> {
  try {
    return (await request.json()) as GenerateRequestBody;
  } catch {
    return null;
  }
}

function existingReportResponse(period: string, locked: boolean, reportJson: string) {
  const parsed = parseReportJSON(reportJson);
  return NextResponse.json({
    generated: false,
    locked,
    period,
    report_json: parsed.reportJson,
    parse_error: parsed.parseError,
  });
}

function toReportesIARow(
  periodId: string,
  year: number,
  month: number,
  generated: GeneratedFinancialAIReport,
): NewReportesIARow {
  return {
    ID_Periodo: periodId,
    Tipo_Periodo: 'MENSUAL',
    Anio: String(year),
    Mes: String(month).padStart(2, '0'),
    Estado: 'OK',
    Locked: 'TRUE',
    Fecha_Generacion: new Date().toISOString(),
    Fecha_Corte_Datos: generated.metadata.fechaCorteDatos,
    Data_Hash: generated.metadata.dataHash,
    Model: generated.metadata.model,
    Prompt_Version: generated.metadata.promptVersion,
    Report_JSON: JSON.stringify(generated.report),
    Error: '',
  };
}

export async function POST(request: Request) {
  const token = getCookieValue(request.headers.get('cookie'), DASHBOARD_AUTH_COOKIE);
  const isAuthorized = await verifyDashboardSessionToken(token);
  if (!isAuthorized) {
    return jsonError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const body = await readBody(request);
  const periodId = typeof body?.periodId === 'string' ? body.periodId : '';
  const parsed = parsePeriodId(periodId);

  if (!parsed.ok) {
    return jsonError(`Periodo invalido: ${parsed.error}`, 400, 'INVALID_PERIOD', periodId);
  }

  const { period } = parsed;

  try {
    if (!isMonthClosed(period.year, period.month)) {
      return jsonError(
        'No se puede generar reporte mensual de un mes abierto o futuro',
        400,
        'OPEN_PERIOD',
        periodId,
      );
    }

    const existing = await findExistingReportByPeriod(periodId);
    if (existing) {
      return existingReportResponse(periodId, true, existing.Report_JSON);
    }

    const generated = await generateFinancialAIReport(periodId);
    await appendClosedMonthlyReport(
      toReportesIARow(periodId, period.year, period.month, generated),
    );

    return NextResponse.json({
      generated: true,
      locked: true,
      period: periodId,
      report_json: generated.report,
      parse_error: false,
    });
  } catch (error) {
    return toStatusError(error, periodId);
  }
}

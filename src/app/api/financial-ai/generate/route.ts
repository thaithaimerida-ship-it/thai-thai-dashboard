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

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateRequestBody {
  periodId?: unknown;
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

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function toStatusError(error: unknown) {
  if (error instanceof InsufficientFinancialDataError) {
    return jsonError(error.message, 422);
  }
  if (error instanceof MissingAnthropicApiKeyError) {
    return jsonError('Falta configurar ANTHROPIC_API_KEY', 500);
  }
  if (error instanceof AnthropicTimeoutError) {
    return jsonError(error.message, 504);
  }
  if (error instanceof AnthropicRequestError) {
    return jsonError('Error al solicitar analisis financiero a Anthropic', 502);
  }
  if (error instanceof InvalidAIResponseError) {
    return jsonError(error.message, 502);
  }

  return jsonError('Error inesperado al generar reporte financiero IA', 500);
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
  const body = await readBody(request);
  const periodId = typeof body?.periodId === 'string' ? body.periodId : '';
  const parsed = parsePeriodId(periodId);

  if (!parsed.ok) {
    return jsonError(`Periodo invalido: ${parsed.error}`, 400);
  }

  const { period } = parsed;

  try {
    if (!isMonthClosed(period.year, period.month)) {
      return jsonError('No se puede generar reporte mensual de un mes abierto o futuro', 400);
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
    });
  } catch (error) {
    return toStatusError(error);
  }
}

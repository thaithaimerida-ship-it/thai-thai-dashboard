import 'server-only';

import { buildFinancialAIPayload } from './payload-builder';
import { computeDataHash } from './period';
import { getSelectedFinancialAIModel, requestFinancialAIAnalysis } from './provider';
import {
  buildFinancialAISystemPrompt,
  buildFinancialAIUserPrompt,
} from './prompt';
import { validateFinancialAIReport } from './report-validator';
import { FinancialReportSchema, type FinancialReport } from './schema';
import { FINANCIAL_AI_PROMPT_VERSION } from './targets';
import { InvalidAIResponseError } from './errors';

export interface GeneratedFinancialAIReport {
  report: FinancialReport;
  metadata: {
    dataHash: string;
    fechaCorteDatos: string;
    model: string;
    promptVersion: string;
  };
}

function injectDeterministicKpis(
  aiReport: FinancialReport,
  payload: Awaited<ReturnType<typeof buildFinancialAIPayload>>,
): FinancialReport {
  const reportWithDeterministicKpis = {
    ...aiReport,
    resumen_financiero: payload.agregados.resumen_financiero,
    rentabilidad: payload.agregados.rentabilidad,
    caja_operativa: payload.agregados.caja_operativa,
    comisiones_canales: payload.agregados.comisiones_canales,
  };

  const result = FinancialReportSchema.safeParse(reportWithDeterministicKpis);
  if (!result.success) {
    throw new InvalidAIResponseError(
      'El reporte financiero IA con KPIs determinísticos no cumple el schema aprobado',
      result.error.flatten(),
    );
  }

  return result.data;
}

export async function generateFinancialAIReport(
  periodId: string,
): Promise<GeneratedFinancialAIReport> {
  const payload = await buildFinancialAIPayload(periodId);
  const responseText = await requestFinancialAIAnalysis({
    system: buildFinancialAISystemPrompt(),
    prompt: buildFinancialAIUserPrompt(payload),
  });
  const aiReport = validateFinancialAIReport(responseText, periodId);

  return {
    report: injectDeterministicKpis(aiReport, payload),
    metadata: {
      dataHash: computeDataHash(payload),
      fechaCorteDatos: payload.periodo.rango.fin,
      model: getSelectedFinancialAIModel(),
      promptVersion: FINANCIAL_AI_PROMPT_VERSION,
    },
  };
}

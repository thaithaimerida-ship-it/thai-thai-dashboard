import 'server-only';

import { getFinancialAIModel, requestFinancialAIAnalysis } from './anthropic-client';
import { buildFinancialAIPayload } from './payload-builder';
import { computeDataHash } from './period';
import {
  buildFinancialAISystemPrompt,
  buildFinancialAIUserPrompt,
} from './prompt';
import { validateFinancialAIReport } from './report-validator';
import type { FinancialReport } from './schema';
import { FINANCIAL_AI_PROMPT_VERSION } from './targets';

export interface GeneratedFinancialAIReport {
  report: FinancialReport;
  metadata: {
    dataHash: string;
    fechaCorteDatos: string;
    model: string;
    promptVersion: string;
  };
}

export async function generateFinancialAIReport(
  periodId: string,
): Promise<GeneratedFinancialAIReport> {
  const payload = await buildFinancialAIPayload(periodId);
  const responseText = await requestFinancialAIAnalysis({
    system: buildFinancialAISystemPrompt(),
    prompt: buildFinancialAIUserPrompt(payload),
  });

  return {
    report: validateFinancialAIReport(responseText, periodId),
    metadata: {
      dataHash: computeDataHash(payload),
      fechaCorteDatos: payload.periodo.rango.fin,
      model: getFinancialAIModel(),
      promptVersion: FINANCIAL_AI_PROMPT_VERSION,
    },
  };
}

import 'server-only';

import { requestFinancialAIAnalysis } from './anthropic-client';
import { buildFinancialAIPayload } from './payload-builder';
import {
  buildFinancialAISystemPrompt,
  buildFinancialAIUserPrompt,
} from './prompt';
import { validateFinancialAIReport } from './report-validator';
import type { FinancialReport } from './schema';

export async function generateFinancialAIReport(periodId: string): Promise<FinancialReport> {
  const payload = await buildFinancialAIPayload(periodId);
  const responseText = await requestFinancialAIAnalysis({
    system: buildFinancialAISystemPrompt(),
    prompt: buildFinancialAIUserPrompt(payload),
  });

  return validateFinancialAIReport(responseText);
}

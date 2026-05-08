import 'server-only';

import {
  FinancialReportSchema,
  type FinancialReport,
} from './schema';
import { InvalidAIResponseError } from './errors';

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new InvalidAIResponseError('La respuesta de IA no es JSON valido', error);
  }
}

export function validateFinancialAIReport(
  responseText: string,
  expectedPeriodId?: string,
): FinancialReport {
  const trimmed = responseText.trim();
  if (!trimmed) {
    throw new InvalidAIResponseError('La respuesta de IA esta vacia');
  }

  const parsed = parseJSON(trimmed);
  const result = FinancialReportSchema.safeParse(parsed);

  if (!result.success) {
    throw new InvalidAIResponseError(
      'La respuesta de IA no cumple el schema financiero aprobado',
      result.error.flatten(),
    );
  }

  if (expectedPeriodId && result.data.metadata.periodo !== expectedPeriodId) {
    throw new InvalidAIResponseError(
      `La respuesta de IA no corresponde al periodo solicitado ${expectedPeriodId}`,
    );
  }

  return result.data;
}

import 'server-only';

import {
  FinancialReportSchema,
  type FinancialReport,
} from './schema';
import { InvalidAIResponseError } from './errors';

function getIssueProperty(issue: unknown, key: string): unknown {
  if (!issue || typeof issue !== 'object') return undefined;
  return (issue as Record<string, unknown>)[key];
}

function logSchemaValidationIssues(error: { issues: unknown[] }): void {
  const issues = error.issues.slice(0, 20).map((issue) => ({
    path: Array.isArray(getIssueProperty(issue, 'path'))
      ? (getIssueProperty(issue, 'path') as Array<string | number>).join('.')
      : '',
    code: getIssueProperty(issue, 'code'),
    expected: getIssueProperty(issue, 'expected'),
    received: getIssueProperty(issue, 'received'),
    message: getIssueProperty(issue, 'message'),
  }));

  console.error('[financial-ai/report-validator] schema validation failed', {
    issue_count: error.issues.length,
    issues,
  });
}

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
    logSchemaValidationIssues(result.error);
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

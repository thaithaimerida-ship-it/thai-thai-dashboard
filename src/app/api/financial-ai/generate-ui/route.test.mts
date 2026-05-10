import { describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));
mock.module('@/lib/google-sheets-server', () => ({
  appendClosedMonthlyReport: async () => {},
  findExistingReportByPeriod: async () => null,
}));
mock.module('@/lib/financial-ai/financial-analysis-service', () => ({
  generateFinancialAIReport: async () => {
    throw new Error('not used');
  },
}));
mock.module('@/lib/dashboard-auth', () => ({
  DASHBOARD_AUTH_COOKIE: 'dashboard_session',
  verifyDashboardSessionToken: async () => true,
}));

describe('Financial AI generate-ui error payloads', () => {
  test('serializes sanitized OpenAI details without raw response data', async () => {
    const { toOpenAIErrorPayload } = await import('./route');
    const { OpenAIRequestError } = await import('@/lib/financial-ai/errors');

    const error = new OpenAIRequestError(
      'Error al solicitar analisis financiero a OpenAI',
      undefined,
      {
        status: 404,
        type: 'invalid_request_error',
        code: 'model_not_found',
        message: 'The model gpt-test does not exist or you do not have access.',
      },
      'OPENAI_MODEL_NOT_AVAILABLE',
    );

    expect(toOpenAIErrorPayload(error)).toEqual({
      openai_status: 404,
      openai_type: 'invalid_request_error',
      openai_code: 'model_not_found',
      openai_message: 'The model gpt-test does not exist or you do not have access.',
    });
  });
});

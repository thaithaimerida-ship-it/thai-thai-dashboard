import { afterEach, describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));

const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnvValue('OPENAI_API_KEY', originalOpenAIApiKey);
});

const parsedReport = {
  metadata: {
    periodo: '2026-04',
    tipo_periodo: 'monthly',
    fecha_generacion: '2026-05-09T00:00:00.000Z',
    estado_reporte: 'cerrado',
    locked: true,
  },
  resumen_ejecutivo: 'Resumen',
  diagnostico_general: {
    estado_mes: 'sano_con_alertas',
    lectura: 'Lectura',
    principal_riesgo: 'Riesgo',
    principal_oportunidad: 'Oportunidad',
  },
  kpis_ejecutivos: [
    {
      nombre: 'Ingresos netos',
      valor_real: '$1',
      objetivo: '$1',
      gap: '$0',
      estado: 'verde',
      lectura: 'Lectura',
    },
  ],
  semaforo_kpis: [
    {
      nombre: 'Food cost',
      valor_real: '30%',
      objetivo: '30%',
      estado: 'verde',
      lectura: 'Lectura',
    },
  ],
  analisis_canales: {
    resumen: 'Resumen',
    canal_mas_rentable: 'BBVA',
    canal_mayor_riesgo: 'Uber',
    canales: [
      {
        canal: 'Uber',
        bruto: 1,
        comision: 0,
        neto: 1,
        porcentaje_comision: 0,
        lectura: 'Lectura',
      },
    ],
    observaciones: [],
  },
  hallazgos_confirmados: [],
  hipotesis_operativas: [],
  ingenieria_menu: {
    disponible: false,
    lectura: 'No disponible',
    limitaciones: [],
    acciones_sugeridas: [],
  },
  comparativo: {
    vs_mes_anterior: 'No disponible',
    vs_mismo_mes_anio_anterior: 'No disponible',
    nota_disponibilidad_datos: 'No disponible',
  },
  areas_oportunidad: [],
  alertas_riesgo: [],
  acciones_sugeridas: [],
  recomendacion_principal: {
    titulo: 'Recomendacion',
    recomendacion: 'Recomendacion',
    razon: 'Razon',
    decision_sugerida: 'Decision',
  },
};

describe('OpenAI Financial AI client', () => {
  test('returns JSON text from a parsed Structured Outputs response', async () => {
    const { requestOpenAIFinancialAIAnalysis } = await import('./openai-client');

    let capturedRequest: unknown;
    const client = {
      responses: {
        parse: async (request: unknown) => {
          capturedRequest = request;
          return { output_parsed: parsedReport };
        },
      },
    };

    const responseText = await requestOpenAIFinancialAIAnalysis(
      {
        system: 'system prompt',
        prompt: 'user prompt',
      },
      client,
    );

    expect(JSON.parse(responseText)).toEqual(parsedReport);
    expect(capturedRequest).toMatchObject({
      model: 'gpt-5.1',
      max_output_tokens: 4096,
      input: [
        { role: 'system', content: 'system prompt' },
        { role: 'user', content: 'user prompt' },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'financial_report',
          strict: true,
        },
      },
    });
  });

  test('throws OPENAI_MISSING_KEY before creating a real OpenAI request', async () => {
    delete process.env.OPENAI_API_KEY;

    const {
      requestOpenAIFinancialAIAnalysis,
    } = await import('./openai-client');
    const { MissingOpenAIApiKeyError } = await import('./errors');

    await expect(
      requestOpenAIFinancialAIAnalysis({
        system: 'system prompt',
        prompt: 'user prompt',
      }),
    ).rejects.toBeInstanceOf(MissingOpenAIApiKeyError);
  });

  test('maps an aborted OpenAI request to OPENAI_TIMEOUT', async () => {
    const {
      requestOpenAIFinancialAIAnalysis,
    } = await import('./openai-client');
    const { OpenAITimeoutError } = await import('./errors');

    const client = {
      responses: {
        parse: async (_request: unknown, options?: { signal?: AbortSignal }) =>
          new Promise<never>((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      },
    };

    await expect(
      requestOpenAIFinancialAIAnalysis(
        {
          system: 'system prompt',
          prompt: 'user prompt',
          timeoutMs: 1,
        },
        client,
      ),
    ).rejects.toBeInstanceOf(OpenAITimeoutError);
  });

  test('maps SDK request failures to OPENAI_REQUEST_ERROR', async () => {
    const {
      requestOpenAIFinancialAIAnalysis,
    } = await import('./openai-client');
    const { OpenAIRequestError } = await import('./errors');

    const client = {
      responses: {
        parse: async () => {
          throw new Error('SDK request failed');
        },
      },
    };

    await expect(
      requestOpenAIFinancialAIAnalysis(
        {
          system: 'system prompt',
          prompt: 'user prompt',
        },
        client,
      ),
    ).rejects.toBeInstanceOf(OpenAIRequestError);
  });

  test('maps model access errors to OPENAI_MODEL_NOT_AVAILABLE with sanitized details', async () => {
    const {
      requestOpenAIFinancialAIAnalysis,
    } = await import('./openai-client');

    const client = {
      responses: {
        parse: async () => {
          throw {
            status: 404,
            error: {
              type: 'invalid_request_error',
              code: 'model_not_found',
              message: 'The model gpt-test does not exist or you do not have access.',
            },
          };
        },
      },
    };

    await expect(
      requestOpenAIFinancialAIAnalysis(
        {
          system: 'system prompt',
          prompt: 'user prompt',
        },
        client,
      ),
    ).rejects.toMatchObject({
      code: 'OPENAI_MODEL_NOT_AVAILABLE',
      openai: {
        status: 404,
        type: 'invalid_request_error',
        code: 'model_not_found',
        message: 'The model gpt-test does not exist or you do not have access.',
      },
    });
  });

  test('maps auth, quota, rate limit, and schema errors to specific OpenAI codes', async () => {
    const {
      classifyOpenAIErrorCode,
      sanitizeOpenAIError,
    } = await import('./openai-client');

    expect(classifyOpenAIErrorCode(sanitizeOpenAIError({
      status: 401,
      error: { type: 'invalid_request_error', code: 'invalid_api_key' },
    }))).toBe('OPENAI_AUTH_ERROR');
    expect(classifyOpenAIErrorCode(sanitizeOpenAIError({
      status: 429,
      error: { type: 'insufficient_quota', code: 'insufficient_quota' },
    }))).toBe('OPENAI_QUOTA_ERROR');
    expect(classifyOpenAIErrorCode(sanitizeOpenAIError({
      status: 429,
      error: { type: 'rate_limit_error', code: 'rate_limit_exceeded' },
    }))).toBe('OPENAI_RATE_LIMIT');
    expect(classifyOpenAIErrorCode(sanitizeOpenAIError({
      status: 400,
      error: {
        type: 'invalid_request_error',
        code: 'invalid_json_schema',
        message: 'Invalid schema for response format.',
      },
    }))).toBe('OPENAI_SCHEMA_ERROR');
  });
});

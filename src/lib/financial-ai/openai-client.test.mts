import { describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));

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
});

import { describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));

const deterministicBlocks = {
  resumen_financiero: {
    ingresos_brutos_financieros: 320_000,
    comisiones_totales: 25_000,
    ingresos_netos_financieros: 295_000,
    meta_ventas_netas: 325_000,
    punto_equilibrio: 295_000,
    diferencia_vs_meta: -30_000,
    diferencia_vs_punto_equilibrio: 0,
    cumplimiento_meta_pct: 90.77,
    cumplimiento_pe_pct: 100,
  },
  rentabilidad: {
    food_cost_monto: 59_000,
    food_cost_pct: 20,
    labor_monto: 73_750,
    labor_pct: 25,
    costo_primo_monto: 132_750,
    costo_primo_pct: 45,
    cash_yield_pct: 50,
    utilidad_neta: 147_500,
    datos_no_disponibles: [],
  },
  caja_operativa: {
    venta_con_impuesto: 342_200,
    impuesto_total: 47_200,
    venta_neta_caja: 295_000,
    comensales: 1000,
    ticket_promedio: 342.2,
    metodos_pago: {
      Efectivo: 100_000,
      Tarjeta: 200_000,
    },
  },
  comisiones_canales: [
    {
      canal: 'BBVA',
      bruto: 220_000,
      comision: 5_000,
      neto: 215_000,
      porcentaje_comision: 2.27,
    },
  ],
};

const wrongDeterministicBlocks = {
  resumen_financiero: {
    ingresos_brutos_financieros: 1,
    comisiones_totales: 1,
    ingresos_netos_financieros: 1,
    meta_ventas_netas: 1,
    punto_equilibrio: 1,
    diferencia_vs_meta: 1,
    diferencia_vs_punto_equilibrio: 1,
    cumplimiento_meta_pct: 1,
    cumplimiento_pe_pct: 1,
  },
  rentabilidad: {
    food_cost_monto: 1,
    food_cost_pct: 1,
    labor_monto: 1,
    labor_pct: 1,
    costo_primo_monto: 1,
    costo_primo_pct: 1,
    cash_yield_pct: 1,
    utilidad_neta: 1,
    datos_no_disponibles: ['wrong'],
  },
  caja_operativa: {
    venta_con_impuesto: 1,
    impuesto_total: 1,
    venta_neta_caja: 1,
    comensales: 1,
    ticket_promedio: 1,
    metodos_pago: {
      Falso: 1,
    },
  },
  comisiones_canales: [
    {
      canal: 'Inventado',
      bruto: 1,
      comision: 1,
      neto: 1,
      porcentaje_comision: 1,
    },
  ],
};

const aiReport = {
  metadata: {
    periodo: '2026-04',
    tipo_periodo: 'monthly',
    fecha_generacion: '2026-05-10T00:00:00.000Z',
    estado_reporte: 'cerrado',
    locked: true,
  },
  ...wrongDeterministicBlocks,
  resumen_ejecutivo: 'Resumen interpretativo de la IA',
  diagnostico_general: {
    estado_mes: 'sano_con_alertas',
    lectura: 'Lectura de la IA',
    principal_riesgo: 'Riesgo interpretativo',
    principal_oportunidad: 'Oportunidad interpretativa',
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
      valor_real: '1%',
      objetivo: '1%',
      estado: 'verde',
      lectura: 'Lectura',
    },
  ],
  analisis_canales: {
    resumen: 'Resumen de canales de la IA',
    canal_mas_rentable: 'BBVA',
    canal_mayor_riesgo: 'Uber',
    canales: [
      {
        canal: 'Uber',
        bruto: 1,
        comision: 1,
        neto: 1,
        porcentaje_comision: 1,
        lectura: 'Lectura',
      },
    ],
    observaciones: [],
  },
  hallazgos_confirmados: [
    {
      titulo: 'Hallazgo IA',
      dato_base: 'Dato IA',
      lectura: 'Lectura IA',
    },
  ],
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
    titulo: 'Recomendacion IA',
    recomendacion: 'Accion IA',
    razon: 'Razon IA',
    decision_sugerida: 'Decision IA',
  },
};

mock.module('./payload-builder', () => ({
  buildFinancialAIPayload: async () => ({
    periodo: {
      id: '2026-04',
      tipo: 'monthly',
      anio: 2026,
      mes: 4,
      estado_reporte: 'cerrado',
      locked: true,
      rango: {
        inicio: '2026-04-01',
        fin: '2026-04-30',
        etiqueta: '2026-04',
      },
    },
    targets: {},
    agregados: {
      ...deterministicBlocks,
    },
    disponibilidad_datos: {},
    datos_no_disponibles: [],
    limitaciones: [],
    ingenieria_menu_disponible: false,
    causa_operativa_confirmada_disponible: false,
    nota: 'Nota',
  }),
}));

mock.module('./provider', () => ({
  getFinancialAIProvider: () => {
    const provider = process.env.FINANCIAL_AI_PROVIDER?.trim().toLowerCase() || 'anthropic';
    if (provider === 'anthropic' || provider === 'openai') return provider;
    throw new Error('FINANCIAL_AI_PROVIDER invalido');
  },
  getSelectedFinancialAIModel: () => {
    const provider = process.env.FINANCIAL_AI_PROVIDER?.trim().toLowerCase() || 'anthropic';
    if (provider === 'openai') return process.env.OPENAI_FINANCIAL_AI_MODEL || 'gpt-5.1';
    return 'mock-model';
  },
  requestFinancialAIAnalysis: async () => JSON.stringify(aiReport),
}));

describe('generateFinancialAIReport deterministic injection', () => {
  test('overwrites AI deterministic KPI blocks with payload values and preserves interpretation', async () => {
    const { generateFinancialAIReport } = await import('./financial-analysis-service');
    const { FinancialReportSchema } = await import('./schema');

    const generated = await generateFinancialAIReport('2026-04');

    expect(generated.report.resumen_financiero).toEqual(deterministicBlocks.resumen_financiero);
    expect(generated.report.rentabilidad).toEqual(deterministicBlocks.rentabilidad);
    expect(generated.report.caja_operativa).toEqual(deterministicBlocks.caja_operativa);
    expect(generated.report.comisiones_canales).toEqual(deterministicBlocks.comisiones_canales);
    expect(generated.report.resumen_ejecutivo).toBe('Resumen interpretativo de la IA');
    expect(generated.report.diagnostico_general.lectura).toBe('Lectura de la IA');
    expect(generated.report.hallazgos_confirmados[0]?.titulo).toBe('Hallazgo IA');
    expect(FinancialReportSchema.safeParse(generated.report).success).toBe(true);
  });
});

import { describe, expect, mock, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('server-only', () => ({}));

describe('FinancialAIReportView deterministic KPI rendering', () => {
  test('renders mandatory deterministic financial and cash KPIs', async () => {
    const { FinancialAIReportView } = await import('./FinancialAIReportView');

    const report = {
      metadata: {
        periodo: '2026-04',
        tipo_periodo: 'monthly',
        fecha_generacion: '2026-05-10T00:00:00.000Z',
        estado_reporte: 'cerrado',
        locked: true,
      },
      resumen_financiero: {
        ingresos_brutos_financieros: 320_000,
        comisiones_totales: 25_000,
        ingresos_netos_financieros: 295_000,
        meta_ventas_netas: 325_000,
        punto_equilibrio: 295_000,
        diferencia_vs_meta: 15_000,
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
        utilidad_neta: 147_500,
        cash_yield_pct: 50,
        datos_no_disponibles: [],
      },
      caja_operativa: {
        venta_con_impuesto: 342_200,
        impuesto_total: 47_200,
        venta_neta_caja: 295_000,
        comensales: 1000,
        ticket_promedio: 342.2,
        metodos_pago: {
          efectivo: 100_000,
          tarjeta: 200_000,
          otros: 20_000,
          propinas_pagadas: 5_000,
        },
      },
      comisiones_canales: [
        {
          canal: 'Uber',
          bruto: 100_000,
          comision: 20_000,
          neto: 80_000,
          porcentaje_comision: 20,
        },
        {
          canal: 'BBVA',
          bruto: 220_000,
          comision: 5_000,
          neto: 215_000,
          porcentaje_comision: 2.27,
        },
      ],
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
          valor_real: '$295,000',
          objetivo: '$325,000',
          gap: '-$30,000',
          estado: 'amarillo',
          lectura: 'Lectura',
        },
      ],
      semaforo_kpis: [
        {
          nombre: 'Food cost',
          valor_real: '20%',
          objetivo: '28%-32%',
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
            bruto: 100_000,
            comision: 20_000,
            neto: 80_000,
            porcentaje_comision: 20,
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

    const markup = renderToStaticMarkup(
      createElement(FinancialAIReportView, {
        report,
        selectedMonthLabel: 'Abril 2026',
      }),
    );

    for (const label of [
      'Ingresos netos financieros',
      'Meta mensual',
      'Punto de equilibrio',
      'Food Cost',
      'Labor Cost',
      'Costo Primo',
      'Cash Yield',
      'Venta con impuesto',
      'Impuesto total',
      'Venta neta caja',
      'Comensales',
      'Ticket promedio',
      'Uber',
      'Total comisiones',
      '$25,000',
      'Superávit vs meta',
    ]) {
      expect(markup).toContain(label);
    }
    expect(markup).not.toContain('Brecha vs meta');
    expect(markup.match(/<table/g)?.length).toBe(1);
  });
});

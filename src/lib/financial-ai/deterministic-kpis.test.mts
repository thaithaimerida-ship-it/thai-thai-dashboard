import { describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));

describe('Financial AI deterministic KPI contract', () => {
  test('uses approved Financial AI sales targets', async () => {
    const { FINANCIAL_AI_TARGETS } = await import('./targets');

    expect(FINANCIAL_AI_TARGETS.VENTAS_OBJETIVO_MENSUAL_MXN).toBe(325_000);
    expect(FINANCIAL_AI_TARGETS.PE_MENSUAL_MXN).toBe(295_000);
  });

  test('aggregateWindow builds deterministic KPI blocks from financial and cash sources', async () => {
    const { aggregateWindow } = await import('./payload-builder');

    const aggregate = aggregateWindow(
      {
        ingresos: [
          {
            Fecha: '1 abril, 2026',
            'Fuente / Cliente': 'Uber',
            'Monto Bruto (+)': '$100,000',
            'Comision / Retencion (-)': '($20,000)',
            'Monto Neto (Calculo)': '$80,000',
          },
          {
            Fecha: '2 abril, 2026',
            'Fuente / Cliente': 'BBVA',
            'Monto Bruto (+)': '$220,000',
            'Comision / Retencion (-)': '($5,000)',
            'Monto Neto (Calculo)': '$215,000',
          },
        ],
        gastos: [
          {
            Fecha: '3 abril, 2026',
            Categoria: 'Insumos Alimentos',
            'Grupo P&L': 'Costo de Venta',
            Total: '($59,000)',
          },
          {
            Fecha: '4 abril, 2026',
            Categoria: 'Nomina',
            'Grupo P&L': 'Gastos Operativos',
            Total: '($73,750)',
          },
          {
            Fecha: '5 abril, 2026',
            Categoria: 'Impuestos SAT',
            'Grupo P&L': 'Financiero/Impuestos',
            Total: '($14,750)',
          },
        ],
        cortesCaja: [
          {
            Fecha: '1 abril, 2026',
            'Venta con Imp.': '$342,200',
            'Impuesto Total': '$47,200',
            'Venta Neta': '$295,000',
            'No. de Comensales': '1000',
            Efectivo: '$100,000',
            Tarjeta: '$200,000',
            Otros: '$20,000',
            'Propinas Pagadas': '$5,000',
          },
        ],
        estadoResultados: [],
        estadoResultadosDisponible: false,
      },
      {
        start: new Date(2026, 3, 1),
        end: new Date(2026, 3, 30),
        label: '2026-04',
      },
      new Set<string>(),
      new Set<string>(),
    );

    expect(aggregate.resumen_financiero).toMatchObject({
      ingresos_brutos_financieros: 320_000,
      comisiones_totales: 25_000,
      ingresos_netos_financieros: 295_000,
      meta_ventas_netas: 325_000,
      punto_equilibrio: 295_000,
      diferencia_vs_meta: -30_000,
      diferencia_vs_punto_equilibrio: 0,
      cumplimiento_meta_pct: 90.77,
      cumplimiento_pe_pct: 100,
    });
    expect(aggregate.rentabilidad).toMatchObject({
      food_cost_monto: 59_000,
      food_cost_pct: 20,
      labor_monto: 73_750,
      labor_pct: 25,
      costo_primo_monto: 132_750,
      costo_primo_pct: 45,
      utilidad_neta: 147_500,
      cash_yield_pct: 50,
    });
    expect(aggregate.caja_operativa).toMatchObject({
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
    });
    expect(aggregate.comisiones_canales).toEqual([
      {
        canal: 'BBVA',
        bruto: 220_000,
        comision: 5_000,
        neto: 215_000,
        porcentaje_comision: 2.27,
      },
      {
        canal: 'Uber',
        bruto: 100_000,
        comision: 20_000,
        neto: 80_000,
        porcentaje_comision: 20,
      },
    ]);
  });
});

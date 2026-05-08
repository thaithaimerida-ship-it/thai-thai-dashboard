import { z } from 'zod';

export const SemaforoEstadoSchema = z.enum(['verde', 'amarillo', 'rojo']);

export const SemaforoKpiSchema = z.object({
  nombre: z.string().min(1),
  valor_real: z.string().min(1),
  objetivo: z.string().min(1),
  estado: SemaforoEstadoSchema,
  lectura: z.string().min(1),
});

export const AnalisisCanalesSchema = z.object({
  resumen: z.string().min(1),
  canal_mas_rentable: z.string().min(1),
  observaciones: z.array(z.string()),
});

export const ComparativoSchema = z.object({
  vs_mes_anterior: z.string(),
  vs_mismo_mes_anio_anterior: z.string(),
});

export const FinancialReportSchema = z.object({
  resumen_ejecutivo: z.string().min(1),
  semaforo_kpis: z.array(SemaforoKpiSchema).min(1),
  analisis_canales: AnalisisCanalesSchema,
  areas_oportunidad: z.array(z.string()),
  alertas_riesgo: z.array(z.string()),
  comparativo: ComparativoSchema,
  recomendacion_principal: z.string().min(1),
  acciones_sugeridas: z.array(z.string()),
});

export type FinancialReport = z.infer<typeof FinancialReportSchema>;
export type SemaforoKpi = z.infer<typeof SemaforoKpiSchema>;
export type SemaforoEstado = z.infer<typeof SemaforoEstadoSchema>;

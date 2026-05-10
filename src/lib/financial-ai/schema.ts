import { z } from 'zod';

export const SemaforoEstadoSchema = z.enum(['verde', 'amarillo', 'rojo']);
export const PeriodoTipoSchema = z.literal('monthly');
export const EstadoReporteSchema = z.literal('cerrado');
export const EstadoMesSchema = z.enum([
  'sano',
  'sano_con_alertas',
  'riesgo_moderado',
  'riesgo_alto',
]);
export const NivelRiesgoSchema = z.enum(['medio', 'alto', 'critico']);
export const PrioridadSchema = z.enum(['alta', 'media', 'baja']);

export const MetadataSchema = z.object({
  periodo: z.string().min(1),
  tipo_periodo: PeriodoTipoSchema,
  fecha_generacion: z.string().min(1),
  estado_reporte: EstadoReporteSchema,
  locked: z.literal(true),
});

export const DiagnosticoGeneralSchema = z.object({
  estado_mes: EstadoMesSchema,
  lectura: z.string().min(1),
  principal_riesgo: z.string().min(1),
  principal_oportunidad: z.string().min(1),
});

export const KpiEjecutivoSchema = z.object({
  nombre: z.string().min(1),
  valor_real: z.string().min(1),
  objetivo: z.string().min(1),
  gap: z.string().min(1),
  estado: SemaforoEstadoSchema,
  lectura: z.string().min(1),
});

export const SemaforoKpiSchema = z.object({
  nombre: z.string().min(1),
  valor_real: z.string().min(1),
  objetivo: z.string().min(1),
  estado: SemaforoEstadoSchema,
  lectura: z.string().min(1),
});

export const CanalFinancieroSchema = z.object({
  canal: z.string().min(1),
  bruto: z.number(),
  comision: z.number(),
  neto: z.number(),
  porcentaje_comision: z.number(),
  lectura: z.string().min(1),
});

export const AnalisisCanalesSchema = z.object({
  resumen: z.string().min(1),
  canal_mas_rentable: z.string().min(1),
  canal_mayor_riesgo: z.string().min(1),
  canales: z.array(CanalFinancieroSchema).min(1),
  observaciones: z.array(z.string()),
});

export const HallazgoConfirmadoSchema = z.object({
  titulo: z.string().min(1),
  dato_base: z.string().min(1),
  lectura: z.string().min(1),
});

export const HipotesisOperativaSchema = z.object({
  hipotesis: z.string().min(1),
  por_que_importa: z.string().min(1),
  dato_necesario_para_confirmar: z.string().min(1),
  accion_para_validar: z.string().min(1),
});

export const IngenieriaMenuSchema = z.object({
  disponible: z.boolean(),
  lectura: z.string().min(1),
  limitaciones: z.array(z.string()),
  acciones_sugeridas: z.array(z.string()),
});

export const ComparativoSchema = z.object({
  vs_mes_anterior: z.string(),
  vs_mismo_mes_anio_anterior: z.string(),
  nota_disponibilidad_datos: z.string(),
});

export const AreaOportunidadSchema = z.object({
  area: z.string().min(1),
  oportunidad: z.string().min(1),
  impacto_estimado: z.string().min(1),
  accion_sugerida: z.string().min(1),
});

export const AlertaRiesgoSchema = z.object({
  alerta: z.string().min(1),
  nivel: NivelRiesgoSchema,
  dato_base: z.string().min(1),
  accion_recomendada: z.string().min(1),
});

export const AccionSugeridaSchema = z.object({
  prioridad: PrioridadSchema,
  accion: z.string().min(1),
  responsable_sugerido: z.string().min(1),
  plazo_sugerido: z.string().min(1),
  impacto_esperado: z.string().min(1),
});

export const RecomendacionPrincipalSchema = z.object({
  titulo: z.string().min(1),
  recomendacion: z.string().min(1),
  razon: z.string().min(1),
  decision_sugerida: z.string().min(1),
});

export const FinancialReportSchema = z.object({
  metadata: MetadataSchema,
  resumen_ejecutivo: z.string().min(1),
  diagnostico_general: DiagnosticoGeneralSchema,
  kpis_ejecutivos: z.array(KpiEjecutivoSchema).min(1),
  semaforo_kpis: z.array(SemaforoKpiSchema).min(1),
  analisis_canales: AnalisisCanalesSchema,
  hallazgos_confirmados: z.array(HallazgoConfirmadoSchema).max(3),
  hipotesis_operativas: z.array(HipotesisOperativaSchema).max(3),
  ingenieria_menu: IngenieriaMenuSchema,
  comparativo: ComparativoSchema,
  areas_oportunidad: z.array(AreaOportunidadSchema).max(3),
  alertas_riesgo: z.array(AlertaRiesgoSchema).max(3),
  acciones_sugeridas: z.array(AccionSugeridaSchema).max(3),
  recomendacion_principal: RecomendacionPrincipalSchema,
});

export type FinancialReport = z.infer<typeof FinancialReportSchema>;
export type SemaforoKpi = z.infer<typeof SemaforoKpiSchema>;
export type SemaforoEstado = z.infer<typeof SemaforoEstadoSchema>;

import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileLock2,
  Lightbulb,
  Lock,
  MinusCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { FinancialReport, SemaforoEstado } from '@/lib/financial-ai/schema';
import { cn } from '@/lib/utils';

interface FinancialAIReportViewProps {
  report: FinancialReport;
  selectedMonthLabel: string;
  isDemo?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  if (Math.abs(value) <= 1) {
    return new Intl.NumberFormat('es-MX', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatNullablePercent(value: number | null) {
  return value === null ? 'No disponible' : formatPercent(value);
}

function formatNullableCurrency(value: number | null) {
  return value === null ? 'No disponible' : formatCurrency(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value);
}

function statusTone(status: SemaforoEstado) {
  if (status === 'verde') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'amarillo') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-rose-200 bg-rose-50 text-rose-700';
}

function statusDot(status: SemaforoEstado) {
  if (status === 'verde') return 'bg-emerald-500';
  if (status === 'amarillo') return 'bg-amber-500';
  return 'bg-rose-500';
}

function priorityTone(priority: 'alta' | 'media' | 'baja') {
  if (priority === 'alta') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (priority === 'media') return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function SectionHeading({
  number,
  title,
  icon: Icon,
  description,
}: {
  number: number;
  title: string;
  icon: LucideIcon;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm">
          {number}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-500" />
            <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          </div>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  number,
  title,
  icon,
  description,
  children,
  className,
}: {
  number: number;
  title: string;
  icon: LucideIcon;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6', className)}>
      <SectionHeading number={number} title={title} icon={icon} description={description} />
      <div className="mt-5">{children}</div>
    </section>
  );
}

function normalizeLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function getPaymentMethodItems(report: FinancialReport) {
  return [
    ['Efectivo', report.caja_operativa.metodos_pago.efectivo],
    ['Tarjeta', report.caja_operativa.metodos_pago.tarjeta],
    ['Otros', report.caja_operativa.metodos_pago.otros],
    ['Propinas pagadas', report.caja_operativa.metodos_pago.propinas_pagadas],
  ] as const;
}

function getCommissionTotal(report: FinancialReport) {
  return report.comisiones_canales.reduce((total, canal) => total + canal.comision, 0);
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
      {detail && <p className="mt-2 text-xs leading-relaxed text-slate-500">{detail}</p>}
    </div>
  );
}

export function FinancialAIReportView({
  report,
  selectedMonthLabel,
  isDemo = false,
}: FinancialAIReportViewProps) {
  const metaGapLabel =
    report.resumen_financiero.diferencia_vs_meta > 0 ? 'Superávit vs meta' : 'Brecha vs meta';
  const commissionTotal = getCommissionTotal(report);

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-950">
              <Sparkles className="h-4 w-4" />
              Vista demo · datos de ejemplo
            </span>
            <span className="text-sm font-medium text-amber-900">
              Periodo del selector: {selectedMonthLabel}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-amber-950">
            Este reporte es una simulacion visual. No esta conectado a datos reales.
          </p>
        </div>
      )}

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    V1 · Solo meses cerrados
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Lock className="h-3.5 w-3.5" />
                    Reporte bloqueado
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    <FileLock2 className="h-3.5 w-3.5" />
                    No regenerable
                  </span>
                  {isDemo && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      Mock local
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {isDemo ? 'Reporte demo · Abril 2026' : `Periodo · ${selectedMonthLabel}`}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    Análisis Financiero IA
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Reporte financiero mensual generado con IA
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
              >
                <FileLock2 className="h-4 w-4" />
                Generar Analisis
              </button>
            </div>
          </div>

          <div className="space-y-6 bg-slate-50/60 p-4 sm:p-6">
            <SectionCard number={1} title="Resumen ejecutivo" icon={ClipboardList}>
              <p className="max-w-5xl text-base leading-7 text-slate-700">
                {report.resumen_ejecutivo}
              </p>
            </SectionCard>

            <SectionCard
              number={2}
              title="Resumen financiero"
              icon={BarChart3}
              description="KPIs duros calculados por codigo desde Ingresos_BD y objetivos aprobados."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Ingresos netos financieros"
                  value={formatCurrency(report.resumen_financiero.ingresos_netos_financieros)}
                  detail="Fuente: Ingresos_BD.Monto Neto (Calculo)"
                />
                <MetricCard
                  label="Meta mensual"
                  value={formatCurrency(report.resumen_financiero.meta_ventas_netas)}
                  detail={`${formatNullablePercent(report.resumen_financiero.cumplimiento_meta_pct)} de cumplimiento`}
                />
                <MetricCard
                  label="Punto de equilibrio"
                  value={formatCurrency(report.resumen_financiero.punto_equilibrio)}
                  detail={`${formatNullablePercent(report.resumen_financiero.cumplimiento_pe_pct)} de cumplimiento`}
                />
                <MetricCard
                  label={metaGapLabel}
                  value={formatCurrency(report.resumen_financiero.diferencia_vs_meta)}
                  detail={`Brecha vs PE: ${formatCurrency(report.resumen_financiero.diferencia_vs_punto_equilibrio)}`}
                />
              </div>
            </SectionCard>

            <SectionCard
              number={3}
              title="Rentabilidad"
              icon={ShieldCheck}
              description="Indicadores calculados con ventas netas financieras como denominador."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Food Cost"
                  value={formatNullablePercent(report.rentabilidad.food_cost_pct)}
                  detail={formatCurrency(report.rentabilidad.food_cost_monto)}
                />
                <MetricCard
                  label="Labor Cost"
                  value={formatNullablePercent(report.rentabilidad.labor_pct)}
                  detail={formatCurrency(report.rentabilidad.labor_monto)}
                />
                <MetricCard
                  label="Costo Primo"
                  value={formatNullablePercent(report.rentabilidad.costo_primo_pct)}
                  detail={formatCurrency(report.rentabilidad.costo_primo_monto)}
                />
                <MetricCard
                  label="Cash Yield"
                  value={formatNullablePercent(report.rentabilidad.cash_yield_pct)}
                  detail={`Utilidad neta: ${formatNullableCurrency(report.rentabilidad.utilidad_neta)}`}
                />
              </div>
              {report.rentabilidad.datos_no_disponibles.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Datos no disponibles: {report.rentabilidad.datos_no_disponibles.join(', ')}
                </div>
              )}
            </SectionCard>

            <SectionCard
              number={4}
              title="Caja operativa"
              icon={TrendingUp}
              description="Lectura de Cortes_de_Caja para caja, impuestos, comensales y metodos de pago."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label="Venta con impuesto"
                  value={formatCurrency(report.caja_operativa.venta_con_impuesto)}
                />
                <MetricCard
                  label="Impuesto total"
                  value={formatCurrency(report.caja_operativa.impuesto_total)}
                />
                <MetricCard
                  label="Venta neta caja"
                  value={formatCurrency(report.caja_operativa.venta_neta_caja)}
                />
                <MetricCard
                  label="Comensales"
                  value={formatNumber(report.caja_operativa.comensales)}
                />
                <MetricCard
                  label="Ticket promedio"
                  value={
                    report.caja_operativa.ticket_promedio === null
                      ? 'No disponible'
                      : formatCurrency(report.caja_operativa.ticket_promedio)
                  }
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                {getPaymentMethodItems(report).map(([metodo, monto]) => (
                  <div key={metodo} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {metodo}
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">{formatCurrency(monto)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              number={5}
              title="Comisiones por canal"
              icon={TrendingUp}
              description="Canales comerciales desde Ingresos_BD.Fuente / Cliente."
            >
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3 font-semibold">Canal</th>
                        <th className="px-4 py-3 font-semibold">Bruto</th>
                        <th className="px-4 py-3 font-semibold">Comision</th>
                        <th className="px-4 py-3 font-semibold">Neto</th>
                        <th className="px-4 py-3 font-semibold">% comision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.comisiones_canales.map((canal) => (
                        <tr key={canal.canal} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-slate-900">{canal.canal}</td>
                          <td className="px-4 py-3 text-slate-600">{formatCurrency(canal.bruto)}</td>
                          <td className="px-4 py-3 text-slate-600">{formatCurrency(canal.comision)}</td>
                          <td className="px-4 py-3 font-semibold text-slate-950">{formatCurrency(canal.neto)}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatNullablePercent(canal.porcentaje_comision)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-200 bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-950">Total comisiones</td>
                        <td className="px-4 py-3 text-slate-500">-</td>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          {formatCurrency(commissionTotal)}
                        </td>
                        <td className="px-4 py-3 text-slate-500">-</td>
                        <td className="px-4 py-3 text-slate-500">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <SectionCard number={2} title="Diagnóstico general" icon={BadgeCheck}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </p>
                    <p className="mt-2 text-xl font-semibold capitalize text-slate-950">
                      {normalizeLabel(report.diagnostico_general.estado_mes)}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {report.diagnostico_general.lectura}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                        Principal riesgo
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-rose-950">
                        {report.diagnostico_general.principal_riesgo}
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Principal oportunidad
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-950">
                        {report.diagnostico_general.principal_oportunidad}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <div className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ShieldCheck className="h-4 w-4" />
                  Cierre mensual
                </div>
                <p className="mt-4 text-2xl font-semibold">
                  {isDemo ? 'Abril 2026' : selectedMonthLabel}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  La lectura queda bloqueada para conservar una foto consistente del cierre.
                </p>
              </div>
            </section>

            <SectionCard
              number={3}
              title="KPIs ejecutivos"
              icon={BarChart3}
              description="Lectura compacta de indicadores principales y semáforo de salud financiera."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[...report.kpis_ejecutivos, ...report.semaforo_kpis].slice(0, 5).map((kpi) => (
                  <div key={kpi.nombre} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-500">{kpi.nombre}</p>
                      <span className={cn('h-2.5 w-2.5 rounded-full', statusDot(kpi.estado))} />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{kpi.valor_real}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={cn('rounded-full border px-2 py-1 text-xs font-medium', statusTone(kpi.estado))}>
                        {kpi.estado}
                      </span>
                      <span className="text-xs text-slate-500">Obj. {kpi.objetivo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              number={4}
              title="Análisis por canales"
              icon={TrendingUp}
              description={report.analisis_canales.resumen}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Canal mas rentable
                  </p>
                  <p className="mt-2 font-semibold text-emerald-950">
                    {report.analisis_canales.canal_mas_rentable}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Canal de mayor riesgo
                  </p>
                  <p className="mt-2 font-semibold text-amber-950">
                    {report.analisis_canales.canal_mayor_riesgo}
                  </p>
                </div>
              </div>
            </SectionCard>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <SectionCard number={5} title="Hallazgos confirmados" icon={CheckCircle2} className="border-emerald-200 bg-emerald-50">
                <div className="space-y-4">
                  {report.hallazgos_confirmados.map((hallazgo) => (
                    <div key={hallazgo.titulo} className="rounded-lg border border-emerald-100 bg-white p-4">
                      <p className="font-semibold text-emerald-950">{hallazgo.titulo}</p>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">{hallazgo.dato_base}</p>
                      <p className="mt-3 text-sm leading-relaxed text-emerald-900">{hallazgo.lectura}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard number={6} title="Hipótesis operativas" icon={Lightbulb} className="border-amber-200 bg-amber-50">
                <div className="space-y-4">
                  {report.hipotesis_operativas.map((hipotesis) => (
                    <div key={hipotesis.hipotesis} className="rounded-lg border border-amber-100 bg-white p-4">
                      <p className="font-semibold text-amber-950">{hipotesis.hipotesis}</p>
                      <p className="mt-3 text-sm leading-relaxed text-amber-900">{hipotesis.por_que_importa}</p>
                      <p className="mt-3 text-xs font-medium text-amber-700">
                        Dato necesario: {hipotesis.dato_necesario_para_confirmar}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard number={7} title="Acciones sugeridas" icon={ClipboardList} className="border-blue-200 bg-blue-50">
                <div className="space-y-4">
                  {report.acciones_sugeridas.map((accion) => (
                    <div key={accion.accion} className="rounded-lg border border-blue-100 bg-white p-4">
                      <span className={cn('rounded-full border px-2 py-1 text-xs font-semibold', priorityTone(accion.prioridad))}>
                        Prioridad {accion.prioridad}
                      </span>
                      <p className="mt-3 font-semibold text-blue-950">{accion.accion}</p>
                      <p className="mt-3 text-sm text-blue-900">
                        {accion.responsable_sugerido} · {accion.plazo_sugerido}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-blue-900">{accion.impacto_esperado}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard number={8} title="Ingeniería de menú" icon={MinusCircle} className="bg-slate-100">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {report.ingenieria_menu.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                  {!report.ingenieria_menu.disponible && (
                    <span className="text-sm font-medium text-slate-700">
                      Falta venta por platillo y costo receta.
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {report.ingenieria_menu.lectura}
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {report.ingenieria_menu.limitaciones.map((limitacion) => (
                    <div key={limitacion} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                      {limitacion}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {report.alertas_riesgo.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-4 w-4 text-rose-600" />
                  <h3 className="text-base font-semibold text-rose-950">Alertas de riesgo</h3>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {report.alertas_riesgo.map((alerta) => (
                    <div key={alerta.alerta} className="rounded-lg border border-rose-100 bg-white p-4">
                      <p className="font-semibold text-rose-950">{alerta.alerta}</p>
                      <p className="mt-2 text-xs font-semibold text-rose-700">
                        Nivel {alerta.nivel} · {alerta.dato_base}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-rose-900">
                        {alerta.accion_recomendada}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <SectionCard number={9} title="Recomendación principal" icon={ShieldCheck} className="border-slate-900 bg-slate-950 text-white">
              <div className="max-w-5xl">
                <h3 className="text-2xl font-semibold text-white">
                  {report.recomendacion_principal.titulo}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  {report.recomendacion_principal.recomendacion}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {report.recomendacion_principal.razon}
                </p>
                <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-4 text-sm font-medium text-white">
                  {report.recomendacion_principal.decision_sugerida}
                </div>
              </div>
            </SectionCard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

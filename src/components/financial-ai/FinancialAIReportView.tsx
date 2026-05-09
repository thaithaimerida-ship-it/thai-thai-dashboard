import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  FileLock2,
  Lightbulb,
  Lock,
  MinusCircle,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

function statusTone(status: SemaforoEstado) {
  if (status === 'verde') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'amarillo') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-rose-200 bg-rose-50 text-rose-700';
}

function priorityTone(priority: 'alta' | 'media' | 'baja') {
  if (priority === 'alta') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (priority === 'media') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: typeof BarChart3;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-slate-100 p-2 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

export function FinancialAIReportView({
  report,
  selectedMonthLabel,
  isDemo = false,
}: FinancialAIReportViewProps) {
  return (
    <div className="space-y-6">
      {isDemo && (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex w-fit items-center rounded-full border border-amber-400 bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">
            Vista demo · datos de ejemplo
          </span>
          <span className="text-xs font-medium text-amber-800">
            Selector actual: {selectedMonthLabel}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-amber-900">
          Este reporte es una simulación visual. No está conectado a datos reales.
        </p>
      </div>
      )}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-6 border-b border-slate-100 bg-slate-50/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                  <Lock className="h-3.5 w-3.5" />
                  Reporte bloqueado
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Mensual cerrado
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  No regenerable
                </span>
              </div>

              <div>
                {isDemo && (
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mock local · no conectado a datos reales
                </p>
                )}
                <CardTitle className="mt-2 text-2xl text-slate-950">
                  {isDemo ? 'Reporte demo · Abril 2026' : `Reporte Financial AI · ${selectedMonthLabel}`}
                </CardTitle>
                {false && (
                <p className="hidden">
                  Reporte demo · Abril 2026
                </p>
                )}
                <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-600">
                  {report.resumen_ejecutivo}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
            >
              <FileLock2 className="h-4 w-4" />
              Generar Análisis
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
              <SectionTitle icon={BadgeCheck} title="Diagnóstico general" />
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {report.diagnostico_general.lectura}
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Principal riesgo
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-rose-900">
                    {report.diagnostico_general.principal_riesgo}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Principal oportunidad
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                    {report.diagnostico_general.principal_oportunidad}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Estado del mes
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {report.diagnostico_general.estado_mes.replaceAll('_', ' ')}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Bloqueado para conservar la lectura del cierre mensual.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {report.kpis_ejecutivos.map((kpi) => (
              <div key={kpi.nombre} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{kpi.nombre}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">
                      {kpi.valor_real}
                    </p>
                  </div>
                  <span className={cn('rounded-full border px-2 py-1 text-xs', statusTone(kpi.estado))}>
                    {kpi.estado}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Objetivo {kpi.objetivo} · Gap {kpi.gap}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{kpi.lectura}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1.4fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <SectionTitle icon={BarChart3} title="Semáforo KPI" />
              <div className="mt-5 space-y-4">
                {report.semaforo_kpis.map((kpi) => (
                  <div key={kpi.nombre} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{kpi.nombre}</p>
                      <span className={cn('rounded-full border px-2 py-1 text-xs', statusTone(kpi.estado))}>
                        {kpi.estado}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {kpi.valor_real} vs {kpi.objetivo}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{kpi.lectura}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <SectionTitle icon={TrendingUp} title="Análisis de canales" />
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {report.analisis_canales.resumen}
              </p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Canal</th>
                      <th className="px-3 py-2 font-semibold">Bruto</th>
                      <th className="px-3 py-2 font-semibold">Comisión</th>
                      <th className="px-3 py-2 font-semibold">Neto</th>
                      <th className="py-2 pl-3 font-semibold">% comisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.analisis_canales.canales.map((canal) => (
                      <tr key={canal.canal} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-3 font-medium text-slate-800">{canal.canal}</td>
                        <td className="px-3 py-3 text-slate-600">{formatCurrency(canal.bruto)}</td>
                        <td className="px-3 py-3 text-slate-600">
                          {formatCurrency(canal.comision)}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {formatCurrency(canal.neto)}
                        </td>
                        <td className="py-3 pl-3 text-slate-600">
                          {formatPercent(canal.porcentaje_comision)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <SectionTitle icon={CheckCircle2} title="Hallazgos confirmados" />
              <div className="mt-5 space-y-4">
                {report.hallazgos_confirmados.map((hallazgo) => (
                  <div key={hallazgo.titulo} className="rounded-lg bg-white/80 p-4">
                    <p className="font-medium text-emerald-950">{hallazgo.titulo}</p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                      {hallazgo.dato_base}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-emerald-900">
                      {hallazgo.lectura}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <SectionTitle icon={Lightbulb} title="Hipótesis operativas" />
              <div className="mt-5 space-y-4">
                {report.hipotesis_operativas.map((hipotesis) => (
                  <div key={hipotesis.hipotesis} className="rounded-lg bg-white/80 p-4">
                    <p className="font-medium text-amber-950">{hipotesis.hipotesis}</p>
                    <p className="mt-3 text-sm leading-relaxed text-amber-900">
                      {hipotesis.por_que_importa}
                    </p>
                    <p className="mt-3 text-xs text-amber-700">
                      Validar con: {hipotesis.dato_necesario_para_confirmar}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
              <SectionTitle icon={TrendingUp} title="Acciones sugeridas" />
              <div className="mt-5 space-y-4">
                {report.acciones_sugeridas.map((accion) => (
                  <div key={accion.accion} className="rounded-lg bg-white/80 p-4">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-1 text-xs font-medium',
                        priorityTone(accion.prioridad),
                      )}
                    >
                      Prioridad {accion.prioridad}
                    </span>
                    <p className="mt-3 font-medium text-blue-950">{accion.accion}</p>
                    <p className="mt-3 text-sm text-blue-900">
                      {accion.responsable_sugerido} · {accion.plazo_sugerido}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-blue-900">
                      {accion.impacto_esperado}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!report.ingenieria_menu.disponible && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <SectionTitle icon={MinusCircle} title="Ingeniería de menú no disponible" />
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {report.ingenieria_menu.lectura}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {report.ingenieria_menu.limitaciones.map((limitacion) => (
                  <div
                    key={limitacion}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600"
                  >
                    {limitacion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.alertas_riesgo.length > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
              <SectionTitle icon={AlertTriangle} title="Alertas de riesgo" />
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {report.alertas_riesgo.map((alerta) => (
                  <div key={alerta.alerta} className="rounded-lg bg-white/80 p-4">
                    <p className="font-medium text-rose-950">{alerta.alerta}</p>
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

          <div className="rounded-lg border border-slate-900 bg-slate-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Recomendación principal
            </p>
            <h3 className="mt-2 text-xl font-semibold">
              {report.recomendacion_principal.titulo}
            </h3>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-200">
              {report.recomendacion_principal.recomendacion}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {report.recomendacion_principal.razon}
            </p>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-4 text-sm text-white">
              {report.recomendacion_principal.decision_sugerida}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

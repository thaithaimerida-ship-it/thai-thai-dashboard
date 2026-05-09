'use client';

import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, CalendarCheck, FileLock2, Info, Lock, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinancialReport } from '@/lib/financial-ai/schema';
import { cn } from '@/lib/utils';
import { FinancialAIReportView } from './FinancialAIReportView';
import { mockFinancialAIReport } from './mockFinancialAIReport';

interface FinancialAIAnalysisTabProps {
  selectedMonthLabel: string;
  isYtdSelected: boolean;
  isClosedMonth: boolean;
}

type ReportLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'generating' }
  | { status: 'loaded'; period: string; report: FinancialReport }
  | { status: 'unauthorized' }
  | { status: 'parse-error' }
  | { status: 'error' };

interface UiReportResponse {
  exists: boolean;
  period: string;
  locked: boolean;
  estado?: string;
  fecha_generacion?: string;
  report_json?: unknown;
  parse_error?: boolean;
  error?: string;
}

interface GenerateUiResponse {
  generated?: boolean;
  period?: string;
  locked?: boolean;
  report_json?: unknown;
  parse_error?: boolean;
  error?: string;
}

const rules = [
  { label: 'Solo meses cerrados', icon: CalendarCheck },
  { label: 'No regenerable', icon: FileLock2 },
  { label: 'Reporte bloqueado al generarse', icon: Lock },
  { label: 'Sin YTD en V1', icon: Info },
] as const;

const monthNameToNumber: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

// Mock visual desactivado por defecto. No activar en produccion.
const showMockReport = false;

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function monthLabelToPeriodId(label: string): string | null {
  const match = normalizeText(label).match(/^([a-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const month = monthNameToNumber[match[1]];
  if (!month) return null;

  return `${match[2]}-${month}`;
}

function isFinancialReport(value: unknown): value is FinancialReport {
  return Boolean(value && typeof value === 'object' && 'metadata' in value);
}

function GenerateButton({
  canGenerate,
  isGenerating,
  onGenerate,
}: {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!canGenerate || isGenerating}
      onClick={onGenerate}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
        canGenerate && !isGenerating
          ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
          : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
      )}
    >
      <BrainCircuit className="h-4 w-4" />
      {isGenerating ? 'Generando...' : 'Generar Analisis'}
    </button>
  );
}

export function FinancialAIAnalysisTab({
  selectedMonthLabel,
  isYtdSelected,
  isClosedMonth,
}: FinancialAIAnalysisTabProps) {
  const periodId = useMemo(() => monthLabelToPeriodId(selectedMonthLabel), [selectedMonthLabel]);
  const canLoadSavedReport = !isYtdSelected && isClosedMonth && Boolean(periodId);
  const [reportState, setReportState] = useState<ReportLoadState>({ status: 'idle' });

  const blockedMessage = isYtdSelected
    ? 'Financial AI V1 no usa YTD. Selecciona un mes cerrado.'
    : 'Selecciona un mes cerrado para generar el analisis.';
  const shouldShowMockReport = showMockReport;
  const shouldShowDemoPeriodNote = shouldShowMockReport && !canLoadSavedReport;

  useEffect(() => {
    if (!canLoadSavedReport || !periodId) {
      return;
    }

    const controller = new AbortController();

    async function loadSavedReport() {
      setReportState({ status: 'loading' });

      try {
        const response = await fetch(
          `/api/financial-ai/ui-report?period=${encodeURIComponent(periodId)}`,
          {
            credentials: 'same-origin',
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          setReportState({ status: 'unauthorized' });
          return;
        }

        if (!response.ok) {
          setReportState({ status: 'error' });
          return;
        }

        const data = (await response.json()) as UiReportResponse;
        if (!data.exists) {
          setReportState({ status: 'empty' });
          return;
        }

        if (data.parse_error || !isFinancialReport(data.report_json)) {
          setReportState({ status: 'parse-error' });
          return;
        }

        setReportState({ status: 'loaded', period: periodId, report: data.report_json });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setReportState({ status: 'error' });
      }
    }

    void loadSavedReport();

    return () => controller.abort();
  }, [canLoadSavedReport, periodId]);

  async function handleGenerateReport() {
    if (!canLoadSavedReport || !periodId || reportState.status === 'generating') return;

    const confirmed = window.confirm(
      `Generar el reporte Financial AI para ${selectedMonthLabel}? ` +
        'Si se genera correctamente, quedara bloqueado y no podra regenerarse.',
    );
    if (!confirmed) return;

    setReportState({ status: 'generating' });

    try {
      const response = await fetch('/api/financial-ai/generate-ui', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ periodId }),
      });

      if (response.status === 401) {
        setReportState({ status: 'unauthorized' });
        return;
      }

      const data = (await response.json()) as GenerateUiResponse;

      if (!response.ok) {
        setReportState({ status: 'error' });
        return;
      }

      if (data.parse_error || !isFinancialReport(data.report_json)) {
        setReportState({ status: 'parse-error' });
        return;
      }

      setReportState({ status: 'loaded', period: periodId, report: data.report_json });
    } catch {
      setReportState({ status: 'error' });
    }
  }

  const canGenerateReport =
    canLoadSavedReport && reportState.status === 'empty' && !shouldShowMockReport;
  const isGeneratingReport = reportState.status === 'generating';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-900 p-2 text-white">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Analisis Financiero IA</h2>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                V1 · Solo meses cerrados
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Reporte financiero mensual generado con IA
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
          Periodo: <span className="font-semibold text-gray-800">{selectedMonthLabel}</span>
        </div>
      </div>

      {shouldShowMockReport ? (
        <div className="space-y-4">
          {shouldShowDemoPeriodNote && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              El periodo seleccionado no es valido para generacion real, pero se muestra
              una vista demo para revision visual. No conectado a datos reales.
            </div>
          )}
          <FinancialAIReportView
            report={mockFinancialAIReport}
            selectedMonthLabel={selectedMonthLabel}
            isDemo
          />
        </div>
      ) : canLoadSavedReport && reportState.status === 'loaded' && reportState.period === periodId ? (
        <FinancialAIReportView
          report={reportState.report}
          selectedMonthLabel={selectedMonthLabel}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-gray-800">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  {getStateTitle(reportState.status, canLoadSavedReport)}
                </CardTitle>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                  {getStateMessage(reportState.status, canLoadSavedReport, blockedMessage)}
                </p>
              </div>

              <GenerateButton
                canGenerate={canGenerateReport}
                isGenerating={isGeneratingReport}
                onGenerate={handleGenerateReport}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {canGenerateReport
                ? 'La generacion requiere confirmacion y bloqueara el reporte mensual.'
                : 'Generacion disponible solo para meses cerrados sin reporte guardado.'}
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {rules.map((rule) => (
                <div
                  key={rule.label}
                  className={cn(
                    'rounded-lg border bg-white p-3',
                    canLoadSavedReport ? 'border-slate-200' : 'border-amber-200 bg-amber-50',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'rounded-md p-1.5',
                        canLoadSavedReport
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      <rule.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">{rule.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getStateTitle(status: ReportLoadState['status'], canLoadSavedReport: boolean): string {
  if (!canLoadSavedReport) return 'Periodo no disponible para Financial AI V1';
  if (status === 'loading') return 'Cargando reporte Financial AI';
  if (status === 'generating') return 'Generando reporte Financial AI';
  if (status === 'unauthorized') return 'Sesion no autorizada';
  if (status === 'parse-error') return 'Reporte guardado no legible';
  if (status === 'error') return 'No se pudo cargar el reporte';
  return 'Sin reporte generado para este periodo';
}

function getStateMessage(
  status: ReportLoadState['status'],
  canLoadSavedReport: boolean,
  blockedMessage: string,
): string {
  if (!canLoadSavedReport) return blockedMessage;
  if (status === 'loading') return 'Buscando si ya existe un reporte guardado para este mes.';
  if (status === 'generating') return 'Generando y guardando el reporte. No cierres esta ventana.';
  if (status === 'unauthorized') return 'Sesion no autorizada. Vuelve a iniciar sesion.';
  if (status === 'parse-error') return 'El reporte guardado no pudo leerse correctamente.';
  if (status === 'error') return 'No se pudo cargar el reporte Financial AI.';
  return 'Sin reporte generado para este periodo.';
}

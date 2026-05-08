'use client';

import { BrainCircuit, CalendarCheck, FileLock2, Info, Lock, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FinancialAIReportView } from './FinancialAIReportView';
import { mockFinancialAIReport } from './mockFinancialAIReport';

interface FinancialAIAnalysisTabProps {
  selectedMonthLabel: string;
  isYtdSelected: boolean;
  isClosedMonth: boolean;
}

const rules = [
  { label: 'Solo meses cerrados', icon: CalendarCheck },
  { label: 'No regenerable', icon: FileLock2 },
  { label: 'Reporte bloqueado al generarse', icon: Lock },
  { label: 'Sin YTD en V1', icon: Info },
] as const;

// Mock visual desactivado por defecto. No activar en producción.
const showMockReport = false;

export function FinancialAIAnalysisTab({
  selectedMonthLabel,
  isYtdSelected,
  isClosedMonth,
}: FinancialAIAnalysisTabProps) {
  const blockedMessage = isYtdSelected
    ? 'Financial AI V1 no usa YTD. Selecciona un mes cerrado.'
    : 'Selecciona un mes cerrado para generar el análisis.';
  const canShowEmptyState = !isYtdSelected && isClosedMonth;
  const shouldShowMockReport = showMockReport;
  const shouldShowDemoPeriodNote = shouldShowMockReport && !canShowEmptyState;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-900 p-2 text-white">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Análisis Financiero IA</h2>
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
              El periodo seleccionado no es vÃ¡lido para generaciÃ³n real, pero se muestra
              una vista demo para revisiÃ³n visual. No conectado a datos reales.
            </div>
          )}
          <FinancialAIReportView
            report={mockFinancialAIReport}
            selectedMonthLabel={selectedMonthLabel}
          />
        </div>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-gray-800">
                <Sparkles className="h-4 w-4 text-blue-600" />
                {canShowEmptyState
                  ? 'Sin reporte generado para este periodo'
                  : 'Periodo no disponible para Financial AI V1'}
              </CardTitle>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                {canShowEmptyState
                  ? 'Cuando se habilite la generación segura, este reporte se guardará y quedará bloqueado para el mes seleccionado.'
                  : blockedMessage}
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
            >
              <BrainCircuit className="h-4 w-4" />
              Generar Análisis
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">Generación no conectada todavía.</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {rules.map((rule) => (
              <div
                key={rule.label}
                className={cn(
                  'rounded-lg border bg-white p-3',
                  canShowEmptyState ? 'border-slate-200' : 'border-amber-200 bg-amber-50',
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'rounded-md p-1.5',
                      canShowEmptyState
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

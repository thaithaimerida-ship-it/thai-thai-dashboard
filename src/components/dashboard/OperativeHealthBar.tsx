'use client';

import { cn } from '@/lib/utils';

type EstadoOp = 'excelente' | 'bueno' | 'alerta' | 'critico';

interface OperativeHealthBarProps {
  titulo: string;
  valor: number;
  estado: EstadoOp;
  objetivo: string;
  rangeMax: number;
  monto?: number;
}

const statusMap: Record<EstadoOp, { bar: string; text: string; badge: string; label: string }> = {
  excelente: {
    bar: 'bg-green-500',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800 border-green-200',
    label: 'Óptimo',
  },
  bueno: {
    bar: 'bg-blue-500',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Bueno',
  },
  alerta: {
    bar: 'bg-amber-500',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Atención',
  },
  critico: {
    bar: 'bg-red-500',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'Crítico',
  },
};

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,%\s,]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatCurrency = (value: unknown) => {
  const safeValue = toSafeNumber(value);
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeValue);
};

export function OperativeHealthBar({
  titulo,
  valor,
  estado,
  objetivo,
  rangeMax,
  monto = 0,
}: OperativeHealthBarProps) {
  const cfg = statusMap[estado] ?? statusMap.bueno;
  const safeValor = toSafeNumber(valor);
  const safeRangeMax = Math.max(1, toSafeNumber(rangeMax));
  const scaleMax = safeRangeMax * 1.35;
  const pct = Math.min(100, Math.max(0, (safeValor / scaleMax) * 100));
  const pctTarget = Math.min(100, Math.max(0, (safeRangeMax / scaleMax) * 100));
  const safeMonto = toSafeNumber(monto);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{titulo}</span>
        <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium border', cfg.badge)}>
          {cfg.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl sm:text-3xl font-semibold', cfg.text)}>
          {(Math.round(safeValor * 10) / 10).toFixed(1)}%
        </span>
        {safeMonto > 0 && (
          <span className="text-xs text-gray-400">{formatCurrency(safeMonto)}</span>
        )}
      </div>

      <div>
        <div className="relative h-2.5 bg-gray-100 rounded-full mb-1.5">
          <div
            className="absolute top-0 bottom-0 w-px bg-gray-300 z-10"
            style={{ left: `${pctTarget}%` }}
          />
          <div
            className={cn('absolute top-0 left-0 h-full rounded-full transition-all duration-700', cfg.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] text-gray-400">Objetivo: {objetivo}</div>
      </div>
    </div>
  );
}

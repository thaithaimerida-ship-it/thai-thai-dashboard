'use client';

import { cn } from '@/lib/utils';

function getStatus(value: number, min: number, max: number): 'ok' | 'warning' | 'critical' | 'low' {
  if (value < min) return 'low';
  if (value > max) return 'critical';
  return 'ok';
}

const statusStyles = {
  ok:       { bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'OK' },
  warning:  { bar: 'bg-amber-400',   text: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Atención' },
  critical: { bar: 'bg-red-400',     text: 'text-red-600',     badge: 'bg-red-50 text-red-700 border-red-200',             label: 'Fuera rango' },
  low:      { bar: 'bg-blue-400',    text: 'text-blue-600',    badge: 'bg-blue-50 text-blue-700 border-blue-200',          label: 'Bajo rango' },
};

interface HealthBarItem {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  monto: number;
  formatCurrency: (v: number) => string;
}

function HealthBar({ label, value, min, max, unit, monto, formatCurrency }: HealthBarItem) {
  const absMax = max + (max - min) * 0.5;
  const pct    = Math.min(100, (value / absMax) * 100);
  const minPct = (min / absMax) * 100;
  const maxPct = (max / absMax) * 100;
  const st     = getStatus(value, min, max);
  const cfg    = statusStyles[st];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-600">{label}</span>
          <span className="text-[10px] text-gray-400">Obj: {min}–{max}{unit}</span>
        </div>
        <div className="text-right">
          <span className={cn('text-xl font-bold', cfg.text)}>{value.toFixed(1)}{unit}</span>
          <div className="text-[10px] text-gray-400">{formatCurrency(monto)}</div>
        </div>
      </div>
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="absolute top-0 h-full bg-emerald-100 rounded-full"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
        <div className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-700', cfg.bar)}
          style={{ width: `${pct}%` }} />
        <div className="absolute top-0 h-full w-px bg-emerald-500 opacity-60" style={{ left: `${minPct}%` }} />
        <div className="absolute top-0 h-full w-px bg-emerald-500 opacity-60" style={{ left: `${maxPct}%` }} />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-gray-400">0{unit}</span>
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', cfg.badge)}>{cfg.label}</span>
        <span className="text-[10px] text-gray-400">{absMax.toFixed(0)}{unit}</span>
      </div>
    </div>
  );
}

interface OperativeHealthBarProps {
  foodCost: number;
  labor: number;
  costoPrimo: number;
  costoVenta: number;
  nomina: number;
  formatCurrency: (v: number) => string;
}

export function OperativeHealthBar({ foodCost, labor, costoPrimo, costoVenta, nomina, formatCurrency }: OperativeHealthBarProps) {
  const items: HealthBarItem[] = [
    { label: 'Food Cost',    value: foodCost,    min: 28, max: 32, unit: '%', monto: costoVenta,              formatCurrency },
    { label: 'Labor',        value: labor,        min: 20, max: 25, unit: '%', monto: nomina,                  formatCurrency },
    { label: 'Costo Primo',  value: costoPrimo,  min: 48, max: 59, unit: '%', monto: costoVenta + nomina,     formatCurrency },
  ];

  const allOk      = items.every(i => getStatus(i.value, i.min, i.max) === 'ok');
  const hasCritical = items.some(i => getStatus(i.value, i.min, i.max) === 'critical');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Salud operativa</h3>
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border',
          hasCritical ? 'bg-red-50 text-red-700 border-red-200' :
          allOk       ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200')}>
          {hasCritical ? 'Atención requerida' : allOk ? 'Dentro del rango' : 'Revisar'}
        </span>
      </div>
      <div className="space-y-4 divide-y divide-gray-50">
        {items.map((item, i) => (
          <div key={item.label} className={i > 0 ? 'pt-4' : ''}>
            <HealthBar {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}

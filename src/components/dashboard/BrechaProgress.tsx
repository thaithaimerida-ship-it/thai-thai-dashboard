'use client';

import { cn } from '@/lib/utils';

interface BrechaProgressProps {
  ventasActuales: number;
  peMensual: number;
  ventaObjetivo: number;
  comensalesActuales: number;
  comensalesPE: number;
  comensalesObjetivo: number;
  comisiones: number;
  ventasBrutas: number;
  formatCurrency: (v: number) => string;
}

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,%\s,]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const pct = (numerator: unknown, denominator: unknown): number => {
  const n = toSafeNumber(numerator);
  const d = toSafeNumber(denominator);
  if (d <= 0) return 0;
  return (n / d) * 100;
};

export function BrechaProgress({
  ventasActuales,
  peMensual,
  ventaObjetivo,
  comensalesActuales,
  comensalesPE,
  comensalesObjetivo,
  comisiones,
  ventasBrutas,
  formatCurrency,
}: BrechaProgressProps) {
  const safeVentasActuales = toSafeNumber(ventasActuales);
  const safePeMensual = toSafeNumber(peMensual);
  const safeVentaObjetivo = toSafeNumber(ventaObjetivo);
  const safeComensalesActuales = toSafeNumber(comensalesActuales);
  const safeComensalesPE = toSafeNumber(comensalesPE);
  const safeComensalesObjetivo = toSafeNumber(comensalesObjetivo);
  const safeComisiones = toSafeNumber(comisiones);
  const safeVentasBrutas = toSafeNumber(ventasBrutas);

  const ventasPct = Math.min(100, Math.max(0, pct(safeVentasActuales, safeVentaObjetivo)));
  const comensalesPct = Math.min(100, Math.max(0, pct(safeComensalesActuales, safeComensalesObjetivo)));
  const faltantePE = Math.max(0, safePeMensual - safeVentasActuales);
  const faltanteObj = Math.max(0, safeVentaObjetivo - safeVentasActuales);
  const pctComision = pct(safeComisiones, safeVentasBrutas).toFixed(1);
  const alcanzoPE = safeVentasActuales >= safePeMensual;
  const alcanzaObjetivo = safeVentasActuales >= safeVentaObjetivo;
  const peMarkerPct = Math.min(100, Math.max(0, pct(safePeMensual, safeVentaObjetivo)));
  const comensalesMarkerPct = Math.min(100, Math.max(0, pct(safeComensalesPE, safeComensalesObjetivo)));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Brecha vs objetivos</h3>
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border', alcanzoPE ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200')}>
          PE: {alcanzoPE ? 'Alcanzado ✓' : 'No alcanzado'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Ventas netas</span>
          <span className={cn('font-bold text-sm', alcanzaObjetivo ? 'text-emerald-600' : alcanzoPE ? 'text-blue-600' : 'text-red-500')}>
            {formatCurrency(safeVentasActuales)}
          </span>
        </div>

        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-700', alcanzaObjetivo ? 'bg-emerald-500' : alcanzoPE ? 'bg-blue-500' : 'bg-red-400')}
            style={{ width: `${ventasPct}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-amber-400 z-10"
            style={{ left: `${peMarkerPct}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-400">
          <span>$0</span>
          <span className="text-amber-500 font-medium">PE {formatCurrency(safePeMensual)}</span>
          <span className="text-blue-500 font-medium">Obj {formatCurrency(safeVentaObjetivo)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className={cn('text-base font-bold', faltantePE === 0 ? 'text-emerald-600' : 'text-red-500')}>
            {faltantePE === 0 ? '✓' : formatCurrency(faltantePE)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Faltante PE</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className={cn('text-base font-bold', faltanteObj === 0 ? 'text-emerald-600' : 'text-amber-500')}>
            {faltanteObj === 0 ? '✓' : formatCurrency(faltanteObj)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Faltante Obj</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-base font-bold text-amber-500">{pctComision}%</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Comisiones</div>
        </div>
      </div>

      <div className="space-y-2 border-t border-gray-50 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Comensales</span>
          <span className="font-bold text-sm text-gray-700">
            {safeComensalesActuales} <span className="text-gray-400 font-normal">/ {safeComensalesObjetivo} objetivo</span>
          </span>
        </div>

        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full transition-all duration-700', comensalesPct >= 100 ? 'bg-emerald-500' : safeComensalesActuales >= safeComensalesPE ? 'bg-blue-500' : 'bg-amber-400')}
            style={{ width: `${comensalesPct}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-amber-400 z-10"
            style={{ left: `${comensalesMarkerPct}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-400">
          <span>0</span>
          <span className="text-amber-500 font-medium">PE {safeComensalesPE}</span>
          <span className="text-blue-500 font-medium">Obj {safeComensalesObjetivo}</span>
        </div>
      </div>
    </div>
  );
}

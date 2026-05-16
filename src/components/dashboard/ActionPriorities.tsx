'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export type SeveridadAccion = 'critico' | 'alerta' | 'ok' | 'info';

export interface AccionEjecutiva {
  severidad: SeveridadAccion;
  titulo: string;
  descripcion: string;
  accion: string;
}

interface ActionPrioritiesProps {
  acciones: AccionEjecutiva[];
}

const severityConfig: Record<SeveridadAccion, { icon: React.ReactNode; bar: string; badge: string; label: string }> = {
  critico: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border border-red-200',
    label: 'Crítico',
  },
  alerta: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    bar: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    label: 'Atención',
  },
  ok: {
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    label: 'Saludable',
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-500" />,
    bar: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    label: 'Info',
  },
};

export function ActionPriorities({ acciones }: ActionPrioritiesProps) {
  const top = Array.isArray(acciones) ? acciones.slice(0, 3) : [];

  if (top.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700">Prioridades de acción</h3>
        <p className="text-xs text-gray-400 mt-2">Sin recomendaciones disponibles para este periodo.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Prioridades de acción</h3>
      <div className="space-y-3">
        {top.map((p, i) => {
          const cfg = severityConfig[p.severidad] ?? severityConfig.info;
          return (
            <div key={`${p.titulo}-${i}`} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className={cn('w-1 rounded-full flex-shrink-0', cfg.bar)} />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.badge)}>
                    {cfg.label}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">{p.titulo}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">{p.descripcion}</p>
                <p className="text-[11px] text-gray-700 font-medium leading-snug">→ {p.accion}</p>
              </div>
              <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

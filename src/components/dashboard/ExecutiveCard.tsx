'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Status = 'excelente' | 'bueno' | 'alerta' | 'critico';

interface ExecutiveCardProps {
  label: string;
  value: string;
  subtitle: string;
  status: Status;
  statusLabel: string;
  secondary?: string;
  trend?: number;
  className?: string;
}

const statusConfig: Record<Status, { bar: string; badge: string; badgeText: string; value: string }> = {
  excelente: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', badgeText: 'text-emerald-700', value: 'text-emerald-600' },
  bueno:     { bar: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border border-blue-200',       badgeText: 'text-blue-700',   value: 'text-blue-600'   },
  alerta:    { bar: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border border-amber-200',     badgeText: 'text-amber-700',  value: 'text-amber-600'  },
  critico:   { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border border-red-200',           badgeText: 'text-red-700',    value: 'text-red-600'    },
};

export function ExecutiveCard({ label, value, subtitle, status, statusLabel, secondary, trend, className }: ExecutiveCardProps) {
  const cfg = statusConfig[status];
  return (
    <div className={cn('bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap', cfg.badge)}>{statusLabel}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={cn('text-3xl font-bold leading-none tracking-tight', cfg.value)}>{value}</span>
        {typeof trend === 'number' && trend !== 0 && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium mb-0.5', trend > 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      {secondary && <div className="text-sm text-gray-600 font-medium -mt-1">{secondary}</div>}
      <div className={cn('h-[2px] rounded-full', cfg.bar, 'opacity-80')} />
      <p className="text-xs text-gray-400 leading-snug">{subtitle}</p>
    </div>
  );
}

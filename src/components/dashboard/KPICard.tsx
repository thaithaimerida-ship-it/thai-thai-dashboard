'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react';
import { KPI } from '@/data/realData';
import { cn } from '@/lib/utils';

interface KPICardProps {
  kpi: KPI;
}

export function KPICard({ kpi }: KPICardProps) {
  const getIcon = () => {
    if (kpi.unidad === '%') return <Percent className="h-4 w-4" />;
    if (kpi.unidad === '$') return <DollarSign className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  const getEstadoColors = () => {
    switch (kpi.estado) {
      case 'excelente':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900',
          border: 'border-green-200 dark:border-green-800',
          accent: 'text-green-600 dark:text-green-400',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        };
      case 'bueno':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950 dark:to-sky-900',
          border: 'border-blue-200 dark:border-blue-800',
          accent: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        };
      case 'alerta':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900',
          border: 'border-amber-200 dark:border-amber-800',
          accent: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        };
      case 'critico':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900',
          border: 'border-red-200 dark:border-red-800',
          accent: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        };
    }
  };

  const colors = getEstadoColors();

  const formatValue = (value: number, unidad: string) => {
    if (unidad === '$') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return `${value}${unidad}`;
  };

  const formatMonto = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
      colors.bg,
      colors.border
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {kpi.titulo}
        </CardTitle>
        <div className={cn('p-2 rounded-full bg-white/50 dark:bg-black/20', colors.accent)}>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={cn('text-3xl font-bold', colors.accent)}>
              {formatValue(kpi.valor, kpi.unidad)}
            </div>
            {/* Mostrar monto si existe (para porcentajes) */}
            {kpi.monto && (
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                = {formatMonto(kpi.monto)}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {kpi.descripcion}
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            kpi.tendencia > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            kpi.tendencia < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
            'hidden'
          )}>
            {kpi.tendencia > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : kpi.tendencia < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {kpi.tendencia !== 0 ? `${Math.abs(kpi.tendencia).toFixed(1)}%` : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

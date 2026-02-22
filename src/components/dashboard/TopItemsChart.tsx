'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { topGastos, topIngresos } from '@/data/realData';
import { TrendingUp, TrendingDown, Minus, DollarSign, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopItemsChartProps {
  tipo: 'gastos' | 'ventas';
  titulo?: string;
  descripcion?: string;
}

const colors = [
  '#3b82f6',
  '#8b5cf6', 
  '#06b6d4',
  '#f59e0b',
  '#ec4899',
];

export function TopItemsChart({ tipo, titulo, descripcion }: TopItemsChartProps) {
  const data = tipo === 'gastos' ? topGastos : topIngresos;
  const chartTitle = titulo || (tipo === 'gastos' ? 'Top 5 Gastos' : 'Top Fuentes de Ingreso');
  const chartDesc = descripcion || (tipo === 'gastos' ? 'Principales conceptos de egreso' : 'Fuentes con mayor recaudación');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Preparar datos para el gráfico horizontal
  const chartData = data.map(item => ({
    name: tipo === 'gastos' ? item.concepto : (item as typeof topIngresos[0]).tipo,
    monto: item.monto,
    porcentaje: item.porcentaje,
    color: colors[data.indexOf(item) % colors.length],
  }));

  // Calcular el total para mostrar el monto total
  const totalMonto = chartData.reduce((acc, item) => acc + item.monto, 0);

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg',
            tipo === 'gastos' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'
          )}>
            {tipo === 'gastos' ? (
              <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
              {chartTitle}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
              {chartDesc}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate pr-2 flex items-center gap-2" title={item.name}>
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                  )} style={{ backgroundColor: item.color }}>
                    {index + 1}
                  </span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="text-gray-900 dark:text-gray-100 font-semibold whitespace-nowrap">
                  {formatCurrency(item.monto)}
                </span>
              </div>
              <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.porcentaje * 2.5}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium" style={{ color: item.color }}>
                  {item.porcentaje}% del total
                </span>
                {tipo === 'gastos' && (
                  <TendenciaIcon tendencia={(data[index] as typeof topGastos[0]).tendencia} />
                )}
                {tipo === 'ventas' && (
                  <span>{(data[index] as typeof topIngresos[0]).porcentajeComision}% comisión</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Total */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Top 5</span>
              <span className="block text-xs text-gray-400 dark:text-gray-500">
                100% del gráfico
              </span>
            </div>
            <span className={cn(
              'text-xl font-bold',
              tipo === 'gastos' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            )}>
              {formatCurrency(totalMonto)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar la tendencia
function TendenciaIcon({ tendencia }: { tendencia: 'up' | 'down' | 'stable' }) {
  if (tendencia === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-red-500">
        <TrendingUp className="h-3 w-3" />
        <span className="text-xs">Subió</span>
      </span>
    );
  }
  if (tendencia === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-green-500">
        <TrendingDown className="h-3 w-3" />
        <span className="text-xs">Bajó</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-gray-400">
      <Minus className="h-3 w-3" />
      <span className="text-xs">Estable</span>
    </span>
  );
}

// Componente de tabla alternativa para vista detallada
export function TopItemsTable({ tipo }: { tipo: 'gastos' | 'ventas' }) {
  const data = tipo === 'gastos' ? topGastos : topIngresos;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">#</th>
            <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">
              {tipo === 'gastos' ? 'Concepto' : 'Tipo'}
            </th>
            <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Monto</th>
            <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">%</th>
            {tipo === 'ventas' && (
              <th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Cantidad</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-2 px-3 text-gray-500">{index + 1}</td>
              <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                {tipo === 'gastos' ? item.concepto : (item as typeof topIngresos[0]).tipo}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(item.monto)}
              </td>
              <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">
                {item.porcentaje}%
              </td>
              {tipo === 'ventas' && (
                <td className="py-2 px-3 text-right text-gray-500 dark:text-gray-400">
                  {(item as typeof topIngresos[0]).porcentajeComision}% com.
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

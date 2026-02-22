'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { topGastos, gastosPorGrupoPL, topIngresos, CONSTANTES_NEGOCIO } from '@/data/realData';
import { 
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalisisRangoFechasProps {
  onDateRangeChange?: (start: string, end: string) => void;
}

export function AnalisisRangoFechas({ onDateRangeChange }: AnalisisRangoFechasProps) {
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin, setFechaFin] = useState('2026-02-20');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calcular totales filtrados
  const datosFiltrados = useMemo(() => {
    // En una implementación real, aquí filtraríamos por fecha
    // Por ahora usamos los datos de ejemplo
    const gastosFiltrados = categoriaSeleccionada === 'todas' 
      ? topGastos 
      : topGastos.filter(g => g.concepto === categoriaSeleccionada);
    
    const totalGastos = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);
    
    return {
      gastos: gastosFiltrados,
      totalGastos,
      categorias: ['todas', ...topGastos.map(g => g.concepto)]
    };
  }, [fechaInicio, fechaFin, categoriaSeleccionada]);

  return (
    <div className="space-y-4">
      {/* Panel de filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-500" />
            Filtros de Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fecha inicio */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  onDateRangeChange?.(e.target.value, fechaFin);
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            
            {/* Fecha fin */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  onDateRangeChange?.(fechaInicio, e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            
            {/* Categoría */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
              <div className="relative">
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm pr-10"
                >
                  <option value="todas">Todas las categorías</option>
                  {topGastos.map(g => (
                    <option key={g.concepto} value={g.concepto}>{g.concepto}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Períodos predefinidos */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => {
                setFechaInicio('2026-01-01');
                setFechaFin('2026-01-31');
              }}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Enero 2026
            </button>
            <button
              onClick={() => {
                setFechaInicio('2026-02-01');
                setFechaFin('2026-02-20');
              }}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Febrero 2026
            </button>
            <button
              onClick={() => {
                setFechaInicio('2026-01-01');
                setFechaFin('2026-02-20');
              }}
              className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Período Completo
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen del período */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Período</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {new Date(fechaInicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - {' '}
              {new Date(fechaFin).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Gastos</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(datosFiltrados.totalGastos)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">PE Mensual</p>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">% Gastos vs PE</p>
            <p className={cn(
              'text-lg font-bold',
              (datosFiltrados.totalGastos / CONSTANTES_NEGOCIO.PE_MENSUAL) > 1 ? 'text-red-600' : 'text-green-600'
            )}>
              {((datosFiltrados.totalGastos / CONSTANTES_NEGOCIO.PE_MENSUAL) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de gastos por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Gastos por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {datosFiltrados.gastos.slice(0, 8).map((gasto, index) => {
                const colores = [
                  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500',
                  'bg-green-500', 'bg-red-500', 'bg-cyan-500', 'bg-indigo-500'
                ];
                const colorBar = colores[index % colores.length];
                
                return (
                  <div key={gasto.concepto}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {gasto.concepto}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{gasto.porcentaje}%</span>
                        <span className="text-xs font-bold">{formatCurrency(gasto.monto)}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', colorBar)}
                        style={{ width: `${gasto.porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gastos por Grupo P&L */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-500" />
              Gastos por Grupo P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gastosPorGrupoPL.map((grupo, index) => {
                const colores = ['bg-red-400', 'bg-blue-400', 'bg-amber-400', 'bg-purple-400'];
                const bgColors = ['bg-red-50 dark:bg-red-900/20', 'bg-blue-50 dark:bg-blue-900/20', 'bg-amber-50 dark:bg-amber-900/20', 'bg-purple-50 dark:bg-purple-900/20'];
                
                return (
                  <div 
                    key={grupo.grupo}
                    className={cn('p-3 rounded-lg', bgColors[index % bgColors.length])}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{grupo.grupo}</span>
                      <span className="text-xs text-gray-500">{grupo.porcentaje}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', colores[index % colores.length])}
                        style={{ width: `${grupo.porcentaje}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-bold mt-1">
                      {formatCurrency(grupo.monto)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Tendencias de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['up', 'down', 'stable'].map((tendencia) => {
              const gastosTendencia = topGastos.filter(g => g.tendencia === tendencia);
              const totalTendencia = gastosTendencia.reduce((acc, g) => acc + g.monto, 0);
              
              return (
                <div 
                  key={tendencia}
                  className={cn(
                    'p-4 rounded-lg border',
                    tendencia === 'up' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                    tendencia === 'down' && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                    tendencia === 'stable' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {tendencia === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
                    {tendencia === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
                    {tendencia === 'stable' && <div className="h-4 w-4 flex items-center justify-center text-blue-500">→</div>}
                    <span className="font-semibold text-sm capitalize">
                      {tendencia === 'up' ? 'En aumento' : tendencia === 'down' ? 'Disminuyendo' : 'Estables'}
                    </span>
                  </div>
                  
                  <ul className="space-y-1">
                    {gastosTendencia.slice(0, 4).map(g => (
                      <li key={g.concepto} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                        <span>{g.concepto}</span>
                        <span className="font-medium">{formatCurrency(g.monto)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold">{formatCurrency(totalTendencia)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

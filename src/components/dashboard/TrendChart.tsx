'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  Legend,
  Bar,
  BarChart,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { ventasMensuales, chartColors, CONSTANTES_NEGOCIO } from '@/data/realData';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendChartProps {
  titulo?: string;
  descripcion?: string;
  mesSeleccionado?: number | 'acumulado';
}

const chartConfig = {
  ventas: {
    label: 'Ventas',
    color: chartColors.ventas,
  },
  gastos: {
    label: 'Gastos',
    color: chartColors.gastos,
  },
} satisfies ChartConfig;

export function TrendChart({ 
  titulo = 'Tendencia Ventas vs PE vs Objetivo', 
  descripcion = 'Comparativa mensual con metas',
  mesSeleccionado = 'acumulado'
}: TrendChartProps) {
  // Filtrar datos según el mes seleccionado
  const datosFiltrados = mesSeleccionado === 'acumulado' 
    ? ventasMensuales 
    : ventasMensuales.slice(0, (mesSeleccionado as number) + 1);
  
  // Calcular totales y tendencias
  const ultimaVenta = datosFiltrados[datosFiltrados.length - 1]?.ventas || 0;
  const penultimaVenta = datosFiltrados.length > 1 ? datosFiltrados[datosFiltrados.length - 2]?.ventas : ultimaVenta;
  const variacionVentas = penultimaVenta > 0 ? ((ultimaVenta - penultimaVenta) / penultimaVenta * 100).toFixed(1) : '0';
  
  const ultimoGasto = datosFiltrados[datosFiltrados.length - 1]?.gastos || 0;
  const penultimoGasto = datosFiltrados.length > 1 ? datosFiltrados[datosFiltrados.length - 2]?.gastos : ultimoGasto;
  const variacionGastos = penultimoGasto > 0 ? ((ultimoGasto - penultimoGasto) / penultimoGasto * 100).toFixed(1) : '0';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Encontrar el índice del mes seleccionado para resaltarlo
  const indexResaltado = mesSeleccionado === 'acumulado' ? -1 : mesSeleccionado as number;

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {titulo}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {descripcion}
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Ventas:</span>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${parseFloat(variacionVentas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(variacionVentas) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {variacionVentas}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Gastos:</span>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${parseFloat(variacionGastos) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(variacionGastos) <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {variacionGastos}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[190px] sm:h-[280px] w-full">
          <ComposedChart data={datosFiltrados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.ventas} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColors.ventas} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.gastos} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColors.gastos} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value / 1000}K`}
              domain={[0, 350000]}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            
            {/* Línea de referencia PE */}
            <ReferenceLine 
              y={CONSTANTES_NEGOCIO.PE_MENSUAL} 
              stroke="#f59e0b" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: 'PE', 
                position: 'right',
                fill: '#f59e0b',
                fontSize: 11
              }}
            />
            
            {/* Línea de referencia Objetivo */}
            <ReferenceLine 
              y={CONSTANTES_NEGOCIO.VENTA_OBJETIVO} 
              stroke="#3b82f6" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: 'Objetivo', 
                position: 'right',
                fill: '#3b82f6',
                fontSize: 11
              }}
            />
            
            {/* Línea de referencia para el mes seleccionado */}
            {indexResaltado >= 0 && indexResaltado < datosFiltrados.length && (
              <ReferenceLine 
                x={datosFiltrados[indexResaltado].mes} 
                stroke="#6366f1" 
                strokeDasharray="3 3"
                strokeWidth={2}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="ventas"
              stroke={chartColors.ventas}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVentas)"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke={chartColors.gastos}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGastos)"
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{value}</span>
              )}
            />
          </ComposedChart>
        </ChartContainer>
        
        {/* Leyenda adicional */}
        <div className="flex justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-amber-500" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-gray-500">PE: {formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-500" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-gray-500">Objetivo: {formatCurrency(CONSTANTES_NEGOCIO.VENTA_OBJETIVO)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Gráfico de barras para márgenes
export function MarginChart({ mesSeleccionado = 'acumulado' }: { mesSeleccionado?: number | 'acumulado' }) {
  const datosFiltrados = mesSeleccionado === 'acumulado' 
    ? ventasMensuales 
    : ventasMensuales.slice(0, (mesSeleccionado as number) + 1);

  const chartConfig = {
    margenBruto: {
      label: 'Margen Bruto',
      color: '#3b82f6',
    },
    margenNeto: {
      label: 'Margen Neto',
      color: '#8b5cf6',
    },
  } satisfies ChartConfig;

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Evolución de Márgenes
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Margen bruto y neto {mesSeleccionado === 'acumulado' ? 'mensual' : 'hasta el mes seleccionado'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[145px] sm:h-[200px] w-full">
          <BarChart data={datosFiltrados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[-50, 50]}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value) => `${value}%`}
                />
              }
            />
            {/* Línea de referencia en 0% */}
            <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />
            <Bar 
              dataKey="margenBruto" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Bar 
              dataKey="margenNeto" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

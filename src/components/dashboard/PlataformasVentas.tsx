'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Smartphone } from 'lucide-react';
import { parseFecha, parseMoney, getSemanaISO } from '@/hooks/useGoogleSheets';

interface IngresoRow {
  Fecha: string;
  'Fuente / Cliente': string;
  Categoría: string;
  'Monto Bruto (+)': string;
  'Comisión / Retención (-)': string;
  'Monto Neto (Cálculo)': string;
  'Cuenta Destino': string;
  'Notas / UUID': string;
}

interface PlataformasVentasProps {
  ingresos: IngresoRow[];
}

// Colores de marca (Uber Eats verde, Rappi naranja-rojo)
const COLOR_UBER = '#06C167';
const COLOR_RAPPI = '#FF441F';

const chartConfig = {
  uber: { label: 'Uber Eats', color: COLOR_UBER },
  rappi: { label: 'Rappi', color: COLOR_RAPPI },
} satisfies ChartConfig;

// Normaliza igual que el resto del dashboard: sin acentos, lowercase, trim
function normalizar(value: string | null | undefined): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function PlataformasVentas({ ingresos }: PlataformasVentasProps) {
  const { semanas, totalUber, totalRappi, total, pctRappi } = useMemo(() => {
    const porSemana: Record<
      string,
      { key: string; semana: string; semanaCorta: string; uber: number; rappi: number }
    > = {};

    for (const ing of ingresos) {
      // Filtro: categoría = "Plataforma" (normalizada)
      if (normalizar(ing.Categoría) !== 'plataforma') continue;

      // Plataforma: columna B = Fuente / Cliente
      const fuente = normalizar(ing['Fuente / Cliente']);
      let plataforma: 'uber' | 'rappi' | null = null;
      if (fuente.includes('uber')) plataforma = 'uber';
      else if (fuente.includes('rappi')) plataforma = 'rappi';
      if (!plataforma) continue;

      const fecha = parseFecha(ing.Fecha);
      if (!fecha) continue;

      const { key, label } = getSemanaISO(fecha);
      if (!porSemana[key]) {
        porSemana[key] = {
          key,
          semana: label,
          semanaCorta: `S${key.split('-W')[1] ?? ''}`,
          uber: 0,
          rappi: 0,
        };
      }
      porSemana[key][plataforma] += parseMoney(ing['Monto Bruto (+)']);
    }

    const semanas = Object.values(porSemana)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((s) => ({ ...s, total: s.uber + s.rappi }));

    const totalUber = semanas.reduce((acc, s) => acc + s.uber, 0);
    const totalRappi = semanas.reduce((acc, s) => acc + s.rappi, 0);
    const total = totalUber + totalRappi;
    const pctRappi = total > 0 ? (totalRappi / total) * 100 : 0;

    return { semanas, totalUber, totalRappi, total, pctRappi };
  }, [ingresos]);

  if (semanas.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          No hay ventas de plataformas (Uber Eats / Rappi) en los datos disponibles.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tarjetas de resumen */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-indigo-100 text-xs uppercase">Total Uber Eats</p>
              <p className="text-2xl font-bold">{formatCurrency(totalUber)}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs uppercase">Total Rappi</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRappi)}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs uppercase">% Participación Rappi</p>
              <p className="text-2xl font-bold">{pctRappi.toFixed(1)}%</p>
              <p className="text-indigo-200 text-xs">
                {formatCurrency(totalRappi)} de {formatCurrency(total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfica de barras agrupadas */}
      <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
        <CardHeader className="pb-2 sm:pb-6 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Ventas semanales por plataforma
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Monto bruto por semana ISO — Uber Eats vs Rappi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3 sm:px-6 sm:pb-6">
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[300px] w-full">
            <BarChart data={semanas} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="semanaCorta"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${Math.round((value as number) / 1000)}K`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.semana ?? ''
                    }
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Bar dataKey="uber" name="Uber Eats" fill={COLOR_UBER} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="rappi" name="Rappi" fill={COLOR_RAPPI} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tabla de ventas semanales */}
      <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
        <CardHeader className="pb-2 sm:pb-4 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <Smartphone className="h-5 w-5 text-indigo-500" />
            Detalle semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3 sm:px-6 sm:pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead className="text-right">Uber Eats</TableHead>
                <TableHead className="text-right">Rappi</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semanas.map((s) => (
                <TableRow key={s.key}>
                  <TableCell className="font-medium">{s.semana}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.uber)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.rappi)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(s.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalUber)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalRappi)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

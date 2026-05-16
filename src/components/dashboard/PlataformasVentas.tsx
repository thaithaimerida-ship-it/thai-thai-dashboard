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
  // Mismo contrato que ComisionesPlataformas: índice cronológico del mes
  // con datos (0-based) o 'ytd' para todo. Viene del selector global.
  filtroMes?: number | 'ytd';
}

// Colores de marca (Uber Eats verde, Rappi naranja-rojo)
const COLOR_UBER = '#06C167';
const COLOR_RAPPI = '#FF441F';

const chartConfig = {
  uber: { label: 'Uber Eats', color: COLOR_UBER },
  rappi: { label: 'Rappi', color: COLOR_RAPPI },
} satisfies ChartConfig;

const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DOW_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

export function PlataformasVentas({ ingresos, filtroMes = 'ytd' }: PlataformasVentasProps) {
  // 1) Filtro de mes global — misma lógica que ComisionesPlataformas
  const ingresosFiltrados = useMemo(() => {
    if (!ingresos || ingresos.length === 0) return [];
    if (filtroMes === 'ytd') return ingresos;

    const porMes: Record<string, IngresoRow[]> = {};
    ingresos.forEach((ing) => {
      const fecha = parseFecha(ing.Fecha);
      if (!fecha) return;
      const mesKey = `${MESES_LARGOS[fecha.getMonth()]} ${fecha.getFullYear()}`;
      if (!porMes[mesKey]) porMes[mesKey] = [];
      porMes[mesKey].push(ing);
    });

    const mesesOrdenados = Object.keys(porMes).sort((a, b) => {
      const [mA, aA] = a.split(' ');
      const [mB, aB] = b.split(' ');
      return (parseInt(aA) * 12 + MESES_LARGOS.indexOf(mA))
           - (parseInt(aB) * 12 + MESES_LARGOS.indexOf(mB));
    });

    return porMes[mesesOrdenados[filtroMes]] || [];
  }, [ingresos, filtroMes]);

  // 2) Agregación: semanal (tabla/gráfica) + por fecha (módulo de días)
  const { semanas, totalUber, totalRappi, total, pctRappi, diasStats } = useMemo(() => {
    const porSemana: Record<
      string,
      { key: string; semana: string; semanaCorta: string; uber: number; rappi: number }
    > = {};
    // dateKey -> { dow, bruto } — bruto = Uber + Rappi de ese día
    const porFecha: Record<string, { dow: number; bruto: number }> = {};

    for (const ing of ingresosFiltrados) {
      if (normalizar(ing.Categoría) !== 'plataforma') continue;

      const fuente = normalizar(ing['Fuente / Cliente']);
      let plataforma: 'uber' | 'rappi' | null = null;
      if (fuente.includes('uber')) plataforma = 'uber';
      else if (fuente.includes('rappi')) plataforma = 'rappi';
      if (!plataforma) continue;

      const fecha = parseFecha(ing.Fecha);
      if (!fecha) continue;

      const bruto = parseMoney(ing['Monto Bruto (+)']);

      // Semanal (ISO)
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
      porSemana[key][plataforma] += bruto;

      // Por fecha (para promedio por día de la semana)
      const dateKey = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
      if (!porFecha[dateKey]) porFecha[dateKey] = { dow: fecha.getDay(), bruto: 0 };
      porFecha[dateKey].bruto += bruto;
    }

    const semanas = Object.values(porSemana)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((s) => ({ ...s, total: s.uber + s.rappi }));

    const totalUber = semanas.reduce((acc, s) => acc + s.uber, 0);
    const totalRappi = semanas.reduce((acc, s) => acc + s.rappi, 0);
    const total = totalUber + totalRappi;
    const pctRappi = total > 0 ? (totalRappi / total) * 100 : 0;

    // Promedio de venta bruta por día de la semana
    const mapDow: Record<number, { total: number; count: number }> = {};
    Object.values(porFecha).forEach(({ dow, bruto }) => {
      if (!mapDow[dow]) mapDow[dow] = { total: 0, count: 0 };
      mapDow[dow].total += bruto;
      mapDow[dow].count += 1;
    });
    const diasStats = [0, 1, 2, 3, 4, 5, 6]
      .map((dow) => ({
        dow,
        name: DOW_NAMES[dow],
        fullName: DOW_FULL[dow],
        avg: mapDow[dow] ? Math.round(mapDow[dow].total / mapDow[dow].count) : 0,
        count: mapDow[dow]?.count || 0,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.avg - a.avg);

    return { semanas, totalUber, totalRappi, total, pctRappi, diasStats };
  }, [ingresosFiltrados]);

  if (semanas.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          No hay ventas de plataformas (Uber Eats / Rappi) para el período seleccionado.
        </p>
      </Card>
    );
  }

  const maxDiaAvg = diasStats.length > 0 ? diasStats[0].avg : 0;
  const mejorDia = diasStats[0];
  const peorDia = diasStats[diasStats.length - 1];
  const difDias = mejorDia && mejorDia.avg > 0
    ? Math.round((1 - peorDia.avg / mejorDia.avg) * 100)
    : 0;

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

      {/* Mejores y peores días — promedio bruto Uber + Rappi por día de la semana */}
      {diasStats.length > 0 && (
        <div className="space-y-3">
          <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Venta bruta promedio por día de la semana — Uber Eats + Rappi
              </p>
              <div className="space-y-2">
                {diasStats.map((s, i) => {
                  const pct = Math.max(5, Math.round((s.avg / maxDiaAvg) * 100));
                  const color = i === 0 ? '#10b981' : i === 1 ? '#10b981'
                    : i <= 3 ? '#3b82f6' : i <= 4 ? '#f59e0b' : '#ef4444';
                  const badge = i === 0 ? { label: 'Mejor', cls: 'bg-green-100 text-green-700' }
                    : i === diasStats.length - 1 ? { label: 'Peor', cls: 'bg-red-100 text-red-700' }
                    : i <= 1 ? { label: 'Top', cls: 'bg-green-100 text-green-700' }
                    : i >= diasStats.length - 2 ? { label: 'Bajo', cls: 'bg-yellow-100 text-yellow-700' }
                    : null;
                  return (
                    <div key={s.dow} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 w-8 shrink-0">{s.name}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                        <div style={{ width: `${pct}%`, background: color }} className="h-full rounded flex items-center pl-2">
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">{formatCurrency(s.avg)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 w-28 justify-end shrink-0">
                        <span className="text-xs text-gray-400">~{s.count} días</span>
                        {badge && <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Insights</p>
              <div className="space-y-0 divide-y divide-gray-100">
                <div className="flex gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-800">{mejorDia.fullName}</span> es tu mejor día en plataformas con {formatCurrency(mejorDia.avg)} de venta bruta promedio (Uber Eats + Rappi).
                  </p>
                </div>
                <div className="flex gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-800">{peorDia.fullName}</span> es el día más bajo — vende {difDias}% menos que {mejorDia.fullName}. Considera campañas o promos de delivery ese día.
                  </p>
                </div>
                <div className="flex gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Estos promedios se actualizan automáticamente conforme agregas datos. El ranking del mejor al peor día cambia solo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

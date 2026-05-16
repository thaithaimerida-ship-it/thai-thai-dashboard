'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
  filtroMes?: number | 'ytd';
}

const COLOR_UBER  = '#185FA5';
const COLOR_RAPPI = '#D85A30';

const chartConfig = {
  uber:  { label: 'Uber Eats', color: COLOR_UBER  },
  rappi: { label: 'Rappi',     color: COLOR_RAPPI },
} satisfies ChartConfig;

const MESES_LARGOS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun',
                      'Jul','Ago','Sep','Oct','Nov','Dic'];
const DOW_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DOW_FULL  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function normalizar(value: string | null | undefined): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

const pctFmt = (v: number) => `${v.toFixed(1)}%`;

export function PlataformasVentas({ ingresos, filtroMes = 'ytd' }: PlataformasVentasProps) {

  // ── Filtro de mes global ────────────────────────────────────────────────────
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
    if (mesesOrdenados.length === 0) return [];

    let idx: number;
    if (typeof filtroMes === 'number' && filtroMes >= 0 && filtroMes < mesesOrdenados.length) {
      idx = filtroMes;
    } else {
      const ahora = new Date();
      const mesActualKey = `${MESES_LARGOS[ahora.getMonth()]} ${ahora.getFullYear()}`;
      const found = mesesOrdenados.indexOf(mesActualKey);
      idx = found >= 0 ? found : mesesOrdenados.length - 1;
    }
    return porMes[mesesOrdenados[idx]] || [];
  }, [ingresos, filtroMes]);

  // ── Agregación ──────────────────────────────────────────────────────────────
  const { semanas, meses, totales, diasStats } = useMemo(() => {

    // Por semana (para la gráfica de líneas)
    const porSemana: Record<string, {
      key: string; semanaCorta: string; semana: string;
      uber: number; rappi: number;
    }> = {};

    // Por mes × plataforma (para la tabla)
    // mesKey -> { uber: {bruto, comision, neto}, rappi: {bruto, comision, neto} }
    const porMes: Record<string, {
      label: string; corto: string; anio: number; mes: number;
      uber:  { bruto: number; comision: number; neto: number };
      rappi: { bruto: number; comision: number; neto: number };
    }> = {};

    // Por fecha (para días de la semana)
    const porFecha: Record<string, { dow: number; bruto: number }> = {};

    for (const ing of ingresosFiltrados) {
      if (normalizar(ing.Categoría) !== 'plataforma') continue;

      const fuente = normalizar(ing['Fuente / Cliente']);
      let plat: 'uber' | 'rappi' | null = null;
      if (fuente.includes('uber'))  plat = 'uber';
      else if (fuente.includes('rappi')) plat = 'rappi';
      if (!plat) continue;

      const fecha = parseFecha(ing.Fecha);
      if (!fecha) continue;

      const bruto   = parseMoney(ing['Monto Bruto (+)']);
      const comision = parseMoney(ing['Comisión / Retención (-)']);
      const neto    = parseMoney(ing['Monto Neto (Cálculo)']);

      // Semanal
      const { key, label } = getSemanaISO(fecha);
      if (!porSemana[key]) {
        porSemana[key] = { key, semana: label,
          semanaCorta: `S${key.split('-W')[1] ?? ''}`, uber: 0, rappi: 0 };
      }
      porSemana[key][plat] += bruto;

      // Mensual
      const m = fecha.getMonth();
      const a = fecha.getFullYear();
      const mesKey = `${a}-${String(m + 1).padStart(2, '0')}`;
      if (!porMes[mesKey]) {
        porMes[mesKey] = {
          label: `${MESES_LARGOS[m]} ${a}`,
          corto: MESES_CORTOS[m],
          anio: a, mes: m,
          uber:  { bruto: 0, comision: 0, neto: 0 },
          rappi: { bruto: 0, comision: 0, neto: 0 },
        };
      }
      porMes[mesKey][plat].bruto    += bruto;
      porMes[mesKey][plat].comision += comision;
      porMes[mesKey][plat].neto     += neto;

      // Por fecha
      const dateKey = `${a}-${m}-${fecha.getDate()}`;
      if (!porFecha[dateKey]) porFecha[dateKey] = { dow: fecha.getDay(), bruto: 0 };
      porFecha[dateKey].bruto += bruto;
    }

    const semanas = Object.values(porSemana)
      .sort((a, b) => a.key.localeCompare(b.key));

    const meses = Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);

    // Totales generales
    const totales = {
      uber:  { bruto: 0, comision: 0, neto: 0 },
      rappi: { bruto: 0, comision: 0, neto: 0 },
    };
    meses.forEach((m) => {
      (['bruto','comision','neto'] as const).forEach((k) => {
        totales.uber[k]  += m.uber[k];
        totales.rappi[k] += m.rappi[k];
      });
    });

    // Días de la semana
    const mapDow: Record<number, { total: number; count: number }> = {};
    Object.values(porFecha).forEach(({ dow, bruto }) => {
      if (!mapDow[dow]) mapDow[dow] = { total: 0, count: 0 };
      mapDow[dow].total += bruto;
      mapDow[dow].count += 1;
    });
    const diasStats = [0,1,2,3,4,5,6]
      .map((dow) => ({
        dow,
        name: DOW_NAMES[dow],
        fullName: DOW_FULL[dow],
        avg: mapDow[dow] ? Math.round(mapDow[dow].total / mapDow[dow].count) : 0,
        count: mapDow[dow]?.count || 0,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.avg - a.avg);

    return { semanas, meses, totales, diasStats };
  }, [ingresosFiltrados]);

  if (semanas.length === 0 && meses.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          No hay ventas de plataformas (Uber Eats / Rappi) para el período seleccionado.
        </p>
      </Card>
    );
  }

  const totalBruto  = totales.uber.bruto  + totales.rappi.bruto;
  const totalNeto   = totales.uber.neto   + totales.rappi.neto;
  const pctUber     = totalBruto > 0 ? (totales.uber.bruto  / totalBruto) * 100 : 0;
  const pctRappi    = totalBruto > 0 ? (totales.rappi.bruto / totalBruto) * 100 : 0;

  const maxDiaAvg   = diasStats.length > 0 ? diasStats[0].avg : 0;
  const mejorDia    = diasStats[0];
  const peorDia     = diasStats[diasStats.length - 1];
  const difDias     = mejorDia && mejorDia.avg > 0
    ? Math.round((1 - peorDia.avg / mejorDia.avg) * 100) : 0;

  return (
    <div className="space-y-4">

      {/* ── Tarjetas de resumen ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-[#E6F1FB] dark:bg-[#0C447C] border-0">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#185FA5] dark:text-[#85B7EB] mb-1">
              Uber Eats
            </p>
            <p className="text-2xl font-bold text-[#0C447C] dark:text-white">
              {formatCurrency(totales.uber.bruto)}
            </p>
            <p className="text-xs text-[#185FA5] dark:text-[#85B7EB] mt-1">
              {pctFmt(pctUber)} del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#FAECE7] dark:bg-[#712B13] border-0">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#D85A30] dark:text-[#F0997B] mb-1">
              Rappi
            </p>
            <p className="text-2xl font-bold text-[#712B13] dark:text-white">
              {formatCurrency(totales.rappi.bruto)}
            </p>
            <p className="text-xs text-[#D85A30] dark:text-[#F0997B] mt-1">
              {pctFmt(pctRappi)} del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-800 border">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Total plataformas
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatCurrency(totalBruto)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Neto: {formatCurrency(totalNeto)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Gráfica de líneas ───────────────────────────────────────────────── */}
      <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Ventas semanales por plataforma
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400 text-xs">
            Venta bruta por semana ISO
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          {/* Leyenda manual */}
          <div className="flex gap-4 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span style={{ width: 20, height: 2, background: COLOR_UBER, display: 'inline-block', borderRadius: 1 }} />
              Uber Eats
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 20, height: 0, borderTop: `2px dashed ${COLOR_RAPPI}`, display: 'inline-block' }} />
              Rappi
            </span>
          </div>
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[260px] w-full">
            <LineChart data={semanas} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                tickFormatter={(v) => `$${Math.round((v as number) / 1000)}K`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.semana ?? ''}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Line
                dataKey="uber" name="Uber Eats"
                stroke={COLOR_UBER} strokeWidth={2}
                dot={{ r: 4, fill: COLOR_UBER }}
                activeDot={{ r: 5 }}
              />
              <Line
                dataKey="rappi" name="Rappi"
                stroke={COLOR_RAPPI} strokeWidth={2} strokeDasharray="5 4"
                dot={{ r: 4, fill: COLOR_RAPPI }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Tabla mensual: plataforma × mes ────────────────────────────────── */}
      <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200">
            <Smartphone className="h-4 w-4 text-indigo-500" />
            Ventas por plataforma
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b border-gray-200 dark:border-gray-700 pr-3"
                    style={{ width: '22%' }}>
                    Plataforma
                  </th>
                  {meses.map((m) => (
                    <th key={`${m.anio}-${m.mes}`}
                      className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b border-gray-200 dark:border-gray-700 px-2">
                      {m.corto}
                    </th>
                  ))}
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b border-gray-200 dark:border-gray-700 pl-3"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* ── UBER EATS ── */}
                <tr>
                  <td colSpan={meses.length + 2}
                    className="py-1.5 px-2 text-xs font-semibold tracking-wide"
                    style={{ background: 'var(--color-background-secondary)', color: COLOR_UBER }}>
                    — Uber Eats
                  </td>
                </tr>
                {/* Venta bruta */}
                <tr>
                  <td className="py-2 pr-3 text-xs text-gray-400">Venta bruta</td>
                  {meses.map((m) => (
                    <td key={`ub-${m.anio}-${m.mes}`} className="py-2 px-2 text-right text-sm">
                      {formatCurrency(m.uber.bruto)}
                    </td>
                  ))}
                  <td className="py-2 pl-3 text-right text-sm font-semibold"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    {formatCurrency(totales.uber.bruto)}
                  </td>
                </tr>
                {/* Comisiones */}
                <tr>
                  <td className="py-2 pr-3 text-xs text-gray-400">Comisiones</td>
                  {meses.map((m) => {
                    const pct = m.uber.bruto > 0
                      ? (m.uber.comision / m.uber.bruto) * 100 : 0;
                    return (
                      <td key={`uc-${m.anio}-${m.mes}`} className="py-2 px-2 text-right text-sm text-red-600">
                        −{formatCurrency(m.uber.comision)}
                        <span className="block text-[10px] text-red-400">{pct.toFixed(1)}%</span>
                      </td>
                    );
                  })}
                  <td className="py-2 pl-3 text-right text-sm font-semibold text-red-600"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    −{formatCurrency(totales.uber.comision)}
                    <span className="block text-[10px] text-red-400">
                      {totales.uber.bruto > 0
                        ? pctFmt((totales.uber.comision / totales.uber.bruto) * 100)
                        : '—'}
                    </span>
                  </td>
                </tr>
                {/* Venta neta */}
                <tr style={{ borderBottom: '0.5px solid #e5e7eb' }}>
                  <td className="py-2 pr-3 text-xs text-gray-400">Venta neta</td>
                  {meses.map((m) => (
                    <td key={`un-${m.anio}-${m.mes}`} className="py-2 px-2 text-right text-sm text-gray-500">
                      {formatCurrency(m.uber.neto)}
                    </td>
                  ))}
                  <td className="py-2 pl-3 text-right text-sm font-semibold text-gray-500"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    {formatCurrency(totales.uber.neto)}
                  </td>
                </tr>

                {/* ── RAPPI ── */}
                <tr>
                  <td colSpan={meses.length + 2}
                    className="py-1.5 px-2 text-xs font-semibold tracking-wide"
                    style={{ background: 'var(--color-background-secondary)', color: COLOR_RAPPI }}>
                    — Rappi
                  </td>
                </tr>
                {/* Venta bruta */}
                <tr>
                  <td className="py-2 pr-3 text-xs text-gray-400">Venta bruta</td>
                  {meses.map((m) => (
                    <td key={`rb-${m.anio}-${m.mes}`} className="py-2 px-2 text-right text-sm">
                      {formatCurrency(m.rappi.bruto)}
                    </td>
                  ))}
                  <td className="py-2 pl-3 text-right text-sm font-semibold"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    {formatCurrency(totales.rappi.bruto)}
                  </td>
                </tr>
                {/* Comisiones */}
                <tr>
                  <td className="py-2 pr-3 text-xs text-gray-400">Comisiones</td>
                  {meses.map((m) => {
                    const pct = m.rappi.bruto > 0
                      ? (m.rappi.comision / m.rappi.bruto) * 100 : 0;
                    return (
                      <td key={`rc-${m.anio}-${m.mes}`} className="py-2 px-2 text-right text-sm text-red-600">
                        −{formatCurrency(m.rappi.comision)}
                        <span className="block text-[10px] text-red-400">{pct.toFixed(1)}%</span>
                      </td>
                    );
                  })}
                  <td className="py-2 pl-3 text-right text-sm font-semibold text-red-600"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    −{formatCurrency(totales.rappi.comision)}
                    <span className="block text-[10px] text-red-400">
                      {totales.rappi.bruto > 0
                        ? pctFmt((totales.rappi.comision / totales.rappi.bruto) * 100)
                        : '—'}
                    </span>
                  </td>
                </tr>
                {/* Venta neta */}
                <tr>
                  <td className="py-2 pr-3 text-xs text-gray-400">Venta neta</td>
                  {meses.map((m) => (
                    <td key={`rn-${m.anio}-${m.mes}`} className="py-2 px-2 text-right text-sm text-gray-500">
                      {formatCurrency(m.rappi.neto)}
                    </td>
                  ))}
                  <td className="py-2 pl-3 text-right text-sm font-semibold text-gray-500"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    {formatCurrency(totales.rappi.neto)}
                  </td>
                </tr>
              </tbody>

              {/* ── TOTALES ── */}
              <tfoot>
                <tr style={{ borderTop: '2px solid #d1d5db' }}>
                  <td className="pt-3 pr-3 font-semibold text-sm text-gray-800 dark:text-gray-200">
                    Total bruto
                  </td>
                  {meses.map((m) => (
                    <td key={`tb-${m.anio}-${m.mes}`} className="pt-3 px-2 text-right font-semibold text-sm">
                      {formatCurrency(m.uber.bruto + m.rappi.bruto)}
                    </td>
                  ))}
                  <td className="pt-3 pl-3 text-right font-semibold text-sm"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    {formatCurrency(totalBruto)}
                  </td>
                </tr>
                <tr>
                  <td className="pt-1 pb-2 pr-3 font-semibold text-sm text-gray-500">
                    Total neto
                  </td>
                  {meses.map((m) => (
                    <td key={`tn-${m.anio}-${m.mes}`} className="pt-1 pb-2 px-2 text-right font-semibold text-sm text-gray-500">
                      {formatCurrency(m.uber.neto + m.rappi.neto)}
                    </td>
                  ))}
                  <td className="pt-1 pb-2 pl-3 text-right font-semibold text-sm text-gray-500"
                    style={{ borderLeft: '0.5px solid #d1d5db' }}>
                    {formatCurrency(totalNeto)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Mejores y peores días ───────────────────────────────────────────── */}
      {diasStats.length > 0 && (
        <div className="space-y-3">
          <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Venta bruta promedio por día — Uber Eats + Rappi · histórico YTD
              </p>
              <div className="space-y-2">
                {diasStats.map((s, i) => {
                  const pct   = Math.max(5, Math.round((s.avg / maxDiaAvg) * 100));
                  const color = i === 0 ? '#10b981' : i === 1 ? '#10b981'
                    : i <= 3 ? '#3b82f6' : i <= 4 ? '#f59e0b' : '#ef4444';
                  const badge = i === 0
                    ? { label: 'Mejor', cls: 'bg-green-100 text-green-700' }
                    : i === diasStats.length - 1
                    ? { label: 'Peor',  cls: 'bg-red-100 text-red-700' }
                    : i <= 1
                    ? { label: 'Top',   cls: 'bg-green-100 text-green-700' }
                    : i >= diasStats.length - 2
                    ? { label: 'Bajo',  cls: 'bg-yellow-100 text-yellow-700' }
                    : null;
                  return (
                    <div key={s.dow} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 w-8 shrink-0">{s.name}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                        <div style={{ width: `${pct}%`, background: color }}
                          className="h-full rounded flex items-center pl-2">
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {formatCurrency(s.avg)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 w-28 justify-end shrink-0">
                        <span className="text-xs text-gray-400">~{s.count} días</span>
                        {badge && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                      <polyline points="17 6 23 6 23 12"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-800">{mejorDia.fullName}</span> es tu mejor día
                    en plataformas con {formatCurrency(mejorDia.avg)} de venta bruta promedio (Uber Eats + Rappi).
                  </p>
                </div>
                <div className="flex gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                      <polyline points="17 18 23 18 23 12"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-800">{peorDia.fullName}</span> es el día más bajo
                    — vende {difDias}% menos que {mejorDia.fullName}. Considera promos de delivery ese día.
                  </p>
                </div>
                <div className="flex gap-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    El ranking se actualiza automáticamente conforme agregas datos de Rappi y Uber Eats.
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

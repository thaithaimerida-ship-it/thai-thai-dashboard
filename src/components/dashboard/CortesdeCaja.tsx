'use client';

import { useMemo, useState } from 'react';
import { parseMoney, parseFecha } from '@/hooks/useGoogleSheets';

interface CorteCajaRow {
  Fecha: string;
  Turno: string;
  'Venta Neta': string;
  'Impuesto Total': string;
  'Venta con Imp.': string;
  Efectivo: string;
  Tarjeta: string;
  Otros: string;
  'Propinas Pagadas': string;
  'No. de Comensales': string;
  Validación: string;
  'Fondo Inicial': string;
  'Declaración Cajero Efectivo': string;
  'Efectivo Final': string;
}

interface IngresoRow {
  Fecha: string;
  'Fuente / Cliente': string;
  Categoría: string;
  'Monto Bruto (+)': string;
  'Comisión / Retención (-)': string;
  'Monto Neto (Cálculo)': string;
}

interface Props {
  cortesCaja: CorteCajaRow[];
  ingresos: IngresoRow[];
}

const MXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const MXNk = (n: number) => {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'k';
  return MXN(n);
};

const DOW_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const getDow = (fecha: Date): string => DOW_NAMES[fecha.getDay()];

const MESES_NOMBRES: Record<string, string> = {
  enero: 'Enero', febrero: 'Febrero', marzo: 'Marzo', abril: 'Abril',
  mayo: 'Mayo', junio: 'Junio', julio: 'Julio', agosto: 'Agosto',
  septiembre: 'Septiembre', octubre: 'Octubre', noviembre: 'Noviembre', diciembre: 'Diciembre',
};

const MESES_ORDER = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function DowAnalysis({ days }: { days: { fecha: Date; vci: number; com: number }[] }) {
  const stats = useMemo(() => {
    const map: Record<number, { total: number; count: number; comTotal: number }> = {};
    days.forEach(d => {
      const dow = d.fecha.getDay();
      if (!map[dow]) map[dow] = { total: 0, count: 0, comTotal: 0 };
      map[dow].total += d.vci;
      map[dow].count += 1;
      map[dow].comTotal += d.com;
    });
    return [0,1,2,3,4,5,6].map(dow => ({
      dow,
      name: DOW_NAMES[dow],
      fullName: DOW_FULL[dow],
      avg: map[dow] ? Math.round(map[dow].total / map[dow].count) : 0,
      avgCom: map[dow] ? Math.round(map[dow].comTotal / map[dow].count) : 0,
      count: map[dow]?.count || 0,
    })).filter(d => d.count > 0).sort((a, b) => b.avg - a.avg);
  }, [days]);

  if (stats.length === 0) return null;

  const maxAvg = stats[0].avg;
  const best = stats[0];
  const worst = stats[stats.length - 1];
  const fri = stats.find(s => s.dow === 5);
  const diff = best.avg > 0 ? Math.round((1 - worst.avg / best.avg) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Venta promedio por día de la semana — YTD 2026</p>
        <div className="space-y-2">
          {stats.map((s, i) => {
            const pct = Math.max(5, Math.round(s.avg / maxAvg * 100));
            const color = i === 0 ? '#10b981' : i === 1 ? '#10b981' : i <= 3 ? '#3b82f6' : i <= 4 ? '#f59e0b' : '#ef4444';
            const badge = i === 0 ? { label: 'Mejor', cls: 'bg-green-100 text-green-700' }
              : i === stats.length - 1 ? { label: 'Peor', cls: 'bg-red-100 text-red-700' }
              : i <= 1 ? { label: 'Top', cls: 'bg-green-100 text-green-700' }
              : i >= stats.length - 2 ? { label: 'Bajo', cls: 'bg-yellow-100 text-yellow-700' }
              : null;
            return (
              <div key={s.dow} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 w-8 shrink-0">{s.name}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div style={{ width: `${pct}%`, background: color }} className="h-full rounded flex items-center pl-2">
                    <span className="text-[10px] font-bold text-white whitespace-nowrap">{MXN(s.avg)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 w-28 justify-end shrink-0">
                  <span className="text-xs text-gray-400">~{s.avgCom} com.</span>
                  {badge && <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Insights</p>
        <div className="space-y-0 divide-y divide-gray-100">
          <div className="flex gap-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-800">{best.fullName}</span> es tu mejor día con {MXN(best.avg)} de venta promedio y ~{best.avgCom} comensales.
            </p>
          </div>
          <div className="flex gap-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-800">{worst.fullName}</span> es el día más bajo — vende {diff}% menos que {best.fullName}. Considera una promoción o reducir costos ese día.
            </p>
          </div>
          {fri && fri.dow !== best.dow && (
            <div className="flex gap-3 py-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold text-gray-800">Viernes</span> promedia {MXN(fri.avg)} — a solo {MXN(best.avg - fri.avg)} del mejor día. Una promoción de "Viernes Thai" podría cerrar esa brecha.
              </p>
            </div>
          )}
          <div className="flex gap-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Estos promedios se actualizan automáticamente conforme agregas datos. Si un día mejora consistentemente, el ranking cambia solo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CortesdeCaja({ cortesCaja, ingresos }: Props) {
  const [mesKey, setMesKey] = useState<string>('');

  // Group cortes by month
  const byMonth = useMemo(() => {
    const map: Record<string, { days: { d: string; fecha: Date; vci: number; ef: number; tar: number; ot: number; prop: number; com: number }[] }> = {};
    cortesCaja.forEach(row => {
      const fecha = parseFecha(row.Fecha);
      if (!fecha) return;
      const parts = row.Fecha.toLowerCase().trim().split(/[\s,]+/);
      const mesStr = parts.find(p => MESES_NOMBRES[p]);
      if (!mesStr) return;
      const anio = fecha.getFullYear();
      const key = `${mesStr}_${anio}`;
      if (!map[key]) map[key] = { days: [] };
      const dayParts = parts[0];
      map[key].days.push({
        d: dayParts.padStart(2, '0') + '/' + MESES_NOMBRES[mesStr].slice(0, 3),
        fecha,
        vci: parseMoney(row['Venta con Imp.']),
        ef: parseMoney(row.Efectivo),
        tar: parseMoney(row.Tarjeta),
        ot: parseMoney(row.Otros),
        prop: Math.abs(parseMoney(row['Propinas Pagadas'])),
        com: parseInt(row['No. de Comensales'] || '0') || 0,
      });
    });
    // Sort days within each month
    Object.values(map).forEach(m => m.days.sort((a, b) => a.fecha.getTime() - b.fecha.getTime()));
    return map;
  }, [cortesCaja]);

  // Sorted month keys
  const sortedMonths = useMemo(() =>
    Object.keys(byMonth).sort((a, b) => {
      const [mA, yA] = a.split('_'); const [mB, yB] = b.split('_');
      if (yA !== yB) return parseInt(yA) - parseInt(yB);
      return MESES_ORDER.indexOf(mA) - MESES_ORDER.indexOf(mB);
    }).filter(k => {
      const [mes] = k.split('_');
      return MESES_ORDER.indexOf(mes) >= 0;
    })
  , [byMonth]);

  // Default to latest month
  const activeMesKey = mesKey || sortedMonths[sortedMonths.length - 1] || '';

  // Aggregate commissions from Ingresos — DINÁMICO: detecta plataformas automáticamente
  // por comisión > 0, sin hardcodear ningún nombre
  const comsByMonth = useMemo(() => {
    const map: Record<string, Record<string, { b: number; c: number }>> = {};
    ingresos.forEach(row => {
      const fuente = (row['Fuente / Cliente'] || '').trim();
      if (!fuente) return;
      const com = parseMoney(row['Comisión / Retención (-)']);
      if (com <= 0) return; // Solo plataformas que cobran comisión
      const fecha = parseFecha(row.Fecha);
      if (!fecha) return;
      const parts = row.Fecha.toLowerCase().trim().split(/[\s,]+/);
      const mesStr = parts.find(p => MESES_NOMBRES[p]);
      if (!mesStr) return;
      const key = `${mesStr}_${fecha.getFullYear()}`;
      if (!map[key]) map[key] = {};
      if (!map[key][fuente]) map[key][fuente] = { b: 0, c: 0 };
      map[key][fuente].b += parseMoney(row['Monto Bruto (+)']);
      map[key][fuente].c += com;
    });
    return map;
  }, [ingresos]);

  // Monthly summary for charts
  const monthlySummary = useMemo(() =>
    sortedMonths.map(k => {
      const [mes] = k.split('_');
      const days = byMonth[k]?.days || [];
      const tot = days.reduce((a, r) => ({ vci: a.vci + r.vci, ef: a.ef + r.ef, tar: a.tar + r.tar, ot: a.ot + r.ot, prop: a.prop + r.prop, com: a.com + r.com }), { vci: 0, ef: 0, tar: 0, ot: 0, prop: 0, com: 0 });
      return { key: k, label: MESES_NOMBRES[mes] || mes, ...tot, dias: days.length };
    })
  , [sortedMonths, byMonth]);

  // Current month data
  const cur = useMemo(() => {
    if (activeMesKey === 'ytd') {
      const allDays = sortedMonths.flatMap(k => byMonth[k]?.days || []);
      const tot = allDays.reduce((a, r) => ({ vci: a.vci + r.vci, ef: a.ef + r.ef, tar: a.tar + r.tar, ot: a.ot + r.ot, prop: a.prop + r.prop, com: a.com + r.com }), { vci: 0, ef: 0, tar: 0, ot: 0, prop: 0, com: 0 });
      return { days: allDays, ...tot, dias: allDays.length, label: 'Acumulado YTD' };
    }
    const days = byMonth[activeMesKey]?.days || [];
    const tot = days.reduce((a, r) => ({ vci: a.vci + r.vci, ef: a.ef + r.ef, tar: a.tar + r.tar, ot: a.ot + r.ot, prop: a.prop + r.prop, com: a.com + r.com }), { vci: 0, ef: 0, tar: 0, ot: 0, prop: 0, com: 0 });
    const [mes] = activeMesKey.split('_');
    return { days, ...tot, dias: days.length, label: MESES_NOMBRES[mes] || mes };
  }, [activeMesKey, byMonth, sortedMonths]);

  // Commissions for current view — DINÁMICO: acumula por nombre de plataforma
  const curComs = useMemo(() => {
    if (activeMesKey === 'ytd') {
      const merged: Record<string, { b: number; c: number }> = {};
      sortedMonths.forEach(k => {
        const c = comsByMonth[k];
        if (!c) return;
        Object.entries(c).forEach(([plat, vals]) => {
          if (!merged[plat]) merged[plat] = { b: 0, c: 0 };
          merged[plat].b += vals.b;
          merged[plat].c += vals.c;
        });
      });
      return merged;
    }
    return comsByMonth[activeMesKey] || {};
  }, [activeMesKey, comsByMonth, sortedMonths]);

  const comedor = cur.tar + cur.ef;
  const plata = cur.ot;
  const totPay = comedor + plata;
  const comP = totPay > 0 ? Math.round(comedor / totPay * 100) : 0;
  const pltP = 100 - comP;
  const ticket = cur.com > 0 ? Math.round(cur.vci / cur.com) : 0;

  const platformRows = Object.entries(curComs).map(([name, vals]) => ({
    name,
    b: vals.b,
    c: vals.c,
    p: vals.b > 0 ? Math.round(vals.c / vals.b * 100) : 0,
  })).filter(r => r.b > 0).sort((a, b) => b.b - a.b);

  const tb = platformRows.reduce((s, r) => s + r.b, 0);
  const tc = platformRows.reduce((s, r) => s + r.c, 0);
  const tn = tb - tc;
  const totP = tb > 0 ? Math.round(tc / tb * 100) : 0;
  const platformsAbusivas = platformRows.filter(r => r.p > 70);

  // Max for bar charts
  const maxVCI = Math.max(...monthlySummary.map(m => m.vci), 1);
  const maxCom = Math.max(...monthlySummary.map(m => m.com), 1);
  const maxProp = Math.max(...monthlySummary.map(m => m.prop), 1);
  const maxDay = Math.max(...(cur.days?.map(d => d.vci) || [1]), 1);

  // PE and Objetivo with IVA
  const PE_IVA = 405000;
  const OBJ_IVA = 445000;
  const MIN_SCALE = 380000;
const maxBarRef = Math.max(maxVCI, OBJ_IVA + 20000);

  return (
    <div className="space-y-4 pb-6">
      {/* HEADER + SELECTOR */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Cortes de Caja</h2>
          <p className="text-xs text-gray-500">Venta con IVA · Efectivo · Tarjeta · Plataformas · Propinas · Comensales</p>
        </div>
        <select
          value={activeMesKey}
          onChange={e => setMesKey(e.target.value)}
          className="ml-auto text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="ytd">📊 Acumulado YTD</option>
          {sortedMonths.map(k => {
            const [mes, anio] = k.split('_');
            return <option key={k} value={k}>📅 {MESES_NOMBRES[mes]} {anio}</option>;
          })}
        </select>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500 col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Venta con IVA</p>
          <p className="text-3xl font-extrabold text-blue-700 leading-none">{MXN(cur.vci)}</p>
          <p className="text-xs text-gray-400 mt-1">{cur.label}{cur.dias < 28 && activeMesKey !== 'ytd' ? ` · ${cur.dias} días` : ''}</p>
        </div>
        {[
          { label: 'Ticket promedio', val: MXN(ticket), sub: 'venta c/IVA ÷ comensales' },
          { label: 'Comensales', val: cur.com.toLocaleString('es-MX'), sub: `~${cur.dias > 0 ? Math.round(cur.com / cur.dias) : 0} por día` },
          { label: 'Venta diaria prom.', val: MXN(cur.dias > 0 ? Math.round(cur.vci / cur.dias) : 0), sub: `${cur.dias} días operados` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{k.label}</p>
            <p className="text-xl font-bold text-gray-900">{k.val}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* DISTRIBUCIÓN + DIARIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut + split */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Distribución — Plataformas vs Comedor</p>
          <div className="flex items-center gap-4">
            {/* Simple donut SVG */}
            <div className="relative flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="46" fill="none" stroke="#e2e8f0" strokeWidth="20"/>
                {/* Comedor arc */}
                <circle cx="60" cy="60" r="46" fill="none" stroke="#3b82f6" strokeWidth="20"
                  strokeDasharray={`${comP / 100 * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
                  transform="rotate(-90 60 60)"/>
                {/* Plataformas arc */}
                <circle cx="60" cy="60" r="46" fill="none" stroke="#ec4899" strokeWidth="20"
                  strokeDasharray={`${pltP / 100 * 2 * Math.PI * 46} ${2 * Math.PI * 46}`}
                  strokeDashoffset={-(comP / 100 * 2 * Math.PI * 46)}
                  transform="rotate(-90 60 60)"/>
                <text x="60" y="56" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1e293b">{MXN(cur.vci)}</text>
                <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#94a3b8">total c/IVA</text>
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-700 uppercase mb-1">🍽️ Comedor</p>
                <p className="text-2xl font-extrabold text-blue-700">{comP}% <span className="text-sm font-semibold text-blue-500">{MXN(comedor)}</span></p>
                <p className="text-xs text-gray-500 mt-1">Tarjeta: {MXN(cur.tar)} · Efectivo: {MXN(cur.ef)}</p>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <p className="text-xs font-bold text-pink-700 uppercase mb-1">📱 Plataformas</p>
                <p className="text-2xl font-extrabold text-pink-700">{pltP}% <span className="text-sm font-semibold text-pink-500">{MXN(plata)}</span></p>
                <p className="text-xs text-gray-500 mt-1">{platformRows.map(r => r.name).join(' + ') || 'Sin datos'}</p>
              </div>
            </div>
          </div>

          {/* Commissions table */}
          {tb > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Detalle de comisiones pagadas</p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-pink-50">
                    <th className="text-left p-2 text-pink-700 font-bold">Plataforma</th>
                    <th className="text-right p-2 text-pink-700 font-bold">Vendieron</th>
                    <th className="text-right p-2 text-pink-700 font-bold">Cobr.</th>
                    <th className="text-right p-2 text-pink-700 font-bold">%</th>
                    <th className="text-right p-2 text-pink-700 font-bold">Recibiste</th>
                  </tr>
                </thead>
                <tbody>
                  {platformRows.map(r => (
                    <tr key={r.name} className="border-b border-pink-50">
                      <td className="p-2">{r.name}</td>
                      <td className="p-2 text-right">{MXN(r.b)}</td>
                      <td className="p-2 text-right">{MXN(r.c)}</td>
                      <td className="p-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${r.p > 60 ? 'bg-red-100 text-red-700' : r.p > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{r.p}%</span>
                      </td>
                      <td className="p-2 text-right font-bold">{MXN(r.b - r.c)}</td>
                    </tr>
                  ))}
                  <tr className="bg-pink-50 font-bold text-pink-800">
                    <td className="p-2">TOTAL</td>
                    <td className="p-2 text-right">{MXN(tb)}</td>
                    <td className="p-2 text-right">{MXN(tc)}</td>
                    <td className="p-2 text-right"><span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">{totP}%</span></td>
                    <td className="p-2 text-right">{MXN(tn)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2.5 text-xs text-green-800">
                💰 Vendieron <strong>{MXN(tb)}</strong> a tus clientes · Se quedaron con <strong>{MXN(tc)} ({totP}%)</strong> · Te depositaron <strong>{MXN(tn)}</strong>
              </div>
              {platformsAbusivas.map(r => (
                <div key={r.name} className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-800">
                  ⚠️ <strong>{r.name} cobra {r.p}%</strong> — de cada $100 que vende un cliente, solo recibes ${100 - r.p}. Considera pausar o subir precios al menos 80%.
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily bars */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ventas por día — {cur.label}</p>
          <div className="flex gap-3 text-xs text-gray-500 mb-3 flex-wrap">
            <span><span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-sm mr-1 align-middle"/>≥$20k</span>
            <span><span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm mr-1 align-middle"/>$12k–$20k</span>
            <span><span className="inline-block w-2.5 h-2.5 bg-yellow-500 rounded-sm mr-1 align-middle"/>&lt;$12k</span>
            <span className="text-gray-400">· Número = comensales</span>
          </div>
          <div className="overflow-y-auto max-h-80 space-y-1 pr-1">
            {cur.days?.map((r, i) => {
              const pct = Math.max(5, Math.round(r.vci / maxDay * 100));
              const color = r.vci >= 20000 ? '#10b981' : r.vci >= 12000 ? '#3b82f6' : '#f59e0b';
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-[72px] text-right shrink-0">
                    <span className="text-[9px] text-gray-400 font-medium">{getDow(r.fecha)} </span>
                    <span className="text-[10px] text-gray-500 font-medium">{r.d}</span>
                  </div>
                  <div className="flex-1 h-[18px] bg-gray-100 rounded-sm overflow-hidden">
                    <div style={{ width: `${pct}%`, background: color }} className="h-full rounded-sm flex items-center pl-1.5 min-w-[4px]">
                      <span className="text-[9px] font-bold text-white whitespace-nowrap">{r.com} com.</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 w-16 text-right shrink-0">{MXN(r.vci)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DOW ANALYSIS */}
      <DowAnalysis days={sortedMonths.flatMap(k => byMonth[k]?.days || [])} />

      {/* VENTAS MENSUALES VERTICAL */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Ventas por mes — 2026 (Venta con IVA)</p>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-3 min-w-[360px] relative" style={{ height: '320px', paddingBottom: '44px', paddingTop: '30px' }}>
            {/* Reference lines */}
            {[{ val: PE_IVA, color: '#ef4444', label: 'PE $405k' }, { val: OBJ_IVA, color: '#10b981', label: 'Obj $445k' }].map(ref => {
              const btm = Math.round((ref.val - MIN_SCALE) / (maxBarRef - MIN_SCALE) * 246) + 44;
              return (
                <div key={ref.label} className="absolute left-0 right-0 flex items-center pointer-events-none" style={{ bottom: `${btm}px` }}>
                  <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: ref.color }}/>
                  <span className="text-[10px] font-bold ml-1 whitespace-nowrap" style={{ color: ref.color }}>{ref.label}</span>
                </div>
              );
            })}
            {monthlySummary.map(m => {
              const barH = m.vci < MIN_SCALE ? 6 : Math.max(6, Math.round((m.vci - MIN_SCALE) / (maxBarRef - MIN_SCALE) * 246));
              const isCur = m.key === activeMesKey || activeMesKey === 'ytd';
              const isPartial = m.dias < 20;
              const perfColor = m.vci >= OBJ_IVA ? '#10b981' : m.vci >= PE_IVA ? '#3b82f6' : '#f59e0b';
              const barColor = isCur && activeMesKey !== 'ytd' ? '#f97316' : perfColor;
              const opacity = !isCur && activeMesKey !== 'ytd' ? 0.25 : 1;
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center justify-end min-w-[56px]" style={{ height: '246px' }}>
                  <p className="font-extrabold text-center mb-1.5 whitespace-nowrap leading-none"
                    style={{ color: barColor, opacity, fontSize: isCur && activeMesKey !== 'ytd' ? '15px' : '12px', fontWeight: isCur && activeMesKey !== 'ytd' ? 900 : 700 }}>
                    {MXNk(m.vci)}
                  </p>
                  <div
                    className="w-4/5 rounded-t-md transition-all duration-300"
                    style={{
                      height: `${barH}px`,
                      background: isPartial ? `repeating-linear-gradient(45deg,${barColor}66,${barColor}66 5px,${barColor}aa 5px,${barColor}aa 10px)` : barColor,
                      opacity,
                      outline: isCur && activeMesKey !== 'ytd' ? `2.5px solid #ea580c` : 'none',
                      boxShadow: isCur && activeMesKey !== 'ytd' ? '0 4px 24px rgba(249,115,22,0.4)' : 'none',
                    }}
                  />
                  <p className="text-xs text-center mt-1.5 font-semibold leading-tight"
                    style={{ color: isCur && activeMesKey !== 'ytd' ? '#ea580c' : '#64748b', opacity: opacity < 0.5 ? 0.45 : 1 }}>
                    {m.label}{isPartial ? ' ⭐' : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-400 mt-1 flex-wrap">
          <span><span className="inline-block w-4 border-t-2 border-dashed border-red-400 align-middle mr-1"/>PE $405k</span>
          <span><span className="inline-block w-4 border-t-2 border-dashed border-green-400 align-middle mr-1"/>Objetivo ~$377k</span>
          <span className="text-gray-300">⭐ Mes parcial</span>
        </div>
      </div>

      {/* COMENSALES + PROPINAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Comensales por mes — 2026</p>
          <div className="space-y-2">
            {monthlySummary.map(m => {
              const pct = Math.round(m.com / maxCom * 100);
              const isCur = m.key === activeMesKey || activeMesKey === 'ytd';
              const color = m.com >= 1100 ? '#10b981' : m.com >= 990 ? '#3b82f6' : '#f59e0b';
              return (
                <div key={m.key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold w-16 shrink-0">{m.label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded relative overflow-hidden">
                    <div style={{ width: `${pct}%`, background: color, opacity: isCur && activeMesKey !== 'ytd' ? 1 : 0.45 }} className="h-full rounded flex items-center pl-2">
                      <span className="text-[11px] font-bold text-white">{m.com}</span>
                    </div>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-70" style={{ left: `${Math.round(990 / maxCom * 100)}%` }}/>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-green-400 opacity-70" style={{ left: `${Math.round(1100 / maxCom * 100)}%` }}/>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-20 text-right">{m.com.toLocaleString()} com.</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2"><span className="text-red-400">|</span> PE: 990 · <span className="text-green-400">|</span> Objetivo: 1,100</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Propinas pagadas por mes — 2026</p>
          <div className="space-y-2">
            {monthlySummary.map(m => {
              const pct = Math.round(m.prop / maxProp * 100);
              const isCur = m.key === activeMesKey || activeMesKey === 'ytd';
              return (
                <div key={m.key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold w-16 shrink-0">{m.label}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div style={{ width: `${pct}%`, background: '#8b5cf6', opacity: isCur && activeMesKey !== 'ytd' ? 1 : 0.45 }} className="h-full rounded"/>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-20 text-right">{MXN(m.prop)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">Las propinas se pagan a los meseros e impactan la línea de nómina.</p>
        </div>
      </div>
    </div>
  );
}

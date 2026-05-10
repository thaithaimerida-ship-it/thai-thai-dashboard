import 'server-only';

import { readSheetRows, type SheetRows } from '../google-sheets-server';
import { isMonthClosed, parsePeriodId, type Period } from './period';
import { FINANCIAL_AI_TARGETS } from './targets';
import { InsufficientFinancialDataError } from './errors';

const SHEETS = {
  ingresos: 'Ingresos_BD',
  gastos: 'Gastos_BD',
  cortesCaja: 'Cortes_de_Caja',
  estadoResultados: 'Estado de Resultados',
} as const;

const FOOD_COST_CATEGORIAS = new Set(['insumos alimentos', 'insumos bebidas']);
const ANTI_INVENCION_NOTA =
  'No afirmar causas operativas sin datos de horarios, staffing, mermas, campanas, clima o ventas por producto.';
const FOOD_COST_LIMITACION =
  'Desechables no incluidos en food cost porque el dashboard actual calcula food cost con Insumos Alimentos e Insumos Bebidas.';

type SheetObject = Record<string, string>;
type NullableNumber = number | null;

interface PeriodWindow {
  start: Date;
  end: Date;
  label: string;
}

interface SourceRows {
  ingresos: SheetObject[];
  gastos: SheetObject[];
  cortesCaja: SheetObject[];
  estadoResultados: SheetObject[];
  estadoResultadosDisponible: boolean;
}

interface CanalAgg {
  canal: string;
  bruto: number;
  comision: number;
  neto: number;
  porcentaje_comision: NullableNumber;
}

interface ComparativoPayload {
  periodo_anterior: string;
  ingresos_brutos: number;
  comisiones: number;
  ingresos_netos: number;
  gastos_totales: number;
  food_cost_pct: NullableNumber;
  labor_pct: NullableNumber;
  costo_primo_pct: NullableNumber;
  comensales: number;
  ticket_promedio: NullableNumber;
}

interface AggregatePayload extends ComparativoPayload {
  ingresos_por_canal: CanalAgg[];
  venta_con_impuesto: number;
  impuesto_total: number;
  venta_neta_caja: number;
  ventas_por_metodo_pago: Record<string, number>;
  gastos_por_categoria: Record<string, number>;
  gastos_por_grupo_pl: Record<string, number>;
  food_cost_monto: number;
  labor_monto: number;
  resumen_financiero: {
    ingresos_brutos_financieros: number;
    comisiones_totales: number;
    ingresos_netos_financieros: number;
    meta_ventas_netas: number;
    punto_equilibrio: number;
    diferencia_vs_meta: number;
    diferencia_vs_punto_equilibrio: number;
    cumplimiento_meta_pct: NullableNumber;
    cumplimiento_pe_pct: NullableNumber;
  };
  rentabilidad: {
    food_cost_monto: number;
    food_cost_pct: NullableNumber;
    labor_monto: number;
    labor_pct: NullableNumber;
    costo_primo_monto: number;
    costo_primo_pct: NullableNumber;
    cash_yield_pct: NullableNumber;
    utilidad_neta: NullableNumber;
    datos_no_disponibles: string[];
  };
  caja_operativa: {
    venta_con_impuesto: number;
    impuesto_total: number;
    venta_neta_caja: number;
    comensales: number;
    ticket_promedio: NullableNumber;
    metodos_pago: Record<string, number>;
  };
  comisiones_canales: CanalAgg[];
}

export interface FinancialAIPayload {
  periodo: {
    id: string;
    tipo: 'monthly';
    anio: number;
    mes: number;
    estado_reporte: 'cerrado';
    locked: true;
    rango: {
      inicio: string;
      fin: string;
      etiqueta: string;
    };
  };
  targets: typeof FINANCIAL_AI_TARGETS;
  agregados: AggregatePayload & {
    comparativo_vs_mes_anterior: ComparativoPayload | null;
  };
  disponibilidad_datos: Record<string, boolean>;
  datos_no_disponibles: string[];
  limitaciones: string[];
  ingenieria_menu_disponible: false;
  causa_operativa_confirmada_disponible: false;
  nota: string;
}

function repairMojibake(value: string): string {
  return value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‘/g, 'Ñ');
}

export function normalizeText(value: string | null | undefined): string {
  return repairMojibake(String(value ?? ''))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function normalizeHeader(value: string | null | undefined): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, ' ');
}

export function parseMoney(value: string | null | undefined): number {
  if (value === null || value === undefined) return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  const isNegative = raw.includes('(') && raw.includes(')');
  const cleaned = raw.replace(/[$,\s()]/g, '');
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return 0;

  return isNegative ? -Math.abs(parsed) : parsed;
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const raw = repairMojibake(String(value).trim());
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return makeDate(Number(slash[3]), Number(slash[2]), Number(slash[1]));

  const months: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };
  const text = raw.match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+),?\s+(?:de\s+)?(\d{4})/i);
  if (text) {
    const month = months[normalizeText(text[2])];
    if (month) return makeDate(Number(text[3]), month, Number(text[1]));
  }

  return null;
}

export function rowToObject(headers: string[], row: string[]): SheetObject {
  return headers.reduce<SheetObject>((acc, header, index) => {
    acc[header] = row[index] ?? '';
    return acc;
  }, {});
}

function makeDate(year: number, month: number, day: number): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function getValue(row: SheetObject, aliases: string[]): string {
  const normalizedAliases = new Set(aliases.map(normalizeHeader));
  const found = Object.entries(row).find(([key]) => normalizedAliases.has(normalizeHeader(key)));
  return found?.[1] ?? '';
}

function mapRows(sheet: SheetRows): SheetObject[] {
  return sheet.rows.map((row) => rowToObject(sheet.headers, row));
}

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthLabel(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0);
}

function buildPeriodWindow(period: Period): PeriodWindow {
  if (!isMonthClosed(period.year, period.month)) {
    throw new InsufficientFinancialDataError(
      `El periodo mensual ${period.id} aun no esta cerrado`,
    );
  }

  return {
    start: new Date(period.year, period.month - 1, 1),
    end: endOfMonth(period.year, period.month),
    label: monthLabel(period.year, period.month),
  };
}

function previousMonthWindow(period: Period): PeriodWindow | null {
  const previousMonth = period.month === 1 ? 12 : period.month - 1;
  const previousYear = period.month === 1 ? period.year - 1 : period.year;

  return {
    start: new Date(previousYear, previousMonth - 1, 1),
    end: endOfMonth(previousYear, previousMonth),
    label: monthLabel(previousYear, previousMonth),
  };
}

function dateInWindow(date: Date, window: PeriodWindow): boolean {
  return date >= window.start && date <= window.end;
}

async function readOptionalSheet(sheetName: string): Promise<{
  rows: SheetObject[];
  available: boolean;
}> {
  try {
    const sheet = await readSheetRows(sheetName);
    return { rows: mapRows(sheet), available: sheet.headers.length > 0 };
  } catch {
    return { rows: [], available: false };
  }
}

async function readSourceRows(): Promise<SourceRows> {
  const [ingresosSheet, gastosSheet, cortesSheet, estadoResultados] = await Promise.all([
    readSheetRows(SHEETS.ingresos),
    readSheetRows(SHEETS.gastos),
    readSheetRows(SHEETS.cortesCaja),
    readOptionalSheet(SHEETS.estadoResultados),
  ]);

  return {
    ingresos: mapRows(ingresosSheet),
    gastos: mapRows(gastosSheet),
    cortesCaja: mapRows(cortesSheet),
    estadoResultados: estadoResultados.rows,
    estadoResultadosDisponible: estadoResultados.available,
  };
}

function sumRecord(target: Record<string, number>, key: string, amount: number): void {
  const normalizedKey = repairMojibake(key).trim() || 'Sin categoria';
  target[normalizedKey] = (target[normalizedKey] ?? 0) + amount;
}

function pct(part: number, total: number): NullableNumber {
  if (total === 0) return null;
  return Math.round((part / total) * 10000) / 100;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function ensureCanal(canales: Record<string, CanalAgg>, canal: string): CanalAgg {
  if (!canales[canal]) {
    canales[canal] = {
      canal,
      bruto: 0,
      comision: 0,
      neto: 0,
      porcentaje_comision: null,
    };
  }

  return canales[canal];
}

function addPaymentMethod(
  target: Record<string, number>,
  label: string,
  amount: number,
): void {
  if (amount === 0) return;
  target[label] = (target[label] ?? 0) + amount;
}

function hasValidationColumn(row: SheetObject): boolean {
  return Object.keys(row).some((key) => normalizeHeader(key) === normalizeHeader('Validacion'));
}

function hasNonOkValidation(row: SheetObject): boolean {
  const value = normalizeText(getValue(row, ['Validacion', 'ValidaciÃ³n', 'ValidaciÃƒÂ³n']));
  if (!value) return false;
  return value !== 'ok' && value !== 'validado' && value !== 'validada';
}

export function aggregateWindow(
  sources: SourceRows,
  window: PeriodWindow,
  datosNoDisponibles: Set<string>,
  limitaciones: Set<string>,
): AggregatePayload {
  let validCorteDates = 0;
  let cortesInWindow = 0;
  let cortesWithValidationWarnings = 0;
  let ingresos_brutos = 0;
  let venta_con_impuesto = 0;
  let impuesto_total = 0;
  let venta_neta_caja = 0;
  let ingresos_netos = 0;
  let comensales = 0;
  const ventas_por_metodo_pago: Record<string, number> = {};

  if (sources.cortesCaja.length === 0) {
    datosNoDisponibles.add('Cortes_de_Caja');
    limitaciones.add(
      'Cortes_de_Caja no disponible; caja operativa, comensales y metodos de pago se tratan como no disponibles.',
    );
  }

  for (const row of sources.cortesCaja) {
    const date = parseDate(getValue(row, ['Fecha']));
    if (!date) continue;
    validCorteDates += 1;
    if (!dateInWindow(date, window)) continue;

    cortesInWindow += 1;
    const ventaNeta = parseMoney(getValue(row, ['Venta Neta']));
    const ventaConImpuesto = parseMoney(getValue(row, ['Venta con Imp.', 'Venta con Imp']));
    const impuesto = parseMoney(getValue(row, ['Impuesto Total']));
    const parsedComensales = Number.parseInt(getValue(row, ['No. de Comensales']), 10);

    venta_con_impuesto += ventaConImpuesto;
    venta_neta_caja += ventaNeta;
    impuesto_total += impuesto;
    if (Number.isFinite(parsedComensales)) comensales += parsedComensales;

    addPaymentMethod(ventas_por_metodo_pago, 'Efectivo', parseMoney(getValue(row, ['Efectivo'])));
    addPaymentMethod(ventas_por_metodo_pago, 'Tarjeta', parseMoney(getValue(row, ['Tarjeta'])));
    addPaymentMethod(ventas_por_metodo_pago, 'Otros', parseMoney(getValue(row, ['Otros'])));
    addPaymentMethod(
      ventas_por_metodo_pago,
      'Propinas pagadas',
      parseMoney(getValue(row, ['Propinas Pagadas'])),
    );

    if (hasValidationColumn(row) && hasNonOkValidation(row)) {
      cortesWithValidationWarnings += 1;
    }
  }

  if (sources.cortesCaja.length > 0 && validCorteDates === 0) {
    datosNoDisponibles.add('caja_operativa');
    limitaciones.add('Cortes_de_Caja no tiene fechas validas; caja operativa no disponible.');
  }
  if (sources.cortesCaja.length > 0 && cortesInWindow === 0) {
    datosNoDisponibles.add('caja_operativa');
    limitaciones.add(
      `Cortes_de_Caja no tiene registros para ${window.label}; caja operativa no disponible.`,
    );
  }

  if (cortesWithValidationWarnings > 0) {
    limitaciones.add(
      `${cortesWithValidationWarnings} corte(s) de caja del periodo tienen validacion distinta de OK; se incluyeron sin bloquear el analisis.`,
    );
  }

  let validIngresoDates = 0;
  let ingresosRowsInWindow = 0;
  let comisiones = 0;
  const canales: Record<string, CanalAgg> = {};

  for (const row of sources.ingresos) {
    const date = parseDate(getValue(row, ['Fecha']));
    if (!date) continue;
    validIngresoDates += 1;
    if (!dateInWindow(date, window)) continue;
    ingresosRowsInWindow += 1;

    const canal = getValue(row, ['Fuente / Cliente']) || 'Otros';
    const bruto = parseMoney(getValue(row, ['Monto Bruto (+)']));
    const comision = parseMoney(
      getValue(row, [
        'Comision / Retencion (-)',
        'Comisión / Retención (-)',
        'ComisiÃ³n / RetenciÃ³n (-)',
      ]),
    );
    const neto = parseMoney(
      getValue(row, ['Monto Neto (Calculo)', 'Monto Neto (Cálculo)', 'Monto Neto (CÃ¡lculo)']),
    );

    comisiones += Math.abs(comision);
    ingresos_brutos += bruto;
    ingresos_netos += neto;
    const canalAgg = ensureCanal(canales, canal);
    canalAgg.bruto += bruto;
    canalAgg.comision += Math.abs(comision);
    canalAgg.neto += neto;
  }

  if (validIngresoDates === 0) {
    datosNoDisponibles.add('Ingresos_BD');
    throw new InsufficientFinancialDataError(
      'Ingresos_BD no tiene fechas validas; rentabilidad financiera no disponible.',
    );
  } else if (ingresosRowsInWindow === 0) {
    datosNoDisponibles.add('rentabilidad_financiera');
    throw new InsufficientFinancialDataError(
      `Ingresos_BD no tiene ventas financieras para ${window.label}; no se usa Cortes_de_Caja como sustituto de rentabilidad.`,
    );
  } else if (ingresos_brutos === 0 && ingresos_netos === 0) {
    datosNoDisponibles.add('rentabilidad_financiera');
    throw new InsufficientFinancialDataError(
      `Ingresos_BD no tiene montos financieros validos para ${window.label}; no se usa Cortes_de_Caja como sustituto de rentabilidad.`,
    );
  }

  let gastos_totales = 0;
  let food_cost_monto = 0;
  let labor_monto = 0;
  let impuestos_financiamientos = 0;
  const gastos_por_categoria: Record<string, number> = {};
  const gastos_por_grupo_pl: Record<string, number> = {};

  if (sources.gastos.length === 0) {
    datosNoDisponibles.add('Gastos_BD');
    limitaciones.add('No hay gastos disponibles para el periodo.');
  }

  for (const row of sources.gastos) {
    const date = parseDate(getValue(row, ['Fecha']));
    if (!date || !dateInWindow(date, window)) continue;

    const categoria = getValue(row, ['Categoria', 'Categoría', 'CategorÃ­a']);
    const grupoPl = getValue(row, ['Grupo P&L']);
    const grupoNorm = normalizeText(grupoPl);
    const categoriaNorm = normalizeText(categoria);
    const total = -parseMoney(getValue(row, ['Total']));

    sumRecord(gastos_por_categoria, categoria, Math.abs(total));
    sumRecord(gastos_por_grupo_pl, grupoPl, Math.abs(total));

    if (categoriaNorm === 'impuestos sat' || categoriaNorm === 'prestamo bbva') {
      impuestos_financiamientos += total;
    }

    if (grupoNorm !== 'costo de venta' && grupoNorm !== 'gastos operativos') continue;

    gastos_totales += total;
    if (FOOD_COST_CATEGORIAS.has(categoriaNorm)) food_cost_monto += total;
    if (categoriaNorm === 'nomina') labor_monto += total;
  }

  if (comensales === 0) {
    datosNoDisponibles.add('ticket_promedio');
    limitaciones.add('Ticket promedio no disponible porque no hay comensales reales en el periodo.');
  }

  const ingresos_por_canal = Object.values(canales)
    .map((canal) => ({
      ...canal,
      porcentaje_comision: pct(canal.comision, canal.bruto),
    }))
    .sort((a, b) => b.bruto - a.bruto);

  const food_cost_pct = pct(food_cost_monto, ingresos_netos);
  const labor_pct = pct(labor_monto, ingresos_netos);
  const costo_primo_monto = food_cost_monto + labor_monto;
  const costo_primo_pct =
    food_cost_pct === null && labor_pct === null
      ? null
      : (food_cost_pct ?? 0) + (labor_pct ?? 0);
  const utilidad_neta = ingresos_netos - gastos_totales - impuestos_financiamientos;
  const cash_yield_pct = pct(utilidad_neta, ingresos_netos);
  const ticket_promedio =
    comensales > 0 ? Math.round((venta_con_impuesto / comensales) * 100) / 100 : null;
  const rentabilidadDatosNoDisponibles: string[] = [];

  if (sources.gastos.length === 0) {
    rentabilidadDatosNoDisponibles.push('Gastos_BD');
  }
  if (cash_yield_pct === null) {
    rentabilidadDatosNoDisponibles.push('cash_yield_pct');
  }

  const resumen_financiero = {
    ingresos_brutos_financieros: roundMoney(ingresos_brutos),
    comisiones_totales: roundMoney(comisiones),
    ingresos_netos_financieros: roundMoney(ingresos_netos),
    meta_ventas_netas: FINANCIAL_AI_TARGETS.VENTAS_OBJETIVO_MENSUAL_MXN,
    punto_equilibrio: FINANCIAL_AI_TARGETS.PE_MENSUAL_MXN,
    diferencia_vs_meta: roundMoney(
      ingresos_netos - FINANCIAL_AI_TARGETS.VENTAS_OBJETIVO_MENSUAL_MXN,
    ),
    diferencia_vs_punto_equilibrio: roundMoney(
      ingresos_netos - FINANCIAL_AI_TARGETS.PE_MENSUAL_MXN,
    ),
    cumplimiento_meta_pct: pct(
      ingresos_netos,
      FINANCIAL_AI_TARGETS.VENTAS_OBJETIVO_MENSUAL_MXN,
    ),
    cumplimiento_pe_pct: pct(ingresos_netos, FINANCIAL_AI_TARGETS.PE_MENSUAL_MXN),
  };
  const rentabilidad = {
    food_cost_monto: roundMoney(food_cost_monto),
    food_cost_pct,
    labor_monto: roundMoney(labor_monto),
    labor_pct,
    costo_primo_monto: roundMoney(costo_primo_monto),
    costo_primo_pct,
    cash_yield_pct,
    utilidad_neta: roundMoney(utilidad_neta),
    datos_no_disponibles: rentabilidadDatosNoDisponibles,
  };
  const caja_operativa = {
    venta_con_impuesto: roundMoney(venta_con_impuesto),
    impuesto_total: roundMoney(impuesto_total),
    venta_neta_caja: roundMoney(venta_neta_caja),
    comensales,
    ticket_promedio,
    metodos_pago: ventas_por_metodo_pago,
  };

  return {
    periodo_anterior: window.label,
    ingresos_brutos,
    comisiones,
    ingresos_netos,
    ingresos_por_canal,
    venta_con_impuesto,
    impuesto_total,
    venta_neta_caja,
    ventas_por_metodo_pago,
    gastos_totales,
    gastos_por_categoria,
    gastos_por_grupo_pl,
    food_cost_monto,
    food_cost_pct,
    labor_monto,
    labor_pct,
    costo_primo_pct,
    comensales,
    ticket_promedio,
    resumen_financiero,
    rentabilidad,
    caja_operativa,
    comisiones_canales: ingresos_por_canal,
  };
}

function tryBuildComparativo(sources: SourceRows, window: PeriodWindow | null): ComparativoPayload | null {
  if (window === null) return null;

  try {
    return aggregateWindow(sources, window, new Set<string>(), new Set<string>());
  } catch (error) {
    if (error instanceof InsufficientFinancialDataError) return null;
    throw error;
  }
}

export async function buildFinancialAIPayload(periodId: string): Promise<FinancialAIPayload> {
  const parsed = parsePeriodId(periodId);
  if (!parsed.ok) {
    throw new InsufficientFinancialDataError(`Periodo invalido: ${parsed.error}`);
  }

  const period = parsed.period;
  const window = buildPeriodWindow(period);
  const sources = await readSourceRows();
  const datosNoDisponibles = new Set<string>();
  const limitaciones = new Set<string>([FOOD_COST_LIMITACION]);

  if (!sources.estadoResultadosDisponible || sources.estadoResultados.length === 0) {
    datosNoDisponibles.add(SHEETS.estadoResultados);
    limitaciones.add('Estado de Resultados no disponible o sin estructura confiable.');
  }

  datosNoDisponibles.add('ventas_por_producto');
  datosNoDisponibles.add('horarios');
  datosNoDisponibles.add('staffing');
  datosNoDisponibles.add('mermas');
  datosNoDisponibles.add('campanas');
  datosNoDisponibles.add('clima');

  const aggregate = aggregateWindow(sources, window, datosNoDisponibles, limitaciones);
  const comparativo = tryBuildComparativo(sources, previousMonthWindow(period));

  return {
    periodo: {
      id: period.id,
      tipo: 'monthly',
      anio: period.year,
      mes: period.month,
      estado_reporte: 'cerrado',
      locked: true,
      rango: {
        inicio: isoDate(window.start),
        fin: isoDate(window.end),
        etiqueta: window.label,
      },
    },
    targets: FINANCIAL_AI_TARGETS,
    agregados: {
      ...aggregate,
      comparativo_vs_mes_anterior: comparativo,
    },
    disponibilidad_datos: {
      ingresos_bd: sources.ingresos.length > 0,
      gastos_bd: sources.gastos.length > 0,
      cortes_de_caja: sources.cortesCaja.length > 0,
      estado_de_resultados: sources.estadoResultadosDisponible,
      ingenieria_menu: false,
      causas_operativas_confirmadas: false,
    },
    datos_no_disponibles: Array.from(datosNoDisponibles).sort(),
    limitaciones: Array.from(limitaciones),
    ingenieria_menu_disponible: false,
    causa_operativa_confirmada_disponible: false,
    nota: ANTI_INVENCION_NOTA,
  };
}

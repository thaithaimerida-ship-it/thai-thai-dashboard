'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface GastoRow {
  Fecha: string;
  Proveedor: string;
  RFC: string;
  Descripción: string;
  Cantidad: string;
  'P. Unitario': string;
  Descuento: string;
  Impuestos: string;
  Total: string;
  Categoría: string;
  'Grupo P&L': string;
  Origen: string;
  'Link de Factura': string;
  UUID: string;
  Procesado_En: string;
}

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

interface SheetsResponse {
  sheet: string;
  headers: string[];
  totalRows: number;
  data: IngresoRow[] | GastoRow[] | CorteCajaRow[];
}

// Parsear valor monetario de forma robusta
// Soporta: $7,050.60 | 7,050.60 | ($1,234.00) → negativo | valores vacíos
export function parseMoney(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  
  const str = String(value).trim();
  if (!str) return 0;
  
  // Detectar si es negativo por paréntesis: ($1,234.00)
  const esNegativo = str.includes('(') && str.includes(')');
  
  // Limpiar: quitar $, comas, espacios, paréntesis
  const cleaned = str.replace(/[$,\s()]/g, '');
  
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  
  return esNegativo ? -num : num;
}

// Parsear fecha de forma robusta
// Soporta múltiples formatos:
// - "1 enero, 2026" | "1 de enero de 2026"
// - "01/02/2026" | "2026-02-01"
// - Meses con/sin acentos
export function parseFecha(fechaStr: string | null | undefined): Date | null {
  if (!fechaStr) return null;
  
  const str = String(fechaStr).trim();
  if (!str) return null;
  
  const meses: Record<string, number> = {
    'enero': 0, 'enero': 0,
    'febrero': 1, 'febrero': 1,
    'marzo': 2, 'marzo': 2,
    'abril': 3, 'abril': 3,
    'mayo': 4, 
    'junio': 5, 
    'julio': 6, 
    'agosto': 7, 
    'septiembre': 8, 'septiembre': 8,
    'octubre': 9, 'octubre': 9,
    'noviembre': 10, 'noviembre': 10,
    'diciembre': 11, 'diciembre': 11
  };
  
  // Formato 1: "1 enero, 2026" o "1 de enero de 2026"
  const matchTexto = str.match(/(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?,?\s*(\d{4})/i);
  if (matchTexto) {
    const dia = parseInt(matchTexto[1]);
    const mesNombre = matchTexto[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const año = parseInt(matchTexto[3]);
    const mes = meses[mesNombre];
    if (mes !== undefined) {
      return new Date(año, mes, dia);
    }
  }
  
  // Formato 2: "01/02/2026" (DD/MM/YYYY)
  const matchSlash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (matchSlash) {
    const dia = parseInt(matchSlash[1]);
    const mes = parseInt(matchSlash[2]) - 1;
    const año = parseInt(matchSlash[3]);
    return new Date(año, mes, dia);
  }
  
  // Formato 3: "2026-02-01" (YYYY-MM-DD)
  const matchISO = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchISO) {
    const año = parseInt(matchISO[1]);
    const mes = parseInt(matchISO[2]) - 1;
    const dia = parseInt(matchISO[3]);
    return new Date(año, mes, dia);
  }
  
  // Formato 4: Intento genérico con mes en español
  const matchGenerico = str.match(/(\d{1,2})\s+(\w+),?\s*(\d{4})/i);
  if (matchGenerico) {
    const dia = parseInt(matchGenerico[1]);
    const mesNombre = matchGenerico[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const año = parseInt(matchGenerico[3]);
    const mes = meses[mesNombre];
    if (mes !== undefined) {
      return new Date(año, mes, dia);
    }
  }
  
  // Si no se pudo parsear, registrar y retornar null
  console.warn(`[parseFecha] No se pudo parsear: "${fechaStr}"`);
  return null;
}

// Obtener mes/año de una fecha
export function getMesAnio(fecha: Date): string {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Semana ISO 8601 (lunes inicio; semana 1 = la que contiene el primer jueves).
// key = "2026-W20" (ordenable, usa el año-ISO que puede diferir del calendario
// en fin/inicio de año). label = "Sem 20 · 12–18 may" (rango lun–dom).
// Se trabaja en UTC para evitar desfaces por zona horaria.
export function getSemanaISO(fecha: Date): { key: string; label: string } {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Lunes=0 ... Domingo=6

  // Jueves de la semana ISO de esta fecha → define el año-ISO
  const jueves = new Date(d);
  jueves.setUTCDate(d.getUTCDate() - dayNum + 3);
  const anioISO = jueves.getUTCFullYear();

  // Jueves de la semana 1 (la que contiene el 4 de enero)
  const primerJueves = new Date(Date.UTC(anioISO, 0, 4));
  const pjDayNum = (primerJueves.getUTCDay() + 6) % 7;
  primerJueves.setUTCDate(primerJueves.getUTCDate() - pjDayNum + 3);

  const semana = 1 + Math.round(
    (jueves.getTime() - primerJueves.getTime()) / (7 * 24 * 3600 * 1000)
  );

  // Lunes y domingo de la semana para el rango legible
  const lunes = new Date(d);
  lunes.setUTCDate(d.getUTCDate() - dayNum);
  const domingo = new Date(lunes);
  domingo.setUTCDate(lunes.getUTCDate() + 6);

  const key = `${anioISO}-W${String(semana).padStart(2, '0')}`;
  const dLun = lunes.getUTCDate();
  const dDom = domingo.getUTCDate();
  const mLun = MESES_CORTOS[lunes.getUTCMonth()];
  const mDom = MESES_CORTOS[domingo.getUTCMonth()];
  const rango = mLun === mDom
    ? `${dLun}–${dDom} ${mLun}`
    : `${dLun} ${mLun}–${dDom} ${mDom}`;

  return { key, label: `Sem ${semana} · ${rango}` };
}

function normalizeText(value: string | null | undefined): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const FOOD_COST_CATEGORIAS = new Set(['insumos alimentos', 'insumos bebidas']);

export function useGoogleSheets() {
  const [ingresos, setIngresos] = useState<IngresoRow[]>([]);
  const [gastos, setGastos] = useState<GastoRow[]>([]);
  const [cortesCaja, setCortesCaja] = useState<CorteCajaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataStatus, setDataStatus] = useState<{
    ingresos: 'ok' | 'vacio' | 'error';
    gastos: 'ok' | 'vacio' | 'error';
    cortesCaja: 'ok' | 'vacio' | 'error';
  }>({ ingresos: 'vacio', gastos: 'vacio', cortesCaja: 'vacio' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const status = { ingresos: 'vacio' as const, gastos: 'vacio' as const, cortesCaja: 'vacio' as const };
    
    try {
      // Hacer peticiones independientes (no fallar si una falla)
      const [ingresosRes, gastosRes, cortesRes] = await Promise.allSettled([
        fetch('/api/sheets?sheet=Ingresos_BD'),
        fetch('/api/sheets?sheet=Gastos_BD'),
        fetch('/api/sheets?sheet=Cortes_de_Caja')
      ]);

      // Procesar ingresos
      if (ingresosRes.status === 'fulfilled' && ingresosRes.value.ok) {
        const data = await ingresosRes.value.json();
        if (data.data && data.data.length > 0) {
          setIngresos(data.data);
          status.ingresos = 'ok';
        } else {
          status.ingresos = 'vacio';
        }
      } else {
        status.ingresos = 'error';
      }

      // Procesar gastos
      if (gastosRes.status === 'fulfilled' && gastosRes.value.ok) {
        const data = await gastosRes.value.json();
        if (data.data && data.data.length > 0) {
          setGastos(data.data);
          status.gastos = 'ok';
        } else {
          status.gastos = 'vacio';
        }
      } else {
        status.gastos = 'error';
      }

      // Procesar cortes de caja
      if (cortesRes.status === 'fulfilled' && cortesRes.value.ok) {
        const data = await cortesRes.value.json();
        if (data.data && data.data.length > 0) {
          setCortesCaja(data.data);
          status.cortesCaja = 'ok';
        } else {
          status.cortesCaja = 'vacio';
        }
      } else {
        status.cortesCaja = 'error';
      }

      setDataStatus(status);
      setLastUpdate(new Date());
      
      // Solo marcar error si TODAS fallaron
      if (status.ingresos === 'error' && status.gastos === 'error' && status.cortesCaja === 'error') {
        setError('No se pudieron cargar los datos de ninguna fuente');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ingresos,
    gastos,
    cortesCaja,
    loading,
    error,
    lastUpdate,
    dataStatus,
    refetch: fetchData
  };
}

// Procesar datos para el dashboard
export function procesarDatosDashboard(ingresos: IngresoRow[], gastos: GastoRow[], cortesCaja: CorteCajaRow[] = []) {
  // Agrupar por mes
  const datosPorMes: Record<string, {
    ventasBrutas: number;
    comisiones: number;
    ventasNetas: number;
    gastos: number;
    costoVenta: number;
    nomina: number;
    comensales: number;
    ingresos: IngresoRow[];
    gastosDetalle: GastoRow[];
  }> = {};

  // Procesar comensales desde Cortes_de_Caja
  const comensalesPorMes: Record<string, number> = {};
  cortesCaja.forEach(corte => {
    const fecha = parseFecha(corte.Fecha);
    if (!fecha) return;
    const mesKey = getMesAnio(fecha);
    const comensales = parseInt(corte['No. de Comensales']) || 0;
    comensalesPorMes[mesKey] = (comensalesPorMes[mesKey] || 0) + comensales;
  });

  // Procesar ingresos
  ingresos.forEach(ing => {
    const fecha = parseFecha(ing.Fecha);
    if (!fecha) return;
    
    const mesKey = getMesAnio(fecha);
    if (!datosPorMes[mesKey]) {
      datosPorMes[mesKey] = {
        ventasBrutas: 0, comisiones: 0, ventasNetas: 0, gastos: 0, 
        costoVenta: 0, nomina: 0, comensales: 0,
        ingresos: [], gastosDetalle: []
      };
    }
    
    const bruto = parseMoney(ing['Monto Bruto (+)']);
    const comision = parseMoney(ing['Comisión / Retención (-)']);
    const neto = parseMoney(ing['Monto Neto (Cálculo)']);
    
    datosPorMes[mesKey].ventasBrutas += bruto;
    datosPorMes[mesKey].comisiones += comision;
    datosPorMes[mesKey].ventasNetas += neto;
    datosPorMes[mesKey].ingresos.push(ing);
  });

  // Procesar gastos - Separar por tipo para Food Cost y Labor
  const impuestosFinanciamientosPorMes: Record<string, number> = {};
  
  gastos.forEach(gas => {
    const fecha = parseFecha(gas.Fecha);
    if (!fecha) return;
    
    const mesKey = getMesAnio(fecha);
    const grupoPLNormalizado = normalizeText(gas['Grupo P&L']);
    const categoriaNormalizada = normalizeText((gas as Record<string, string>)['Categoría'] || gas.Categoría);
    
    // Trackear Impuestos y Financiamientos (para Cash Yield)
    if (categoriaNormalizada === 'impuestos sat' || categoriaNormalizada === 'prestamo bbva') {
      const total = -parseMoney(gas.Total);
      impuestosFinanciamientosPorMes[mesKey] = (impuestosFinanciamientosPorMes[mesKey] || 0) + total;
      return; // No incluir en gastos operativos
    }
    
    // Solo incluir gastos operativos del negocio (basado en Grupo P&L)
    if (grupoPLNormalizado !== 'costo de venta' && grupoPLNormalizado !== 'gastos operativos') return;
    
    if (!datosPorMes[mesKey]) {
      datosPorMes[mesKey] = {
        ventasBrutas: 0, comisiones: 0, ventasNetas: 0, gastos: 0,
        costoVenta: 0, nomina: 0, comensales: 0,
        ingresos: [], gastosDetalle: []
      };
    }
    
    // Convierte gastos (normalmente negativos) a positivo y mantiene notas de crédito restando.
    const total = -parseMoney(gas.Total);
    datosPorMes[mesKey].gastos += total;
    datosPorMes[mesKey].gastosDetalle.push(gas);
    
    // Food Cost: SOLO Insumos Alimentos + Insumos Bebidas
    if (FOOD_COST_CATEGORIAS.has(categoriaNormalizada)) {
      datosPorMes[mesKey].costoVenta += total;
    }
    
    // Separar Nómina (Labor)
    if (categoriaNormalizada === 'nomina') {
      datosPorMes[mesKey].nomina += total;
    }
  });

  // Agregar comensales a cada mes
  Object.keys(comensalesPorMes).forEach(mesKey => {
    if (datosPorMes[mesKey]) {
      datosPorMes[mesKey].comensales = comensalesPorMes[mesKey];
    }
  });

  // Calcular KPIs por mes
  const mesesOrdenados = Object.keys(datosPorMes).sort((a, b) => {
    const [mesA, añoA] = a.split(' ');
    const [mesB, añoB] = b.split(' ');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return (parseInt(añoA) * 12 + meses.indexOf(mesA)) - (parseInt(añoB) * 12 + meses.indexOf(mesB));
  });

  const ventasMensuales = mesesOrdenados.map(mes => {
    const datos = datosPorMes[mes];
    const utilidadBruta = datos.ventasNetas - datos.gastos;
    const impuestosFin = impuestosFinanciamientosPorMes[mes] || 0;
    const utilidadNeta = utilidadBruta - impuestosFin;
    const margenBruto = datos.ventasNetas > 0 ? Math.round((utilidadBruta / datos.ventasNetas) * 100) : 0;
    const cashYield = datos.ventasNetas > 0 ? (utilidadNeta / datos.ventasNetas) * 100 : 0;
    const comensales = datos.comensales || comensalesPorMes[mes] || 0;
    
    // Calcular Food Cost, Labor y Costo Primo
    const costoVenta = datos.costoVenta || 0;
    const nomina = datos.nomina || 0;
    const foodCost = datos.ventasNetas > 0 ? Math.round((costoVenta / datos.ventasNetas) * 10000) / 100 : 0;
    const labor = datos.ventasNetas > 0 ? Math.round((nomina / datos.ventasNetas) * 10000) / 100 : 0;
    const costoPrimo = foodCost + labor;
    
    return {
      mes: mes.split(' ')[0].substring(0, 3),
      mesCompleto: mes,
      ventas: datos.ventasNetas,
      ventasBrutas: datos.ventasBrutas,
      comisiones: datos.comisiones,
      gastos: datos.gastos,
      utilidad: utilidadBruta,
      utilidadNeta,
      impuestosFinanciamientos: impuestosFin,
      margenBruto,
      margenNeto: margenBruto,
      cashYield: Math.round(cashYield * 100) / 100,
      cashYieldMonto: utilidadNeta,
      indiceVsPE: datos.ventasNetas / 295000,
      comensales,
      costoVenta,
      nomina,
      foodCost,
      labor,
      costoPrimo,
    };
  });

  // Totales acumulados
  const acumulado = {
    ventasBrutas: ventasMensuales.reduce((sum, m) => sum + m.ventasBrutas, 0),
    comisiones: ventasMensuales.reduce((sum, m) => sum + m.comisiones, 0),
    ventasNetas: ventasMensuales.reduce((sum, m) => sum + m.ventas, 0),
    gastos: ventasMensuales.reduce((sum, m) => sum + m.gastos, 0),
    comensales: ventasMensuales.reduce((sum, m) => sum + m.comensales, 0),
  };
  acumulado.utilidad = acumulado.ventasNetas - acumulado.gastos;

  // Comisiones por plataforma
  const comisionesPorPlataforma: Record<string, { bruto: number; comision: number; neto: number; count: number }> = {};
  ingresos.forEach(ing => {
    const plataforma = ing['Fuente / Cliente'] || 'Otros';
    if (!comisionesPorPlataforma[plataforma]) {
      comisionesPorPlataforma[plataforma] = { bruto: 0, comision: 0, neto: 0, count: 0 };
    }
    comisionesPorPlataforma[plataforma].bruto += parseMoney(ing['Monto Bruto (+)']);
    comisionesPorPlataforma[plataforma].comision += parseMoney(ing['Comisión / Retención (-)']);
    comisionesPorPlataforma[plataforma].neto += parseMoney(ing['Monto Neto (Cálculo)']);
    comisionesPorPlataforma[plataforma].count++;
  });

  // Gastos por categoría
  const gastosPorCategoria: Record<string, number> = {};
  gastos.forEach(gas => {
    const categoria = gas['Grupo P&L'] || gas.Categoría || 'Otros';
    const total = Math.abs(parseMoney(gas.Total));
    gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + total;
  });

  return {
    ventasMensuales,
    acumulado,
    comisionesPorPlataforma,
    gastosPorCategoria,
    datosPorMes
  };
}

// Datos REALES procesados desde CSV - Restaurante THAI THAI
// Período: Enero - Febrero 2026

import { CONSTANTES_NEGOCIO } from '../lib/dataProcessor';

// ==================== INTERFACES ====================
export interface VentaMensual {
  mes: string;
  mesCompleto: string;
  ventas: number;
  ventasBrutas: number;
  gastos: number;
  comisiones: number;
  margenBruto: number;
  margenNeto: number;
  peMensual: number;
  ventaObjetivo: number;
  indiceVsPE: number;
  clientes: number;
  ticketPromedio: number;
}

export interface ComisionPlataforma {
  plataforma: string;
  montoBruto: number;
  comisionTotal: number;
  montoNeto: number;
  porcentajeComision: number;
  numTransacciones: number;
  comisionPromedio: number;
  esRentable: boolean;
  recomendacion: string;
}

export interface GastoCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
  grupoPL: string;
}

export interface TopGasto {
  concepto: string;
  monto: number;
  porcentaje: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface TopVenta {
  tipo: string;
  monto: number;
  porcentaje: number;
  comision: number;
  porcentajeComision: number;
}

// Re-exportar constantes
export { CONSTANTES_NEGOCIO };

// ==================== DATOS REALES ENERO 2026 ====================
// Procesados desde GASTOS THAI THAI - Ingresos_BD.csv y Gastos_BD.csv

// Datos procesados con Python - Enero 2026
export const ventasMensuales: VentaMensual[] = [
  {
    mes: 'Ene',
    mesCompleto: 'Enero 2026',
    ventas: 561527.65,           // Neto real
    ventasBrutas: 723270.93,    // Bruto real
    gastos: 520374.03,          // Gastos totales reales
    comisiones: 161743.28,      // Comisiones totales
    margenBruto: 28,            // (723270.93 - 520374.03) / 723270.93
    margenNeto: 7,              // (561527.65 - 520374.03) / 561527.65
    peMensual: CONSTANTES_NEGOCIO.PE_MENSUAL,
    ventaObjetivo: CONSTANTES_NEGOCIO.VENTA_OBJETIVO,
    indiceVsPE: 1.90,           // 561527.65 / 295000
    clientes: 1872,
    ticketPromedio: 300,
  },
];

// ==================== ANÁLISIS DE COMISIONES POR PLATAFORMA ====================
// Calculado desde Ingresos_BD.csv

// Datos reales procesados con Python
export const comisionesPorPlataforma: ComisionPlataforma[] = [
  {
    plataforma: 'BBVA Terminal Bancaria',
    montoBruto: 350491.03,
    comisionTotal: 9143.92,
    montoNeto: 341347.11,
    porcentajeComision: 2.6,
    numTransacciones: 58,
    comisionPromedio: 157.65,
    esRentable: true,
    recomendacion: '✅ Mejor opción - Solo 2.6% de comisión',
  },
  {
    plataforma: 'Efectivo (Caja)',
    montoBruto: 77000.00,
    comisionTotal: 0,
    montoNeto: 77000.00,
    porcentajeComision: 0,
    numTransacciones: 11,
    comisionPromedio: 0,
    esRentable: true,
    recomendacion: '✅ Sin comisión - Fomentar pago en efectivo',
  },
  {
    plataforma: 'Uber Eats',
    montoBruto: 223267.00,
    comisionTotal: 108419.86,
    montoNeto: 114847.14,
    porcentajeComision: 48.6,
    numTransacciones: 13,
    comisionPromedio: 8332.30,
    esRentable: false,
    recomendacion: '⚠️ Alta comisión (48.6%) - Subir precios en la app',
  },
  {
    plataforma: 'Rappi',
    montoBruto: 59241.90,
    comisionTotal: 43465.68,
    montoNeto: 15776.22,
    porcentajeComision: 73.4,
    numTransacciones: 8,
    comisionPromedio: 5433.21,
    esRentable: false,
    recomendacion: '🔴 Comisión muy alta (73.4%) - Evaluar si conviene',
  },
  {
    plataforma: 'PayPal',
    montoBruto: 9944.00,
    comisionTotal: 561.08,
    montoNeto: 9382.92,
    porcentajeComision: 5.6,
    numTransacciones: 18,
    comisionPromedio: 31.17,
    esRentable: true,
    recomendacion: '✅ Comisión razonable para pagos online',
  },
  {
    plataforma: 'Mercado Pago',
    montoBruto: 3073.00,
    comisionTotal: 143.02,
    montoNeto: 2929.98,
    porcentajeComision: 4.7,
    numTransacciones: 4,
    comisionPromedio: 35.76,
    esRentable: true,
    recomendacion: '✅ Buena alternativa digital',
  },
  {
    plataforma: 'Clip',
    montoBruto: 254.00,
    comisionTotal: 9.72,
    montoNeto: 244.28,
    porcentajeComision: 3.8,
    numTransacciones: 1,
    comisionPromedio: 9.72,
    esRentable: true,
    recomendacion: '✅ Terminal con baja comisión',
  },
];

// ==================== TOP GASTOS POR CATEGORÍA ====================

// Datos reales procesados con Python
export const topGastos: TopGasto[] = [
  { concepto: 'Insumos Alimentos', monto: 153801.33, porcentaje: 29.6, tendencia: 'stable' },
  { concepto: 'Nómina', monto: 130053.10, porcentaje: 25.0, tendencia: 'stable' },
  { concepto: 'Servicios (Luz, Agua, Gas, Tel)', monto: 44004.69, porcentaje: 8.5, tendencia: 'up' },
  { concepto: 'Renta', monto: 30000.00, porcentaje: 5.8, tendencia: 'stable' },
  { concepto: 'Personal', monto: 28592.04, porcentaje: 5.5, tendencia: 'stable' },
  { concepto: 'Carga Social', monto: 26030.03, porcentaje: 5.0, tendencia: 'stable' },
  { concepto: 'Insumos Bebidas', monto: 19832.53, porcentaje: 3.8, tendencia: 'stable' },
  { concepto: 'Desechables', monto: 16792.40, porcentaje: 3.2, tendencia: 'down' },
  { concepto: 'Impuestos SAT', monto: 15818.00, porcentaje: 3.0, tendencia: 'stable' },
  { concepto: 'Préstamo BBVA', monto: 12448.89, porcentaje: 2.4, tendencia: 'stable' },
];

// ==================== GASTOS POR GRUPO P&L ====================

// Datos reales procesados con Python
export const gastosPorGrupoPL = [
  { grupo: 'Gastos Operativos', monto: 273088.84, porcentaje: 52.5 },
  { grupo: 'Costo de Venta', monto: 190426.26, porcentaje: 36.6 },
  { grupo: 'Gastos Personales', monto: 28592.04, porcentaje: 5.5 },
  { grupo: 'Financiero/Impuestos', monto: 28266.89, porcentaje: 5.4 },
];

// ==================== TOP FUENTES DE INGRESO ====================

// Datos reales procesados con Python
export const topIngresos: TopVenta[] = [
  { 
    tipo: 'BBVA Terminal Bancaria', 
    monto: 341347.11, 
    porcentaje: 60.8, 
    comision: 9143.92,
    porcentajeComision: 2.6 
  },
  { 
    tipo: 'Uber Eats', 
    monto: 114847.14, 
    porcentaje: 20.5, 
    comision: 108419.86,
    porcentajeComision: 48.6 
  },
  { 
    tipo: 'Efectivo (Caja)', 
    monto: 77000.00, 
    porcentaje: 13.7, 
    comision: 0,
    porcentajeComision: 0 
  },
  { 
    tipo: 'Rappi', 
    monto: 15776.22, 
    porcentaje: 2.8, 
    comision: 43465.68,
    porcentajeComision: 73.4 
  },
  { 
    tipo: 'PayPal', 
    monto: 9382.92, 
    porcentaje: 1.7, 
    comision: 561.08,
    porcentajeComision: 5.6 
  },
  { 
    tipo: 'Mercado Pago', 
    monto: 2929.98, 
    porcentaje: 0.5, 
    comision: 143.02,
    porcentajeComision: 4.7 
  },
  { 
    tipo: 'Clip', 
    monto: 244.28, 
    porcentaje: 0.04, 
    comision: 9.72,
    porcentajeComision: 3.8 
  },
];

// ==================== RESUMEN EJECUTIVO ====================

// Datos reales procesados con Python - Enero 2026
export const resumenEjecutivo = {
  // Totales del período
  totalVentasBrutas: 723270.93,
  totalVentasNetas: 561527.65,
  totalComisiones: 161743.28,
  totalGastos: 520374.03,
  utilidadNeta: 41153.62,
  
  // Porcentajes
  porcentajeComisionesSobreBruto: 22.4,
  porcentajeGastosSobreVentas: 92.7,
  margenBrutoPromedio: 28,
  margenNetoPromedio: 7,
  
  // PE
  promedioIndicePE: 1.90,
  mesesSobrePE: 1,
  mesesBajoPE: 0,
  
  // Ticket
  ticketPromedio: 300,
  totalClientes: 1872,
};

// ==================== PROYECCIÓN PARA PE ====================

export function calcularProyeccionPE(
  ventaActual: number, 
  diasTranscurridos: number, 
  diasEnMes: number = 30
) {
  const diasRestantes = Math.max(0, diasEnMes - diasTranscurridos);
  const ventaDiariaActual = diasTranscurridos > 0 ? ventaActual / diasTranscurridos : 0;
  
  const faltantePE = Math.max(0, CONSTANTES_NEGOCIO.PE_MENSUAL - ventaActual);
  const faltanteObjetivo = Math.max(0, CONSTANTES_NEGOCIO.VENTA_OBJETIVO - ventaActual);
  
  const ventaDiariaNecesariaPE = diasRestantes > 0 ? faltantePE / diasRestantes : 0;
  const ventaDiariaNecesariaObjetivo = diasRestantes > 0 ? faltanteObjetivo / diasRestantes : 0;
  
  return {
    peMensual: CONSTANTES_NEGOCIO.PE_MENSUAL,
    ventaObjetivo: CONSTANTES_NEGOCIO.VENTA_OBJETIVO,
    ventaActual,
    diasTranscurridos,
    diasRestantes,
    ventaDiariaActual,
    ventaDiariaNecesariaPE,
    ventaDiariaNecesariaObjetivo,
    faltantePE,
    faltanteObjetivo,
    escenarios: [
      {
        nombre: 'Conservador',
        descripcion: 'Mantener ritmo actual',
        ventaDiaria: ventaDiariaActual,
        diasNecesarios: faltantePE > 0 && ventaDiariaActual > 0 ? Math.ceil(faltantePE / ventaDiariaActual) : 0,
      },
      {
        nombre: 'Moderado',
        descripcion: 'Incrementar 20%',
        ventaDiaria: ventaDiariaActual * 1.2,
        diasNecesarios: faltantePE > 0 && ventaDiariaActual > 0 ? Math.ceil(faltantePE / (ventaDiariaActual * 1.2)) : 0,
      },
      {
        nombre: 'Agresivo',
        descripcion: 'Incrementar 50%',
        ventaDiaria: ventaDiariaActual * 1.5,
        diasNecesarios: faltantePE > 0 && ventaDiariaActual > 0 ? Math.ceil(faltantePE / (ventaDiariaActual * 1.5)) : 0,
      },
    ],
  };
}

// ==================== OPCIONES DE FILTRO ====================

export const opcionesMeses = [
  { valor: 'acumulado', etiqueta: '📊 Enero 2026' },
  ...ventasMensuales.map((m, i) => ({
    valor: i.toString(),
    etiqueta: `📅 ${m.mesCompleto}`,
  })),
];

// ==================== FUNCIONES DE KPIs ====================

export interface KPI {
  titulo: string;
  valor: number;
  unidad: string;
  tendencia: number;
  estado: 'excelente' | 'bueno' | 'alerta' | 'critico';
  descripcion: string;
  monto?: number;
  objetivo?: number;
  pe?: number;
}

export function generateKPIs(mesIndex: number | 'acumulado'): KPI[] {
  if (mesIndex === 'acumulado') {
    const totalVentas = ventasMensuales.reduce((acc, m) => acc + m.ventas, 0);
    const totalGastos = ventasMensuales.reduce((acc, m) => acc + m.gastos, 0);
    const totalComisiones = ventasMensuales.reduce((acc, m) => acc + m.comisiones, 0);
    const promedioMargenBruto = Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenBruto, 0) / ventasMensuales.length);
    const promedioMargenNeto = Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenNeto, 0) / ventasMensuales.length);
    
    return [
      {
        titulo: 'Margen Bruto',
        valor: promedioMargenBruto,
        unidad: '%',
        tendencia: 0,
        estado: promedioMargenBruto >= 35 ? 'excelente' : promedioMargenBruto >= 25 ? 'bueno' : promedioMargenBruto >= 15 ? 'alerta' : 'critico',
        descripcion: 'Promedio del período',
        monto: Math.round(totalVentas * promedioMargenBruto / 100)
      },
      {
        titulo: 'Margen Neto',
        valor: promedioMargenNeto,
        unidad: '%',
        tendencia: 0,
        estado: promedioMargenNeto >= 20 ? 'excelente' : promedioMargenNeto >= 10 ? 'bueno' : promedioMargenNeto >= 5 ? 'alerta' : 'critico',
        descripcion: 'Promedio del período',
        monto: Math.round(totalVentas * promedioMargenNeto / 100)
      },
      {
        titulo: 'Ventas Totales',
        valor: totalVentas,
        unidad: '$',
        tendencia: 0,
        estado: 'excelente',
        descripcion: 'Neto del período',
      },
      {
        titulo: 'Gastos Totales',
        valor: totalGastos,
        unidad: '$',
        tendencia: 0,
        estado: 'bueno',
        descripcion: 'Total del período',
      },
    ];
  }
  
  const mesData = ventasMensuales[mesIndex];
  const mesAnterior = mesIndex > 0 ? ventasMensuales[mesIndex - 1] : null;
  
  const tendenciaVentas = mesAnterior 
    ? ((mesData.ventas - mesAnterior.ventas) / mesAnterior.ventas * 100)
    : 0;
  const tendenciaGastos = mesAnterior 
    ? ((mesData.gastos - mesAnterior.gastos) / mesAnterior.gastos * 100)
    : 0;
  const tendenciaMargenBruto = mesAnterior 
    ? mesData.margenBruto - mesAnterior.margenBruto
    : 0;
  const tendenciaMargenNeto = mesAnterior 
    ? mesData.margenNeto - mesAnterior.margenNeto
    : 0;
  
  return [
    {
      titulo: 'Margen Bruto',
      valor: mesData.margenBruto,
      unidad: '%',
      tendencia: tendenciaMargenBruto,
      estado: mesData.margenBruto >= 35 ? 'excelente' : mesData.margenBruto >= 25 ? 'bueno' : mesData.margenBruto >= 15 ? 'alerta' : 'critico',
      descripcion: 'Porcentaje de ganancia sobre ventas',
      monto: Math.round(mesData.ventas * mesData.margenBruto / 100)
    },
    {
      titulo: 'Margen Neto',
      valor: mesData.margenNeto,
      unidad: '%',
      tendencia: tendenciaMargenNeto,
      estado: mesData.margenNeto >= 20 ? 'excelente' : mesData.margenNeto >= 10 ? 'bueno' : mesData.margenNeto >= 5 ? 'alerta' : 'critico',
      descripcion: 'Ganancia real después de gastos',
      monto: Math.round(mesData.ventas * mesData.margenNeto / 100)
    },
    {
      titulo: 'Ventas del Mes',
      valor: mesData.ventas,
      unidad: '$',
      tendencia: tendenciaVentas,
      estado: mesData.ventas >= CONSTANTES_NEGOCIO.VENTA_OBJETIVO ? 'excelente' : mesData.ventas >= CONSTANTES_NEGOCIO.PE_MENSUAL ? 'bueno' : 'critico',
      descripcion: `Total de ${mesData.mesCompleto} (Neto)`,
      pe: CONSTANTES_NEGOCIO.PE_MENSUAL,
      objetivo: CONSTANTES_NEGOCIO.VENTA_OBJETIVO,
    },
    {
      titulo: 'Gastos del Mes',
      valor: mesData.gastos,
      unidad: '$',
      tendencia: tendenciaGastos,
      estado: mesData.gastos <= mesData.ventas * 0.7 ? 'excelente' : mesData.gastos <= mesData.ventas * 0.85 ? 'bueno' : 'alerta',
      descripcion: `Total de ${mesData.mesCompleto}`,
    },
  ];
}

export function generateKPIsRestaurante(mesIndex: number | 'acumulado'): KPI[] {
  if (mesIndex === 'acumulado') {
    const totalVentas = ventasMensuales.reduce((acc, m) => acc + m.ventas, 0);
    const totalComisiones = ventasMensuales.reduce((acc, m) => acc + m.comisiones, 0);
    const promedioIndice = ventasMensuales.reduce((acc, m) => acc + m.indiceVsPE, 0) / ventasMensuales.length;
    
    return [
      {
        titulo: 'Índice vs PE',
        valor: promedioIndice,
        unidad: '',
        tendencia: 0,
        estado: promedioIndice >= 1 ? 'excelente' : promedioIndice >= 0.9 ? 'alerta' : 'critico',
        descripcion: 'Promedio del período',
      },
      {
        titulo: 'Comisiones Totales',
        valor: totalComisiones,
        unidad: '$',
        tendencia: 0,
        estado: 'alerta',
        descripcion: `${Math.round((totalComisiones / totalVentas) * 100)}% sobre ventas`,
      },
      {
        titulo: 'PE Acumulado',
        valor: CONSTANTES_NEGOCIO.PE_MENSUAL * ventasMensuales.length,
        unidad: '$',
        tendencia: 0,
        estado: 'bueno',
        descripcion: 'Punto de equilibrio total',
      },
      {
        titulo: 'Objetivo Acumulado',
        valor: CONSTANTES_NEGOCIO.VENTA_OBJETIVO * ventasMensuales.length,
        unidad: '$',
        tendencia: 0,
        estado: 'bueno',
        descripcion: 'Meta total',
      },
    ];
  }
  
  const mesData = ventasMensuales[mesIndex];
  const mesAnterior = mesIndex > 0 ? ventasMensuales[mesIndex - 1] : null;
  
  const tendenciaClientes = mesAnterior 
    ? ((mesData.clientes - mesAnterior.clientes) / mesAnterior.clientes * 100)
    : 0;
  const tendenciaIndice = mesAnterior 
    ? ((mesData.indiceVsPE - mesAnterior.indiceVsPE) / mesAnterior.indiceVsPE * 100)
    : 0;
  
  const estadoIndice = mesData.indiceVsPE >= 1 ? 'excelente' : 
                       mesData.indiceVsPE >= 0.9 ? 'alerta' : 'critico';
  
  return [
    {
      titulo: 'Índice vs PE',
      valor: mesData.indiceVsPE,
      unidad: '',
      tendencia: tendenciaIndice,
      estado: estadoIndice,
      descripcion: mesData.indiceVsPE >= 1 ? '¡Por arriba del PE!' : 'Por debajo del PE',
      monto: mesData.indiceVsPE >= 1 
        ? mesData.ventas - CONSTANTES_NEGOCIO.PE_MENSUAL 
        : CONSTANTES_NEGOCIO.PE_MENSUAL - mesData.ventas,
    },
    {
      titulo: 'Clientes del Mes',
      valor: mesData.clientes,
      unidad: '',
      tendencia: tendenciaClientes,
      estado: mesData.clientes >= CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO * CONSTANTES_NEGOCIO.DIAS_MES ? 'excelente' : mesData.clientes >= CONSTANTES_NEGOCIO.COMENSALES_PE * CONSTANTES_NEGOCIO.DIAS_MES ? 'bueno' : 'alerta',
      descripcion: `Promedio: ${Math.round(mesData.clientes / CONSTANTES_NEGOCIO.DIAS_MES)} clientes/día`,
    },
    {
      titulo: 'PE Mensual',
      valor: CONSTANTES_NEGOCIO.PE_MENSUAL,
      unidad: '$',
      tendencia: 0,
      estado: 'bueno',
      descripcion: 'Punto de Equilibrio',
    },
    {
      titulo: 'Venta Objetivo',
      valor: CONSTANTES_NEGOCIO.VENTA_OBJETIVO,
      unidad: '$',
      tendencia: 0,
      estado: 'bueno',
      descripcion: 'Meta mensual',
    },
  ];
}

export function getDatosMes(mesIndex: number | 'acumulado') {
  if (mesIndex === 'acumulado') {
    return {
      ventas: ventasMensuales.reduce((acc, m) => acc + m.ventas, 0),
      ventasBrutas: ventasMensuales.reduce((acc, m) => acc + m.ventasBrutas, 0),
      gastos: ventasMensuales.reduce((acc, m) => acc + m.gastos, 0),
      comisiones: ventasMensuales.reduce((acc, m) => acc + m.comisiones, 0),
      margenBruto: Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenBruto, 0) / ventasMensuales.length),
      margenNeto: Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenNeto, 0) / ventasMensuales.length),
      clientes: ventasMensuales.reduce((acc, m) => acc + m.clientes, 0),
      indiceVsPE: ventasMensuales.reduce((acc, m) => acc + m.indiceVsPE, 0) / ventasMensuales.length,
    };
  }
  return ventasMensuales[mesIndex];
}

export function getKPIsBrecha(mesIndex: number) {
  const mesData = ventasMensuales[mesIndex];
  const diasRestantes = CONSTANTES_NEGOCIO.DIAS_MES;
  const ventaDiariaActual = mesData.ventas / CONSTANTES_NEGOCIO.DIAS_MES;
  
  return {
    ventasMes: mesData.ventas,
    faltanteParaPE: Math.max(0, CONSTANTES_NEGOCIO.PE_MENSUAL - mesData.ventas),
    faltanteParaObjetivo: Math.max(0, CONSTANTES_NEGOCIO.VENTA_OBJETIVO - mesData.ventas),
    ventaDiariaActual: ventaDiariaActual,
    ventaDiariaNecesariaPE: Math.max(0, (CONSTANTES_NEGOCIO.PE_MENSUAL - mesData.ventas) / diasRestantes),
    clientesObjetivo: CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO * CONSTANTES_NEGOCIO.DIAS_MES,
    clientesActuales: mesData.clientes,
    clientesDiariosActuales: Math.round(mesData.clientes / CONSTANTES_NEGOCIO.DIAS_MES),
    clientesFaltantes: Math.max(0, CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO * CONSTANTES_NEGOCIO.DIAS_MES - mesData.clientes),
    comisiones: mesData.comisiones,
    porcentajeComisiones: Math.round((mesData.comisiones / mesData.ventasBrutas) * 100),
  };
}

// Colores para gráficos
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  ventas: '#10b981',
  gastos: '#f43f5e',
  pe: '#f59e0b',
  objetivo: '#3b82f6',
};

// Función para obtener estado del indicador
export function getEstadoIndicador(valor: number, tipo: 'margen' | 'ventas' | 'gastos' | 'indice'): {
  color: string;
  emoji: string;
  nivel: string;
  descripcion: string;
} {
  if (tipo === 'indice') {
    if (valor >= 110) return { color: '#22c55e', emoji: '🟢', nivel: 'Excelente', descripcion: '¡10%+ arriba del PE!' };
    if (valor >= 100) return { color: '#84cc16', emoji: '🟢', nivel: 'Bueno', descripcion: '¡Por arriba del PE!' };
    if (valor >= 90) return { color: '#eab308', emoji: '🟡', nivel: 'Alerta', descripcion: 'Cerca del PE' };
    return { color: '#ef4444', emoji: '🔴', nivel: 'Crítico', descripcion: '¡Debajo del PE!' };
  }
  
  if (tipo === 'margen') {
    if (valor >= 35) return { color: '#22c55e', emoji: '🟢', nivel: 'Excelente', descripcion: '¡Muy saludable!' };
    if (valor >= 25) return { color: '#84cc16', emoji: '🟢', nivel: 'Bueno', descripcion: 'Por encima del promedio' };
    if (valor >= 15) return { color: '#eab308', emoji: '🟡', nivel: 'Regular', descripcion: 'Necesita atención' };
    if (valor >= 0) return { color: '#f97316', emoji: '🟠', nivel: 'Bajo', descripcion: 'Margen reducido' };
    return { color: '#ef4444', emoji: '🔴', nivel: 'Pérdida', descripcion: '¡Operando en negativo!' };
  }
  
  if (tipo === 'ventas') {
    if (valor >= CONSTANTES_NEGOCIO.VENTA_OBJETIVO) return { color: '#22c55e', emoji: '🟢', nivel: 'Excelente', descripcion: '¡Meta alcanzada!' };
    if (valor >= CONSTANTES_NEGOCIO.PE_MENSUAL) return { color: '#84cc16', emoji: '🟢', nivel: 'Bueno', descripcion: 'Arriba del PE' };
    if (valor >= CONSTANTES_NEGOCIO.PE_MENSUAL * 0.9) return { color: '#eab308', emoji: '🟡', nivel: 'Alerta', descripcion: 'Cerca del PE' };
    return { color: '#ef4444', emoji: '🔴', nivel: 'Crítico', descripcion: 'Debajo del PE' };
  }
  
  // gastos
  if (valor <= 60) return { color: '#22c55e', emoji: '🟢', nivel: 'Excelente', descripcion: 'Gastos controlados' };
  if (valor <= 75) return { color: '#84cc16', emoji: '🟢', nivel: 'Bueno', descripcion: 'Dentro del presupuesto' };
  if (valor <= 90) return { color: '#eab308', emoji: '🟡', nivel: 'Regular', descripcion: 'Cercano al límite' };
  return { color: '#ef4444', emoji: '🔴', nivel: 'Crítico', descripcion: '¡Sobrepasado!' };
}

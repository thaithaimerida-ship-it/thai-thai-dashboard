// Datos REALES del dashboard - Restaurante THAI THAI
// Procesado desde Google Sheets

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
  cantidad: number;
}

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

// Constantes del negocio - THAI THAI
export const CONSTANTES_NEGOCIO = {
  PE_MENSUAL: 295000,        // Punto de Equilibrio
  VENTA_OBJETIVO: 325000,    // Meta de ventas
  COMENSALES_PE: 33,         // Clientes mínimos para PE
  COMENSALES_OBJETIVO: 44,   // Clientes objetivo
  VENTA_DIARIA_PE: 9800,     // Venta diaria mínima
  VENTA_DIARIA_OBJETIVO: 12000, // Venta diaria objetivo
  DIAS_MES: 30,
};

// ==================== DATOS REALES PROCESADOS ====================

// Ventas mensuales reales - THAI THAI
export const ventasMensuales: VentaMensual[] = [
  // Enero 2026 - DATOS REALES
  { 
    mes: 'Ene', 
    mesCompleto: 'Enero 2026', 
    ventas: 333670.37,      // Ingresos netos reales
    ventasBrutas: 448366.46, // Ingresos brutos reales
    gastos: 294822.38,       // Gastos totales reales
    comisiones: 114696.09,   // Comisiones de plataformas
    margenBruto: 34,         // Calculado
    margenNeto: 13,          // Utilidad neta / ventas
    peMensual: 295000,
    ventaObjetivo: 325000,
    indiceVsPE: 1.13,        // 333,670 / 295,000
    clientes: 1107           // Estimado
  },
  // Febrero 2026 - DATOS REALES
  { 
    mes: 'Feb', 
    mesCompleto: 'Febrero 2026', 
    ventas: 227857.28,       // Ingresos netos reales
    ventasBrutas: 274904.47, // Ingresos brutos reales
    gastos: 213796.25,       // Gastos totales reales
    comisiones: 47047.19,    // Comisiones de plataformas
    margenBruto: 6,          // Calculado
    margenNeto: 6,           // Utilidad neta / ventas
    peMensual: 295000,
    ventaObjetivo: 325000,
    indiceVsPE: 0.77,        // 227,857 / 295,000
    clientes: 803            // Estimado
  },
];

// Top 5 Gastos - DATOS REALES
export const topGastos: TopGasto[] = [
  { concepto: 'Nómina y Sueldos', monto: 130053.16, porcentaje: 26, tendencia: 'down' },
  { concepto: 'Insumos Alimentos', monto: 148189.34, porcentaje: 29, tendencia: 'stable' },
  { concepto: 'Renta', monto: 30000, porcentaje: 6, tendencia: 'stable' },
  { concepto: 'Servicios (Luz, Agua, Gas)', monto: 42612.69, porcentaje: 8, tendencia: 'up' },
  { concepto: 'Insumos Bebidas', monto: 16472.53, porcentaje: 3, tendencia: 'stable' },
];

// Top 5 Fuentes de Ingreso - DATOS REALES
export const topVentas: TopVenta[] = [
  { tipo: 'BBVA Terminal (Tarjetas)', monto: 341347.11, porcentaje: 60, cantidad: 0 },
  { tipo: 'UBBER Eats', monto: 114847.14, porcentaje: 20, cantidad: 0 },
  { tipo: 'CAJA (Efectivo)', monto: 77000, porcentaje: 14, cantidad: 0 },
  { tipo: 'PAYPAL', monto: 9382.92, porcentaje: 2, cantidad: 0 },
  { tipo: 'RAPPI', monto: 15776.22, porcentaje: 3, cantidad: 0 },
];

// ==================== FUNCIONES DE KPIs ====================

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
        estado: promedioMargenNeto >= 35 ? 'excelente' : promedioMargenNeto >= 25 ? 'bueno' : promedioMargenNeto >= 15 ? 'alerta' : 'critico',
        descripcion: 'Promedio del período',
        monto: Math.round(totalVentas * promedioMargenNeto / 100)
      },
      {
        titulo: 'Ventas Acumuladas',
        valor: totalVentas,
        unidad: '$',
        tendencia: 0,
        estado: 'excelente',
        descripcion: 'Total del período (Neto)',
      },
      {
        titulo: 'Gastos Acumulados',
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
        descripcion: 'Comisiones de plataformas',
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

export function getDatosAcumulados() {
  const totalVentas = ventasMensuales.reduce((acc, m) => acc + m.ventas, 0);
  const totalGastos = ventasMensuales.reduce((acc, m) => acc + m.gastos, 0);
  const totalComisiones = ventasMensuales.reduce((acc, m) => acc + m.comisiones, 0);
  const promMargenBruto = Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenBruto, 0) / ventasMensuales.length);
  const promMargenNeto = Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenNeto, 0) / ventasMensuales.length);
  const utilidadNeta = totalVentas - totalGastos;
  const promIndicePE = ventasMensuales.reduce((acc, m) => acc + m.indiceVsPE, 0) / ventasMensuales.length;
  
  return {
    ventas: totalVentas,
    gastos: totalGastos,
    comisiones: totalComisiones,
    margenBruto: promMargenBruto,
    margenNeto: promMargenNeto,
    utilidadNeta,
    porcentajeGastoSobreVentas: Math.round((totalGastos / totalVentas) * 100),
    indiceVsPE: promIndicePE,
  };
}

export const resumenFinanciero = {
  ventasTotales: ventasMensuales.reduce((acc, m) => acc + m.ventas, 0),
  gastosTotales: ventasMensuales.reduce((acc, m) => acc + m.gastos, 0),
  comisionesTotales: ventasMensuales.reduce((acc, m) => acc + m.comisiones, 0),
  margenBrutoPromedio: Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenBruto, 0) / ventasMensuales.length),
  margenNetoPromedio: Math.round(ventasMensuales.reduce((acc, m) => acc + m.margenNeto, 0) / ventasMensuales.length),
};

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
    if (valor >= CONSTANTES_NEGOCIO.PE_MENSUAL * 0.9) return { color: '#eab308', emoji: '🟡', nivel: 'Alerta', descricao: 'Cerca del PE' };
    return { color: '#ef4444', emoji: '🔴', nivel: 'Crítico', descripcion: 'Debajo del PE' };
  }
  
  // gastos
  if (valor <= 60) return { color: '#22c55e', emoji: '🟢', nivel: 'Excelente', descripcion: 'Gastos controlados' };
  if (valor <= 75) return { color: '#84cc16', emoji: '🟢', nivel: 'Bueno', descripcion: 'Dentro del presupuesto' };
  if (valor <= 90) return { color: '#eab308', emoji: '🟡', nivel: 'Regular', descripcion: 'Cercano al límite' };
  return { color: '#ef4444', emoji: '🔴', nivel: 'Crítico', descripcion: '¡Sobrepasado!' };
}

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
  chart1: '#3b82f6',
  chart2: '#8b5cf6',
  chart3: '#06b6d4',
  chart4: '#f59e0b',
  chart5: '#ec4899',
};

export const opcionesMeses = [
  { valor: 'acumulado', etiqueta: '📊 Acumulado' },
  ...ventasMensuales.map((m, i) => ({
    valor: i.toString(),
    etiqueta: `📅 ${m.mesCompleto}`,
  })),
];

// Procesador de datos CSV para el Dashboard THAI THAI
// Este archivo contiene funciones para procesar los datos de gastos e ingresos

export interface GastoRaw {
  fecha: string;
  proveedor: string;
  rfc: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  impuestos: number;
  total: number;
  categoria: string;
  grupoPL: string;
  origen: string;
  linkFactura: string;
  uuid: string;
  procesadoEn: string;
}

export interface IngresoRaw {
  fecha: string;
  fuente: string;
  categoria: string;
  montoBruto: number;
  comision: number;
  montoNeto: number;
  cuentaDestino: string;
  notas: string;
}

export interface ComisionPlataforma {
  plataforma: string;
  montoBruto: number;
  comisionTotal: number;
  montoNeto: number;
  porcentajeComision: number;
  numTransacciones: number;
  comisionPromedio: number;
}

export interface DatosProcesados {
  ventasMensuales: VentaMensualProcesada[];
  topGastos: TopGastoProcesado[];
  topIngresos: TopIngresoProcesado[];
  comisionesPlataforma: ComisionPlataforma[];
  gastosPorCategoria: GastoCategoria[];
  gastosPorGrupoPL: GastoGrupoPL[];
  proyeccionPE: ProyeccionPE;
}

export interface VentaMensualProcesada {
  mes: string;
  mesCompleto: string;
  mesIndex: number;
  año: number;
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

export interface TopGastoProcesado {
  concepto: string;
  monto: number;
  porcentaje: number;
  tendencia: 'up' | 'down' | 'stable';
  categoria?: string;
}

export interface TopIngresoProcesado {
  tipo: string;
  monto: number;
  porcentaje: number;
  comision: number;
  porcentajeComision: number;
  numTransacciones: number;
}

export interface GastoCategoria {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export interface GastoGrupoPL {
  grupo: string;
  monto: number;
  porcentaje: number;
}

export interface ProyeccionPE {
  peMensual: number;
  ventaObjetivo: number;
  ventaActual: number;
  diasTranscurridos: number;
  diasRestantes: number;
  ventaDiariaActual: number;
  ventaDiariaNecesariaPE: number;
  ventaDiariaNecesariaObjetivo: number;
  faltantePE: number;
  faltanteObjetivo: number;
  escenarios: EscenarioPE[];
}

export interface EscenarioPE {
  nombre: string;
  descripcion: string;
  ventaDiaria: number;
  diasNecesarios: number;
  fechaAlcanzable: string;
}

// Constantes del negocio
export const CONSTANTES_NEGOCIO = {
  PE_MENSUAL: 295000,
  VENTA_OBJETIVO: 325000,
  COMENSALES_PE: 33,
  COMENSALES_OBJETIVO: 44,
  VENTA_DIARIA_PE: 9800,
  VENTA_DIARIA_OBJETIVO: 12000,
  DIAS_MES: 30,
  TICKET_PROMEDIO: 300,
};

// Función para parsear montos con formato mexicano
export function parseMonto(valor: string): number {
  if (!valor) return 0;
  // Remover símbolo $ y comas, manejar negativos entre paréntesis
  let limpio = valor.replace(/[$,]/g, '').replace(/"/g, '').trim();
  // Si tiene comillas dobles al inicio/final, removerlas
  limpio = limpio.replace(/^["']|["']$/g, '');
  const negativo = limpio.startsWith('-') || limpio.startsWith('(');
  const numero = parseFloat(limpio.replace(/[-()]/g, ''));
  return isNaN(numero) ? 0 : (negativo ? -Math.abs(numero) : Math.abs(numero));
}

// Función para parsear fecha en formato mexicano
export function parseFecha(fechaStr: string): Date {
  const meses: { [key: string]: number } = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
    'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
    'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  };
  
  const limpio = fechaStr.toLowerCase().replace(/"/g, '').trim();
  const partes = limpio.match(/(\d+)\s+(\w+)\s*,?\s*(\d+)/);
  
  if (partes) {
    const dia = parseInt(partes[1]);
    const mes = meses[partes[2]] ?? 0;
    const año = parseInt(partes[3]);
    return new Date(año, mes, dia);
  }
  
  return new Date();
}

// Función para obtener nombre del mes
export function getNombreMes(mes: number): string {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses[mes] || '';
}

export function getNombreMesCompleto(mes: number): string {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes] || '';
}

// Procesar datos de ingresos desde CSV
export function procesarIngresos(csvData: string): IngresoRaw[] {
  const lineas = csvData.split('\n').slice(1); // Saltar header
  const ingresos: IngresoRaw[] = [];
  
  for (const linea of lineas) {
    if (!linea.trim()) continue;
    
    // Parse CSV con campos entre comillas
    const matches = linea.match(/(?:"([^"]*)"|([^,]*))(?:,|$)/g);
    if (!matches || matches.length < 8) continue;
    
    const valores = matches.map(m => m.replace(/(^,|,$)/g, '').replace(/^"|"$/g, ''));
    
    ingresos.push({
      fecha: valores[0] || '',
      fuente: valores[1] || '',
      categoria: valores[2] || '',
      montoBruto: parseMonto(valores[3]),
      comision: parseMonto(valores[4]),
      montoNeto: parseMonto(valores[5]),
      cuentaDestino: valores[6] || '',
      notas: valores[7] || '',
    });
  }
  
  return ingresos;
}

// Procesar datos de gastos desde CSV
export function procesarGastos(csvData: string): GastoRaw[] {
  const lineas = csvData.split('\n').slice(1); // Saltar header
  const gastos: GastoRaw[] = [];
  
  for (const linea of lineas) {
    if (!linea.trim()) continue;
    
    // Parse CSV con campos entre comillas
    const matches = linea.match(/(?:"([^"]*)"|([^,]*))(?:,|$)/g);
    if (!matches || matches.length < 15) continue;
    
    const valores = matches.map(m => m.replace(/(^,|,$)/g, '').replace(/^"|"$/g, ''));
    
    gastos.push({
      fecha: valores[0] || '',
      proveedor: valores[1] || '',
      rfc: valores[2] || '',
      descripcion: valores[3] || '',
      cantidad: parseFloat(valores[4]) || 0,
      precioUnitario: parseMonto(valores[5]),
      descuento: parseMonto(valores[6]),
      impuestos: parseMonto(valores[7]),
      total: parseMonto(valores[8]),
      categoria: valores[9] || '',
      grupoPL: valores[10] || '',
      origen: valores[11] || '',
      linkFactura: valores[12] || '',
      uuid: valores[13] || '',
      procesadoEn: valores[14] || '',
    });
  }
  
  return gastos;
}

// Calcular comisiones por plataforma
export function calcularComisionesPorPlataforma(ingresos: IngresoRaw[]): ComisionPlataforma[] {
  const plataformas: { [key: string]: ComisionPlataforma } = {};
  
  for (const ingreso of ingresos) {
    const plataforma = normalizarPlataforma(ingreso.fuente);
    
    if (!plataformas[plataforma]) {
      plataformas[plataforma] = {
        plataforma,
        montoBruto: 0,
        comisionTotal: 0,
        montoNeto: 0,
        porcentajeComision: 0,
        numTransacciones: 0,
        comisionPromedio: 0,
      };
    }
    
    plataformas[plataforma].montoBruto += ingreso.montoBruto;
    plataformas[plataforma].comisionTotal += Math.abs(ingreso.comision);
    plataformas[plataforma].montoNeto += ingreso.montoNeto;
    plataformas[plataforma].numTransacciones++;
  }
  
  // Calcular porcentajes
  const resultado = Object.values(plataformas).map(p => ({
    ...p,
    porcentajeComision: p.montoBruto > 0 ? Math.round((p.comisionTotal / p.montoBruto) * 100) : 0,
    comisionPromedio: p.numTransacciones > 0 ? p.comisionTotal / p.numTransacciones : 0,
  }));
  
  // Ordenar por monto bruto descendente
  return resultado.sort((a, b) => b.montoBruto - a.montoBruto);
}

// Normalizar nombre de plataforma
function normalizarPlataforma(fuente: string): string {
  const normalizaciones: { [key: string]: string } = {
    'UBBER': 'Uber Eats',
    'UBER': 'Uber Eats',
    'RAPPI': 'Rappi',
    'PAYPAL': 'PayPal',
    'MERCADO PAGO': 'Mercado Pago',
    'CAJA': 'Efectivo (Caja)',
    'CLIP': 'Clip',
    'BBVA': 'BBVA Terminal/Transfer',
  };
  
  const upper = fuente.toUpperCase();
  for (const [key, value] of Object.entries(normalizaciones)) {
    if (upper.includes(key)) {
      // Diferenciar entre Terminal Bancaria y Transferencia
      if (key === 'BBVA') {
        if (fuente.toLowerCase().includes('transfer')) return 'Transferencia';
        if (fuente.toLowerCase().includes('term')) return 'Terminal Bancaria';
      }
      return value;
    }
  }
  
  return fuente;
}

// Calcular ventas mensuales
export function calcularVentasMensuales(ingresos: IngresoRaw[], gastos: GastoRaw[]): VentaMensualProcesada[] {
  const mesesData: { [key: string]: { ingresos: IngresoRaw[]; gastos: GastoRaw[] } } = {};
  
  // Agrupar ingresos por mes
  for (const ingreso of ingresos) {
    const fecha = parseFecha(ingreso.fecha);
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    if (!mesesData[key]) mesesData[key] = { ingresos: [], gastos: [] };
    mesesData[key].ingresos.push(ingreso);
  }
  
  // Agrupar gastos por mes
  for (const gasto of gastos) {
    const fecha = parseFecha(gasto.fecha);
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    if (!mesesData[key]) mesesData[key] = { ingresos: [], gastos: [] };
    mesesData[key].gastos.push(gasto);
  }
  
  // Calcular métricas por mes
  const resultado: VentaMensualProcesada[] = [];
  let mesIndex = 0;
  
  for (const [key, data] of Object.entries(mesesData).sort()) {
    const [año, mes] = key.split('-').map(Number);
    
    const ventasBrutas = data.ingresos.reduce((acc, i) => acc + i.montoBruto, 0);
    const comisiones = data.ingresos.reduce((acc, i) => acc + Math.abs(i.comision), 0);
    const ventas = data.ingresos.reduce((acc, i) => acc + i.montoNeto, 0);
    const totalGastos = data.gastos.reduce((acc, g) => acc + Math.abs(g.total), 0);
    
    const margenBruto = ventasBrutas > 0 ? Math.round(((ventasBrutas - totalGastos) / ventasBrutas) * 100) : 0;
    const margenNeto = ventas > 0 ? Math.round(((ventas - totalGastos) / ventas) * 100) : 0;
    const indiceVsPE = CONSTANTES_NEGOCIO.PE_MENSUAL > 0 ? ventas / CONSTANTES_NEGOCIO.PE_MENSUAL : 0;
    const clientes = Math.round(ventas / CONSTANTES_NEGOCIO.TICKET_PROMEDIO);
    const ticketPromedio = clientes > 0 ? ventas / clientes : 0;
    
    resultado.push({
      mes: getNombreMes(mes),
      mesCompleto: `${getNombreMesCompleto(mes)} ${año}`,
      mesIndex,
      año,
      ventas,
      ventasBrutas,
      gastos: totalGastos,
      comisiones,
      margenBruto,
      margenNeto,
      peMensual: CONSTANTES_NEGOCIO.PE_MENSUAL,
      ventaObjetivo: CONSTANTES_NEGOCIO.VENTA_OBJETIVO,
      indiceVsPE,
      clientes,
      ticketPromedio,
    });
    
    mesIndex++;
  }
  
  return resultado;
}

// Calcular top gastos por categoría
export function calcularTopGastos(gastos: GastoRaw[]): TopGastoProcesado[] {
  const porCategoria: { [key: string]: number } = {};
  let total = 0;
  
  for (const gasto of gastos) {
    const monto = Math.abs(gasto.total);
    const categoria = gasto.categoria || 'Sin categoría';
    porCategoria[categoria] = (porCategoria[categoria] || 0) + monto;
    total += monto;
  }
  
  const resultado = Object.entries(porCategoria)
    .map(([concepto, monto]) => ({
      concepto,
      monto,
      porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
      tendencia: 'stable' as const,
    }))
    .sort((a, b) => b.monto - a.monto)
    .slice(0, 10);
  
  return resultado;
}

// Calcular top fuentes de ingreso
export function calcularTopIngresos(ingresos: IngresoRaw[]): TopIngresoProcesado[] {
  const porFuente: { [key: string]: { monto: number; comision: number; count: number } } = {};
  let total = 0;
  
  for (const ingreso of ingresos) {
    const fuente = normalizarPlataforma(ingreso.fuente);
    if (!porFuente[fuente]) {
      porFuente[fuerte] = { monto: 0, comision: 0, count: 0 };
    }
    porFuente[fuente].monto += ingreso.montoNeto;
    porFuente[fuente].comision += Math.abs(ingreso.comision);
    porFuente[fuente].count++;
    total += ingreso.montoNeto;
  }
  
  const resultado = Object.entries(porFuente)
    .map(([tipo, data]) => ({
      tipo,
      monto: data.monto,
      porcentaje: total > 0 ? Math.round((data.monto / total) * 100) : 0,
      comision: data.comision,
      porcentajeComision: data.monto + data.comision > 0 
        ? Math.round((data.comision / (data.monto + data.comision)) * 100) 
        : 0,
      numTransacciones: data.count,
    }))
    .sort((a, b) => b.monto - a.monto);
  
  return resultado;
}

// Calcular proyección para alcanzar PE
export function calcularProyeccionPE(
  ventaActual: number, 
  diasTranscurridos: number, 
  diasEnMes: number = 30
): ProyeccionPE {
  const diasRestantes = diasEnMes - diasTranscurridos;
  const ventaDiariaActual = diasTranscurridos > 0 ? ventaActual / diasTranscurridos : 0;
  
  const faltantePE = Math.max(0, CONSTANTES_NEGOCIO.PE_MENSUAL - ventaActual);
  const faltanteObjetivo = Math.max(0, CONSTANTES_NEGOCIO.VENTA_OBJETIVO - ventaActual);
  
  const ventaDiariaNecesariaPE = diasRestantes > 0 ? faltantePE / diasRestantes : 0;
  const ventaDiariaNecesariaObjetivo = diasRestantes > 0 ? faltanteObjetivo / diasRestantes : 0;
  
  // Generar escenarios
  const escenarios: EscenarioPE[] = [
    {
      nombre: 'Conservador',
      descripcion: 'Mantener ritmo actual',
      ventaDiaria: ventaDiariaActual,
      diasNecesarios: faltantePE > 0 ? Math.ceil(faltantePE / ventaDiariaActual) : 0,
      fechaAlcanzable: calcularFechaFutura(diasTranscurridos + Math.ceil(faltantePE / ventaDiariaActual)),
    },
    {
      nombre: 'Moderado',
      descripcion: 'Incrementar 20%',
      ventaDiaria: ventaDiariaActual * 1.2,
      diasNecesarios: faltantePE > 0 ? Math.ceil(faltantePE / (ventaDiariaActual * 1.2)) : 0,
      fechaAlcanzable: calcularFechaFutura(diasTranscurridos + Math.ceil(faltantePE / (ventaDiariaActual * 1.2))),
    },
    {
      nombre: 'Agresivo',
      descripcion: 'Incrementar 50%',
      ventaDiaria: ventaDiariaActual * 1.5,
      diasNecesarios: faltantePE > 0 ? Math.ceil(faltantePE / (ventaDiariaActual * 1.5)) : 0,
      fechaAlcanzable: calcularFechaFutura(diasTranscurridos + Math.ceil(faltantePE / (ventaDiariaActual * 1.5))),
    },
  ];
  
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
    escenarios,
  };
}

function calcularFechaFutura(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
}



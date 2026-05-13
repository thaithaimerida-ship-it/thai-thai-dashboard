'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComisionesPlataformas } from '@/components/dashboard/ComisionesPlataformas';
import { ProyeccionPECard } from '@/components/dashboard/ProyeccionPE';
import { AnalisisRangoFechas } from '@/components/dashboard/AnalisisRangoFechas';
import { AdsPerformance } from '@/components/dashboard/AdsPerformance';
import { FinancialAIAnalysisTab } from '@/components/financial-ai/FinancialAIAnalysisTab';
import { CortesdeCaja } from '@/components/dashboard/CortesdeCaja';
import { ExecutiveCard } from '@/components/dashboard/ExecutiveCard';
import { BrechaProgress } from '@/components/dashboard/BrechaProgress';
import { OperativeHealthBar } from '@/components/dashboard/OperativeHealthBar';
import { ActionPriorities, type AccionEjecutiva } from '@/components/dashboard/ActionPriorities';
import { CONSTANTES_NEGOCIO } from '@/data/realData';
import { useGoogleSheets, procesarDatosDashboard } from '@/hooks/useGoogleSheets';
import { 
  BarChart3, Calendar, RefreshCw, ShoppingCart, AlertTriangle, CheckCircle,
  ChevronDown, Target, Info, CreditCard, Calculator, Filter, Settings,
  ExternalLink, Loader2, BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'cortes' | 'dashboard' | 'comisiones' | 'proyeccion' | 'analisis' | 'automatizacion' | 'ads' | 'financial-ai';

export default function Dashboard() {
  const { ingresos, gastos, cortesCaja, loading, error, lastUpdate, refetch, dataStatus } = useGoogleSheets();
  const [mesSeleccionado, setMesSeleccionado] = useState<number | 'ytd'>(-1);
  const [tabActivo, setTabActivo] = useState<TabId>('cortes');
  
  // Permitir datos parciales - procesar con lo que tengamos
  const datosProcesados = useMemo(() => {
    if (ingresos.length > 0 || gastos.length > 0) {
      return procesarDatosDashboard(ingresos, gastos, cortesCaja);
    }
    return null;
  }, [ingresos, gastos, cortesCaja]);

  // Calcular datos YTD
  const datosYTD = useMemo(() => {
    if (!datosProcesados) return null;
    const { ventasMensuales } = datosProcesados;
    
    const totalVentas = ventasMensuales.reduce((sum, m) => sum + m.ventas, 0);
    const totalVentasBrutas = ventasMensuales.reduce((sum, m) => sum + m.ventasBrutas, 0);
    const totalGastos = ventasMensuales.reduce((sum, m) => sum + m.gastos, 0);
    const totalComisiones = ventasMensuales.reduce((sum, m) => sum + m.comisiones, 0);
    const totalUtilidadNeta = ventasMensuales.reduce((sum, m) => sum + (m.cashYieldMonto || 0), 0);
    const totalImpuestosFin = ventasMensuales.reduce((sum, m) => sum + (m.impuestosFinanciamientos || 0), 0);
    const totalComensales = ventasMensuales.reduce((sum, m) => sum + (m.comensales || 0), 0);
    const totalCostoVenta = ventasMensuales.reduce((sum, m) => sum + (m.costoVenta || 0), 0);
    const totalNomina = ventasMensuales.reduce((sum, m) => sum + (m.nomina || 0), 0);
    
    const utilidadBruta = totalVentas - totalGastos;
    const margenBruto = totalVentas > 0 ? Math.round((utilidadBruta / totalVentas) * 100) : 0;
    const cashYield = totalVentas > 0 ? (totalUtilidadNeta / totalVentas) * 100 : 0;
    const foodCost = totalVentas > 0 ? Math.round((totalCostoVenta / totalVentas) * 10000) / 100 : 0;
    const labor = totalVentas > 0 ? Math.round((totalNomina / totalVentas) * 10000) / 100 : 0;
    const costoPrimo = foodCost + labor;
    
    return {
      mes: 'YTD',
      mesCompleto: 'Acumulado YTD 2026',
      ventas: totalVentas,
      ventasBrutas: totalVentasBrutas,
      comisiones: totalComisiones,
      gastos: totalGastos,
      utilidad: utilidadBruta,
      utilidadNeta: totalUtilidadNeta,
      impuestosFinanciamientos: totalImpuestosFin,
      margenBruto,
      margenNeto: margenBruto,
      cashYield: Math.round(cashYield * 100) / 100,
      cashYieldMonto: totalUtilidadNeta,
      indiceVsPE: totalVentas / CONSTANTES_NEGOCIO.PE_MENSUAL,
      comensales: totalComensales,
      costoVenta: totalCostoVenta,
      nomina: totalNomina,
      foodCost,
      labor,
      costoPrimo,
    };
  }, [datosProcesados]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value);
  };

  const tabs = [
    { id: 'cortes' as const, label: 'Cortes de Caja', icon: ShoppingCart },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'comisiones' as const, label: 'Comisiones', icon: CreditCard },
    { id: 'proyeccion' as const, label: 'Proyección PE', icon: Calculator },
    { id: 'analisis' as const, label: 'Análisis Fechas', icon: Filter },
    { id: 'automatizacion' as const, label: 'Automatizar', icon: Settings },
    { id: 'ads' as const, label: 'Google Ads', icon: Target },
    { id: 'financial-ai' as const, label: 'Análisis Financiero IA', icon: BrainCircuit },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Conectando con Google Sheets...</h2>
          <p className="text-gray-500 mt-2">Obteniendo datos en tiempo real</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800">Error de conexión</h2>
            <p className="text-red-600 mt-2">{error}</p>
            <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data
  if (!datosProcesados || datosProcesados.ventasMensuales.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Sin datos disponibles</h2>
            <p className="text-gray-500 mt-2">No se encontraron registros en Google Sheets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { ventasMensuales, acumulado, comisionesPorPlataforma } = datosProcesados;

  // Obtener el mes actual del sistema
  const obtenerMesActualIndex = () => {
    const ahora = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesActual = `${meses[ahora.getMonth()]} ${ahora.getFullYear()}`;
    
    // Buscar el mes actual en los datos
    const index = ventasMensuales.findIndex(m => m.mesCompleto === mesActual);
    return index >= 0 ? index : ventasMensuales.length - 1; // Si no existe, usar el último
  };

  // Índice real del mes seleccionado (-1 = mes actual)
  const indiceMes = mesSeleccionado === 'ytd' 
    ? 'ytd' 
    : (mesSeleccionado === -1 ? obtenerMesActualIndex() : mesSeleccionado);

  // Datos actuales según selección
  const datosActuales = indiceMes === 'ytd' 
    ? datosYTD! 
    : ventasMensuales[indiceMes as number];

  const isFinancialAIYtdSelected = indiceMes === 'ytd';
  const selectedFinancialAIMonthLabel = datosActuales.mesCompleto || 'Periodo seleccionado';
  const isFinancialAIMonthClosed = (() => {
    if (isFinancialAIYtdSelected) return false;
    const match = selectedFinancialAIMonthLabel.match(/^([A-Za-zÃ¡Ã©Ã­Ã³ÃºÃ±]+)\s+(\d{4})$/);
    if (!match) return false;

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const monthIndex = months.indexOf(match[1].toLowerCase());
    const year = Number(match[2]);
    if (monthIndex < 0 || !Number.isInteger(year)) return false;

    const now = new Date();
    const selectedMonth = monthIndex + 1;
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return year < currentYear || (year === currentYear && selectedMonth < currentMonth);
  })();

  const opcionesMeses = [
    { valor: 'ytd', etiqueta: '📊 Acumulado YTD' },
    ...ventasMensuales.map((m, i) => ({ valor: i.toString(), etiqueta: `📅 ${m.mesCompleto}` }))
  ];

  const alcanzoPE = datosActuales.ventas >= CONSTANTES_NEGOCIO.PE_MENSUAL;
  const cashYield = datosActuales.cashYield || 0;
  const cashYieldMonto = datosActuales.cashYieldMonto || 0;
  const indiceVsPE =
    typeof datosActuales.indiceVsPE === 'number' && Number.isFinite(datosActuales.indiceVsPE)
      ? datosActuales.indiceVsPE
      : datosActuales.ventas / CONSTANTES_NEGOCIO.PE_MENSUAL;

  // KPIs Financieros
  const porcentajeVsObjetivo = Math.round((datosActuales.ventas / CONSTANTES_NEGOCIO.VENTA_OBJETIVO) * 100);
  const utilidadBruta = datosActuales.ventas - datosActuales.gastos;
  const utilidadBrutaPorcentaje = datosActuales.ventas > 0 ? Math.round((utilidadBruta / datosActuales.ventas) * 10000) / 100 : 0;

  // Objetivos de comensales
  const COMENSALES_PE = 990;
  const COMENSALES_OBJETIVO = 1100;

  const brecha = {
    faltanteParaPE: Math.max(0, CONSTANTES_NEGOCIO.PE_MENSUAL - datosActuales.ventas),
    faltanteParaObjetivo: Math.max(0, CONSTANTES_NEGOCIO.VENTA_OBJETIVO - datosActuales.ventas),
    comensalesFaltantesPE: Math.max(0, COMENSALES_PE - (datosActuales.comensales || 0)),
    comensalesFaltantesObjetivo: Math.max(0, COMENSALES_OBJETIVO - (datosActuales.comensales || 0)),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Thai Thai</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-xs text-gray-500 hidden sm:block">
                  Actualizado: {lastUpdate.toLocaleTimeString('es-MX')}
                </span>
              )}
              {/* Filtro global — solo visible fuera de Cortes de Caja */}
              {tabActivo !== 'cortes' && (
                <div className="relative">
                  <select
                    value={indiceMes.toString()}
                    onChange={(e) => setMesSeleccionado(e.target.value === 'ytd' ? 'ytd' : parseInt(e.target.value))}
                    className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {opcionesMeses.map((op) => (
                      <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              <button onClick={refetch} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Actualizar datos">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  tabActivo === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Avisos de estado de datos */}
      {(dataStatus.ingresos !== 'ok' || dataStatus.gastos !== 'ok' || dataStatus.cortesCaja !== 'ok') && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 font-medium">Datos parciales:</span>
            {dataStatus.ingresos === 'ok' && (
              <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded">✓ Ingresos</span>
            )}
            {dataStatus.ingresos === 'vacio' && (
              <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">⚠ Ingresos vacío</span>
            )}
            {dataStatus.ingresos === 'error' && (
              <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded">✗ Ingresos error</span>
            )}
            {dataStatus.gastos === 'ok' && (
              <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded">✓ Gastos</span>
            )}
            {dataStatus.gastos === 'vacio' && (
              <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">⚠ Gastos vacío</span>
            )}
            {dataStatus.gastos === 'error' && (
              <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded">✗ Gastos error</span>
            )}
            {dataStatus.cortesCaja === 'ok' && (
              <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded">✓ Comensales</span>
            )}
            {(dataStatus.cortesCaja === 'vacio' || dataStatus.cortesCaja === 'error') && (
              <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">○ Comensales no disponible</span>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {tabActivo === 'cortes' && (
          <CortesdeCaja cortesCaja={cortesCaja} ingresos={ingresos} />
        )}

        {tabActivo === 'dashboard' && (() => {
          // ── Estado calculado para el nuevo diseño ──────────────────────────
          const foodCost = datosActuales.foodCost || 0;
          const labor = datosActuales.labor || 0;
          const costoPrimo = datosActuales.costoPrimo || 0;

          const estadoFoodCost = foodCost <= 28 ? 'excelente' : foodCost <= 32 ? 'bueno' : 'alerta';
          const estadoLabor = labor <= 20 ? 'excelente' : labor <= 25 ? 'bueno' : 'alerta';
          const estadoCostoPrimo = costoPrimo < 60 ? 'excelente' : 'critico';

          const estadoUtilidadBruta =
            utilidadBrutaPorcentaje >= 18 ? 'excelente'
            : utilidadBrutaPorcentaje >= 15 ? 'bueno'
            : 'critico';

          const estadoCashYield =
            cashYield >= 18 ? 'excelente'
            : cashYield >= 12 ? 'bueno'
            : 'critico';

          const estadoVentas = alcanzoPE ? 'excelente' : 'critico';
          const estadoIndice = indiceVsPE >= 1 ? 'excelente' : 'critico';

          // ── Prioridades de acción ejecutivas ──────────────────────────────
          const prioridades: AccionEjecutiva[] = [];

          if (!alcanzoPE) {
            prioridades.push({
              severidad: 'critico',
              titulo: 'Por debajo del punto de equilibrio',
              descripcion: `Ventas en ${formatCurrency(datosActuales.ventas)}, faltan ${formatCurrency(brecha.faltanteParaPE)} para cubrir todos los costos del mes.`,
              accion: 'Revisar canales de captación y activar promociones de corto plazo esta semana.',
            });
          } else {
            prioridades.push({
              severidad: 'ok',
              titulo: 'Punto de equilibrio alcanzado',
              descripcion: `Excedente de ${formatCurrency(datosActuales.ventas - CONSTANTES_NEGOCIO.PE_MENSUAL)} sobre el PE. Margen positivo para el mes.`,
              accion: 'Mantener ritmo operativo y enfocar en alcanzar el objetivo de $325,000.',
            });
          }

          if (labor > 25) {
            prioridades.push({
              severidad: 'alerta',
              titulo: 'Labor por encima del objetivo',
              descripcion: `Costo de nómina en ${labor.toFixed(1)}% de ventas netas, por encima del rango 20–25%.`,
              accion: 'Auditar turnos vs afluencia real. Ajustar horarios en días de baja demanda.',
            });
          } else if (utilidadBrutaPorcentaje < 15) {
            prioridades.push({
              severidad: 'alerta',
              titulo: 'Utilidad bruta bajo el objetivo',
              descripcion: `Margen bruto de ${utilidadBrutaPorcentaje.toFixed(1)}%, por debajo del 15% mínimo objetivo.`,
              accion: 'Revisar estructura de costos. Analizar insumos con mayor desviación vs semana previa.',
            });
          } else {
            prioridades.push({
              severidad: 'ok',
              titulo: 'Labor y utilidad bajo control',
              descripcion: `Labor ${labor.toFixed(1)}% y utilidad bruta ${utilidadBrutaPorcentaje.toFixed(1)}%, ambos dentro de rango.`,
              accion: 'Continuar con la estructura actual. Monitorear semanalmente.',
            });
          }

          if (cashYield < 12) {
            prioridades.push({
              severidad: 'alerta',
              titulo: 'Cash Yield bajo el mínimo',
              descripcion: `Rentabilidad neta de ${cashYield.toFixed(1)}% después de impuestos, por debajo del 12% objetivo.`,
              accion: 'Comparar impuestos y financiamientos vs mes anterior. Evaluar con contador.',
            });
          } else {
            prioridades.push({
              severidad: 'ok',
              titulo: 'Cash Yield saludable',
              descripcion: `Rentabilidad neta de ${cashYield.toFixed(1)}% después de impuestos y financiamientos.`,
              accion: 'Mantener disciplina en gastos. Proyectar cierre del mes vs objetivo.',
            });
          }

          return (
            <div className="space-y-6">
              {/* A. Header de periodo */}
              <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{datosActuales.mesCompleto}</span>
                </div>
                <div className={cn(
                  'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border',
                  alcanzoPE
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                )}>
                  <Target className="h-3.5 w-3.5" />
                  PE: {alcanzoPE ? 'Alcanzado' : 'No alcanzado'}
                </div>
              </div>

              {/* B. Executive Snapshot — 4 KPIs principales */}
              <section>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Panorama ejecutivo
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <ExecutiveCard
                    label="Ventas Netas"
                    value={formatCurrency(datosActuales.ventas)}
                    subtitle={`${porcentajeVsObjetivo}% del objetivo mensual`}
                    status={estadoVentas}
                    statusLabel={alcanzoPE ? '✓ Sobre PE' : '↓ Bajo PE'}
                  />
                  <ExecutiveCard
                    label="Utilidad Bruta"
                    value={`${utilidadBrutaPorcentaje.toFixed(1)}%`}
                    secondary={formatCurrency(Math.round(utilidadBruta))}
                    subtitle="Objetivo: 15% – 18%"
                    status={estadoUtilidadBruta}
                    statusLabel={
                      utilidadBrutaPorcentaje >= 18 ? 'Excelente'
                      : utilidadBrutaPorcentaje >= 15 ? 'Dentro de rango'
                      : 'Bajo objetivo'
                    }
                  />
                  <ExecutiveCard
                    label="Cash Yield"
                    value={`${cashYield.toFixed(1)}%`}
                    secondary={formatCurrency(Math.round(cashYieldMonto))}
                    subtitle="Objetivo: 12% – 18%"
                    status={estadoCashYield}
                    statusLabel={
                      cashYield >= 18 ? 'Excelente'
                      : cashYield >= 12 ? 'Dentro de rango'
                      : 'Bajo objetivo'
                    }
                  />
                  <ExecutiveCard
                    label="Índice vs PE"
                    value={indiceVsPE.toFixed(2)}
                    subtitle={`PE mensual: ${formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)}`}
                    status={estadoIndice}
                    statusLabel={indiceVsPE >= 1 ? '↑ Arriba del PE' : '↓ Debajo del PE'}
                  />
                </div>
              </section>

              {/* C. Brecha y objetivos */}
              <section>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  ¿Cuánto falta para llegar?
                </div>
                <BrechaProgress
                  ventasActuales={datosActuales.ventas}
                  peMensual={CONSTANTES_NEGOCIO.PE_MENSUAL}
                  ventaObjetivo={CONSTANTES_NEGOCIO.VENTA_OBJETIVO}
                  comensalesActuales={datosActuales.comensales || 0}
                  comensalesPE={990}
                  comensalesObjetivo={1100}
                  comisiones={datosActuales.comisiones || 0}
                  ventasBrutas={datosActuales.ventasBrutas || 0}
                  formatCurrency={formatCurrency}
                />
              </section>

              {/* D. Salud operativa */}
              <section>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Salud operativa
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <OperativeHealthBar
                    titulo="Food Cost"
                    valor={foodCost}
                    estado={estadoFoodCost as 'excelente' | 'bueno' | 'alerta' | 'critico'}
                    objetivo="28% – 32%"
                    rangeMax={32}
                    monto={datosActuales.costoVenta || 0}
                  />
                  <OperativeHealthBar
                    titulo="Labor"
                    valor={labor}
                    estado={estadoLabor as 'excelente' | 'bueno' | 'alerta' | 'critico'}
                    objetivo="20% – 25%"
                    rangeMax={25}
                    monto={datosActuales.nomina || 0}
                  />
                  <OperativeHealthBar
                    titulo="Costo Primo"
                    valor={costoPrimo}
                    estado={estadoCostoPrimo as 'excelente' | 'bueno' | 'alerta' | 'critico'}
                    objetivo="< 60%"
                    rangeMax={60}
                    monto={(datosActuales.costoVenta || 0) + (datosActuales.nomina || 0)}
                  />
                </div>
              </section>

              {/* E. Prioridades de acción */}
              <section>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Prioridades de acción
                </div>
                <ActionPriorities acciones={prioridades} />
              </section>
            </div>
          );
        })()}

        {tabActivo === 'comisiones' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800">Análisis de Comisiones por Plataforma</h2>
            </div>
            <ComisionesPlataformas filtroMes={mesSeleccionado} datosEnTiempoReal={{ comisionesPorPlataforma, ingresos }} />
          </div>
        )}

        {tabActivo === 'proyeccion' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">Proyección para Alcanzar el PE</h2>
            </div>
            <ProyeccionPECard mesIndex={typeof mesSeleccionado === 'number' ? mesSeleccionado : 0} datosReales={datosActuales} />
          </div>
        )}

        {tabActivo === 'analisis' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-800">Análisis de Costos por Rango de Fecha</h2>
            </div>
            <AnalisisRangoFechas gastosRaw={gastos} />
          </div>
        )}

        {tabActivo === 'ads' && (
          <AdsPerformance />
        )}

        {tabActivo === 'financial-ai' && (
          <FinancialAIAnalysisTab
            selectedMonthLabel={selectedFinancialAIMonthLabel}
            isYtdSelected={isFinancialAIYtdSelected}
            isClosedMonth={isFinancialAIMonthClosed}
          />
        )}

        {tabActivo === 'automatizacion' && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">¡Conexión Activa!</h2>
                    <p className="text-green-600">El dashboard está conectado a Google Sheets en tiempo real.</p>
                    <p className="text-sm text-green-500 mt-1">
                      Sheet ID: {process.env.NEXT_PUBLIC_SHEET_ID || '17LNxz8jXPWF9G2d0Rwa1Mzw-6s1brtJzYufnyOI42FI'.substring(0, 20)}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-blue-500" />
                  Datos Conectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800">Ingresos_BD</h3>
                    <p className="text-2xl font-bold text-blue-600">{ingresos.length} registros</p>
                    <p className="text-sm text-blue-500">Última actualización: {lastUpdate?.toLocaleString('es-MX')}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800">Gastos_BD</h3>
                    <p className="text-2xl font-bold text-red-600">{gastos.length} registros</p>
                    <p className="text-sm text-red-500">Última actualización: {lastUpdate?.toLocaleString('es-MX')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-gray-500 text-sm">Ventas Brutas</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(acumulado.ventasBrutas)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Comisiones</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(acumulado.comisiones)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Ventas Netas</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(acumulado.ventasNetas)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Gastos</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(acumulado.gastos)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-500 border-t border-gray-200">
        <p>THAI THAI Dashboard • Conectado a Google Sheets • {lastUpdate?.toLocaleString('es-MX') || 'Cargando...'}</p>
      </footer>
    </div>
  );
}

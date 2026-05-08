'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { ThermometerGauge } from '@/components/dashboard/ThermometerGauge';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { TopItemsChart } from '@/components/dashboard/TopItemsChart';
import { ComisionesPlataformas } from '@/components/dashboard/ComisionesPlataformas';
import { ProyeccionPECard } from '@/components/dashboard/ProyeccionPE';
import { AnalisisRangoFechas } from '@/components/dashboard/AnalisisRangoFechas';
import { CortesdeCaja } from '@/components/dashboard/CortesdeCaja';
import { CONSTANTES_NEGOCIO, chartColors } from '@/data/realData';
import { useGoogleSheets, procesarDatosDashboard, parseMoney, parseFecha, getMesAnio } from '@/hooks/useGoogleSheets';
import { 
  Activity, DollarSign, BarChart3, Calendar, RefreshCw, Download, ShoppingCart,
  Lightbulb, AlertTriangle, CheckCircle, ChevronDown, Target, Info,
  CreditCard, Calculator, Filter, Settings, ExternalLink, Loader2, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'cortes' | 'dashboard' | 'comisiones' | 'proyeccion' | 'analisis' | 'automatizacion';

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

  const { ventasMensuales, acumulado, comisionesPorPlataforma, gastosPorCategoria } = datosProcesados;

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

  const opcionesMeses = [
    { valor: 'ytd', etiqueta: '📊 Acumulado YTD' },
    ...ventasMensuales.map((m, i) => ({ valor: i.toString(), etiqueta: `📅 ${m.mesCompleto}` }))
  ];

  const alcanzoPE = datosActuales.ventas >= CONSTANTES_NEGOCIO.PE_MENSUAL;
  const utilidad = datosActuales.ventas - datosActuales.gastos;
  const cashYield = datosActuales.cashYield || 0;
  const cashYieldMonto = datosActuales.cashYieldMonto || 0;

  // KPIs Financieros
  const porcentajeVsObjetivo = Math.round((datosActuales.ventas / CONSTANTES_NEGOCIO.VENTA_OBJETIVO) * 100);
  const utilidadBruta = datosActuales.ventas - datosActuales.gastos;
  const utilidadBrutaPorcentaje = datosActuales.ventas > 0 ? Math.round((utilidadBruta / datosActuales.ventas) * 10000) / 100 : 0;
  
  const kpis = [
    { 
      titulo: 'Utilidad Bruta', 
      valor: utilidadBrutaPorcentaje, 
      unidad: '%', 
      tendencia: 0, 
      estado: utilidadBrutaPorcentaje >= 15 ? (utilidadBrutaPorcentaje >= 18 ? 'excelente' : 'bueno') : 'alerta' as const, 
      descripcion: 'Objetivo: 15% - 18%',
      monto: Math.round(utilidadBruta)
    },
    { 
      titulo: 'Cash Yield', 
      valor: cashYield, 
      unidad: '%', 
      tendencia: 0, 
      estado: cashYield >= 12 ? (cashYield >= 18 ? 'excelente' : 'bueno') : 'alerta' as const, 
      descripcion: 'Utilidad neta después de impuestos',
      monto: Math.round(cashYieldMonto)
    },
    { 
      titulo: 'Ventas Netas', 
      valor: datosActuales.ventas, 
      unidad: '$', 
      tendencia: 0, 
      estado: alcanzoPE ? 'excelente' : 'critico' as const, 
      descripcion: `${porcentajeVsObjetivo}% vs objetivo ${formatCurrency(CONSTANTES_NEGOCIO.VENTA_OBJETIVO)}` 
    },
    { 
      titulo: 'Gastos Operativos', 
      valor: datosActuales.gastos, 
      unidad: '$', 
      tendencia: 0, 
      estado: 'bueno' as const, 
      descripcion: 'Costo de Venta + Gastos Op' 
    },
  ];

  const kpisRestaurante = [
    { titulo: 'Índice vs PE', valor: parseFloat(datosActuales.indiceVsPE.toFixed(2)), unidad: '', tendencia: 0, estado: datosActuales.indiceVsPE >= 1 ? 'excelente' : 'critico' as const, descripcion: datosActuales.indiceVsPE >= 1 ? '¡Arriba del PE!' : 'Debajo del PE' },
    { titulo: 'PE Mensual', valor: CONSTANTES_NEGOCIO.PE_MENSUAL, unidad: '$', tendencia: 0, estado: 'bueno' as const, descripcion: 'Punto de equilibrio' },
    { titulo: 'Venta Objetivo', valor: CONSTANTES_NEGOCIO.VENTA_OBJETIVO, unidad: '$', tendencia: 0, estado: 'bueno' as const, descripcion: 'Meta mensual' },
    { titulo: 'Comisiones', valor: datosActuales.comisiones, unidad: '$', tendencia: 0, estado: 'alerta' as const, descripcion: `${Math.round((datosActuales.comisiones / datosActuales.ventasBrutas) * 100)}% sobre ventas brutas` },
  ];

  // Objetivos de comensales
  const COMENSALES_PE = 990;
  const COMENSALES_OBJETIVO = 1100;

  const brecha = {
    faltanteParaPE: Math.max(0, CONSTANTES_NEGOCIO.PE_MENSUAL - datosActuales.ventas),
    faltanteParaObjetivo: Math.max(0, CONSTANTES_NEGOCIO.VENTA_OBJETIVO - datosActuales.ventas),
    comensalesFaltantesPE: Math.max(0, COMENSALES_PE - (datosActuales.comensales || 0)),
    comensalesFaltantesObjetivo: Math.max(0, COMENSALES_OBJETIVO - (datosActuales.comensales || 0)),
  };

  // KPIs de Brechas
  const kpisBrechas = [
    { 
      titulo: 'Faltante para PE', 
      valor: brecha.faltanteParaPE, 
      unidad: '$', 
      tendencia: 0, 
      estado: brecha.faltanteParaPE === 0 ? 'excelente' : 'alerta' as const, 
      descripcion: brecha.faltanteParaPE === 0 ? '¡PE alcanzado!' : `Ventas actuales: ${formatCurrency(datosActuales.ventas)}` 
    },
    { 
      titulo: 'Faltante para Objetivo', 
      valor: brecha.faltanteParaObjetivo, 
      unidad: '$', 
      tendencia: 0, 
      estado: brecha.faltanteParaObjetivo === 0 ? 'excelente' : 'bueno' as const, 
      descripcion: brecha.faltanteParaObjetivo === 0 ? '¡Objetivo alcanzado!' : `Meta: ${formatCurrency(CONSTANTES_NEGOCIO.VENTA_OBJETIVO)}` 
    },
    { 
      titulo: 'Comensales Faltantes', 
      valor: brecha.comensalesFaltantesObjetivo, 
      unidad: '', 
      tendencia: 0, 
      estado: brecha.comensalesFaltantesObjetivo === 0 ? 'excelente' : 'alerta' as const, 
      descripcion: `Actual: ${datosActuales.comensales || 0} | Objetivo: ${COMENSALES_OBJETIVO}`
    },
    { 
      titulo: 'Comensales Faltantes PE', 
      valor: brecha.comensalesFaltantesPE, 
      unidad: '', 
      tendencia: 0, 
      estado: brecha.comensalesFaltantesPE === 0 ? 'excelente' : 'alerta' as const, 
      descripcion: `Actual: ${datosActuales.comensales || 0} | PE: ${COMENSALES_PE}`
    },
  ];

  // Recomendaciones
  const recomendaciones = [];
  if (utilidadBrutaPorcentaje < 15) {
    recomendaciones.push({ tipo: 'alerta' as const, titulo: 'Utilidad Bruta Baja', descripcion: `La utilidad bruta de ${utilidadBrutaPorcentaje.toFixed(1)}% está por debajo del 15% objetivo.` });
  } else if (utilidadBrutaPorcentaje >= 18) {
    recomendaciones.push({ tipo: 'exito' as const, titulo: 'Utilidad Bruta Excelente', descripcion: `Utilidad bruta de ${utilidadBrutaPorcentaje.toFixed(1)}% supera el objetivo de 18%.` });
  }
  if (cashYield < 12) {
    recomendaciones.push({ tipo: 'alerta' as const, titulo: 'Cash Yield Bajo', descripcion: `El Cash Yield de ${cashYield.toFixed(2)}% está por debajo del 12% objetivo.` });
  } else if (cashYield >= 18) {
    recomendaciones.push({ tipo: 'exito' as const, titulo: 'Cash Yield Excelente', descripcion: `Cash Yield de ${cashYield.toFixed(2)}% supera el objetivo de 18%.` });
  }
  if (!alcanzoPE) {
    recomendaciones.push({ tipo: 'alerta' as const, titulo: 'Por debajo del PE', descripcion: `Faltan ${formatCurrency(brecha.faltanteParaPE)} para alcanzar el punto de equilibrio.` });
  } else {
    recomendaciones.push({ tipo: 'exito' as const, titulo: 'PE Alcanzado', descripcion: `Has superado el PE. Excedente: ${formatCurrency(datosActuales.ventas - CONSTANTES_NEGOCIO.PE_MENSUAL)}` });
  }
  recomendaciones.push({ tipo: 'info' as const, titulo: 'Referencias', descripcion: `PE: ${formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)} | Objetivo: ${formatCurrency(CONSTANTES_NEGOCIO.VENTA_OBJETIVO)}` });

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

        {tabActivo === 'dashboard' && (
          <div className="space-y-6">
            {/* Estado */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {datosActuales.mesCompleto}
                </span>
              </div>
              <div className={cn('rounded-lg px-4 py-2 flex items-center gap-2', alcanzoPE ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
                <Target className={cn('h-4 w-4', alcanzoPE ? 'text-green-600' : 'text-red-600')} />
                <span className={cn('text-sm font-medium', alcanzoPE ? 'text-green-700' : 'text-red-700')}>
                  PE: {alcanzoPE ? 'Alcanzado' : 'No alcanzado'}
                </span>
              </div>
            </div>

            {/* KPIs */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-700">KPIs Financieros</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => <KPICard key={kpi.titulo} kpi={kpi} />)}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-700">KPIs de Restaurante</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpisRestaurante.map((kpi) => <KPICard key={kpi.titulo} kpi={kpi} />)}
              </div>
            </section>

            {/* KPIs de Brechas */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h2 className="text-sm font-semibold text-gray-700">Brechas vs Objetivos</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpisBrechas.map((kpi) => <KPICard key={kpi.titulo} kpi={kpi} />)}
              </div>
            </section>

            {/* Termómetros */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-700">Indicadores de Salud</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ThermometerGauge titulo="Utilidad Bruta" valor={utilidadBrutaPorcentaje} tipo="margen" monto={Math.round(utilidadBruta)} />
                <ThermometerGauge titulo="Cash Yield" valor={cashYield} tipo="margen" monto={Math.round(cashYieldMonto)} />
                <ThermometerGauge titulo="Índice vs PE" valor={datosActuales.indiceVsPE * 100} tipo="indice" />
                <ThermometerGauge titulo="Nivel de Ventas" valor={datosActuales.ventas} tipo="ventas" />
              </div>
            </section>

            {/* KPIs Operativos - Food Cost, Labor, Costo Primo */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h2 className="text-sm font-semibold text-gray-700">KPIs Operativos</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard 
                  kpi={{ 
                    titulo: 'Food Cost', 
                    valor: datosActuales.foodCost || 0, 
                    unidad: '%', 
                    tendencia: 0, 
                    estado: (datosActuales.foodCost || 0) <= 32 ? ((datosActuales.foodCost || 0) <= 28 ? 'excelente' : 'bueno') : 'alerta' as const, 
                    descripcion: `Objetivo: 28% - 32%`,
                    monto: datosActuales.costoVenta || 0
                  }} 
                />
                <KPICard 
                  kpi={{ 
                    titulo: 'Labor', 
                    valor: datosActuales.labor || 0, 
                    unidad: '%', 
                    tendencia: 0, 
                    estado: (datosActuales.labor || 0) <= 25 ? ((datosActuales.labor || 0) <= 20 ? 'excelente' : 'bueno') : 'alerta' as const, 
                    descripcion: `Objetivo: 20% - 25%`,
                    monto: datosActuales.nomina || 0
                  }} 
                />
                <KPICard 
                  kpi={{ 
                    titulo: 'Costo Primo', 
                    valor: datosActuales.costoPrimo || 0, 
                    unidad: '%', 
                    tendencia: 0, 
                    estado: (datosActuales.costoPrimo || 0) < 60 ? 'excelente' : 'alerta' as const, 
                    descripcion: `Objetivo: < 60%`,
                    monto: (datosActuales.costoVenta || 0) + (datosActuales.nomina || 0)
                  }} 
                />
              </div>
            </section>

            {/* Recomendaciones */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-700">Recomendaciones</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recomendaciones.map((rec, index) => (
                  <Card key={index} className={cn('border-l-4', rec.tipo === 'alerta' && 'border-l-amber-500 bg-amber-50', rec.tipo === 'exito' && 'border-l-green-500 bg-green-50', rec.tipo === 'info' && 'border-l-blue-500 bg-blue-50')}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-full', rec.tipo === 'alerta' && 'bg-amber-100', rec.tipo === 'exito' && 'bg-green-100', rec.tipo === 'info' && 'bg-blue-100')}>
                          {rec.tipo === 'alerta' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                          {rec.tipo === 'exito' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {rec.tipo === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">{rec.titulo}</h3>
                          <p className="text-xs text-gray-600 mt-1">{rec.descripcion}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

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

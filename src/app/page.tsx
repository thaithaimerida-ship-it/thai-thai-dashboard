'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { ThermometerGauge } from '@/components/dashboard/ThermometerGauge';
import { TrendChart, MarginChart } from '@/components/dashboard/TrendChart';
import { TopItemsChart } from '@/components/dashboard/TopItemsChart';
import { PEIndicator, ClientesMetrics, VentaDiariaMetrics, BrechaDetail } from '@/components/dashboard/PEIndicator';
import { ComisionesPlataformas } from '@/components/dashboard/ComisionesPlataformas';
import { ProyeccionPECard } from '@/components/dashboard/ProyeccionPE';
import { AnalisisRangoFechas } from '@/components/dashboard/AnalisisRangoFechas';
import { 
  ventasMensuales, 
  opcionesMeses, 
  generateKPIs,
  generateKPIsRestaurante,
  getDatosMes,
  getKPIsBrecha,
  CONSTANTES_NEGOCIO,
  chartColors,
  resumenEjecutivo
} from '@/data/realData';
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Calendar,
  RefreshCw,
  Download,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Target,
  Users,
  Info,
  CreditCard,
  Calculator,
  Filter,
  Settings,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'dashboard' | 'comisiones' | 'proyeccion' | 'analisis' | 'automatizacion';

export default function Dashboard() {
  const [mesSeleccionado, setMesSeleccionado] = useState<number | 'acumulado'>(ventasMensuales.length - 1);
  const [tabActivo, setTabActivo] = useState<TabId>('dashboard');
  
  const kpis = generateKPIs(mesSeleccionado);
  const kpisRestaurante = generateKPIsRestaurante(mesSeleccionado);
  const datosActuales = getDatosMes(mesSeleccionado);
  
  const mostrarBrecha = mesSeleccionado !== 'acumulado';
  const brecha = mostrarBrecha ? getKPIsBrecha(mesSeleccionado as number) : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleMesChange = (valor: string) => {
    if (valor === 'acumulado') {
      setMesSeleccionado('acumulado');
    } else {
      setMesSeleccionado(parseInt(valor));
    }
  };

  const alcanzoPE = datosActuales.ventas >= CONSTANTES_NEGOCIO.PE_MENSUAL;
  const alcanzoObjetivo = datosActuales.ventas >= CONSTANTES_NEGOCIO.VENTA_OBJETIVO;
  const utilidad = datosActuales.ventas - datosActuales.gastos;
  const porcentajeGastoSobreVentas = datosActuales.ventas > 0 ? Math.round((datosActuales.gastos / datosActuales.ventas) * 100) : 0;

  // Tabs de navegación
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'comisiones' as const, label: 'Comisiones', icon: CreditCard },
    { id: 'proyeccion' as const, label: 'Proyección PE', icon: Calculator },
    { id: 'analisis' as const, label: 'Análisis Fechas', icon: Filter },
    { id: 'automatizacion' as const, label: 'Automatizar', icon: Settings },
  ];

  // Recomendaciones
  const recomendaciones = [];
  if (datosActuales.margenBruto < 25) {
    recomendaciones.push({
      tipo: 'alerta' as const,
      titulo: 'Margen Bruto Bajo',
      descripcion: `El margen bruto de ${datosActuales.margenBruto}% está por debajo del 25% recomendado.`,
    });
  }
  if (!alcanzoPE && mostrarBrecha) {
    recomendaciones.push({
      tipo: 'alerta' as const,
      titulo: 'Por debajo del PE',
      descripcion: `Faltan ${formatCurrency(brecha!.faltanteParaPE)} para alcanzar el punto de equilibrio.`,
    });
  } else if (alcanzoPE && mostrarBrecha) {
    recomendaciones.push({
      tipo: 'exito' as const,
      titulo: 'PE Alcanzado',
      descripcion: `Has superado el PE. Excedente: ${formatCurrency(datosActuales.ventas - CONSTANTES_NEGOCIO.PE_MENSUAL)}`,
    });
  }
  recomendaciones.push({
    tipo: 'info' as const,
    titulo: 'Referencias',
    descripcion: `PE: ${formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)} | Objetivo: ${formatCurrency(CONSTANTES_NEGOCIO.VENTA_OBJETIVO)}`,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  THAI THAI Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Termómetro para toma de decisiones
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Selector de mes */}
              <div className="relative">
                <select
                  value={mesSeleccionado.toString()}
                  onChange={(e) => handleMesChange(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {opcionesMeses.map((op) => (
                    <option key={op.valor} value={op.valor}>
                      {op.etiqueta}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  tabActivo === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB: Dashboard Principal */}
        {tabActivo === 'dashboard' && (
          <div className="space-y-6">
            {/* Indicadores de estado */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {mesSeleccionado === 'acumulado' 
                    ? 'Período Acumulado' 
                    : ventasMensuales[mesSeleccionado]?.mesCompleto}
                </span>
              </div>
              
              {mostrarBrecha && (
                <>
                  <div className={cn(
                    'rounded-lg px-4 py-2 flex items-center gap-2',
                    alcanzoPE 
                      ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                  )}>
                    <Target className={cn('h-4 w-4', alcanzoPE ? 'text-green-600' : 'text-red-600')} />
                    <span className={cn('text-sm font-medium', alcanzoPE ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
                      PE: {alcanzoPE ? 'Alcanzado' : 'No alcanzado'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* KPIs Financieros */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">KPIs Financieros</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                  <KPICard key={kpi.titulo} kpi={kpi} />
                ))}
              </div>
            </section>

            {/* KPIs de Restaurante */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">KPIs de Restaurante (PE y Objetivo)</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpisRestaurante.map((kpi) => (
                  <KPICard key={kpi.titulo} kpi={kpi} />
                ))}
              </div>
            </section>

            {/* Termómetros */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Indicadores de Salud</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ThermometerGauge 
                  titulo="Margen Bruto" 
                  valor={datosActuales.margenBruto} 
                  tipo="margen"
                  monto={Math.round(datosActuales.ventas * datosActuales.margenBruto / 100)}
                />
                <ThermometerGauge 
                  titulo="Margen Neto" 
                  valor={datosActuales.margenNeto} 
                  tipo="margen"
                  monto={Math.round(datosActuales.ventas * datosActuales.margenNeto / 100)}
                />
                <ThermometerGauge 
                  titulo="Índice vs PE" 
                  valor={datosActuales.indiceVsPE * 100} 
                  tipo="indice"
                />
                <ThermometerGauge 
                  titulo="Nivel de Ventas" 
                  valor={datosActuales.ventas} 
                  tipo="ventas"
                />
              </div>
            </section>

            {/* Gráfico de tendencias */}
            <section>
              <TrendChart mesSeleccionado={mesSeleccionado} />
            </section>

            {/* Top gastos y ventas */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Análisis Detallado</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TopItemsChart tipo="gastos" />
                <TopItemsChart tipo="ventas" />
              </div>
            </section>

            {/* Resumen */}
            <section>
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Ventas</p>
                      <p className="text-2xl font-bold">{formatCurrency(datosActuales.ventas)}</p>
                      <p className="text-blue-200 text-xs mt-1">Neto del período</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Gastos</p>
                      <p className="text-2xl font-bold">{formatCurrency(datosActuales.gastos)}</p>
                      <p className="text-blue-200 text-xs mt-1">{porcentajeGastoSobreVentas}% sobre ventas</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Utilidad Neta</p>
                      <p className="text-2xl font-bold text-green-300">{formatCurrency(utilidad)}</p>
                      <p className="text-blue-200 text-xs mt-1">{datosActuales.margenNeto}% margen</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Margen Bruto</p>
                      <p className="text-2xl font-bold">{datosActuales.margenBruto}%</p>
                      <p className="text-blue-200 text-xs mt-1">= {formatCurrency(Math.round(datosActuales.ventas * datosActuales.margenBruto / 100))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recomendaciones */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recomendaciones</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recomendaciones.map((rec, index) => (
                  <Card 
                    key={index}
                    className={cn(
                      'border-l-4',
                      rec.tipo === 'alerta' && 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
                      rec.tipo === 'exito' && 'border-l-green-500 bg-green-50 dark:bg-green-950/30',
                      rec.tipo === 'info' && 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30',
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-2 rounded-full',
                          rec.tipo === 'alerta' && 'bg-amber-100 dark:bg-amber-900',
                          rec.tipo === 'exito' && 'bg-green-100 dark:bg-green-900',
                          rec.tipo === 'info' && 'bg-blue-100 dark:bg-blue-900',
                        )}>
                          {rec.tipo === 'alerta' && <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                          {rec.tipo === 'exito' && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                          {rec.tipo === 'info' && <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{rec.titulo}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.descripcion}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB: Comisiones por Plataforma */}
        {tabActivo === 'comisiones' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Análisis de Comisiones por Plataforma
              </h2>
            </div>
            <ComisionesPlataformas filtroMes={mesSeleccionado} />
          </div>
        )}

        {/* TAB: Proyección PE */}
        {tabActivo === 'proyeccion' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Proyección para Alcanzar el Punto de Equilibrio
              </h2>
            </div>
            <ProyeccionPECard mesIndex={typeof mesSeleccionado === 'number' ? mesSeleccionado : 0} />
          </div>
        )}

        {/* TAB: Análisis por Fechas */}
        {tabActivo === 'analisis' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Análisis de Costos por Rango de Fecha
              </h2>
            </div>
            <AnalisisRangoFechas />
          </div>
        )}

        {/* TAB: Automatización */}
        {tabActivo === 'automatizacion' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Automatizar Conexión con Google Sheets
              </h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-blue-500" />
                  Conectar con Google Sheets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold">Opción 1: Google Sheets API (Recomendado)</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li>
                      <strong>Crear proyecto en Google Cloud Console</strong>
                      <p className="text-gray-600 dark:text-gray-400 ml-4">
                        Ve a <a href="https://console.cloud.google.com" target="_blank" className="text-blue-500 hover:underline">console.cloud.google.com</a>, crea un proyecto nuevo.
                      </p>
                    </li>
                    <li>
                      <strong>Habilitar Google Sheets API</strong>
                      <p className="text-gray-600 dark:text-gray-400 ml-4">
                        En &quot;APIs &amp; Services&quot; → &quot;Library&quot;, busca &quot;Google Sheets API&quot; y habilítala.
                      </p>
                    </li>
                    <li>
                      <strong>Crear credenciales (Service Account)</strong>
                      <p className="text-gray-600 dark:text-gray-400 ml-4">
                        En &quot;APIs &amp; Services&quot; → &quot;Credentials&quot;, crea una cuenta de servicio.
                        Descarga el archivo JSON de credenciales.
                      </p>
                    </li>
                    <li>
                      <strong>Compartir tu Google Sheet</strong>
                      <p className="text-gray-600 dark:text-gray-400 ml-4">
                        Abre tu Google Sheet y compártelo con el email de la cuenta de servicio (tiene formato: 
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">nombre@proyecto.iam.gserviceaccount.com</code>).
                      </p>
                    </li>
                    <li>
                      <strong>Obtener el ID del Spreadsheet</strong>
                      <p className="text-gray-600 dark:text-gray-400 ml-4">
                        El ID está en la URL de tu Sheet: 
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                          docs.google.com/spreadsheets/d/<strong className="text-blue-600">ESTE_ES_EL_ID</strong>/edit
                        </code>
                      </p>
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Código de ejemplo para Next.js API Route:
                  </h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// app/api/sheets/route.ts
import { google } from 'googleapis';

export async function GET() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: 'TU_SPREADSHEET_ID',
    range: 'Gastos_BD!A:O', // Nombre de tu hoja
  });

  return Response.json(response.data.values);
}`}
                  </pre>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold">Opción 2: Publicar como CSV (Más simple)</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>En tu Google Sheet, ve a <strong>Archivo → Compartir → Publicar en la web</strong></li>
                    <li>Selecciona la hoja que quieres publicar</li>
                    <li>Elige formato <strong>Valores separados por comas (.csv)</strong></li>
                    <li>Copia el enlace generado</li>
                  </ol>
                  <p className="text-gray-600 dark:text-gray-400">
                    ⚠️ Nota: Este método hace los datos públicos. Úsalo solo si no hay información sensible.
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Importante
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Nunca subas el archivo de credenciales JSON a repositorios públicos</li>
                    <li>• Usa variables de entorno para las credenciales</li>
                    <li>• La cuenta de servicio solo puede acceder a sheets que le hayas compartido</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ Datos Actuales
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    El dashboard ya está funcionando con datos importados desde tus archivos CSV.
                    Para actualizar, simplemente exporta nuevos CSV desde tu Google Sheet y reemplaza los archivos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>THAI THAI Dashboard • Datos reales Enero-Febrero 2026</p>
      </footer>
    </div>
  );
}

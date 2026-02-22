'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONSTANTES_NEGOCIO, getEstadoIndicador, getKPIsBrecha } from '@/data/realData';
import { cn } from '@/lib/utils';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface PEIndicatorProps {
  mesIndex: number;
  ventas: number;
  indiceVsPE: number;
}

// Componente principal del indicador de PE
export function PEIndicator({ mesIndex, ventas, indiceVsPE }: PEIndicatorProps) {
  const brecha = getKPIsBrecha(mesIndex);
  const estado = getEstadoIndicador(indiceVsPE, 'indice');
  
  // Calcular porcentaje hacia el objetivo
  const porcentajePE = Math.min((ventas / CONSTANTES_NEGOCIO.PE_MENSUAL) * 100, 150);
  const porcentajeObjetivo = Math.min((ventas / CONSTANTES_NEGOCIO.VENTA_OBJETIVO) * 100, 150);
  
  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Target className="h-4 w-4 text-amber-500" />
          Indicador PE vs Objetivo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Barra de progreso dual */}
        <div className="space-y-4">
          {/* PE Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Punto de Equilibrio
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatCurrency(ventas)} / {formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)}
              </span>
            </div>
            <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
                  porcentajePE >= 100 ? 'bg-green-500' : porcentajePE >= 90 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(porcentajePE, 100)}%` }}
              />
              {/* Marcador del PE */}
              <div className="absolute top-0 h-full w-0.5 bg-amber-600" style={{ left: '100%' }}></div>
            </div>
          </div>
          
          {/* Objetivo Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Venta Objetivo
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {porcentajeObjetivo >= 100 ? '✓ ' : ''}{porcentajeObjetivo.toFixed(0)}% de la meta
              </span>
            </div>
            <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
                  porcentajeObjetivo >= 100 ? 'bg-blue-500' : porcentajeObjetivo >= 90 ? 'bg-blue-400' : 'bg-blue-300'
                )}
                style={{ width: `${Math.min(porcentajeObjetivo, 100)}%` }}
              />
              {/* Marcador del objetivo */}
              <div className="absolute top-0 h-full w-0.5 bg-blue-600" style={{ left: '100%' }}></div>
            </div>
          </div>
          
          {/* Estado actual */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-lg">{estado.emoji}</span>
              <div>
                <span className="text-sm font-semibold" style={{ color: estado.color }}>
                  Índice: {indiceVsPE}
                </span>
                <p className="text-xs text-gray-500">{estado.descripcion}</p>
              </div>
            </div>
            {indiceVsPE < 1 && (
              <div className="text-right">
                <span className="text-xs text-gray-500">Faltan</span>
                <p className="text-sm font-bold text-red-600">
                  {formatCurrency(brecha.faltanteParaPE)}
                </p>
              </div>
            )}
            {indiceVsPE >= 1 && (
              <div className="text-right">
                <span className="text-xs text-gray-500">Excedente</span>
                <p className="text-sm font-bold text-green-600">
                  {formatCurrency(ventas - CONSTANTES_NEGOCIO.PE_MENSUAL)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para métricas de clientes/comensales
export function ClientesMetrics({ mesIndex, clientes }: { mesIndex: number; clientes: number }) {
  const brecha = getKPIsBrecha(mesIndex);
  const clientesDiarios = Math.round(clientes / CONSTANTES_NEGOCIO.DIAS_MES);
  const clientesObjetivoTotal = CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO * CONSTANTES_NEGOCIO.DIAS_MES;
  const porcentajeClientes = (clientes / clientesObjetivoTotal) * 100;
  
  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Users className="h-4 w-4 text-purple-500" />
          Métricas de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {clientes.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Clientes del Mes</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {clientesDiarios}
            </p>
            <p className="text-xs text-gray-500">Clientes/Día</p>
          </div>
        </div>
        
        {/* Barra de progreso de clientes */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">vs Objetivo ({CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO}/día)</span>
            <span className={cn(
              'font-medium',
              porcentajeClientes >= 100 ? 'text-green-600' : porcentajeClientes >= 80 ? 'text-amber-600' : 'text-red-600'
            )}>
              {porcentajeClientes.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all duration-500',
                porcentajeClientes >= 100 ? 'bg-purple-500' : porcentajeClientes >= 80 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${Math.min(porcentajeClientes, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Referencias */}
        <div className="mt-3 flex justify-between text-xs text-gray-500">
          <span>PE: {CONSTANTES_NEGOCIO.COMENSALES_PE}/día</span>
          <span>Objetivo: {CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO}/día</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para venta diaria
export function VentaDiariaMetrics({ ventas }: { ventas: number }) {
  const ventaDiaria = ventas / CONSTANTES_NEGOCIO.DIAS_MES;
  const porcentajePE = (ventaDiaria / CONSTANTES_NEGOCIO.VENTA_DIARIA_PE) * 100;
  const porcentajeObjetivo = (ventaDiaria / CONSTANTES_NEGOCIO.VENTA_DIARIA_OBJETIVO) * 100;
  
  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Calendar className="h-4 w-4 text-cyan-500" />
          Venta Diaria
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(ventaDiaria)}
          </p>
          <p className="text-xs text-gray-500">Promedio diario</p>
        </div>
        
        <div className="space-y-3">
          {/* vs PE Diario */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">vs PE ({formatCurrency(CONSTANTES_NEGOCIO.VENTA_DIARIA_PE)})</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full', porcentajePE >= 100 ? 'bg-green-500' : 'bg-red-500')}
                  style={{ width: `${Math.min(porcentajePE, 100)}%` }}
                />
              </div>
              <span className={cn('text-xs font-medium', porcentajePE >= 100 ? 'text-green-600' : 'text-red-600')}>
                {porcentajePE.toFixed(0)}%
              </span>
            </div>
          </div>
          
          {/* vs Objetivo Diario */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">vs Objetivo ({formatCurrency(CONSTANTES_NEGOCIO.VENTA_DIARIA_OBJETIVO)})</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full', porcentajeObjetivo >= 100 ? 'bg-blue-500' : 'bg-blue-300')}
                  style={{ width: `${Math.min(porcentajeObjetivo, 100)}%` }}
                />
              </div>
              <span className={cn('text-xs font-medium', porcentajeObjetivo >= 100 ? 'text-blue-600' : 'text-blue-400')}>
                {porcentajeObjetivo.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de brecha detallada
export function BrechaDetail({ mesIndex }: { mesIndex: number }) {
  const brecha = getKPIsBrecha(mesIndex);
  
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Análisis de Brecha
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              'p-3 rounded-lg',
              brecha.faltanteParaPE <= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/20'
            )}>
              <p className="text-xs text-gray-500">Faltante para PE</p>
              <p className={cn(
                'text-lg font-bold',
                brecha.faltanteParaPE <= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {brecha.faltanteParaPE <= 0 ? '✓ Alcanzado' : formatCurrency(brecha.faltanteParaPE)}
              </p>
            </div>
            <div className={cn(
              'p-3 rounded-lg',
              brecha.faltanteParaObjetivo <= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-50 dark:bg-blue-900/20'
            )}>
              <p className="text-xs text-gray-500">Faltante para Objetivo</p>
              <p className={cn(
                'text-lg font-bold',
                brecha.faltanteParaObjetivo <= 0 ? 'text-green-600' : 'text-blue-600'
              )}>
                {brecha.faltanteParaObjetivo <= 0 ? '✓ Alcanzado' : formatCurrency(brecha.faltanteParaObjetivo)}
              </p>
            </div>
          </div>
          
          {brecha.faltanteParaPE > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                💡 Para alcanzar el PE necesitas:
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                {formatCurrency(brecha.ventaDiariaNecesariaPE)}/día adicionales
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Clientes faltantes para objetivo:</span>
              <p className="font-bold text-gray-700 dark:text-gray-300">
                {brecha.clientesFaltantes > 0 ? brecha.clientesFaltantes.toLocaleString() : '✓ Alcanzado'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Clientes diarios actuales:</span>
              <p className="font-bold text-gray-700 dark:text-gray-300">
                {brecha.clientesDiariosActuales}/día
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper para formatear moneda
function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

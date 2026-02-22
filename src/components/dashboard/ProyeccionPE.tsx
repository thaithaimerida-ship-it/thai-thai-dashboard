'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONSTANTES_NEGOCIO, ventasMensuales, calcularProyeccionPE } from '@/data/realData';
import { 
  Target, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProyeccionPECardProps {
  mesIndex?: number;
}

export function ProyeccionPECard({ mesIndex = 1 }: ProyeccionPECardProps) {
  const [diasTranscurridos, setDiasTranscurridos] = useState(20);
  const [ventaActual, setVentaActual] = useState(ventasMensuales[mesIndex]?.ventas || 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const proyeccion = calcularProyeccionPE(ventaActual, diasTranscurridos, CONSTANTES_NEGOCIO.DIAS_MES);
  
  // Determinar si alcanzará el PE
  const alcanzaraPE = proyeccion.ventaDiariaActual >= proyeccion.ventaDiariaNecesariaPE || proyeccion.faltantePE <= 0;
  
  return (
    <div className="space-y-4">
      {/* Panel de control */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-500" />
            Calculadora de Proyección PE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Venta Actual (Neto)</label>
              <input
                type="number"
                value={ventaActual}
                onChange={(e) => setVentaActual(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Días Transcurridos</label>
              <input
                type="range"
                min="1"
                max="30"
                value={diasTranscurridos}
                onChange={(e) => setDiasTranscurridos(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span className="font-medium text-blue-600">{diasTranscurridos} días</span>
                <span>30</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado actual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={cn(
          'overflow-hidden',
          alcanzaraPE ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
        )}>
          <CardContent className="p-4 text-center">
            <Target className={cn('h-6 w-6 mx-auto mb-2', alcanzaraPE ? 'text-green-500' : 'text-red-500')} />
            <p className="text-xs text-gray-500">Estado PE</p>
            <p className={cn('text-lg font-bold', alcanzaraPE ? 'text-green-600' : 'text-red-600')}>
              {alcanzaraPE ? '✓ En camino' : '⚠ Riesgo'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-xs text-gray-500">Venta Diaria Actual</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(proyeccion.ventaDiariaActual)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-amber-500" />
            <p className="text-xs text-gray-500">Venta Diaria Necesaria PE</p>
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(proyeccion.ventaDiariaNecesariaPE)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-xs text-gray-500">Días Restantes</p>
            <p className="text-lg font-bold text-purple-600">
              {proyeccion.diasRestantes}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barras de progreso */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* PE */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                Punto de Equilibrio
              </span>
              <span className="text-sm text-gray-500">
                {formatCurrency(ventaActual)} / {formatCurrency(CONSTANTES_NEGOCIO.PE_MENSUAL)}
              </span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-500',
                  ventaActual >= CONSTANTES_NEGOCIO.PE_MENSUAL ? 'bg-green-500' : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(100, (ventaActual / CONSTANTES_NEGOCIO.PE_MENSUAL) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Faltan: {formatCurrency(proyeccion.faltantePE)}</span>
              <span>{Math.round((ventaActual / CONSTANTES_NEGOCIO.PE_MENSUAL) * 100)}%</span>
            </div>
          </div>
          
          {/* Objetivo */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Venta Objetivo
              </span>
              <span className="text-sm text-gray-500">
                {formatCurrency(ventaActual)} / {formatCurrency(CONSTANTES_NEGOCIO.VENTA_OBJETIVO)}
              </span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-500',
                  ventaActual >= CONSTANTES_NEGOCIO.VENTA_OBJETIVO ? 'bg-blue-500' : 'bg-blue-400'
                )}
                style={{ width: `${Math.min(100, (ventaActual / CONSTANTES_NEGOCIO.VENTA_OBJETIVO) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>Faltan: {formatCurrency(proyeccion.faltanteObjetivo)}</span>
              <span>{Math.round((ventaActual / CONSTANTES_NEGOCIO.VENTA_OBJETIVO) * 100)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escenarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Escenarios para Alcanzar PE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proyeccion.escenarios.map((escenario, index) => {
              const esPosible = escenario.ventaDiaria > 0 && 
                               (escenario.diasNecesarios <= proyeccion.diasRestantes || ventaActual >= CONSTANTES_NEGOCIO.PE_MENSUAL);
              
              return (
                <div 
                  key={escenario.nombre}
                  className={cn(
                    'p-3 rounded-lg border',
                    esPosible 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {esPosible 
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <AlertTriangle className="h-4 w-4 text-red-500" />
                      }
                      <span className="font-semibold text-sm">{escenario.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-500">{escenario.descripcion}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Venta diaria requerida</p>
                      <p className="font-bold text-blue-600">{formatCurrency(escenario.ventaDiaria)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Días necesarios</p>
                      <p className={cn('font-bold', esPosible ? 'text-green-600' : 'text-red-600')}>
                        {escenario.diasNecesarios} días
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Acciones Recomendadas
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                {proyeccion.ventaDiariaNecesariaPE > proyeccion.ventaDiariaActual * 1.5 && (
                  <li>• <strong>Alerta:</strong> Necesitas aumentar ventas significativamente para alcanzar el PE.</li>
                )}
                <li>• Venta diaria mínima para PE: <strong>{formatCurrency(CONSTANTES_NEGOCIO.VENTA_DIARIA_PE)}</strong></li>
                <li>• Venta diaria para objetivo: <strong>{formatCurrency(CONSTANTES_NEGOCIO.VENTA_DIARIA_OBJETIVO)}</strong></li>
                <li>• Clientes diarios necesarios: <strong>{CONSTANTES_NEGOCIO.COMENSALES_PE} - {CONSTANTES_NEGOCIO.COMENSALES_OBJETIVO}</strong></li>
                <li>• Considera promociones, marketing o eventos especiales para aumentar ventas.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

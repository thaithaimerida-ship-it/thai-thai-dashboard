'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { comisionesPorPlataforma } from '@/data/realData';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Smartphone,
  CreditCard,
  Banknote,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComisionesPlataformasProps {
  filtroMes?: number | 'acumulado';
}

export function ComisionesPlataformas({ filtroMes = 'acumulado' }: ComisionesPlataformasProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalComisiones = comisionesPorPlataforma.reduce((acc, p) => acc + p.comisionTotal, 0);
  const totalBruto = comisionesPorPlataforma.reduce((acc, p) => acc + p.montoBruto, 0);
  const totalNeto = comisionesPorPlataforma.reduce((acc, p) => acc + p.montoNeto, 0);
  const porcentajeComisionTotal = totalBruto > 0 ? (totalComisiones / totalBruto) * 100 : 0;

  // Obtener icono según plataforma
  const getIcono = (plataforma: string) => {
    if (plataforma.includes('Terminal') || plataforma.includes('Transfer')) {
      return <CreditCard className="h-4 w-4" />;
    }
    if (plataforma.includes('Efectivo')) {
      return <Banknote className="h-4 w-4" />;
    }
    if (plataforma.includes('Uber') || plataforma.includes('Rappi')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <DollarSign className="h-4 w-4" />;
  };

  // Color según porcentaje de comisión
  const getColorComision = (porcentaje: number) => {
    if (porcentaje === 0) return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', bar: 'bg-green-500' };
    if (porcentaje <= 5) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', bar: 'bg-blue-500' };
    if (porcentaje <= 15) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' };
    return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', bar: 'bg-red-500' };
  };

  return (
    <div className="space-y-4">
      {/* Resumen General */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-indigo-100 text-xs uppercase">Total Bruto</p>
              <p className="text-xl font-bold">{formatCurrency(totalBruto)}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs uppercase">Total Comisiones</p>
              <p className="text-xl font-bold text-red-200">{formatCurrency(totalComisiones)}</p>
              <p className="text-indigo-200 text-xs">{porcentajeComisionTotal.toFixed(1)}% del bruto</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs uppercase">Total Neto</p>
              <p className="text-xl font-bold text-green-200">{formatCurrency(totalNeto)}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs uppercase">Impacto Mensual</p>
              <p className="text-xl font-bold">{formatCurrency(totalComisiones)}</p>
              <p className="text-indigo-200 text-xs">Costo por usar plataformas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de plataformas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comisionesPorPlataforma.map((plataforma) => {
          const colores = getColorComision(plataforma.porcentajeComision);
          
          return (
            <Card 
              key={plataforma.plataforma}
              className={cn(
                'relative overflow-hidden transition-all hover:shadow-lg',
                plataforma.esRentable ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('p-2 rounded-lg', colores.bg)}>
                      {getIcono(plataforma.plataforma)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {plataforma.plataforma}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {plataforma.numTransacciones} transacciones
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-bold',
                    colores.bg, colores.text
                  )}>
                    {plataforma.porcentajeComision}%
                  </div>
                </div>
                
                {/* Barras de progreso */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Bruto</span>
                      <span className="font-medium">{formatCurrency(plataforma.montoBruto)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full', colores.bar)}
                        style={{ width: `${Math.min(100, (plataforma.montoBruto / totalBruto) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Comisión</span>
                      <span className="font-medium text-red-600">{formatCurrency(plataforma.comisionTotal)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-400"
                        style={{ width: `${Math.min(100, (plataforma.comisionTotal / totalComisiones) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recomendación */}
                <div className={cn(
                  'mt-3 p-2 rounded-lg text-xs flex items-start gap-2',
                  plataforma.esRentable 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                )}>
                  {plataforma.esRentable 
                    ? <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    : <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  }
                  <span>{plataforma.recomendacion}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recomendaciones generales */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Análisis de Comisiones
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• <strong>Uber Eats</strong> y <strong>Rappi</strong> cobran comisiones muy altas (47-68%). Considera aumentar precios en estas plataformas.</li>
                <li>• <strong>Terminal Bancaria</strong> y <strong>Efectivo</strong> son las opciones más rentables (0-3%).</li>
                <li>• Fomenta pagos directos y transferencias para reducir costos de comisión.</li>
                <li>• El costo total de comisiones representa {porcentajeComisionTotal.toFixed(1)}% de tus ventas brutas.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

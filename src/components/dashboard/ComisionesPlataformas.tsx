'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Smartphone,
  CreditCard,
  Banknote,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseFecha, parseMoney } from '@/hooks/useGoogleSheets';

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

interface ComisionesPlataformasProps {
  filtroMes?: number | 'ytd';
  datosEnTiempoReal?: {
    comisionesPorPlataforma: Record<string, { bruto: number; comision: number; neto: number; count: number }>;
    ingresos: IngresoRow[];
  };
}

export function ComisionesPlataformas({ filtroMes = 'ytd', datosEnTiempoReal }: ComisionesPlataformasProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filtrar ingresos por mes
  const ingresosFiltrados = useMemo(() => {
    if (!datosEnTiempoReal?.ingresos) return [];
    
    if (filtroMes === 'ytd') {
      return datosEnTiempoReal.ingresos;
    }

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Obtener el mes del índice
    const ingresosPorMes: Record<string, IngresoRow[]> = {};
    
    datosEnTiempoReal.ingresos.forEach(ing => {
      const fecha = parseFecha(ing.Fecha);
      if (!fecha) return;
      const mesKey = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      if (!ingresosPorMes[mesKey]) {
        ingresosPorMes[mesKey] = [];
      }
      ingresosPorMes[mesKey].push(ing);
    });

    const mesesOrdenados = Object.keys(ingresosPorMes).sort((a, b) => {
      const [mesA, añoA] = a.split(' ');
      const [mesB, añoB] = b.split(' ');
      return (parseInt(añoA) * 12 + meses.indexOf(mesA)) - (parseInt(añoB) * 12 + meses.indexOf(mesB));
    });

    const mesSeleccionado = mesesOrdenados[filtroMes];
    return ingresosPorMes[mesSeleccionado] || [];
  }, [datosEnTiempoReal, filtroMes]);

  // Calcular comisiones por plataforma
  const comisionesCalculadas = useMemo(() => {
    const plataformas: Record<string, { bruto: number; comision: number; neto: number; count: number }> = {};
    
    ingresosFiltrados.forEach(ing => {
      const plataforma = ing['Fuente / Cliente'] || 'Otros';
      if (!plataformas[plataforma]) {
        plataformas[plataforma] = { bruto: 0, comision: 0, neto: 0, count: 0 };
      }
      plataformas[plataforma].bruto += parseMoney(ing['Monto Bruto (+)']);
      plataformas[plataforma].comision += parseMoney(ing['Comisión / Retención (-)']);
      plataformas[plataforma].neto += parseMoney(ing['Monto Neto (Cálculo)']);
      plataformas[plataforma].count++;
    });

    return Object.entries(plataformas).map(([plataforma, datos]) => ({
      plataforma,
      montoBruto: datos.bruto,
      comisionTotal: datos.comision,
      montoNeto: datos.neto,
      numTransacciones: datos.count,
      porcentajeComision: datos.bruto > 0 ? Math.round((datos.comision / datos.bruto) * 100) : 0,
      esRentable: datos.bruto > 0 && (datos.comision / datos.bruto) < 0.15,
      recomendacion: datos.bruto > 0 && (datos.comision / datos.bruto) >= 0.15 
        ? 'Comisión alta - Considera ajustar precios' 
        : 'Opción rentable',
    })).sort((a, b) => b.montoBruto - a.montoBruto);
  }, [ingresosFiltrados]);

  const totalComisiones = comisionesCalculadas.reduce((acc, p) => acc + p.comisionTotal, 0);
  const totalBruto = comisionesCalculadas.reduce((acc, p) => acc + p.montoBruto, 0);
  const totalNeto = comisionesCalculadas.reduce((acc, p) => acc + p.montoNeto, 0);
  const porcentajeComisionTotal = totalBruto > 0 ? (totalComisiones / totalBruto) * 100 : 0;

  // Obtener icono según plataforma
  const getIcono = (plataforma: string) => {
    if (plataforma.toLowerCase().includes('terminal') || plataforma.toLowerCase().includes('transfer') || plataforma.toLowerCase().includes('bbva')) {
      return <CreditCard className="h-4 w-4" />;
    }
    if (plataforma.toLowerCase().includes('efectivo')) {
      return <Banknote className="h-4 w-4" />;
    }
    if (plataforma.toLowerCase().includes('uber') || plataforma.toLowerCase().includes('rappi') || plataforma.toLowerCase().includes('didi')) {
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

  if (comisionesCalculadas.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No hay datos de comisiones para el período seleccionado</p>
      </Card>
    );
  }

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
              <p className="text-indigo-100 text-xs uppercase">Plataformas</p>
              <p className="text-xl font-bold">{comisionesCalculadas.length}</p>
              <p className="text-indigo-200 text-xs">Fuentes de ingreso</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de plataformas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comisionesCalculadas.map((plataforma) => {
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
                        style={{ width: `${Math.min(100, totalBruto > 0 ? (plataforma.montoBruto / totalBruto) * 100 : 0)}%` }}
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
                        style={{ width: `${Math.min(100, totalComisiones > 0 ? (plataforma.comisionTotal / totalComisiones) * 100 : 0)}%` }}
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
                <li>• Las plataformas de delivery (Uber Eats, Rappi, Didi) suelen cobrar comisiones altas (25-30%). Considera ajustar precios.</li>
                <li>• Las terminales bancarias y efectivo son las opciones más rentables (0-3% de comisión).</li>
                <li>• El costo total de comisiones representa {porcentajeComisionTotal.toFixed(1)}% de tus ventas brutas.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

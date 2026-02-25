'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEstadoIndicador } from '@/data/realData';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface ThermometerGaugeProps {
  titulo: string;
  valor: number;
  tipo: 'margen' | 'ventas' | 'gastos' | 'indice';
  descripcion?: string;
  monto?: number;
}

export function ThermometerGauge({ titulo, valor, tipo, descripcion, monto }: ThermometerGaugeProps) {
  const OBJETIVO_VENTAS_GAUGE = 325000;
  const estadoGeneral = getEstadoIndicador(valor, tipo);
  const avanceVentas = Math.max(0, (valor / OBJETIVO_VENTAS_GAUGE) * 100);
  const estadoVentas = avanceVentas >= 100
    ? { color: '#22c55e', emoji: '🟢', nivel: 'Excelente', descripcion: 'Meta alcanzada' }
    : avanceVentas >= 90
      ? { color: '#84cc16', emoji: '🟢', nivel: 'Bueno', descripcion: 'Muy cerca de la meta' }
      : avanceVentas >= 75
        ? { color: '#eab308', emoji: '🟡', nivel: 'Alerta', descripcion: 'Aún por debajo del objetivo' }
        : { color: '#ef4444', emoji: '🔴', nivel: 'Crítico', descripcion: 'Lejos del objetivo' };
  const estado = tipo === 'ventas' ? estadoVentas : estadoGeneral;
  
  // Calcular el porcentaje para el gauge (0-100)
  const getMaxValue = () => {
    if (tipo === 'margen') return 50;
    if (tipo === 'ventas') return OBJETIVO_VENTAS_GAUGE;
    if (tipo === 'indice') return 150; // 150% = 1.5 veces el PE
    return 100; // gastos como porcentaje
  };
  
  const percentage = Math.min((valor / getMaxValue()) * 100, 100);
  
  // Crear el arco del gauge
  const createArc = () => {
    const startAngle = -90;
    const endAngle = 90;
    const angleRange = endAngle - startAngle;
    const currentAngle = startAngle + (percentage / 100) * angleRange;
    
    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    const describeArc = (start: number, end: number) => {
      const startRad = (start * Math.PI) / 180;
      const endRad = (end * Math.PI) / 180;
      
      const startX = centerX + radius * Math.cos(startRad);
      const startY = centerY + radius * Math.sin(startRad);
      const endX = centerX + radius * Math.cos(endRad);
      const endY = centerY + radius * Math.sin(endRad);
      
      const largeArcFlag = end - start <= 180 ? '0' : '1';
      
      return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
    };
    
    return {
      backgroundPath: describeArc(startAngle, endAngle),
      valuePath: describeArc(startAngle, currentAngle),
    };
  };
  
  const { backgroundPath, valuePath } = createArc();

  const formatMonto = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Formatear valor según tipo
  const formatValue = () => {
    if (tipo === 'ventas') return `$${(valor / 1000).toFixed(0)}K`;
    if (tipo === 'indice') return `${(valor / 100).toFixed(2)}`;
    return `${(Math.round(valor * 10) / 10).toFixed(1)}%`;
  };

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader className="pb-0.5 sm:pb-1.5 px-2.5 pt-2 sm:px-4 sm:pt-4">
        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-gray-700 dark:text-gray-300">
          {titulo}
          {descripcion && (
            <div className="relative group">
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {descripcion}
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-2.5 pb-2 sm:px-4 sm:pb-4">
        <div className="flex flex-col items-center gap-1 sm:gap-1.5">
          {/* Gauge SVG */}
          <div className="w-full flex justify-center">
            <div className="relative w-32 h-12 sm:w-40 sm:h-20">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              {/* Arco de fondo */}
              <path
                d={backgroundPath}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              
              {/* Arco de valor con gradiente */}
              <defs>
                <linearGradient id={`gradient-${titulo.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={estado.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={estado.color} stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d={valuePath}
                fill="none"
                stroke={`url(#gradient-${titulo.replace(/\s/g, '')})`}
                strokeWidth="12"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Marcadores */}
              <text x="20" y="105" className="text-[10px] fill-gray-400">0</text>
              <text x="170" y="105" className="text-[10px] fill-gray-400">
                {tipo === 'indice' ? '1.5' : getMaxValue()}
              </text>
              
              {/* Marcador de referencia para índice (1.0 = PE) */}
              {tipo === 'indice' && (
                <line
                  x1="100"
                  y1="15"
                  x2="100"
                  y2="25"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              )}
            </svg>
            </div>
          </div>

          {/* Valor y monto en flujo normal para evitar overlap con el SVG */}
          <div className="w-full text-center">
            <span className="text-base sm:text-xl font-bold leading-none" style={{ color: estado.color }}>
              {formatValue()}
            </span>
            {monto && (tipo === 'margen' || tipo === 'indice') && (
              <span className="block text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                = {formatMonto(monto)}
              </span>
            )}
          </div>

          {tipo === 'ventas' ? (
            <div className="w-full text-center mt-0.5 sm:mt-1">
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                Objetivo: {formatMonto(OBJETIVO_VENTAS_GAUGE)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                Avance: {Math.round(avanceVentas * 100) / 100}%
              </p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 mt-0 sm:mt-1">
              <span className="text-sm sm:text-base">{estado.emoji}</span>
              <div className="flex flex-col">
                <span
                  className="text-[11px] sm:text-xs font-semibold"
                  style={{ color: estado.color }}
                >
                  {estado.nivel}
                </span>
                <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
                  {estado.descripcion}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente más simple tipo "semáforo" para usar en tabla
export function StatusBadge({ valor, tipo }: { valor: number; tipo: 'margen' | 'ventas' | 'gastos' | 'indice' }) {
  const estado = getEstadoIndicador(valor, tipo);
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
      estado.nivel === 'Excelente' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      estado.nivel === 'Bueno' && 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
      estado.nivel === 'Regular' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      estado.nivel === 'Alerta' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      estado.nivel === 'Crítico' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      estado.nivel === 'Pérdida' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    )}>
      <span>{estado.emoji}</span>
      <span>{estado.nivel}</span>
    </div>
  );
}

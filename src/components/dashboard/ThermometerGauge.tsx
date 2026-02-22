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
  const estado = getEstadoIndicador(valor, tipo);
  
  // Calcular el porcentaje para el gauge (0-100)
  const getMaxValue = () => {
    if (tipo === 'margen') return 50;
    if (tipo === 'ventas') return 200000;
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
    return `${valor}%`;
  };

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
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
      <CardContent className="pt-0">
        <div className="flex flex-col items-center">
          {/* Gauge SVG */}
          <div className="relative w-48 h-24">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              {/* Arco de fondo */}
              <path
                d={backgroundPath}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
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
                strokeWidth="16"
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
            
            {/* Valor central */}
            <div className="absolute inset-0 flex flex-col items-end justify-center pb-1">
              <div className="text-center w-full">
                <span className="text-2xl font-bold" style={{ color: estado.color }}>
                  {formatValue()}
                </span>
                {/* Mostrar monto si existe */}
                {monto && (tipo === 'margen' || tipo === 'indice') && (
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    = {formatMonto(monto)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Indicador de estado */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{estado.emoji}</span>
            <div className="flex flex-col">
              <span 
                className="text-sm font-semibold"
                style={{ color: estado.color }}
              >
                {estado.nivel}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {estado.descripcion}
              </span>
            </div>
          </div>
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

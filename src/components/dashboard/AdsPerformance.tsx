'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdsData, getLastMonths } from '@/hooks/useAdsData';
import {
  AlertTriangle, RefreshCw, Users, WifiOff, Wifi,
} from 'lucide-react';

function formatMXN(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
}

const MONTH_OPTIONS = [
  { label: 'Actual', value: '' },
  { label: 'Mes en curso', value: 'current' },
  ...getLastMonths(6),
];

export function AdsPerformance() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const { ads, crossMetrics, loading, error, lastUpdate, refetch } = useAdsData(
    selectedMonth || undefined
  );

  if (loading && !ads) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Conectando con el agente de ads...</span>
      </div>
    );
  }

  if (error && !ads) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <WifiOff className="h-8 w-8 text-destructive mb-3" />
          <p className="text-sm font-semibold mb-1">Sin conexión al agente de ads</p>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refetch}
            className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!ads) return null;

  const local = ads.campaign_separation?.local;
  const delivery = ads.campaign_separation?.delivery;

  return (
    <div className="space-y-6">
      {/* Header: estado de conexión + selector de mes */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-muted-foreground">
            {selectedMonth
              ? `Datos históricos · ${MONTH_OPTIONS.find(o => o.value === selectedMonth)?.label}`
              : `Snapshot en vivo${lastUpdate ? ` · ${new Date(lastUpdate).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : ''}`
            }
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pills de mes */}
          <div className="flex items-center gap-1 flex-wrap">
            {MONTH_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedMonth(opt.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedMonth === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={refetch}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading overlay cuando hay data pero está refrescando */}
      {loading && ads && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Cargando datos...
        </div>
      )}

      {/* Métrica estrella: costo por comensal (solo disponible en snapshot) */}
      {crossMetrics && crossMetrics.costo_por_comensal > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Costo por comensal (ads)
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatMXN(crossMetrics.costo_por_comensal)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMXN(crossMetrics.ads_spend)} invertidos → {crossMetrics.comensales} comensales
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs de Google Ads */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Inversión</p>
            <p className="text-xl font-bold mt-1">{formatMXN(ads.total_spend)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conversiones</p>
            <p className="text-xl font-bold mt-1">{ads.total_conversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">CPA Promedio</p>
            <p className="text-xl font-bold mt-1">{formatMXN(ads.avg_cpa)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Desperdicio</p>
            <p className={`text-xl font-bold mt-1 ${ads.total_waste > 50 ? 'text-destructive' : ''}`}>
              {formatMXN(ads.total_waste)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por campaña */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Rendimiento por campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {local && (
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-semibold text-sm">Local (restaurante)</p>
                  <p className="text-xs text-muted-foreground">Visitas físicas y llamadas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatMXN(local.spend)}</p>
                  <p className="text-xs text-muted-foreground">
                    {local.conversions} conv · CPA {formatMXN(local.cpa)}
                  </p>
                </div>
              </div>
            )}
            {delivery && (
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-semibold text-sm">Delivery</p>
                  <p className="text-xs text-muted-foreground">Pedidos a domicilio</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatMXN(delivery.spend)}</p>
                  <p className="text-xs text-muted-foreground">
                    {delivery.conversions} conv · CPA {formatMXN(delivery.cpa)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Waste alert */}
      {ads.total_waste > 50 && (
        <Card className="border-amber-200">
          <CardContent className="flex items-start gap-3 pt-4 pb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Gasto sin conversiones detectado</p>
              <p className="text-xs text-muted-foreground mt-1">
                El agente detectó {formatMXN(ads.total_waste)} en keywords sin retorno.
                Revisa las propuestas de optimización.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';

const ADS_AGENT_URL = process.env.NEXT_PUBLIC_ADS_AGENT_URL
  || 'https://thai-thai-ads-agent-624172071613.us-central1.run.app';

interface AdsMetrics {
  total_spend: number;
  total_conversions: number;
  avg_cpa: number;
  campaigns_active: number;
  total_waste: number;
  campaign_separation: {
    local: { spend: number; conversions: number; cpa: number };
    delivery: { spend: number; conversions: number; cpa: number };
  };
  timestamp: string | null;
}

interface CrossMetrics {
  costo_por_comensal: number;
  comensales: number;
  ads_spend: number;
}

interface AdsDataState {
  ads: AdsMetrics | null;
  crossMetrics: CrossMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

/**
 * Hook para datos de Google Ads.
 *
 * month = undefined → /ecosystem/business-metrics (snapshot, rápido)
 * month = "YYYY-MM" → /mission-control?month=YYYY-MM (mes específico)
 * month = "current" → /mission-control?month=current (mes en curso)
 */
export function useAdsData(month?: string) {
  const [state, setState] = useState<AdsDataState>({
    ads: null,
    crossMetrics: null,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let ads: AdsMetrics | null = null;
      let crossMetrics: CrossMetrics | null = null;
      let timestamp: string | null = null;

      if (!month) {
        // Sin filtro de mes → snapshot rápido
        const res = await fetch(`${ADS_AGENT_URL}/ecosystem/business-metrics`, {
          headers: { 'Accept': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        ads = json.ads;
        crossMetrics = json.cross_metrics;
        timestamp = json.timestamp;
      } else {
        // Mes específico o "current" → /mission-control
        const url = `${ADS_AGENT_URL}/mission-control?month=${month}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Mapear respuesta de /mission-control al formato AdsMetrics
        const metrics = json.metrics ?? {};
        const campaignSep = json.campaign_separation ?? {};
        ads = {
          total_spend: metrics.total_spend ?? 0,
          total_conversions: metrics.total_conversions ?? 0,
          avg_cpa: metrics.avg_cpa ?? 0,
          campaigns_active: metrics.campaigns_active ?? 0,
          total_waste: metrics.total_waste ?? 0,
          campaign_separation: {
            local: campaignSep.local ?? { spend: 0, conversions: 0, cpa: 0 },
            delivery: campaignSep.delivery ?? { spend: 0, conversions: 0, cpa: 0 },
          },
          timestamp: json.timestamp ?? null,
        };
        timestamp = json.timestamp ?? null;
        // /mission-control no devuelve cross_metrics — se calcula en el componente
        crossMetrics = null;
      }

      setState({ ads, crossMetrics, loading: false, error: null, lastUpdate: timestamp });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[useAdsData]', message);
      setState(prev => ({ ...prev, loading: false, error: message }));
    }
  }, [month]);

  useEffect(() => {
    fetchData();
    // Solo auto-refresh cuando no hay filtro de mes (snapshot en vivo)
    if (!month) {
      const interval = setInterval(fetchData, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, month]);

  return { ...state, refetch: fetchData };
}

// ── Utilidad: generar últimos N meses en formato "YYYY-MM" ────────────────
export function getLastMonths(n: number): { label: string; value: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('es-MX', { month: 'short', year: 'numeric' });
    months.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value });
  }
  return months;
}

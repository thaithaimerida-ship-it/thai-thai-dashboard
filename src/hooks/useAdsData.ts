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

export function useAdsData() {
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
      const res = await fetch(`${ADS_AGENT_URL}/ecosystem/business-metrics`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      setState({
        ads: json.ads,
        crossMetrics: json.cross_metrics,
        loading: false,
        error: null,
        lastUpdate: json.timestamp,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.error('[useAdsData]', message);
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000); // cada 10 min
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

import { createHash } from 'node:crypto';

export type PeriodType = 'MENSUAL' | 'YTD';

export interface Period {
  id: string;
  type: PeriodType;
  year: number;
  month: number | null;
}

export type ParsePeriodOutcome =
  | { ok: true; period: Period }
  | { ok: false; error: string };

const MES_RE = /^(\d{4})-(\d{2})$/;
const YTD_RE = /^YTD-(\d{4})$/;

export function parsePeriodId(periodId: string): ParsePeriodOutcome {
  if (typeof periodId !== 'string' || periodId.length === 0) {
    return { ok: false, error: 'periodo inválido' };
  }

  const ytdMatch = YTD_RE.exec(periodId);
  if (ytdMatch) {
    const year = Number(ytdMatch[1]);
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      return { ok: false, error: 'año fuera de rango' };
    }
    return { ok: true, period: { id: periodId, type: 'YTD', year, month: null } };
  }

  const mensualMatch = MES_RE.exec(periodId);
  if (mensualMatch) {
    const year = Number(mensualMatch[1]);
    const month = Number(mensualMatch[2]);
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      return { ok: false, error: 'año fuera de rango' };
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { ok: false, error: 'mes fuera de rango' };
    }
    return { ok: true, period: { id: periodId, type: 'MENSUAL', year, month } };
  }

  return { ok: false, error: 'formato no reconocido (use YYYY-MM o YTD-YYYY)' };
}

export function isMonthClosed(year: number, month: number, now: Date = new Date()): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;
  return false;
}

export function lastClosedMonth(now: Date = new Date()): { year: number; month: number } {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (m === 1) return { year: y - 1, month: 12 };
  return { year: y, month: m - 1 };
}

export function computeDataHash(payload: unknown): string {
  const json = JSON.stringify(payload);
  return createHash('sha256').update(json).digest('hex');
}

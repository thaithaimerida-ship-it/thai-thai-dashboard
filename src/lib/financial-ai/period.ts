import { createHash } from 'node:crypto';

export type PeriodType = 'MENSUAL';

export interface Period {
  id: string;
  type: PeriodType;
  year: number;
  month: number;
}

export type ParsePeriodOutcome =
  | { ok: true; period: Period }
  | { ok: false; error: string };

const MES_RE = /^(\d{4})-(\d{2})$/;

export function parsePeriodId(periodId: string): ParsePeriodOutcome {
  if (typeof periodId !== 'string' || periodId.length === 0) {
    return { ok: false, error: 'periodo invalido (use YYYY-MM)' };
  }

  const mensualMatch = MES_RE.exec(periodId);
  if (mensualMatch) {
    const year = Number(mensualMatch[1]);
    const month = Number(mensualMatch[2]);
    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      return { ok: false, error: 'anio fuera de rango (use YYYY-MM)' };
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { ok: false, error: 'mes fuera de rango (use YYYY-MM)' };
    }
    return { ok: true, period: { id: periodId, type: 'MENSUAL', year, month } };
  }

  return { ok: false, error: 'formato no reconocido (use YYYY-MM)' };
}

export function isMonthClosed(year: number, month: number, now: Date = new Date()): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;
  return false;
}

export function computeDataHash(payload: unknown): string {
  const json = JSON.stringify(payload);
  return createHash('sha256').update(json).digest('hex');
}

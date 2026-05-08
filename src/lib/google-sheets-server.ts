import { google, sheets_v4 } from 'googleapis';

import { isMonthClosed, parsePeriodId } from './financial-ai/period';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export const REPORTES_IA_SHEET_NAME = 'Reportes_IA';

export const REPORTES_IA_HEADERS = [
  'ID_Periodo',
  'Tipo_Periodo',
  'Anio',
  'Mes',
  'Estado',
  'Locked',
  'Fecha_Generacion',
  'Fecha_Corte_Datos',
  'Data_Hash',
  'Model',
  'Prompt_Version',
  'Report_JSON',
  'Error',
] as const;

export type ReportesIAColumn = (typeof REPORTES_IA_HEADERS)[number];

let cachedClient: sheets_v4.Sheets | null = null;

function assertEnv(): void {
  const required = ['GOOGLE_SHEET_ID', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
}

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  assertEnv();
  if (cachedClient) return cachedClient;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '')
        .replace(/\\n/g, '\n')
        .trim(),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  cachedClient = google.sheets({ version: 'v4', auth });
  return cachedClient;
}

export interface SheetRows {
  headers: string[];
  rows: string[][];
}

export async function readSheetRows(sheetName: string): Promise<SheetRows> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const values = res.data.values ?? [];
  if (values.length === 0) return { headers: [], rows: [] };

  const [headers, ...rows] = values;
  return {
    headers: headers.map((h) => String(h ?? '')),
    rows: rows.map((r) => r.map((c) => String(c ?? ''))),
  };
}

export type CellValue = string | number | boolean;

export async function appendSheetRows(
  sheetName: string,
  rows: CellValue[][],
): Promise<void> {
  if (rows.length === 0) return;
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

export async function updateSheetRow(
  sheetName: string,
  rowIndex: number,
  values: CellValue[],
): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

async function getSheetIdByName(name: string): Promise<number | null> {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const found = meta.data.sheets?.find((s) => s.properties?.title === name);
  return found?.properties?.sheetId ?? null;
}

export async function ensureReportesIASheet(): Promise<void> {
  const sheets = await getSheetsClient();
  const existingId = await getSheetIdByName(REPORTES_IA_SHEET_NAME);

  if (existingId === null) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: REPORTES_IA_SHEET_NAME } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${REPORTES_IA_SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [REPORTES_IA_HEADERS as unknown as string[]] },
    });
    return;
  }

  const { headers } = await readSheetRows(REPORTES_IA_SHEET_NAME);
  const expected = REPORTES_IA_HEADERS as unknown as string[];
  const headersMatch =
    headers.length >= expected.length && expected.every((h, i) => headers[i] === h);

  if (!headersMatch) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${REPORTES_IA_SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [expected] },
    });
  }
}

export interface ReportesIARow {
  rowIndex: number;
  ID_Periodo: string;
  Tipo_Periodo: string;
  Anio: string;
  Mes: string;
  Estado: string;
  Locked: string;
  Fecha_Generacion: string;
  Fecha_Corte_Datos: string;
  Data_Hash: string;
  Model: string;
  Prompt_Version: string;
  Report_JSON: string;
  Error: string;
}

export type NewReportesIARow = Omit<ReportesIARow, 'rowIndex'>;

function rowToReport(rowIndex: number, row: string[]): ReportesIARow {
  return {
    rowIndex,
    ID_Periodo: row[0] ?? '',
    Tipo_Periodo: row[1] ?? '',
    Anio: row[2] ?? '',
    Mes: row[3] ?? '',
    Estado: row[4] ?? '',
    Locked: row[5] ?? '',
    Fecha_Generacion: row[6] ?? '',
    Fecha_Corte_Datos: row[7] ?? '',
    Data_Hash: row[8] ?? '',
    Model: row[9] ?? '',
    Prompt_Version: row[10] ?? '',
    Report_JSON: row[11] ?? '',
    Error: row[12] ?? '',
  };
}

function reportToRow(r: NewReportesIARow): string[] {
  return [
    r.ID_Periodo,
    r.Tipo_Periodo,
    r.Anio,
    r.Mes,
    r.Estado,
    r.Locked,
    r.Fecha_Generacion,
    r.Fecha_Corte_Datos,
    r.Data_Hash,
    r.Model,
    r.Prompt_Version,
    r.Report_JSON,
    r.Error,
  ];
}

export async function findReportByPeriod(periodId: string): Promise<ReportesIARow | null> {
  await ensureReportesIASheet();
  const { rows } = await readSheetRows(REPORTES_IA_SHEET_NAME);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i][0] === periodId) {
      return rowToReport(i + 2, rows[i]);
    }
  }
  return null;
}

export async function appendClosedMonthlyReport(report: NewReportesIARow): Promise<void> {
  await ensureReportesIASheet();
  const parsed = parsePeriodId(report.ID_Periodo);
  if (!parsed.ok) {
    throw new Error(`ID_Periodo mensual invalido: ${parsed.error}`);
  }
  if (parsed.period.type !== 'MENSUAL') {
    throw new Error('appendClosedMonthlyReport solo acepta periodos mensuales YYYY-MM');
  }
  if (!isMonthClosed(parsed.period.year, parsed.period.month)) {
    throw new Error(`No se puede generar reporte mensual abierto: ${report.ID_Periodo}`);
  }
  const existing = await findReportByPeriod(report.ID_Periodo);
  if (existing) {
    throw new Error(`Ya existe un reporte mensual cerrado para ${report.ID_Periodo}`);
  }
  await appendSheetRows(REPORTES_IA_SHEET_NAME, [reportToRow(report)]);
}

export async function upsertYTDReport(report: NewReportesIARow): Promise<void> {
  throw new Error(
    `YTD no esta disponible en Financial AI V1; no se escribio ${report.ID_Periodo}`,
  );
}

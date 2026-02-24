import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function GET(request: Request) {
  try {
    const requiredEnv = {
      GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    };
    const missing = Object.entries(requiredEnv)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan variables de entorno: ${missing.join(', ')}` },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get('sheet') || 'Ingresos_BD';
    
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheet}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No hay datos' }, { status: 404 });
    }

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return NextResponse.json({ sheet, headers, totalRows: data.length, data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

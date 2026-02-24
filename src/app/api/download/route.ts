import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: 'Archivo no especificado' }, { status: 400 });
  }

  try {
    const filePath = path.join('/home/z/my-project/download', file);
    const fileContent = await readFile(filePath);

    const headers = {
      'Content-Disposition': `attachment; filename="${file}"`,
      'Content-Type': 'application/zip',
    };

    return new NextResponse(fileContent, { headers });
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }
}

import 'server-only';

import { NextResponse } from 'next/server';

const FINANCIAL_AI_SECRET_HEADER = 'x-financial-ai-secret';

export function authorizeFinancialAIRequest(request: Request): NextResponse | null {
  const expectedSecret = process.env.FINANCIAL_AI_API_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Financial AI API not configured' },
      { status: 503 },
    );
  }

  const receivedSecret = request.headers.get(FINANCIAL_AI_SECRET_HEADER);
  if (receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

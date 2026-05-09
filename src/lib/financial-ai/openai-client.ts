import 'server-only';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import {
  MissingOpenAIApiKeyError,
  OpenAIInvalidResponseError,
  OpenAIRequestError,
  OpenAITimeoutError,
} from './errors';
import { FinancialReportSchema } from './schema';
import { OPENAI_FINANCIAL_AI_MODEL } from './targets';

const DEFAULT_TIMEOUT_MS = 35_000;

let cachedClient: OpenAI | null = null;

export interface RequestOpenAIFinancialAIAnalysisInput {
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

interface OpenAIResponsesClient {
  responses: {
    parse: (request: Record<string, unknown>, options?: { signal?: AbortSignal }) => Promise<{
      output_parsed?: unknown;
    }>;
  };
}

function getOpenAIApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new MissingOpenAIApiKeyError();
  }
  return apiKey;
}

function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  cachedClient = new OpenAI({
    apiKey: getOpenAIApiKey(),
  });

  return cachedClient;
}

export function getOpenAIFinancialAIModel(): string {
  return process.env.OPENAI_FINANCIAL_AI_MODEL || OPENAI_FINANCIAL_AI_MODEL;
}

export async function requestOpenAIFinancialAIAnalysis(
  {
    system,
    prompt,
    maxOutputTokens = 4096,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: RequestOpenAIFinancialAIAnalysisInput,
  client: OpenAIResponsesClient = getOpenAIClient(),
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const input = [
      ...(system ? [{ role: 'system', content: system }] : []),
      { role: 'user', content: prompt },
    ];

    const response = await client.responses.parse(
      {
        model: getOpenAIFinancialAIModel(),
        input,
        max_output_tokens: maxOutputTokens,
        store: false,
        text: {
          format: zodTextFormat(FinancialReportSchema, 'financial_report'),
        },
      },
      { signal: controller.signal },
    );

    if (!response.output_parsed) {
      throw new OpenAIInvalidResponseError();
    }

    return JSON.stringify(response.output_parsed);
  } catch (error) {
    if (error instanceof MissingOpenAIApiKeyError || error instanceof OpenAIInvalidResponseError) {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new OpenAITimeoutError(timeoutMs, error);
    }
    throw new OpenAIRequestError(undefined, error);
  } finally {
    clearTimeout(timeout);
  }
}

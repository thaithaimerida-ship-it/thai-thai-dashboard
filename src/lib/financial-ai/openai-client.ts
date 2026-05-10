import 'server-only';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import {
  MissingOpenAIApiKeyError,
  type OpenAIGenerateErrorCode,
  type OpenAIErrorDetails,
  OpenAIInvalidResponseError,
  OpenAIRequestError,
  OpenAITimeoutError,
} from './errors';
import { FinancialReportSchema } from './schema';
import { OPENAI_FINANCIAL_AI_MODEL } from './targets';

const DEFAULT_TIMEOUT_MS = 35_000;
const MAX_OPENAI_MESSAGE_LENGTH = 300;

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

function getObjectProperty(value: unknown, key: string): unknown {
  if (!value || typeof value !== 'object') return undefined;
  return (value as Record<string, unknown>)[key];
}

function getStringProperty(value: unknown, key: string): string | undefined {
  const property = getObjectProperty(value, key);
  return typeof property === 'string' && property.trim() ? property.trim() : undefined;
}

function getNumberProperty(value: unknown, key: string): number | undefined {
  const property = getObjectProperty(value, key);
  return typeof property === 'number' && Number.isFinite(property) ? property : undefined;
}

function sanitizeMessage(message?: string): string | undefined {
  if (!message) return undefined;
  return message.replace(/\s+/g, ' ').trim().slice(0, MAX_OPENAI_MESSAGE_LENGTH);
}

export function sanitizeOpenAIError(error: unknown): OpenAIErrorDetails {
  const nestedError = getObjectProperty(error, 'error');
  const detailSource = nestedError && typeof nestedError === 'object' ? nestedError : error;

  return {
    status: getNumberProperty(error, 'status'),
    type: getStringProperty(detailSource, 'type') ?? getStringProperty(error, 'type'),
    code: getStringProperty(detailSource, 'code') ?? getStringProperty(error, 'code'),
    message: sanitizeMessage(
      getStringProperty(detailSource, 'message') ??
        getStringProperty(error, 'message'),
    ),
  };
}

function includesAny(value: string | undefined, patterns: string[]): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

export function classifyOpenAIErrorCode(details: OpenAIErrorDetails): OpenAIGenerateErrorCode {
  const joined = [details.type, details.code, details.message].filter(Boolean).join(' ');

  if (
    details.status === 401 ||
    details.status === 403 ||
    includesAny(joined, ['invalid_api_key', 'authentication', 'permission', 'unauthorized'])
  ) {
    return 'OPENAI_AUTH_ERROR';
  }

  if (includesAny(joined, ['quota', 'billing', 'insufficient_quota'])) {
    return 'OPENAI_QUOTA_ERROR';
  }

  if (details.status === 429 || includesAny(joined, ['rate_limit', 'rate limit'])) {
    return 'OPENAI_RATE_LIMIT';
  }

  if (
    includesAny(joined, [
      'model_not_found',
      'model_not_available',
      'does not exist',
      'do not have access',
    ])
  ) {
    return 'OPENAI_MODEL_NOT_AVAILABLE';
  }

  if (includesAny(joined, ['schema', 'response_format', 'json_schema'])) {
    return 'OPENAI_SCHEMA_ERROR';
  }

  return 'OPENAI_REQUEST_ERROR';
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
    const details = sanitizeOpenAIError(error);
    throw new OpenAIRequestError(
      undefined,
      error,
      details,
      classifyOpenAIErrorCode(details),
    );
  } finally {
    clearTimeout(timeout);
  }
}

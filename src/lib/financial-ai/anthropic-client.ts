import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { FINANCIAL_AI_MODEL } from './targets';
import {
  AnthropicRequestError,
  AnthropicTimeoutError,
  MissingAnthropicApiKeyError,
} from './errors';

const DEFAULT_TIMEOUT_MS = 45_000;

let cachedClient: Anthropic | null = null;

function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new MissingAnthropicApiKeyError();
  }
  return apiKey;
}

function getAnthropicClient(): Anthropic {
  if (cachedClient) return cachedClient;

  cachedClient = new Anthropic({
    apiKey: getAnthropicApiKey(),
  });

  return cachedClient;
}

export function getFinancialAIModel(): string {
  return process.env.ANTHROPIC_MODEL || FINANCIAL_AI_MODEL;
}

export interface RequestFinancialAIAnalysisInput {
  system?: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}

export async function requestFinancialAIAnalysis({
  system,
  prompt,
  maxTokens = 4096,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: RequestFinancialAIAnalysisInput): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create(
      {
        model: getFinancialAIModel(),
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal },
    );

    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
  } catch (error) {
    if (error instanceof MissingAnthropicApiKeyError) {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new AnthropicTimeoutError(timeoutMs, error);
    }
    throw new AnthropicRequestError(undefined, error);
  } finally {
    clearTimeout(timeout);
  }
}

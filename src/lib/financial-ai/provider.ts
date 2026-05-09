import 'server-only';

import {
  getFinancialAIModel as getAnthropicFinancialAIModel,
  requestFinancialAIAnalysis as requestAnthropicFinancialAIAnalysis,
  type RequestFinancialAIAnalysisInput,
} from './anthropic-client';
import { InvalidFinancialAIProviderError } from './errors';
import {
  getOpenAIFinancialAIModel,
  requestOpenAIFinancialAIAnalysis,
} from './openai-client';

export type FinancialAIProvider = 'anthropic' | 'openai';

export function getFinancialAIProvider(): FinancialAIProvider {
  const provider = process.env.FINANCIAL_AI_PROVIDER?.trim().toLowerCase();
  if (!provider) return 'anthropic';
  if (provider === 'anthropic' || provider === 'openai') return provider;

  throw new InvalidFinancialAIProviderError(provider);
}

export function getSelectedFinancialAIModel(): string {
  return getFinancialAIProvider() === 'openai'
    ? getOpenAIFinancialAIModel()
    : getAnthropicFinancialAIModel();
}

export async function requestFinancialAIAnalysis(
  input: RequestFinancialAIAnalysisInput,
): Promise<string> {
  return getFinancialAIProvider() === 'openai'
    ? requestOpenAIFinancialAIAnalysis(input)
    : requestAnthropicFinancialAIAnalysis(input);
}

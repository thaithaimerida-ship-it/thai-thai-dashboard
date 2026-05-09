import { afterEach, describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));

const originalProvider = process.env.FINANCIAL_AI_PROVIDER;
const originalOpenAIModel = process.env.OPENAI_FINANCIAL_AI_MODEL;
const originalAnthropicModel = process.env.ANTHROPIC_MODEL;

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnvValue('FINANCIAL_AI_PROVIDER', originalProvider);
  restoreEnvValue('OPENAI_FINANCIAL_AI_MODEL', originalOpenAIModel);
  restoreEnvValue('ANTHROPIC_MODEL', originalAnthropicModel);
});

describe('Financial AI provider selection', () => {
  test('defaults to Anthropic when FINANCIAL_AI_PROVIDER is not set', async () => {
    delete process.env.FINANCIAL_AI_PROVIDER;

    const { getFinancialAIProvider } = await import('./provider');

    expect(getFinancialAIProvider()).toBe('anthropic');
  });

  test('selects OpenAI when FINANCIAL_AI_PROVIDER is openai', async () => {
    process.env.FINANCIAL_AI_PROVIDER = 'openai';

    const { getFinancialAIProvider } = await import('./provider');

    expect(getFinancialAIProvider()).toBe('openai');
  });

  test('uses OPENAI_FINANCIAL_AI_MODEL when OpenAI is selected', async () => {
    process.env.FINANCIAL_AI_PROVIDER = 'openai';
    process.env.OPENAI_FINANCIAL_AI_MODEL = 'confirmed-openai-model';

    const { getSelectedFinancialAIModel } = await import('./provider');

    expect(getSelectedFinancialAIModel()).toBe('confirmed-openai-model');
  });
});

export class FinancialAIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'FinancialAIError';
  }
}

export class MissingAnthropicApiKeyError extends FinancialAIError {
  constructor() {
    super('Falta configurar ANTHROPIC_API_KEY', 'MISSING_ANTHROPIC_API_KEY');
    this.name = 'MissingAnthropicApiKeyError';
  }
}

export interface OpenAIErrorDetails {
  status?: number;
  type?: string;
  code?: string;
  message?: string;
}

export type OpenAIGenerateErrorCode =
  | 'OPENAI_MODEL_NOT_AVAILABLE'
  | 'OPENAI_AUTH_ERROR'
  | 'OPENAI_RATE_LIMIT'
  | 'OPENAI_QUOTA_ERROR'
  | 'OPENAI_SCHEMA_ERROR'
  | 'OPENAI_REQUEST_ERROR';

export class MissingOpenAIApiKeyError extends FinancialAIError {
  constructor() {
    super('Falta configurar OPENAI_API_KEY', 'OPENAI_MISSING_KEY');
    this.name = 'MissingOpenAIApiKeyError';
  }
}

export class AnthropicRequestError extends FinancialAIError {
  constructor(message = 'Error al solicitar analisis financiero a Anthropic', cause?: unknown) {
    super(message, 'ANTHROPIC_REQUEST_ERROR', cause);
    this.name = 'AnthropicRequestError';
  }
}

export class OpenAIRequestError extends FinancialAIError {
  constructor(
    message = 'Error al solicitar analisis financiero a OpenAI',
    cause?: unknown,
    public readonly openai?: OpenAIErrorDetails,
    code: OpenAIGenerateErrorCode = 'OPENAI_REQUEST_ERROR',
  ) {
    super(message, code, cause);
    this.name = 'OpenAIRequestError';
  }
}

export class AnthropicTimeoutError extends FinancialAIError {
  constructor(timeoutMs: number, cause?: unknown) {
    super(
      `La solicitud de analisis financiero a Anthropic excedio ${timeoutMs}ms`,
      'ANTHROPIC_TIMEOUT',
      cause,
    );
    this.name = 'AnthropicTimeoutError';
  }
}

export class OpenAITimeoutError extends FinancialAIError {
  constructor(timeoutMs: number, cause?: unknown) {
    super(
      `La solicitud de analisis financiero a OpenAI excedio ${timeoutMs}ms`,
      'OPENAI_TIMEOUT',
      cause,
    );
    this.name = 'OpenAITimeoutError';
  }
}

export class InvalidAIResponseError extends FinancialAIError {
  constructor(message = 'La respuesta de IA no cumple el contrato esperado', cause?: unknown) {
    super(message, 'INVALID_AI_RESPONSE', cause);
    this.name = 'InvalidAIResponseError';
  }
}

export class OpenAIInvalidResponseError extends FinancialAIError {
  constructor(message = 'OpenAI no devolvio una respuesta estructurada valida', cause?: unknown) {
    super(message, 'OPENAI_INVALID_RESPONSE', cause);
    this.name = 'OpenAIInvalidResponseError';
  }
}

export class InsufficientFinancialDataError extends FinancialAIError {
  constructor(message = 'Datos financieros insuficientes para generar analisis', cause?: unknown) {
    super(message, 'INSUFFICIENT_FINANCIAL_DATA', cause);
    this.name = 'InsufficientFinancialDataError';
  }
}

export class InvalidFinancialAIProviderError extends FinancialAIError {
  constructor(provider: string) {
    super(
      `FINANCIAL_AI_PROVIDER invalido: ${provider}`,
      'FINANCIAL_AI_PROVIDER_INVALID',
    );
    this.name = 'InvalidFinancialAIProviderError';
  }
}

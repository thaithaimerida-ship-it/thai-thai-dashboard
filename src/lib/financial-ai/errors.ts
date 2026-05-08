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

export class AnthropicRequestError extends FinancialAIError {
  constructor(message = 'Error al solicitar analisis financiero a Anthropic', cause?: unknown) {
    super(message, 'ANTHROPIC_REQUEST_ERROR', cause);
    this.name = 'AnthropicRequestError';
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

export class InvalidAIResponseError extends FinancialAIError {
  constructor(message = 'La respuesta de IA no cumple el contrato esperado', cause?: unknown) {
    super(message, 'INVALID_AI_RESPONSE', cause);
    this.name = 'InvalidAIResponseError';
  }
}

export class InsufficientFinancialDataError extends FinancialAIError {
  constructor(message = 'Datos financieros insuficientes para generar analisis', cause?: unknown) {
    super(message, 'INSUFFICIENT_FINANCIAL_DATA', cause);
    this.name = 'InsufficientFinancialDataError';
  }
}

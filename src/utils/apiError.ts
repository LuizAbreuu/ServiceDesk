import axios from 'axios';

interface ApiValidationDetail {
  path?: string;
  message?: string;
}

interface ApiErrorPayload {
  error?: string;
  details?: ApiValidationDetail[] | unknown;
}

interface ApiErrorMessageOptions {
  fallback: string;
  forbiddenMessage?: string;
  notFoundMessage?: string;
  conflictMessage?: string;
  validationMessage?: string;
}

const GENERIC_BACKEND_MESSAGES = new Set([
  'Bad request',
  'Conflict',
  'Forbidden',
  'Internal Server Error',
  'Resource not found',
  'Too many requests. Please try again later.',
  'Unauthorized',
  'Unexpected server error',
  'Validation Error',
]);

function getValidationMessage(details: ApiErrorPayload['details']) {
  if (!Array.isArray(details)) return null;

  const firstDetail = details.find(
    (detail): detail is ApiValidationDetail =>
      Boolean(detail) && typeof detail === 'object' && 'message' in detail,
  );

  return firstDetail?.message ?? null;
}

function getBackendMessage(payload?: ApiErrorPayload) {
  if (!payload?.error || GENERIC_BACKEND_MESSAGES.has(payload.error)) {
    return null;
  }

  return payload.error;
}

export function getApiErrorStatus(error: unknown) {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.status ?? null;
}

export function isApiErrorStatus(error: unknown, status: number) {
  return getApiErrorStatus(error) === status;
}

export function getApiErrorMessage(error: unknown, options: ApiErrorMessageOptions) {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return options.fallback;
  }

  if (!error.response) {
    return 'Não foi possível se conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  const { status, data } = error.response;
  const backendMessage = getBackendMessage(data);
  const validationMessage = getValidationMessage(data?.details);

  if (status === 400) {
    return validationMessage ?? backendMessage ?? options.validationMessage ?? options.fallback;
  }

  if (status === 403) {
    return options.forbiddenMessage ?? backendMessage ?? 'Você não tem permissão para concluir esta ação.';
  }

  if (status === 404) {
    return options.notFoundMessage ?? backendMessage ?? 'O recurso solicitado não foi encontrado.';
  }

  if (status === 409) {
    return options.conflictMessage ?? backendMessage ?? 'Houve um conflito com o estado atual dos dados. Atualize e tente novamente.';
  }

  if (status === 429) {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.';
  }

  if (status >= 500) {
    return 'O servidor não conseguiu concluir a solicitação agora. Tente novamente em instantes.';
  }

  return backendMessage ?? options.fallback;
}

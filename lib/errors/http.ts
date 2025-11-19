/**
 * HTTP Error handling utilities
 */

export class HTTPError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'HTTPError';
  }
}

export class BadRequestError extends HTTPError {
  constructor(message: string, code = 'BAD_REQUEST', details?: unknown) {
    super(400, code, message, details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(message = 'No autorizado', code = 'UNAUTHORIZED') {
    super(401, code, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message = 'Acceso prohibido', code = 'FORBIDDEN') {
    super(403, code, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HTTPError {
  constructor(message = 'No encontrado', code = 'NOT_FOUND') {
    super(404, code, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HTTPError {
  constructor(message: string, code = 'CONFLICT') {
    super(409, code, message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends HTTPError {
  constructor(
    message = 'Demasiadas solicitudes',
    retryAfter?: number,
    code = 'RATE_LIMIT_EXCEEDED'
  ) {
    super(429, code, message, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends HTTPError {
  constructor(
    message = 'Error interno del servidor',
    code = 'INTERNAL_SERVER_ERROR'
  ) {
    super(500, code, message);
    this.name = 'InternalServerError';
  }
}

export class ServiceUnavailableError extends HTTPError {
  constructor(
    message = 'Servicio no disponible',
    code = 'SERVICE_UNAVAILABLE'
  ) {
    super(503, code, message);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Format error response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function formatErrorResponse(error: HTTPError): ErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}

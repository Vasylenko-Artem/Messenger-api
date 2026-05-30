const defaultErrorCodeByStatus = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'INTERNAL_SERVER_ERROR',
};

export class HttpError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.expose = options.expose ?? statusCode < 500;
    this.code =
      options.code || defaultErrorCodeByStatus[statusCode] || 'HTTP_ERROR';
    this.details = options.details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends HttpError {
  constructor(message = 'Validation failed', details = []) {
    super(400, message, { code: 'VALIDATION_ERROR', details });
  }
}

export const badRequest = (message = 'Bad request', details) =>
  new HttpError(400, message, { details });

export const unauthorized = (message = 'Unauthorized') =>
  new HttpError(401, message);

export const forbidden = (message = 'Forbidden') => new HttpError(403, message);

export const notFound = (message = 'Not found') => new HttpError(404, message);

export const conflict = (message = 'Conflict') => new HttpError(409, message);

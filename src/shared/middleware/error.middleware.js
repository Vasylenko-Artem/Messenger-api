import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import {
  HttpError,
  badRequest,
  conflict,
  notFound,
} from '../errors/http-error.js';
import { logger } from '../logger/logger.js';

const knownErrorStatusByMessage = {
  Forbidden: 403,
  Unauthorized: 401,
  'No token': 401,
  'Invalid token': 401,
  'No refresh token': 401,
  'Invalid credentials': 401,
  'Invalid refresh token': 401,
  'User is not logged in': 401,
  'Message not found': 404,
  'Conversation not found': 404,
  'User not found': 404,
  'User already exists': 409,
  'Email already exists': 409,
  'Username already exists': 409,
};

const normalizePrismaError = (error) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (error.code === 'P2002') {
    const target = error.meta?.target;
    const field = Array.isArray(target) ? target.join(', ') : target;
    return conflict(
      field ? `${field} already exists` : 'Unique constraint failed'
    );
  }

  if (error.code === 'P2025') {
    return notFound('Resource not found');
  }

  return null;
};

const normalizeZodError = (error) => {
  if (!(error instanceof ZodError)) {
    return null;
  }

  return badRequest(
    'Validation failed',
    error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }))
  );
};

export const normalizeError = (error) => {
  if (error instanceof HttpError) {
    return error;
  }

  const zodError = normalizeZodError(error);
  if (zodError) {
    return zodError;
  }

  const prismaError = normalizePrismaError(error);
  if (prismaError) {
    return prismaError;
  }

  const statusCode = knownErrorStatusByMessage[error?.message];
  if (statusCode) {
    return new HttpError(statusCode, error.message);
  }

  return new HttpError(500, 'Internal server error', { expose: false });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const normalizedError = normalizeError(error);
  const logLevel = normalizedError.statusCode >= 500 ? 'error' : 'warn';

  logger[logLevel](
    { err: error, statusCode: normalizedError.statusCode },
    'Request failed'
  );

  const response = {
    message: normalizedError.expose
      ? normalizedError.message
      : 'Internal server error',
  };

  if (
    normalizedError.details &&
    (!Array.isArray(normalizedError.details) || normalizedError.details.length)
  ) {
    response.details = normalizedError.details;
  }

  res.status(normalizedError.statusCode).json(response);
};

import { getErrorStatus } from '../errors/http-error.js';
import { logger } from '../logger/logger.js';

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  logger.error({ err: error }, 'Request failed');

  res.status(getErrorStatus(error)).json({
    message: error.message || 'Internal server error',
  });
};

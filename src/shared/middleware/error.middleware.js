import { getErrorStatus } from '../errors/http-error.js';

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.log(error);

  res.status(getErrorStatus(error)).json({
    message: error.message || 'Internal server error',
  });
};

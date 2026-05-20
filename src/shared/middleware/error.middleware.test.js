import { HttpError, ValidationError } from '../errors/http-error.js';
import { errorHandler } from './error.middleware.js';

const createResponse = () => ({
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

describe('Error Middleware', () => {
  it('responds with status code from HttpError', () => {
    const error = new HttpError(418, 'Custom error');
    const res = createResponse();

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ message: 'Custom error' });
  });

  it('maps known errors to http statuses', () => {
    const res = createResponse();

    errorHandler(new Error('Forbidden'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
  });

  it('responds with 400 for validation errors', () => {
    const res = createResponse();

    errorHandler(new ValidationError('Invalid input'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid input' });
  });

  it('hides unknown internal errors', () => {
    const res = createResponse();

    errorHandler(new Error('Unexpected failure'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal server error',
    });
  });

  it('delegates when headers were already sent', () => {
    const error = new Error('Late error');
    const next = jest.fn();
    const res = {
      headersSent: true,
    };

    errorHandler(error, {}, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

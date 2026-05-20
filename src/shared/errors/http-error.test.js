import {
  HttpError,
  ValidationError,
  badRequest,
  conflict,
  forbidden,
  notFound,
  unauthorized,
} from './http-error.js';

describe('HTTP errors', () => {
  it('creates http errors with defaults', () => {
    const error = new HttpError(400, 'Bad input');

    expect(error).toMatchObject({
      name: 'HttpError',
      message: 'Bad input',
      statusCode: 400,
      expose: true,
      code: 'BAD_REQUEST',
      details: undefined,
    });
  });

  it('creates http errors with explicit options', () => {
    const details = [{ field: 'email' }];
    const error = new HttpError(500, 'Public failure', {
      expose: true,
      details,
    });

    expect(error).toMatchObject({
      message: 'Public failure',
      statusCode: 500,
      expose: true,
      code: 'INTERNAL_SERVER_ERROR',
      details,
    });
  });

  it('creates validation errors', () => {
    const defaultError = new ValidationError();
    const details = [{ field: 'body' }];
    const customError = new ValidationError('Invalid body', details);

    expect(defaultError).toMatchObject({
      message: 'Validation failed',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: [],
    });
    expect(customError).toMatchObject({
      message: 'Invalid body',
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details,
    });
  });

  it('creates helper errors', () => {
    expect(badRequest()).toMatchObject({
      statusCode: 400,
      message: 'Bad request',
    });
    expect(unauthorized()).toMatchObject({
      statusCode: 401,
      message: 'Unauthorized',
    });
    expect(forbidden()).toMatchObject({
      statusCode: 403,
      message: 'Forbidden',
    });
    expect(notFound()).toMatchObject({
      statusCode: 404,
      message: 'Not found',
    });
    expect(conflict()).toMatchObject({
      statusCode: 409,
      message: 'Conflict',
    });
  });
});

import { Prisma } from '@prisma/client';
import { z } from 'zod';

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

  it('includes validation details when present', () => {
    const res = createResponse();
    const details = [{ field: 'email', message: 'email is required' }];

    errorHandler(
      new ValidationError('Invalid input', details),
      {},
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid input',
      details,
    });
  });

  it('maps Zod validation errors to bad request details', () => {
    const res = createResponse();

    try {
      z.object({
        email: z.string().email(),
      }).parse({ email: 'bad-email' });
    } catch (error) {
      errorHandler(error, {}, res, jest.fn());
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      details: [
        expect.objectContaining({
          field: 'email',
          message: expect.any(String),
        }),
      ],
    });
  });

  it('maps root Zod validation errors to body field', () => {
    const res = createResponse();

    try {
      z.never().parse('value');
    } catch (error) {
      errorHandler(error, {}, res, jest.fn());
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      details: [
        expect.objectContaining({
          field: 'body',
          message: expect.any(String),
        }),
      ],
    });
  });

  it('maps known conflict errors', () => {
    const res = createResponse();

    errorHandler(new Error('Email already exists'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
  });

  it('maps Prisma unique constraint errors with field target', () => {
    const res = createResponse();
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: {
          target: ['email'],
        },
      }
    );

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'email already exists' });
  });

  it('maps Prisma unique constraint errors without target', () => {
    const res = createResponse();
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      }
    );

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unique constraint failed',
    });
  });

  it('maps Prisma not found errors', () => {
    const res = createResponse();
    const error = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Resource not found' });
  });

  it('hides unknown Prisma errors', () => {
    const res = createResponse();
    const error = new Prisma.PrismaClientKnownRequestError('Unknown prisma', {
      code: 'P9999',
      clientVersion: 'test',
    });

    errorHandler(error, {}, res, jest.fn());

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

import jwt from 'jsonwebtoken';

import { authenticate } from './auth.middleware.js';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../config/env.js', () => ({
  env: {
    JWT_ACCESS_SECRET: 'access-secret',
  },
}));

const createResponse = () => ({
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with 401 when access token cookie is missing', () => {
    const req = {
      cookies: {},
    };
    const res = createResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token' });
  });

  it('attaches decoded user and calls next for valid token', () => {
    const decoded = {
      id: 'user-id',
      username: 'test',
    };
    jwt.verify.mockReturnValue(decoded);

    const req = {
      cookies: {
        accessToken: 'valid-token',
      },
    };
    const res = createResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'access-secret');
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 401 when token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const req = {
      cookies: {
        accessToken: 'invalid-token',
      },
    };
    const res = createResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'access-secret');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });
});

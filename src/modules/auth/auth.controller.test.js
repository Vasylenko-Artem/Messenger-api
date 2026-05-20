import {
  login,
  logout,
  refreshToken,
  register,
  status,
} from './auth.controller.js';
import * as authService from './auth.service.js';

jest.mock('./auth.service.js', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
}));

const createResponse = () => ({
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

describe('Auth Controller', () => {
  beforeEach(() => {
    process.env.JWT_ACCES_TOKEN_TTL = '2h';
    process.env.JWT_REFRESH_TOKEN_TTL = '7d';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('responds with success message when user is registered', async () => {
      authService.register.mockResolvedValue({ username: 'test' });

      const req = {
        body: {
          username: 'test',
          email: 'test@example.com',
          password: 'password',
        },
      };
      const res = createResponse();

      await register(req, res);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User test registered successfully',
      });
    });

    it('responds with 400 when registration fails', async () => {
      const error = new Error('User already exists');
      authService.register.mockRejectedValue(error);

      const req = {
        body: {
          username: 'test',
          email: 'test@example.com',
          password: 'password',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('sets auth cookies and responds with success message', async () => {
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const req = {
        body: {
          username: 'test',
          password: 'password',
        },
      };
      const res = createResponse();

      await login(req, res);

      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        'access-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 2,
        }
      );
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7,
        }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged in' });
    });

    it('responds with 401 when login fails', async () => {
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      const req = {
        body: {
          username: 'test',
          password: 'password',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('passes cookie ttl parsing errors to next', async () => {
      authService.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      process.env.JWT_ACCES_TOKEN_TTL = 'bad-ttl';

      const req = {
        body: {
          username: 'test',
          password: 'password',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid TTL value: bad-ttl' })
      );
    });
  });

  describe('refreshToken', () => {
    it('passes 401 error when refresh token cookie is missing', async () => {
      const req = { cookies: {} };
      const res = createResponse();
      const next = jest.fn();

      await refreshToken(req, res, next);

      expect(authService.refreshToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No refresh token',
          statusCode: 401,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it('sets new auth cookies and responds with success message', async () => {
      authService.refreshToken.mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const req = {
        cookies: {
          refreshToken: 'old-refresh-token',
        },
      };
      const res = createResponse();

      await refreshToken(req, res);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'old-refresh-token'
      );
      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        'new-access-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 2,
        }
      );
      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        'new-refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24 * 7,
        }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Token refreshed' });
    });

    it('responds with 401 when refresh token is invalid', async () => {
      const error = new Error('Invalid refresh token');
      authService.refreshToken.mockImplementation(() => {
        throw error;
      });

      const req = {
        cookies: {
          refreshToken: 'invalid-refresh-token',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('clears auth cookies and responds with success message', () => {
      const req = {};
      const res = createResponse();

      logout(req, res);

      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
      };

      expect(res.clearCookie).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        cookieOptions
      );
      expect(res.clearCookie).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        cookieOptions
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
    });
  });

  describe('status', () => {
    it('responds with user data when request has authenticated user', async () => {
      const req = {
        user: {
          id: 1,
          username: 'test',
        },
      };
      const res = createResponse();

      await status(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: {
          username: 'test',
        },
      });
    });

    it('passes 401 error when request does not have authenticated user', async () => {
      const req = {};
      const res = createResponse();
      const next = jest.fn();

      await status(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User is not logged in',
          statusCode: 401,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

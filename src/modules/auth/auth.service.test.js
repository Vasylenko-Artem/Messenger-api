import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { login, refreshToken, register } from './auth.service.js';
import * as usersService from '../users/users.service.js';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../../shared/config/env.js', () => ({
  env: {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
    JWT_ACCES_TOKEN_TTL: '15m',
    JWT_REFRESH_TOKEN_TTL: '7d',
  },
}));

jest.mock('../users/users.service.js', () => ({
  createUser: jest.fn(),
  getUserByUsername: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes password and creates a user', async () => {
      const createdUser = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
      };

      bcrypt.hash.mockResolvedValue('hashed-password');
      usersService.createUser.mockResolvedValue(createdUser);

      await expect(
        register({
          username: 'test',
          email: 'test@example.com',
          password: 'plain-password',
        })
      ).resolves.toEqual(createdUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(usersService.createUser).toHaveBeenCalledWith(
        'test',
        'test@example.com',
        'hashed-password'
      );
    });
  });

  describe('login', () => {
    it('returns access and refresh tokens for valid credentials', async () => {
      const user = {
        id: 1,
        username: 'test',
        passwordHash: 'hashed-password',
      };

      usersService.getUserByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await expect(
        login({ username: 'test', password: 'plain-password' })
      ).resolves.toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(usersService.getUserByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password'
      );
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        { id: 1, username: 'test' },
        'access-secret',
        { expiresIn: '15m' }
      );
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        { id: 1, username: 'test' },
        'refresh-secret',
        { expiresIn: '7d' }
      );
    });

    it('throws when user does not exist', async () => {
      usersService.getUserByUsername.mockResolvedValue(null);

      await expect(
        login({ username: 'missing', password: 'plain-password' })
      ).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('throws when password is invalid', async () => {
      usersService.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'test',
        passwordHash: 'hashed-password',
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        login({ username: 'test', password: 'wrong-password' })
      ).rejects.toThrow('Invalid credentials');

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('returns new tokens for a valid refresh token', () => {
      jwt.verify.mockReturnValue({ id: 1, username: 'test' });
      jwt.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      expect(refreshToken('valid-refresh-token')).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        'refresh-secret'
      );
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        { id: 1, username: 'test' },
        'access-secret',
        { expiresIn: '15m' }
      );
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        { id: 1, username: 'test' },
        'refresh-secret',
        { expiresIn: '7d' }
      );
    });

    it('throws when refresh token is invalid', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => refreshToken('invalid-refresh-token')).toThrow(
        'Invalid refresh token'
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});

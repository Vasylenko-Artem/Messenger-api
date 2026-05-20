import * as authService from './auth.service.js';
import { unauthorized } from '../../shared/errors/http-error.js';
import {
  authValidation,
  validateBody,
} from '../../shared/validation/validators.js';

const durationToMs = (value) => {
  const match = /^(\d+)([smhd])$/.exec(value);

  if (!match) {
    throw new Error(`Invalid TTL value: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2]; // index

  const unitToMs = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  return amount * unitToMs[unit];
};

const getCookieOptions = (ttl) => ({
  httpOnly: true,
  // secure: true, // true for HTTPS
  secure: false,
  sameSite: 'strict',
  maxAge: durationToMs(ttl),
});

export const register = async (req, res, next) => {
  try {
    const body = validateBody(authValidation.register, req);
    const user = await authService.register(body);
    res.json({ message: `User ${user.username} registered successfully` });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const body = validateBody(authValidation.login, req);
    const { accessToken, refreshToken } = await authService.login(body);

    res
      .cookie(
        'accessToken',
        accessToken,
        getCookieOptions(process.env.JWT_ACCES_TOKEN_TTL)
      )
      .cookie(
        'refreshToken',
        refreshToken,
        getCookieOptions(process.env.JWT_REFRESH_TOKEN_TTL)
      )
      .json({ message: 'Logged in' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw unauthorized('No refresh token');
    }

    const { accessToken, refreshToken } = authService.refreshToken(token);

    res
      .cookie(
        'accessToken',
        accessToken,
        getCookieOptions(process.env.JWT_ACCES_TOKEN_TTL)
      )
      .cookie(
        'refreshToken',
        refreshToken,
        getCookieOptions(process.env.JWT_REFRESH_TOKEN_TTL)
      )
      .json({ message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  const cookiesOptions = {
    httpOnly: true,
    // secure: true,
    secure: false,
    sameSite: 'strict',
  };

  res
    .clearCookie('accessToken', cookiesOptions)
    .clearCookie('refreshToken', cookiesOptions)
    .json({ message: 'Logged out' });
};

export const status = async (req, res, next) => {
  try {
    const user = req.user; // Set by auth middleware

    if (!user) {
      throw unauthorized('User is not logged in');
    }

    const { username } = user;

    res.json({
      user: {
        username,
      },
    });
  } catch (error) {
    next(error);
  }
};

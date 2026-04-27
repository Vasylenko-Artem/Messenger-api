import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { env } from '../../shared/config/env.js';

import * as usersService from '../users/users.service.js';
const SALT_ROUNDS = 10;

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCES_TOKEN_TTL,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TOKEN_TTL,
  });

  return { accessToken, refreshToken };
};

export const register = async ({ username, email, password }) => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await usersService.createUser(username, email, hashed);

  return user;
};

export const login = async ({ username, password }) => {
  const user = await usersService.getUserByUsername(username);

  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  return generateTokens(user);
};

export const refreshToken = (token) => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);

    return generateTokens({
      id: payload.id,
      username: payload.username,
    });
  } catch {
    throw new Error('Invalid refresh token');
  }
};

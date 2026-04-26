import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { env } from '../../shared/config/env.js';

const SALT_ROUNDS = 10;
const users = [];

const generateTokens = (username) => {
  const payload = { username };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const register = async ({ username, password }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  users.push({ username, password: hashedPassword });

  return { username };
};

export const login = async ({ username, password }) => {
  const user = users.find((u) => u.username === username);
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  return generateTokens(username);
};

export const refreshToken = (token) => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return generateTokens(payload.username);
  } catch {
    throw new Error('Invalid refresh token');
  }
};

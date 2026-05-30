import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../errors/http-error.js';

export const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return next(unauthorized('No token'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next(unauthorized('Invalid token'));
  }
};

export default authenticate;

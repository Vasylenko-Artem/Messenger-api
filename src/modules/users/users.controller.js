import * as usersService from './users.service.js';
import { badRequest } from '../../shared/errors/http-error.js';
import {
  assertObjectBody,
  minLength,
  optionalEmail,
  optionalString,
  requireAuthUserId,
} from '../../shared/validation/validators.js';

export const getMe = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    const user = await usersService.getCurrentUser(userId);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const userId = requireAuthUserId(req);
    assertObjectBody(req.body);

    const password = optionalString(req.body.password, 'password');
    const body = {
      username: optionalString(req.body.username, 'username'),
      email: optionalEmail(req.body.email),
      password: password && minLength(password, 'password', 6),
    };

    if (Object.values(body).every((value) => value === undefined)) {
      throw badRequest('No fields to update');
    }

    const user = await usersService.updateCurrentUser(userId, body);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

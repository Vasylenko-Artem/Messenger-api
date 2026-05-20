import * as usersService from './users.service.js';
import {
  requireAuthUserId,
  usersValidation,
  validateBody,
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
    const body = validateBody(usersValidation.updateMe, req);

    const user = await usersService.updateCurrentUser(userId, body);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

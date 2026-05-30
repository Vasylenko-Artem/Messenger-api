import * as usersService from './users.service.js';
import { requireAuthUserId } from '../../shared/validation/validators.js';

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
    const user = await usersService.updateCurrentUser(userId, req.body);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

import * as usersService from './users.service.js';

export const getMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await usersService.getCurrentUser(req.user.id);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await usersService.updateCurrentUser(req.user.id, req.body);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

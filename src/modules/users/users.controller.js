import * as usersService from './users.service.js';

const getErrorStatus = (message) => {
  if (message === 'User not found') {
    return 404;
  }

  return 400;
};

export const getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await usersService.getCurrentUser(req.user.id);

    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await usersService.updateCurrentUser(req.user.id, req.body);

    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(getErrorStatus(error.message)).json({ message: error.message });
  }
};

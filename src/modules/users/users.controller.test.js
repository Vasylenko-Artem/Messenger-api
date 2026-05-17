import { getMe, updateMe } from './users.controller.js';
import * as usersService from './users.service.js';

jest.mock('./users.service.js', () => ({
  getCurrentUser: jest.fn(),
  updateCurrentUser: jest.fn(),
}));

const createResponse = () => ({
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
});

describe('Users Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('responds with current user', async () => {
      const user = {
        id: 'user-id',
        username: 'test',
        email: 'test@example.com',
      };

      usersService.getCurrentUser.mockResolvedValue(user);

      const req = {
        user: {
          id: 'user-id',
        },
      };
      const res = createResponse();

      await getMe(req, res);

      expect(usersService.getCurrentUser).toHaveBeenCalledWith('user-id');
      expect(res.json).toHaveBeenCalledWith({ user });
    });

    it('responds with 401 when user is missing from request', async () => {
      const req = {};
      const res = createResponse();

      await getMe(req, res);

      expect(usersService.getCurrentUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('responds with 404 when user does not exist', async () => {
      usersService.getCurrentUser.mockRejectedValue(
        new Error('User not found')
      );

      const req = {
        user: {
          id: 'missing-id',
        },
      };
      const res = createResponse();

      await getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('updateMe', () => {
    it('responds with updated user', async () => {
      const user = {
        id: 'user-id',
        username: 'updated',
        email: 'updated@example.com',
      };

      usersService.updateCurrentUser.mockResolvedValue(user);

      const req = {
        user: {
          id: 'user-id',
        },
        body: {
          username: 'updated',
        },
      };
      const res = createResponse();

      await updateMe(req, res);

      expect(usersService.updateCurrentUser).toHaveBeenCalledWith(
        'user-id',
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({ user });
    });

    it('responds with 401 when user is missing from request', async () => {
      const req = {
        body: {
          username: 'updated',
        },
      };
      const res = createResponse();

      await updateMe(req, res);

      expect(usersService.updateCurrentUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('responds with 400 when update validation fails', async () => {
      usersService.updateCurrentUser.mockRejectedValue(
        new Error('No fields to update')
      );

      const req = {
        user: {
          id: 'user-id',
        },
        body: {},
      };
      const res = createResponse();

      await updateMe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No fields to update',
      });
    });
  });
});

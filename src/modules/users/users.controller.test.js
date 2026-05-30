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

    it('passes 401 error when user is missing from request', async () => {
      const req = {};
      const res = createResponse();
      const next = jest.fn();

      await getMe(req, res, next);

      expect(usersService.getCurrentUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unauthorized', statusCode: 401 })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it('responds with 404 when user does not exist', async () => {
      const error = new Error('User not found');
      usersService.getCurrentUser.mockRejectedValue(error);

      const req = {
        user: {
          id: 'missing-id',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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

    it('updates user without password', async () => {
      const user = {
        id: 'user-id',
        username: 'updated',
        email: 'test@example.com',
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

      expect(usersService.updateCurrentUser).toHaveBeenCalledWith('user-id', {
        username: 'updated',
      });
      expect(res.json).toHaveBeenCalledWith({ user });
    });

    it('updates user with password', async () => {
      const user = {
        id: 'user-id',
        username: 'test',
        email: 'test@example.com',
      };

      usersService.updateCurrentUser.mockResolvedValue(user);

      const req = {
        user: {
          id: 'user-id',
        },
        body: {
          password: 'new-password',
        },
      };
      const res = createResponse();

      await updateMe(req, res);

      expect(usersService.updateCurrentUser).toHaveBeenCalledWith('user-id', {
        password: 'new-password',
      });
      expect(res.json).toHaveBeenCalledWith({ user });
    });

    it('passes 401 error when user is missing from request', async () => {
      const req = {
        body: {
          username: 'updated',
        },
      };
      const res = createResponse();
      const next = jest.fn();

      await updateMe(req, res, next);

      expect(usersService.updateCurrentUser).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unauthorized', statusCode: 401 })
      );
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

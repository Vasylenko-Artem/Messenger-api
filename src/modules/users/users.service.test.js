import bcrypt from 'bcrypt';

import {
  createUser,
  getCurrentUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  updateCurrentUser,
} from './users.service.js';
import prisma from '../../shared/db/prisma.js';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('../../shared/db/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Users Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('creates a user when username and email are unique', async () => {
      const user = {
        id: 'user-id',
        username: 'test',
        email: 'test@example.com',
      };

      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValue(user);

      await expect(
        createUser('test', 'test@example.com', 'hashed-password')
      ).resolves.toEqual(user);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'test',
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        },
      });
    });

    it('throws when username already exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        createUser('test', 'test@example.com', 'hashed-password')
      ).rejects.toThrow('User already exists');

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('throws when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 'existing-id',
      });

      await expect(
        createUser('test', 'test@example.com', 'hashed-password')
      ).rejects.toThrow('Email already exists');

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('returns public user fields', async () => {
      const user = {
        id: 'user-id',
        username: 'test',
        email: 'test@example.com',
      };

      prisma.user.findUnique.mockResolvedValue(user);

      await expect(getCurrentUser('user-id')).resolves.toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('throws when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(getCurrentUser('missing-id')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getUserByUsername', () => {
    it('finds user by username', async () => {
      prisma.user.findUnique.mockResolvedValue({ username: 'test' });

      await getUserByUsername('test');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'test' },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('finds user by email', async () => {
      prisma.user.findUnique.mockResolvedValue({ email: 'test@example.com' });

      await getUserByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('getUserById', () => {
    it('finds user by id', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id' });

      await getUserById('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });
  });

  describe('updateCurrentUser', () => {
    it('updates username, email and password', async () => {
      const updatedUser = {
        id: 'user-id',
        username: 'new-test',
        email: 'new@example.com',
      };

      prisma.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-id',
          username: 'test',
          email: 'test@example.com',
        })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValue('new-hashed-password');
      prisma.user.update.mockResolvedValue(updatedUser);

      await expect(
        updateCurrentUser('user-id', {
          username: ' new-test ',
          email: ' new@example.com ',
          password: 'new-password',
        })
      ).resolves.toEqual(updatedUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          username: 'new-test',
          email: 'new@example.com',
          passwordHash: 'new-hashed-password',
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('throws when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        updateCurrentUser('missing-id', { username: 'test' })
      ).rejects.toThrow('User not found');
    });

    it('throws when username belongs to another user', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: 'user-id' })
        .mockResolvedValueOnce({ id: 'another-user-id' });

      await expect(
        updateCurrentUser('user-id', { username: 'existing' })
      ).rejects.toThrow('Username already exists');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws when no fields are provided', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id' });

      await expect(updateCurrentUser('user-id', {})).rejects.toThrow(
        'No fields to update'
      );
    });

    it('throws when update payload is missing', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id' });

      await expect(updateCurrentUser('user-id')).rejects.toThrow(
        'No fields to update'
      );
    });
  });
});

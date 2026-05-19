import * as usersService from './users.service.js';

// Мок для prisma з правильною структурою
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('../../shared/db/prisma.js', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Імпортуємо мок після того як jest.mock спрацював
import prisma from '../../shared/db/prisma.js';

afterEach(() => {
  jest.clearAllMocks();
});

// =====================
// Тести для getUserById
// =====================
describe('getUserById', () => {
  it('повертає користувача якщо він існує', async () => {
    const fakeUser = { id: '1', username: 'diana', email: 'diana@mail.com' };
    prisma.user.findUnique.mockResolvedValue(fakeUser);

    const result = await usersService.getUserById('1');

    expect(result).toEqual(fakeUser);
  });

  it('повертає null якщо користувача не існує', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await usersService.getUserById('999');

    expect(result).toBeNull();
  });
});

// =====================
// Тести для updateUser
// =====================
describe('updateUser', () => {
  it('оновлює користувача якщо дані валідні', async () => {
    const existingUser = { id: '1', username: 'diana', email: 'diana@mail.com' };
    const updatedUser = { id: '1', username: 'diana_new', email: 'diana@mail.com' };

    prisma.user.findUnique.mockResolvedValueOnce(existingUser);
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.update.mockResolvedValue(updatedUser);

    const result = await usersService.updateUser('1', { username: 'diana_new' });

    expect(result).toEqual(updatedUser);
  });

  it('кидає помилку якщо користувач не існує', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(usersService.updateUser('999', { username: 'test' }))
      .rejects.toThrow('User not found');
  });

  it('кидає помилку якщо username вже зайнятий', async () => {
    const existingUser = { id: '1', username: 'diana', email: 'diana@mail.com' };
    const anotherUser = { id: '2', username: 'diana_new', email: 'other@mail.com' };

    prisma.user.findUnique.mockResolvedValueOnce(existingUser);
    prisma.user.findUnique.mockResolvedValueOnce(anotherUser);

    await expect(usersService.updateUser('1', { username: 'diana_new' }))
      .rejects.toThrow('Username already in use');
  });

  it('кидає помилку якщо email вже зайнятий', async () => {
    const existingUser = { id: '1', username: 'diana', email: 'diana@mail.com' };
    const anotherUser = { id: '2', username: 'other', email: 'taken@mail.com' };

    prisma.user.findUnique.mockResolvedValueOnce(existingUser);
    prisma.user.findUnique.mockResolvedValueOnce(anotherUser);

    await expect(usersService.updateUser('1', { email: 'taken@mail.com' }))
      .rejects.toThrow('Email already in use');
  });
});
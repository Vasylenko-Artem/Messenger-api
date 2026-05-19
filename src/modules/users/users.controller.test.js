import * as usersController from './users.controller.js';
import * as usersService from './users.service.js';

// Мок для сервісу
jest.mock('./users.service.js', () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

// Хелпер — створює фейкові req і res
const mockReqRes = (overrides = {}) => {
  const req = {
    user: { id: '1' },
    body: {},
    ...overrides,
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return { req, res };
};

// =====================
// Тести для getMe
// =====================
describe('getMe', () => {
  it('повертає профіль користувача', async () => {
    const fakeUser = { id: '1', username: 'diana', email: 'diana@mail.com' };
    usersService.getUserById.mockResolvedValue(fakeUser);

    const { req, res } = mockReqRes();
    await usersController.getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it('повертає 404 якщо користувача не знайдено', async () => {
    usersService.getUserById.mockResolvedValue(null);

    const { req, res } = mockReqRes();
    await usersController.getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });
});

// =====================
// Тести для updateMe
// =====================
describe('updateMe', () => {
  it('оновлює профіль і повертає оновленого користувача', async () => {
    const updatedUser = { id: '1', username: 'diana_new', email: 'diana@mail.com' };
    usersService.updateUser.mockResolvedValue(updatedUser);

    const { req, res } = mockReqRes({ body: { username: 'diana_new' } });
    await usersController.updateMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });

  it('повертає 400 якщо username менше 3 символів', async () => {
    const { req, res } = mockReqRes({ body: { username: 'di' } });
    await usersController.updateMe(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Username must be at least 3 characters',
    });
  });

  it('повертає 400 якщо email невалідний', async () => {
    const { req, res } = mockReqRes({ body: { email: 'notanemail' } });
    await usersController.updateMe(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email format' });
  });
});
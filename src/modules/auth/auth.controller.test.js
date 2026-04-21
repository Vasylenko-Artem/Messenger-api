import { createAuthController } from './auth.controller.js';

describe('Auth Controller', () => {
	let controller;
	let authService;

	beforeEach(() => {
		authService = {
			register: jest.fn(),
			login: jest.fn(),
			refreshToken: jest.fn(),
		};

		controller = createAuthController(authService);
	});

	it('should register user', async () => {
		authService.register.mockResolvedValue({ username: 'test' });

		const req = { body: {} };
		const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

		await controller.register(req, res);

		expect(res.json).toHaveBeenCalledWith({
			message: 'User test registered successfully',
		});
	});
});

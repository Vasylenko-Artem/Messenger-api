import { login, register } from './auth.controller.js';

describe('Auth Controller', () => {
	it('should register a new user', () => {
		const req = { body: { username: 'test', password: 'password' } };
		const res = { json: jest.fn() };
		register(req, res);
		expect(res.json).toHaveBeenCalledWith({ message: 'User test registered successfully' });
	});

	it('should login a user', () => {
		const req = { body: { username: 'test', password: 'password' } };
		const res = { json: jest.fn() };
		login(req, res);
		expect(res.json).toHaveBeenCalledWith({ message: 'User test logged in successfully' });
	});
});

import { login, register } from './auth.service.js';

describe('Auth Service', () => {
	it('should register a new user', () => {
		const user = { username: 'test', password: 'password' };
		const result = register(user);
		expect(result).toEqual(user);
	});

	it('should login a user', () => {
		const user = { username: 'test', password: 'password' };
		register(user); // Ensure the user is registered before login
		const result = login(user);
		expect(result).toHaveProperty('username', 'test');
		expect(result).toHaveProperty('token');
	});
});

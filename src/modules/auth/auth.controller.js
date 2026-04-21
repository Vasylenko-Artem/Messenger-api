import * as authService from './auth.service.js';

export const register = (req, res) => {
	const user = authService.register(req.body);
	res.json({ message: `User ${user.username} registered successfully` });
};

export const login = (req, res) => {
	const user = authService.login(req.body);
	res.json({ username: user.username, token: user.token });
};

export const refreshToken = (req, res) => {
	// TODO: Implement token refresh logic
	res.json({ message: 'Token refreshed successfully' });
};

export const logout = (req, res) => {
	// TODO: Implement logout logic (e.g., invalidate token)
	res.json({ message: 'User logged out successfully' });
};

export const status = (req, res) => {
	// TODO: Implement user status logic
	res.json({ message: 'User is logged in' });
};

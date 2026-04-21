import * as authService from './auth.service.js';

export const register = (req, res) => {
	const user = authService.register(req.body);
	res.json({ message: `User ${user.username} registered successfully` });
};

export const login = (req, res) => {
	const user = authService.login(req.body);
	res.json({ username: user.username, token: user.token });
};

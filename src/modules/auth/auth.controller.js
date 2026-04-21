import * as authService from './auth.service.js';

export const register = async (req, res) => {
	try {
		const user = await authService.register(req.body);
		res.json({ message: `User ${user.username} registered successfully` });
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { accessToken, refreshToken } = await authService.login(req.body);

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				// secure: true, // true for HTTPS
				secure: false,
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60, // 1h
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				// secure: true,
				secure: false,
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
			})
			.json({ message: 'Logged in' });
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
};

export const refreshToken = async (req, res) => {
	try {
		const token = req.cookies.refreshToken;

		if (!token) {
			return res.status(401).json({ message: 'No refresh token' });
		}

		const { accessToken, refreshToken } = authService.refreshToken(token);

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60,
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60 * 24 * 7,
			})
			.json({ message: 'Token refreshed' });
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
};

export const logout = (req, res) => {
	const cookiesOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
	};

	res.clearCookie('accessToken', cookiesOptions).clearCookie('refreshToken', cookiesOptions).json({ message: 'Logged out' });
};

export const status = async (req, res) => {
	const user = req.user; // Set by auth middleware

	if (!user) {
		return res.status(401).json({ message: 'User is not logged in' });
	}

	const { username } = user;

	res.json({
		user: {
			username,
		},
	});
};

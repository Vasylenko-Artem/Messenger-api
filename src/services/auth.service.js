import jwt from 'jsonwebtoken';

const users = [];

export const register = ({ username, password }) => {
	users.push({ username, password });
	return { username, password };
};

export const login = ({ username, password }) => {
	const user = users.find((u) => u.username === username && u.password === password);
	if (!user) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}
	const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

	return { username, token };
};

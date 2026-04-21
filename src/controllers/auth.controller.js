const users = [];

export const register = (req, res) => {
	const { username, password } = req.body;
	users.push({ username, password });
	res.json({ message: `User ${username} registered successfully` });
};

export const login = (req, res) => {
	const { username, password } = req.body;
	const user = users.find((u) => u.username === username && u.password === password);
	if (!user) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}
	res.json({ message: `User ${username} logged in successfully` });
};

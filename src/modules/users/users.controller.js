import * as usersService from './users.service.js';

// GET /users/me — отримати свій профіль
export const getMe = async (req, res) => {
  try {
    // userId береться з JWT токена (middleware вже поклав його в req.user)
    const userId = req.user.id;

    const user = await usersService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /users/me — оновити свій профіль
export const updateMe = async (req, res) => {
  try {
    // userId береться з JWT токена, НЕ з body!
    const userId = req.user.id;

    const { username, email } = req.body;

    // Валідація — перевіряємо що поля не порожні рядки
    if (username !== undefined && username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    if (email !== undefined && !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Збираємо тільки ті поля які передали (пусті не перезаписуємо)
    const dataToUpdate = {};
    if (username !== undefined) dataToUpdate.username = username;
    if (email !== undefined) dataToUpdate.email = email;

    const updatedUser = await usersService.updateUser(userId, dataToUpdate);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Стара заготовка від тімліда — залишаємо на випадок якщо десь використовується
export const create = async (req, res) => {
  try {
    console.log('Creating user...');
  } catch (error) {
    console.log(error);
  }
};
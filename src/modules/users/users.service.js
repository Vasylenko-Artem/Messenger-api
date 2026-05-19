import prisma from '../../shared/db/prisma.js';

// Знайти користувача по ID
export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      // passwordHash НЕ включаємо — це безпека!
    },
  });
};

// Знайти користувача по username
export const getUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

// Знайти користувача по email
export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

// Створити нового користувача
export const createUser = async (username, email, passwordHash) => {
  const user = await getUserByUsername(username);
  if (user) {
    throw new Error('User already exists');
  }

  return prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  });
};

// Оновити профіль користувача
export const updateUser = async (id, data) => {
  // Перевіряємо чи існує користувач
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new Error('User not found');
  }

  // Якщо змінюється email — перевіряємо унікальність
  if (data.email && data.email !== existingUser.email) {
    const emailTaken = await getUserByEmail(data.email);
    if (emailTaken) {
      throw new Error('Email already in use');
    }
  }

  // Якщо змінюється username — перевіряємо унікальність
  if (data.username && data.username !== existingUser.username) {
    const usernameTaken = await getUserByUsername(data.username);
    if (usernameTaken) {
      throw new Error('Username already in use');
    }
  }

  // Оновлюємо і повертаємо без passwordHash
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    },
  });
};
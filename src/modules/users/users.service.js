import prisma from '../../shared/db/prisma.js';

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

export const getUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

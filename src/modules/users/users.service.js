import bcrypt from 'bcrypt';

import prisma from '../../shared/db/prisma.js';
import {
  badRequest,
  conflict,
  notFound,
} from '../../shared/errors/http-error.js';

const SALT_ROUNDS = 10;

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  createdAt: true,
  updatedAt: true,
};

export const createUser = async (username, email, passwordHash) => {
  const userByUsername = await getUserByUsername(username);
  if (userByUsername) {
    throw conflict('User already exists');
  }

  const userByEmail = await getUserByEmail(email);
  if (userByEmail) {
    throw conflict('Email already exists');
  }

  return prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  });
};

export const getCurrentUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    throw notFound('User not found');
  }

  return user;
};

export const getUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const updateCurrentUser = async (
  id,
  { username, email, password } = {}
) => {
  const currentUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!currentUser) {
    throw notFound('User not found');
  }

  const data = {};

  if (username !== undefined) {
    if (typeof username !== 'string') {
      throw badRequest('Username is required');
    }

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      throw badRequest('Username is required');
    }

    const existingUser = await getUserByUsername(normalizedUsername);
    if (existingUser && existingUser.id !== id) {
      throw conflict('Username already exists');
    }

    data.username = normalizedUsername;
  }

  if (email !== undefined) {
    if (typeof email !== 'string') {
      throw badRequest('Email is required');
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      throw badRequest('Email is required');
    }

    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser && existingUser.id !== id) {
      throw conflict('Email already exists');
    }

    data.email = normalizedEmail;
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || !password) {
      throw badRequest('Password is required');
    }

    data.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (!Object.keys(data).length) {
    throw badRequest('No fields to update');
  }

  return prisma.user.update({
    where: { id },
    data,
    select: publicUserSelect,
  });
};

import { z } from 'zod';

import { unauthorized } from '../errors/http-error.js';

const requiredString = (field) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, { error: `${field} is required` });

const requiredStringArray = (field) =>
  z
    .array(requiredString(field), {
      error: `${field} must be a non-empty array`,
    })
    .min(1, { error: `${field} must be a non-empty array` });

const atLeastOneField = () => (data) =>
  Object.values(data).some((value) => value !== undefined);

export const validate = (schema, data) => schema.parse(data);

export const validateBody = (schema, req) => validate(schema, req.body);

export const validateParams = (schema, req) => validate(schema, req.params);

export const requireAuthUserId = (req) => {
  const id = req.user?.id;

  if (!id) {
    throw unauthorized();
  }

  return id;
};

export const authValidation = {
  register: z
    .object({
      username: requiredString('username'),
      email: requiredString('email').email({ error: 'email must be valid' }),
      password: requiredString('password').min(6, {
        error: 'password must be at least 6 characters',
      }),
    })
    .strict(),

  login: z
    .object({
      username: requiredString('username'),
      password: requiredString('password'),
    })
    .strict(),
};

export const usersValidation = {
  updateMe: z
    .object({
      username: requiredString('username').optional(),
      email: requiredString('email')
        .email({ error: 'email must be valid' })
        .optional(),
      password: requiredString('password')
        .min(6, { error: 'password must be at least 6 characters' })
        .optional(),
    })
    .strict()
    .refine(atLeastOneField(), { error: 'No fields to update' }),
};

export const conversationsValidation = {
  create: z
    .object({
      type: z.enum(['PRIVATE', 'GROUP'], {
        error: 'type must be one of: PRIVATE, GROUP',
      }),
      participantIds: requiredStringArray('participantIds'),
    })
    .strict(),

  addParticipants: z
    .object({
      participantIds: requiredStringArray('participantIds'),
    })
    .strict(),

  idParams: z
    .object({
      id: requiredString('id'),
    })
    .strict(),
};

export const messagesValidation = {
  create: z
    .object({
      conversationId: requiredString('conversationId'),
      content: requiredString('content'),
      type: z.enum(['TEXT', 'IMAGE', 'FILE']).optional(),
    })
    .strict(),

  getByConversationParams: z
    .object({
      conversationId: requiredString('conversationId'),
    })
    .strict(),

  update: z
    .object({
      content: requiredString('content'),
    })
    .strict(),

  idParams: z
    .object({
      id: requiredString('id'),
    })
    .strict(),
};

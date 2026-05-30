import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { unauthorized } from '../errors/http-error.js';

extendZodWithOpenApi(z);

export const conversationTypes = ['PRIVATE', 'GROUP'];
export const messageTypes = ['TEXT', 'IMAGE', 'FILE'];

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

/**
 * Express middleware to validate request data using a Zod schema.
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 * @param {'body' | 'params' | 'query'} source - The request property to validate.
 */
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      next(error);
    }
  };

export const validateBody = (schema, req) => schema.parse(req.body);

export const validateParams = (schema, req) => schema.parse(req.params);

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
      username: requiredString('username').openapi({ example: 'testuser' }),
      email: requiredString('email')
        .email({ error: 'email must be valid' })
        .openapi({ example: 'test@example.com' }),
      password: requiredString('password')
        .min(6, {
          error: 'password must be at least 6 characters',
        })
        .openapi({ example: '123456' }),
    })
    .strict()
    .openapi('RegisterRequest'),

  login: z
    .object({
      username: requiredString('username').openapi({ example: 'testuser' }),
      password: requiredString('password').openapi({ example: '123456' }),
    })
    .strict()
    .openapi('LoginRequest'),
};

export const usersValidation = {
  updateMe: z
    .object({
      username: requiredString('username')
        .optional()
        .openapi({ example: 'newusername' }),
      email: requiredString('email')
        .email({ error: 'email must be valid' })
        .optional()
        .openapi({ example: 'new@example.com' }),
      password: requiredString('password')
        .min(6, { error: 'password must be at least 6 characters' })
        .optional()
        .openapi({ example: 'new-password' }),
    })
    .strict()
    .refine(atLeastOneField(), { error: 'No fields to update' })
    .openapi('UpdateUserRequest'),
};

export const conversationsValidation = {
  create: z
    .object({
      type: z
        .enum(conversationTypes, {
          error: 'type must be one of: PRIVATE, GROUP',
        })
        .openapi({ example: 'PRIVATE' }),
      participantIds: requiredStringArray('participantIds').openapi({
        example: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
      }),
    })
    .strict()
    .openapi('CreateConversationRequest'),

  addParticipants: z
    .object({
      participantIds: requiredStringArray('participantIds').openapi({
        example: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
      }),
    })
    .strict()
    .openapi('AddConversationParticipantsRequest'),

  idParams: z
    .object({
      id: requiredString('id').openapi({
        example: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
      }),
    })
    .strict()
    .openapi('IdParams'),
};

export const messagesValidation = {
  create: z
    .object({
      conversationId: requiredString('conversationId').openapi({
        example: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
      }),
      content: requiredString('content').openapi({ example: 'Hello' }),
      type: z.enum(messageTypes).optional().openapi({ example: 'TEXT' }),
    })
    .strict()
    .openapi('SendMessageRequest'),

  getByConversationParams: z
    .object({
      conversationId: requiredString('conversationId').openapi({
        example: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
      }),
    })
    .strict()
    .openapi('GetMessagesParams'),

  update: z
    .object({
      content: requiredString('content').openapi({
        example: 'Updated message',
      }),
    })
    .strict()
    .openapi('EditMessageRequest'),

  idParams: z
    .object({
      id: requiredString('id').openapi({
        example: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
      }),
    })
    .strict()
    .openapi('MessageIdParams'),
};

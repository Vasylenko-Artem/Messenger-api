import { z } from 'zod';

import {
  authValidation,
  conversationsValidation,
  messagesValidation,
  usersValidation,
} from '../../validation/validators.js';

const withoutJsonSchemaMeta = (schema) => {
  const openApiSchema = z.toJSONSchema(schema);
  delete openApiSchema.$schema;
  return openApiSchema;
};

const withPropertyExamples = (schema, examples) => ({
  ...schema,
  properties: Object.entries(schema.properties || {}).reduce(
    (properties, [name, property]) => ({
      ...properties,
      [name]: examples[name]
        ? { ...property, example: examples[name] }
        : property,
    }),
    {}
  ),
});

const zodToOpenApiSchema = (schema, examples = {}) =>
  withPropertyExamples(withoutJsonSchemaMeta(schema), examples);

export const validationSchemas = {
  RegisterRequest: zodToOpenApiSchema(authValidation.register, {
    username: 'testuser',
    email: 'test@example.com',
    password: '123456',
  }),

  LoginRequest: zodToOpenApiSchema(authValidation.login, {
    username: 'testuser',
    password: '123456',
  }),

  UpdateUserRequest: zodToOpenApiSchema(usersValidation.updateMe, {
    username: 'newusername',
    email: 'new@example.com',
    password: 'new-password',
  }),

  CreateConversationRequest: zodToOpenApiSchema(
    conversationsValidation.create,
    {
      type: 'PRIVATE',
      participantIds: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
    }
  ),

  AddConversationParticipantsRequest: zodToOpenApiSchema(
    conversationsValidation.addParticipants,
    {
      participantIds: ['9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9'],
    }
  ),

  SendMessageRequest: zodToOpenApiSchema(messagesValidation.create, {
    conversationId: '9c2eab54-0c7e-4e0d-980a-9f1ff5297ec9',
    content: 'Hello',
    type: 'TEXT',
  }),

  EditMessageRequest: zodToOpenApiSchema(messagesValidation.update, {
    content: 'Updated message',
  }),
};

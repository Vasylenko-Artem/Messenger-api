import { authPaths } from './paths/auth.paths.js';
import { conversationPaths } from './paths/conversation.paths.js';
import { messagePaths } from './paths/message.paths.js';
import { userPaths } from './paths/user.paths.js';
import { authSchemas } from './schemas/auth.schema.js';
import { conversationSchemas } from './schemas/conversation.schema.js';
import { messageSchemas } from './schemas/message.schema.js';
import { userSchemas } from './schemas/user.schema.js';
import { validationSchemas } from './schemas/validation.schema.js';

import swaggerJSDoc from 'swagger-jsdoc';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  authValidation,
  conversationsValidation,
  messagesValidation,
  usersValidation,
} from '../validation/validators.js';

const generator = new OpenApiGeneratorV3([
  authValidation.register,
  authValidation.login,
  usersValidation.updateMe,
  conversationsValidation.create,
  conversationsValidation.addParticipants,
  conversationsValidation.idParams,
  messagesValidation.create,
  messagesValidation.getByConversationParams,
  messagesValidation.update,
  messagesValidation.idParams,
]);

const zodComponents = generator.generateComponents();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Messaging API',
    version: '1.0.0',
    description:
      'API for auth and messaging system. Use Auth -> Login first; Swagger UI will keep httpOnly cookies for protected requests.',
  },
  servers: [
    {
      url: '/',
      description: 'Current API host',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Registration, login, token refresh and logout',
    },
    {
      name: 'Users',
      description: 'Current user profile',
    },
    {
      name: 'Conversations',
      description: 'Conversation management',
    },
    {
      name: 'Messages',
      description: 'Message management',
    },
  ],
  components: {
    securitySchemes: {
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
      refreshTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
    schemas: {
      ...authSchemas,
      ...userSchemas,
      ...conversationSchemas,
      ...messageSchemas,
      ...validationSchemas,
      ...zodComponents.schemas,
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                example: 'Validation failed',
              },
              details: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ErrorDetail',
                },
              },
            },
          },
        },
      },
      ErrorDetail: {
        type: 'object',
        required: ['field', 'message'],
        properties: {
          field: {
            type: 'string',
            example: 'email',
          },
          message: {
            type: 'string',
            example: 'email must be valid',
          },
          code: {
            type: 'string',
            example: 'invalid_format',
          },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'details'],
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                example: 'Validation failed',
              },
              details: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ErrorDetail',
                },
              },
            },
          },
        },
      },
      ConflictErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'CONFLICT',
              },
              message: {
                type: 'string',
                example: 'Email already exists',
              },
            },
          },
        },
      },
      UnauthorizedErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'UNAUTHORIZED',
              },
              message: {
                type: 'string',
                example: 'Unauthorized',
              },
            },
          },
        },
      },
      ForbiddenErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'FORBIDDEN',
              },
              message: {
                type: 'string',
                example: 'Forbidden',
              },
            },
          },
        },
      },
      NotFoundErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'NOT_FOUND',
              },
              message: {
                type: 'string',
                example: 'Resource not found',
              },
            },
          },
        },
      },
      InternalErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'INTERNAL_SERVER_ERROR',
              },
              message: {
                type: 'string',
                example: 'Internal server error',
              },
            },
          },
        },
      },
      LegacyErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            deprecated: true,
            example: 'Error message',
          },
          details: {
            type: 'array',
            deprecated: true,
            items: {
              type: 'object',
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              ],
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UnauthorizedErrorResponse',
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ForbiddenErrorResponse',
            },
          },
        },
      },
      NotFound: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/NotFoundErrorResponse',
            },
          },
        },
      },
      Conflict: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ConflictErrorResponse',
            },
          },
        },
      },
    },
  },

  paths: {
    ...authPaths,
    ...userPaths,
    ...conversationPaths,
    ...messagePaths,
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);

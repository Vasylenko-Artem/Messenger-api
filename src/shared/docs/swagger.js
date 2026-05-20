import { authPaths } from './paths/auth.paths.js';
import { conversationPaths } from './paths/conversation.paths.js';
import { messagePaths } from './paths/message.paths.js';
import { userPaths } from './paths/user.paths.js';
import { authSchemas } from './schemas/auth.schema.js';
import { conversationSchemas } from './schemas/conversation.schema.js';
import { messageSchemas } from './schemas/message.schema.js';
import { userSchemas } from './schemas/user.schema.js';

import swaggerJSDoc from 'swagger-jsdoc';

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
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            example: 'Error message',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'email must be a valid email',
                },
              },
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
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      NotFound: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      Conflict: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
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

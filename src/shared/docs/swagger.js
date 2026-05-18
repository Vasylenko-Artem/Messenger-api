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
    description: 'API for auth and messaging system',
  },
  servers: [
    {
      url: 'http://localhost:5001',
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
        properties: {
          message: {
            type: 'string',
            example: 'Error message',
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

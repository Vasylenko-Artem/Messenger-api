import { authPaths } from './paths/auth.paths.js';
import { conversationPaths } from './paths/conversation.paths.js';

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
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],

  paths: {
    ...authPaths,
    ...conversationPaths,
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);

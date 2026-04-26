import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { registerModules } from './app.module.js';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

registerModules(app);

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
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: swaggerDefinition,
  apis: [path.join(__dirname, 'modules/**/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

app.use(
  '/api',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    withCredentials: true,
  })
);

export default app;

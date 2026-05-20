import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { registerModules } from './app.module.js';
import { swaggerSpec } from './shared/docs/swagger.js';
import { errorHandler } from './shared/middleware/error.middleware.js';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

registerModules(app);

app.use(
  '/api',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    withCredentials: true,
  })
);

app.use(errorHandler);

export default app;

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { registerModules } from './app.module.js';
import { swaggerSpec } from './shared/docs/swagger.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import { httpLoggerStream } from './shared/logger/logger.js';
import { notFound } from './shared/errors/http-error.js';

dotenv.config();

const app = express();
app.use(morgan('dev', { stream: httpLoggerStream }));
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

app.use((req, res, next) => {
  next(notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

export default app;

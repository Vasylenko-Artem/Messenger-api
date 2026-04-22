import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './modules/auth/auth.routes.js';
import messageRoutes from './modules/messages/message.routes.js';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

export default app;

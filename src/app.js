import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
	res.send('Hello World');
});

export default app;

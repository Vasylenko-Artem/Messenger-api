import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => {
	res.send('Hello World');
});

export default router;

import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', usersController.create);

export default router;

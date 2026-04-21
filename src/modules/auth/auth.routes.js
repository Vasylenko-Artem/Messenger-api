import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

router.post('/logout', authenticate, authController.logout);
router.get('/status', authenticate, authController.status);

export default router;

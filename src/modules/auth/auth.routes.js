import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import {
  authValidation,
  validate,
} from '../../shared/validation/validators.js';

const router = Router();

router.post(
  '/register',
  validate(authValidation.register),
  authController.register
);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh', authController.refreshToken);

router.post('/logout', authenticate, authController.logout);
router.get('/status', authenticate, authController.status);

export default router;

import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import {
  usersValidation,
  validate,
} from '../../shared/validation/validators.js';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch(
  '/me',
  validate(usersValidation.updateMe),
  usersController.updateMe
);

export default router;

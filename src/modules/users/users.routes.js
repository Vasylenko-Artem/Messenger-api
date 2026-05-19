import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// Всі маршрути захищені JWT middleware
router.use(authenticate);

// GET /users/me — отримати свій профіль
router.get('/me', usersController.getMe);

// PATCH /users/me — оновити свій профіль
router.patch('/me', usersController.updateMe);

// Стара заготовка від тімліда
router.post('/', usersController.create);

export default router;
import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import * as messageController from './message.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/:conversationId', messageController.getMessages);
router.patch('/:id', messageController.editMessage);
router.patch('/:id/read', messageController.markAsRead);

export default router;
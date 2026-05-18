import { Router } from 'express';
import * as messagesController from './message.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', messagesController.create);
router.get('/:conversationId', messagesController.getByConversation);
router.patch('/:id', messagesController.update);
router.patch('/:id/read', messagesController.markAsRead);

export default router;

import { Router } from 'express';
import * as messagesController from './message.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import {
  messagesValidation,
  validate,
} from '../../shared/validation/validators.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validate(messagesValidation.create),
  messagesController.create
);
router.get(
  '/:conversationId',
  validate(messagesValidation.getByConversationParams, 'params'),
  messagesController.getByConversation
);
router.patch(
  '/:id',
  validate(messagesValidation.idParams, 'params'),
  validate(messagesValidation.update),
  messagesController.update
);
router.patch(
  '/:id/read',
  validate(messagesValidation.idParams, 'params'),
  messagesController.markAsRead
);

export default router;

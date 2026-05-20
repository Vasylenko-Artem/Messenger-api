import { Router } from 'express';
import * as controller from './conversations.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import {
  conversationsValidation,
  validate,
} from '../../shared/validation/validators.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.getConversations);
router.post('/', validate(conversationsValidation.create), controller.create);
router.post(
  '/:id/participants',
  validate(conversationsValidation.idParams, 'params'),
  validate(conversationsValidation.addParticipants),
  controller.addParticipants
);
router.delete(
  '/:id',
  validate(conversationsValidation.idParams, 'params'),
  controller.remove
);

export default router;

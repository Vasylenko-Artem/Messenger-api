import { Router } from 'express';
import * as controller from './conversations.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.getConversations);
router.post('/', controller.create);
router.post('/:id/participants', controller.addParticipants);
router.delete('/:id', controller.remove);

export default router;

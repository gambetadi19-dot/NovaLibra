import { Router } from 'express';
import { createMessage, listMessages, markMessageRead, messageValidators } from '../controllers/messageController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', authenticate, listMessages);
router.post('/', authenticate, validateRequest(messageValidators.messageSchema), createMessage);
router.patch('/:messageId/read', authenticate, markMessageRead);

export default router;

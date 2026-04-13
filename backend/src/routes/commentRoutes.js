import { Router } from 'express';
import { createComment, createReply, deleteComment, updateComment, commentValidators } from '../controllers/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/', authenticate, validateRequest(commentValidators.commentBodySchema), createComment);
router.patch('/:commentId', authenticate, validateRequest(commentValidators.updateCommentSchema), updateComment);
router.delete('/:commentId', authenticate, validateRequest(commentValidators.commentIdSchema), deleteComment);
router.post('/:commentId/replies', authenticate, validateRequest(commentValidators.replySchema), createReply);

export default router;

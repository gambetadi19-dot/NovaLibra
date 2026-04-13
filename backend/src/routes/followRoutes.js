import { Router } from 'express';
import { toggleFollowAuthor } from '../controllers/followController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/authors/:authorId/toggle', authenticate, toggleFollowAuthor);

export default router;

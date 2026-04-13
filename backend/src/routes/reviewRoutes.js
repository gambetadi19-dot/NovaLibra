import { Router } from 'express';
import { deleteReview, reviewValidators, upsertReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/', authenticate, validateRequest(reviewValidators.reviewSchema), upsertReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router;

import { Router } from 'express';
import { getDashboardStats, listComments, listUsers, toggleFeaturedAuthor } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', listUsers);
router.patch('/users/:userId/feature-author', toggleFeaturedAuthor);
router.get('/comments', listComments);

export default router;

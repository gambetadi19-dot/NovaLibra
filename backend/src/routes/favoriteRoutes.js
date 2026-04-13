import { Router } from 'express';
import { toggleFavorite } from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/:bookId/toggle', authenticate, toggleFavorite);

export default router;

import { Router } from 'express';
import { createBook, deleteBook, getBookBySlug, listBooks, updateBook, bookValidators } from '../controllers/bookController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', listBooks);
router.get('/:slug', getBookBySlug);
router.post('/', authenticate, requireRole('ADMIN', 'AUTHOR'), validateRequest(bookValidators.bookSchema), createBook);
router.patch('/:bookId', authenticate, requireRole('ADMIN', 'AUTHOR'), validateRequest(bookValidators.bookIdSchema.and(bookValidators.bookSchema)), updateBook);
router.delete('/:bookId', authenticate, requireRole('ADMIN', 'AUTHOR'), validateRequest(bookValidators.bookIdSchema), deleteBook);

export default router;

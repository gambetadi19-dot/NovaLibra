import { Router } from 'express';
import {
  getAdminContact,
  getMyBooks,
  getProfile,
  getPublicAuthor,
  getAuthorAnalytics,
  listAuthorContacts,
  updateProfile,
  userValidators
} from '../controllers/userController.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/admin-contact', authenticate, getAdminContact);
router.get('/authors', listAuthorContacts);
router.get('/authors/:authorId', getPublicAuthor);
router.get('/me/analytics', authenticate, requireRole('AUTHOR', 'ADMIN'), getAuthorAnalytics);
router.get('/me/books', authenticate, requireRole('AUTHOR', 'ADMIN'), getMyBooks);
router.get('/me/profile', authenticate, getProfile);
router.patch('/me/profile', authenticate, validateRequest(userValidators.updateProfileSchema), updateProfile);

export default router;

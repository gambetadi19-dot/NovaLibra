import { Router } from 'express';
import {
  announcementValidators,
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement
} from '../controllers/announcementController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.get('/', listAnnouncements);
router.post('/', authenticate, requireRole('ADMIN'), validateRequest(announcementValidators.announcementSchema), createAnnouncement);
router.patch(
  '/:announcementId',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(announcementValidators.announcementIdSchema.and(announcementValidators.announcementSchema)),
  updateAnnouncement
);
router.delete(
  '/:announcementId',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(announcementValidators.announcementIdSchema),
  deleteAnnouncement
);

export default router;

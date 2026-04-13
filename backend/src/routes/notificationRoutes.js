import { Router } from 'express';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, listNotifications);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:notificationId/read', authenticate, markNotificationRead);

export default router;

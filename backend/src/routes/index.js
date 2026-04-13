import { Router } from 'express';
import announcementRoutes from './announcementRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import bookRoutes from './bookRoutes.js';
import commentRoutes from './commentRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import followRoutes from './followRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/announcements', announcementRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/follows', followRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

export default router;

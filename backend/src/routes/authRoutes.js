import { Router } from 'express';
import { authValidators, login, logout, me, refresh, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/register', validateRequest(authValidators.registerSchema), register);
router.post('/login', validateRequest(authValidators.loginSchema), login);
router.post('/refresh', validateRequest(authValidators.refreshSchema), refresh);
router.get('/me', authenticate, me);
router.post('/logout', logout);

export default router;

import express from 'express';
import { signup, login, getMe, deleteAccount } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.delete('/account', authenticate, deleteAccount);

export default router;

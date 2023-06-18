import express from 'express';
import { login, logout, refresh, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/refresh', refresh);
router.post('/logout', logout);

export default router;
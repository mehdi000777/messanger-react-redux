import express from 'express';
import { getAllUsers } from '../controllers/userContorller.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);

router.get('/', getAllUsers);

export default router;
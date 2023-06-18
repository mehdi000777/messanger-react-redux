import express from 'express';
import authorization from '../middlewares/authorization.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.use(authorization);

router.post('/', sendMessage);
router.get('/:chatId', getMessages);

export default router;
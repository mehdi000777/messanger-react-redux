import express from 'express';
import {
    accessChat,
    getAllChats,
    createGroupCaht,
    renameGroup,
    removeFromGroup,
    addToGroup
} from '../controllers/chatController.js';
import authorization from '../middlewares/authorization.js';

const router = express.Router();

router.use(authorization);

router.get('/', getAllChats);
router.post('/group', createGroupCaht);
router.put('/rename', renameGroup);
router.put('/groupRemove', removeFromGroup);
router.put('/groupAdd', addToGroup);
router.post('/:userId', accessChat);

export default router;
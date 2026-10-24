import express from 'express';
import { chatWithAssistant, getConversationHistory, clearConversation } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/chat', chatWithAssistant);
router.get('/history', getConversationHistory);
router.delete('/history/:threadId', clearConversation);

export default router;

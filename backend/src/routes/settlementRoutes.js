import { Router } from 'express';
import { uploadMiddleware, uploadSettlements } from '../controllers/settlementController.js';

const router = Router();

router.post('/upload', uploadMiddleware, uploadSettlements);

export default router;


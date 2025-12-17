import express from 'express';
import { completeProfile } from '../controllers/profilecontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/complete', protect, completeProfile); // or without protect if called right after register

export default router;
import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

router.get('/latest', isAuth, getActivityLogs); // Optional ?type=vendor or ?type=customer

export default router;

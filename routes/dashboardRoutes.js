import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

router.get('/dash', isAuth, getDashboardSummary);

export default router;

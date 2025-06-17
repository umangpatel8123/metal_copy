import express from 'express';
import vendorRouter from './vendorRoutes.js';
import vendorTransactionRouter from './vendorTransactionRoutes.js';
import authRouter from './authRoutes.js';
import activityLogRouter from './activityLogRoutes.js';
import customerRouter from './customerRoutes.js';
import customerTransactionRouter from './customerTransactionRoutes.js';
import dashboardRouter from './dashboardRoutes.js';

const router = express.Router();

// Mount vendor routes
router.use(vendorRouter);
// Mount vendor transaction routes
router.use(vendorTransactionRouter);
// Mount authentication routes
router.use(authRouter);
// Mount activity log routes
router.use(activityLogRouter);
// Mount customer routes
router.use(customerRouter);
// Mount customer transaction routes
router.use(customerTransactionRouter);
// Mount dashboard routes
router.use(dashboardRouter);

export default router;
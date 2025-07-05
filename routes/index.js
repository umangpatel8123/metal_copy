import express from 'express';
import vendorRouter from './vendorRoutes.js';
import vendorTransactionRouter from './vendorTransactionRoutes.js';
import authRouter from './authRoutes.js';
import activityLogRouter from './activityLogRoutes.js';
import customerRouter from './customerRoutes.js';
import customerTransactionRouter from './customerTransactionRoutes.js';
import dashboardRouter from './dashboardRoutes.js';
import maintenanceRouter from './maintenanceRoutes.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Test route working 🎉' });
});

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
// Mount maintenance routes
router.use(maintenanceRouter);

export default router;
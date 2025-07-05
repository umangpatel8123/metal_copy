import express from 'express';
import { getBackupFiles,backupAndClear } from '../controllers/maintenanceController.js';

const router = express.Router();

// Route to backup and drop collections
// router.get('/trigger-backup', backupAndDrop);

// Route to backup and clear collections
router.get('/trigger-backup', backupAndClear);

// Route to get list of backup files
router.get('/list-backups', getBackupFiles);

export default router;

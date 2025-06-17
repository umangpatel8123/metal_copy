import express from 'express';
import {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor
} from '../controllers/vendorController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

router.get('/get-all-vendors', isAuth, getAllVendors);
router.post('/create-vendor',isAuth , createVendor);
router.put('/update-vendor',isAuth, updateVendor);
router.delete('/delete-vendor',isAuth, deleteVendor);

export default router;

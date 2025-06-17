import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

router.post('/create-customer', isAuth, createCustomer);
router.get('/get-all-customers',isAuth, getAllCustomers);
router.put('/update-customer', isAuth, updateCustomer);
router.delete('/delete-customer',isAuth, deleteCustomer);

export default router;

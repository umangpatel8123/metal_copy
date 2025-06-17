import express from 'express';
import {
  addCustomerTransaction,
  getCustomerTransactions,
  deleteCustomerTransaction,
  deleteAllCustomerTransactions,
  getCustomerReceiptByTxnId
} from '../controllers/customerTransactionController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

// Add new customer transaction
router.post('/add-customer-transaction', isAuth, addCustomerTransaction);

// Get all transactions of a customer
router.post('/list-all-customer-transaction', isAuth, getCustomerTransactions);

// Delete a transaction and update customer balance
router.delete('/delete-customer-transaction', isAuth, deleteCustomerTransaction);

// Delete all transactions of a customer
router.delete('/delete-all-customer-transactions', isAuth, deleteAllCustomerTransactions);

// Get customer receipt by transaction ID
router.post('/get-customer-receipt-by-txn-id', isAuth, getCustomerReceiptByTxnId);

export default router;

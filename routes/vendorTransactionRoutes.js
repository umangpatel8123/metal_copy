import express from 'express';
import {
  addVendorTransaction,
  getVendorTransactions,
  deleteVendorTransaction,
  deleteAllVendorTransactions,
  getVendorReceiptByTxnId
} from '../controllers/vendorTransactionController.js';
import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

// Add new vendor transaction
router.post('/add-vendor-transaction', isAuth, addVendorTransaction);

// Get all transactions of a vendor
router.post('/list-all-vendor-transaction',isAuth, getVendorTransactions);

// Delete a transaction and update vendor balance
router.delete('/delete-vendor-transaction',isAuth, deleteVendorTransaction);

// Delete all transactions of a vendor
router.delete('/delete-all-vendor-transactions', isAuth, deleteAllVendorTransactions);

// Get vendor receipt by transaction ID
router.post('/get-vendor-receipt-by-txn-id', isAuth, getVendorReceiptByTxnId);

export default router;

import Vendor from '../models/Vendor.js';
import VendorTransaction from '../models/VendorTransaction.js';
import { logActivity } from '../utils/logActivity.js';
import cloudinary, { extractPublicId } from '../utils/cloudinary.js';

export const addVendorTransaction = async (req, res) => {
  try {
    const {
      vendorId, amount, amountType,
      fineWeight, fineWeightType,
      date, remark, receiptUrl
    } = req.body;

    if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' });

    const isAmountValid = typeof amount === 'number' && amount !== 0;
    const isFineValid = typeof fineWeight === 'number' && fineWeight !== 0;

    if (!isAmountValid && !isFineValid) {
      return res.status(400).json({ error: 'Either amount or fineWeight must be a non-zero number' });
    }

    if (isAmountValid && !['credit', 'debit'].includes(amountType)) {
      return res.status(400).json({ error: 'Amount type must be credit or debit' });
    }

    if (isFineValid && !['credit', 'debit'].includes(fineWeightType)) {
      return res.status(400).json({ error: 'Fine weight type must be credit or debit' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    let newCashBalance = vendor.cashBalance ?? 0;
    let newFineBalance = vendor.fineBalance ?? 0;

    if (isAmountValid) {
      newCashBalance += amountType === 'credit' ? amount : -amount;
    }

    if (isFineValid) {
      newFineBalance += fineWeightType === 'credit' ? fineWeight : -fineWeight;
    }

    vendor.cashBalance = newCashBalance;
    vendor.fineBalance = newFineBalance;
    await vendor.save();

    const txn = new VendorTransaction({
      vendorId,
      amount: isAmountValid ? amount : undefined,
      amountType: isAmountValid ? amountType : undefined,
      fineWeight: isFineValid ? fineWeight : undefined,
      fineWeightType: isFineValid ? fineWeightType : undefined,
      cashBalance: newCashBalance,
      fineBalance: newFineBalance,
      date: date ? new Date(date) : new Date(),
      remark: remark ?? '',
      receiptUrl: receiptUrl ?? ''
    });

    await txn.save();
    await logActivity('vendor', 'add transaction', txn._id, txn);

    res.status(201).json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getVendorTransactions = async (req, res) => {
  try {
    const { vendorId } = req.body;
    if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' });
    const transactions = await VendorTransaction.find({ vendorId }).sort({ date: 1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteVendorTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ error: 'Transaction ID is required' });

    const txn = await VendorTransaction.findById(transactionId);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const vendor = await Vendor.findById(txn.vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    if (txn.receiptUrl) {
      const decryptedUrl = txn.receiptUrl;
      const publicId = extractPublicId(decryptedUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('❌ Cloudinary deletion error:', err.message);
        }
      }
    }

    if (txn.amount && txn.amountType === 'credit') vendor.cashBalance -= txn.amount;
    if (txn.amount && txn.amountType === 'debit') vendor.cashBalance += txn.amount;

    if (txn.fineWeight && txn.fineWeightType === 'credit') vendor.fineBalance -= txn.fineWeight;
    if (txn.fineWeight && txn.fineWeightType === 'debit') vendor.fineBalance += txn.fineWeight;

    await vendor.save();
    await VendorTransaction.findByIdAndDelete(transactionId);
    await logActivity('vendor', 'delete transaction', txn._id, txn);

    res.json({ message: 'Vendor transaction and image deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAllVendorTransactions = async (req, res) => {
  try {
    const { vendorId } = req.body;
    if (!vendorId) return res.status(400).json({ error: 'Vendor ID is required' });

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const transactions = await VendorTransaction.find({ vendorId });

    for (const txn of transactions) {
      if (txn.receiptUrl) {
        const decryptedUrl = txn.receiptUrl;
        const publicId = extractPublicId(decryptedUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('❌ Cloudinary deletion error:', err.message);
          }
        }
      }
    }

    await VendorTransaction.deleteMany({ vendorId });

    vendor.cashBalance = 0;
    vendor.fineBalance = 0;
    await vendor.save();

    await logActivity('vendor', 'delete all transactions', vendorId, {});
    res.json({ message: 'All vendor transactions deleted and images cleaned up' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getVendorReceiptByTxnId = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const txn = await VendorTransaction.findById(transactionId);
    if (!txn) return res.status(404).json({ error: 'Vendor transaction not found' });

    res.json({ receiptUrl: txn.receiptUrl || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

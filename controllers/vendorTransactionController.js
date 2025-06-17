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

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    let newCashBalance = vendor.cashBalance;
    let newFineBalance = vendor.fineBalance;

    if (amount && amountType === 'credit') newCashBalance += amount;
    if (amount && amountType === 'debit') newCashBalance -= amount;

    if (fineWeight && fineWeightType === 'credit') newFineBalance += fineWeight;
    if (fineWeight && fineWeightType === 'debit') newFineBalance -= fineWeight;

    vendor.cashBalance = newCashBalance;
    vendor.fineBalance = newFineBalance;
    await vendor.save();

    const txn = new VendorTransaction({
      vendorId, amount, amountType,
      fineWeight, fineWeightType,
      cashBalance: newCashBalance,
      fineBalance: newFineBalance,
      date, remark, receiptUrl
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
    const transactions = await VendorTransaction.find({ vendorId }).sort({ date: 1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteVendorTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;
    console.log("goalllll " + transactionId);

    const txn = await VendorTransaction.findById(transactionId);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    console.log("idd " + txn._id);
    console.log("url " + txn.receiptUrl);
    const vendor = await Vendor.findById(txn.vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    // 👇 Delete Cloudinary receipt if exists
    if (txn.receiptUrl) {
      const decryptedUrl = txn.receiptUrl;
      const publicId = extractPublicId(decryptedUrl);
      console.log('📄 Public ID to delete:', publicId);

      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log('✅ Cloudinary deletion result:', result);
        } catch (err) {
          console.error('❌ Error deleting from Cloudinary:', err.message);
        }
      }
    }

    // 👇 Reverse balances
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
    console.log("goallllllll");
    const { vendorId } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const transactions = await VendorTransaction.find({ vendorId });

    for (const txn of transactions) {
      if (txn.receiptUrl) {
        const decryptedUrl = txn.receiptUrl;
        const publicId = extractPublicId(decryptedUrl);
        console.log('🧹 Public ID:', publicId);
        if (publicId) {
          try {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('✅ Deleted:', result);
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
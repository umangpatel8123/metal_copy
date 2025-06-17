import Customer from '../models/Customer.js';
import CustomerTransaction from '../models/CustomerTransaction.js';
import { logActivity } from '../utils/logActivity.js';
import cloudinary, { extractPublicId } from '../utils/cloudinary.js';


export const addCustomerTransaction = async (req, res) => {
  try {
    const {
      customerId, amount, amountType,
      fineWeight, fineWeightType,
      date, remark, receiptUrl
    } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    let newCashBalance = customer.cashBalance;
    let newFineBalance = customer.fineBalance;

    if (amount && amountType === 'credit') newCashBalance += amount;
    if (amount && amountType === 'debit') newCashBalance -= amount;

    if (fineWeight && fineWeightType === 'credit') newFineBalance += fineWeight;
    if (fineWeight && fineWeightType === 'debit') newFineBalance -= fineWeight;

    customer.cashBalance = newCashBalance;
    customer.fineBalance = newFineBalance;
    await customer.save();

    const txn = new CustomerTransaction({
      customerId, amount, amountType,
      fineWeight, fineWeightType,
      cashBalance: newCashBalance,
      fineBalance: newFineBalance,
      date, remark, receiptUrl
    });

    await txn.save();
    await logActivity('customer', 'add transaction', txn._id, txn);

    res.status(201).json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.body;
    const transactions = await CustomerTransaction.find({ customerId }).sort({ date: 1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomerTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const txn = await CustomerTransaction.findById(transactionId);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    const customer = await Customer.findById(txn.customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    // 🔥 Cloudinary deletion if receiptUrl exists
    if (txn.receiptUrl) {
      const decryptedUrl = txn.receiptUrl; // Already decrypted
      const publicId = extractPublicId(decryptedUrl);
      console.log('🧾 Public ID to delete:', publicId);

      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log('✅ Cloudinary deletion result:', result);
        } catch (err) {
          console.error('❌ Error deleting from Cloudinary:', err.message);
        }
      }
    }

    // 🔁 Reverse balances
    if (txn.amount && txn.amountType === 'credit') customer.cashBalance -= txn.amount;
    if (txn.amount && txn.amountType === 'debit') customer.cashBalance += txn.amount;

    if (txn.fineWeight && txn.fineWeightType === 'credit') customer.fineBalance -= txn.fineWeight;
    if (txn.fineWeight && txn.fineWeightType === 'debit') customer.fineBalance += txn.fineWeight;

    await customer.save();
    await CustomerTransaction.findByIdAndDelete(transactionId);
    await logActivity('customer', 'delete transaction', txn._id, txn);

    res.json({ message: 'Customer transaction and receipt image deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteAllCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const transactions = await CustomerTransaction.find({ customerId });

    for (const txn of transactions) {
      if (txn.receiptUrl) {
        const decryptedUrl = txn.receiptUrl;
        const publicId = extractPublicId(decryptedUrl);
        console.log('🧹 Customer Txn Public ID:', publicId);
        if (publicId) {
          try {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('✅ Deleted:', result);
          } catch (err) {
            console.error('❌ Cloudinary error:', err.message);
          }
        }
      }
    }

    await CustomerTransaction.deleteMany({ customerId });

    customer.cashBalance = 0;
    customer.fineBalance = 0;
    await customer.save();

    await logActivity('customer', 'delete all transactions', customerId, {});
    res.json({ message: 'All customer transactions deleted and images cleaned up' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


  export const getCustomerReceiptByTxnId = async (req, res) => {
    try {
      const { transactionId } = req.body;
  
      if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }
  
      const txn = await CustomerTransaction.findById(transactionId);
  
      if (!txn) return res.status(404).json({ error: 'Customer transaction not found' });
  
      res.json({ receiptUrl: txn.receiptUrl || '' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
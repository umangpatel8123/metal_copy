import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const allowedTypes = ['credit', 'debit'];

const vendorTransactionSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  date: { type: String },
  amount: { type: Number },

  amountType: {
    type: String,
    set: function (val) {
      if (val && !allowedTypes.includes(val)) {
        throw new mongoose.Error(`Invalid amountType: ${val}`);
      }
      return val ? encrypt(val) : '';
    },
    get: function (val) {
      return val ? decrypt(val) : '';
    }
  },

  fineWeight: { type: Number },

  fineWeightType: {
    type: String,
    set: function (val) {
      if (val && !allowedTypes.includes(val)) {
        throw new mongoose.Error(`Invalid fineWeightType: ${val}`);
      }
      return val ? encrypt(val) : '';
    },
    get: function (val) {
      return val ? decrypt(val) : '';
    }
  },

  cashBalance: { type: Number },
  fineBalance: { type: Number },

  remark: {
    type: String,
    set: (val) => (val ? encrypt(val) : ''),
    get: (val) => (val ? decrypt(val) : '')
  },

  receiptUrl: {
    type: String,
    set: (val) => (val ? encrypt(val) : ''),
    get: (val) => (val ? decrypt(val) : '')
  }

}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model('VendorTransaction', vendorTransactionSchema);

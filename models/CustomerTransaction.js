import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const customerTransactionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  date: { type: String },
  amount: { type: Number },
  amountType: { type: String, enum: ['credit', 'debit'] },
  fineWeight: { type: Number },
  fineWeightType: { type: String, enum: ['credit', 'debit'] },
  cashBalance: { type: Number },
  fineBalance: { type: Number },
  remark: {
    type: String,
    set: (val) => val ? encrypt(val) : '',
    get: (val) => val ? decrypt(val) : ''
  },
  receiptUrl: {
    type: String,
    set: (val) => val ? encrypt(val) : '',
    get: (val) => val ? decrypt(val) : ''
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model('CustomerTransaction', customerTransactionSchema);

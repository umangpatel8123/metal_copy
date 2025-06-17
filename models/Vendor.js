import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const vendorSchema = new mongoose.Schema({
  code: {
    type: String,
    set: (val) => val ? encrypt(val) : '',
    get: (val) => val ? decrypt(val) : ''
  },
  name: {
    type: String,
    set: (val) => val ? encrypt(val) : '',
    get: (val) => val ? decrypt(val) : ''
  },
  phone: {
    type: String,
    set: (val) => val ? encrypt(val) : '',
    get: (val) => val ? decrypt(val) : ''
  },
  cashBalance: { type: Number, default: 0 },
  fineBalance: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model('Vendor', vendorSchema);

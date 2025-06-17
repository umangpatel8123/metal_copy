// models/Auth.js
import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
  pin: {
    type: String, // hashed 6-digit PIN
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Auth', authSchema);

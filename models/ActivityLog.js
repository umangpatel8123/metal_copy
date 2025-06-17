import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['vendor', 'customer'], required: true },
  action: { type: String, required: true }, // e.g. "add transaction"
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  data: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ActivityLog', activityLogSchema);

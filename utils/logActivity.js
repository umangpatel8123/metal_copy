import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (type, action, entityId, data = {}) => {
  try {
    await ActivityLog.create({ type, action, entityId, data });

    // Keep only latest 10 logs per type
    const logs = await ActivityLog.find({ type }).sort({ timestamp: -1 });
    if (logs.length > 20) {
      const toDelete = logs.slice(20);
      const ids = toDelete.map(log => log._id);
      await ActivityLog.deleteMany({ _id: { $in: ids } });
    }
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

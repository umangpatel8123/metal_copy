import ActivityLog from '../models/ActivityLog.js';

// Get latest 10 logs (optionally by type)
export const getActivityLogs = async (req, res) => {
  try {
    const { type } = req.query; // 'vendor' | 'customer' (optional)
    const filter = type ? { type } : {};

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

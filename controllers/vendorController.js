import Vendor from '../models/Vendor.js';
import VendorTransaction from '../models/VendorTransaction.js';
import { logActivity } from '../utils/logActivity.js';

export const createVendor = async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { vendorId, ...updateData } = req.body;
    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
      new: true,
    });
    if (!updatedVendor)
      return res.status(404).json({ message: 'Vendor not found' });
    res.json(updatedVendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    if (!vendorId) return res.status(400).json({ error: 'vendorId is required' });

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    await VendorTransaction.deleteMany({ vendorId });
    await Vendor.findByIdAndDelete(vendorId);

    await logActivity('vendor', 'delete vendor', vendorId, vendor);
    res.json({ message: 'Vendor and transactions deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

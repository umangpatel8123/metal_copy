import Vendor from '../models/Vendor.js';
import VendorTransaction from '../models/VendorTransaction.js';
import { logActivity } from '../utils/logActivity.js';

// ✅ Create Vendor
export const createVendor = async (req, res) => {
  try {
    const { code, name, phone } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    const existing = await Vendor.findOne({ code: code.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Vendor with this code already exists' });
    }

    const vendor = new Vendor({
      code: code.trim(),
      name: name?.trim() || '',
      phone: phone?.trim() || '',
      cashBalance: 0,
      fineBalance: 0
    });

    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get All Vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Vendor
export const updateVendor = async (req, res) => {
  try {
    const { vendorId, name, phone } = req.body;

    if (!vendorId) {
      return res.status(400).json({ error: 'Vendor ID is required' });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update. Only name, phone, or code allowed.' });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedVendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(updatedVendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ✅ Delete Vendor and All Transactions
export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ error: 'vendorId is required' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    await VendorTransaction.deleteMany({ vendorId });
    await Vendor.findByIdAndDelete(vendorId);

    await logActivity('vendor', 'delete vendor', vendorId, vendor);

    res.json({ message: 'Vendor and all associated transactions deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

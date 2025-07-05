import Customer from '../models/Customer.js';
import CustomerTransaction from '../models/CustomerTransaction.js';
import { logActivity } from '../utils/logActivity.js';

// ✅ Create Customer (only code required)
export const createCustomer = async (req, res) => {
  try {
    const { code ,name ,phone} = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Customer code is required' });
    }

    const existing = await Customer.findOne({ code });
    if (existing) {
      return res.status(400).json({ error: 'Customer with this code already exists' });
    }

    const customer = new Customer({
      code: code.trim(),
      name: name?.trim() || '',
      phone: phone?.trim() || '',
      cashBalance: 0,
      fineBalance: 0
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Customer (only non-code fields)
export const updateCustomer = async (req, res) => {
  try {
    const { customerId, name, phone } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update. Only name or phone allowed.' });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ✅ Delete Customer and Transactions
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await CustomerTransaction.deleteMany({ customerId });
    await Customer.findByIdAndDelete(customerId);
    
    await logActivity('customer', 'delete customer', customerId, customer);

    res.json({ message: 'Customer and transactions deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

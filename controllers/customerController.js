import Customer from '../models/Customer.js';
import CustomerTransaction from '../models/CustomerTransaction.js';
import { logActivity } from '../utils/logActivity.js';

export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { customerId, ...updateData } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updateData, {
      new: true,
    });
    if (!updatedCustomer)
      return res.status(404).json({ message: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await CustomerTransaction.deleteMany({ customerId });
    await Customer.findByIdAndDelete(customerId);

    await logActivity('customer', 'delete customer', customerId, customer);
    res.json({ message: 'Customer and transactions deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

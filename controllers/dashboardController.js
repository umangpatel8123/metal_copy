import Vendor from '../models/Vendor.js';
import Customer from '../models/Customer.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    const customers = await Customer.find();

    let vendorCashBalance = 0, vendorFineBalance = 0;
    let customerCashBalance = 0, customerFineBalance = 0;

    vendors.forEach(v => {
      vendorCashBalance += v.cashBalance;
      vendorFineBalance += v.fineBalance;
    });

    customers.forEach(c => {
      customerCashBalance += c.cashBalance;
      customerFineBalance += c.fineBalance;
    });

    res.json({
      vendor: {
        totalCashBalance: vendorCashBalance,
        totalFineBalance: vendorFineBalance
      },
      customer: {
        totalCashBalance: customerCashBalance,
        totalFineBalance: customerFineBalance
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

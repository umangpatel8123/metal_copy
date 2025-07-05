import fs from 'fs/promises'; // Use promises version
import path from 'path';
import { fileURLToPath } from 'url';
import ActivityLog from '../models/ActivityLog.js';
import Auth from '../models/Auth.js';
import Customer from '../models/Customer.js';
import CustomerTransaction from '../models/CustomerTransaction.js';
import Vendor from '../models/Vendor.js';
import VendorTransaction from '../models/VendorTransaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, '../backup');

// Function to backup and drop all collections
// export const backupAndDrop = async (req, res) => {
//   try {
//     if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

//     const collections = {
//       ActivityLog,
//       Auth,
//       Customer,
//       CustomerTransaction,
//       Vendor,
//       VendorTransaction,
//     };

//     const fileLinks = [];

//     for (const [name, model] of Object.entries(collections)) {
//       const data = await model.find({});
//       const filePath = path.join(backupDir, `${name}.json`);
//       fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
//       await model.collection.drop();
//       fileLinks.push(`/backup/${name}.json`);
//     }

//     res.status(200).json({
//       success: true,
//       message: '✅ All collections backed up and dropped successfully.',
//       files: fileLinks,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

export const backupAndClear = async (req, res) => {
  try {
    await fs.mkdir(backupDir, { recursive: true });

    const collections = {
      ActivityLog,
      Auth,
      Customer,
      CustomerTransaction,
      Vendor,
      VendorTransaction,
    };

    const resultFiles = [];

    for (const [name, model] of Object.entries(collections)) {
      try {
        console.log(`Processing ${name}...`);
        
        // Check document count first
        const count = await model.countDocuments();
        console.log(`${name}: ${count} documents`);
        
        if (count === 0) {
          console.log(`${name} is empty, skipping...`);
          continue;
        }
        
        // Limit to prevent memory crash
        if (count > 50000) {
          console.log(`${name} has ${count} documents - too large, skipping for safety`);
          continue;
        }

        // Use lean() for better memory performance
        const data = await model.find({}).lean();
        
        const filePath = path.join(backupDir, `${name}.json`);
        
        // Write file with error handling
        try {
          await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
          console.log(`${name} backup saved`);
          resultFiles.push(`/backup/${name}.json`);
        } catch (writeError) {
          console.error(`Failed to write ${name}:`, writeError.message);
          continue;
        }

        // Delete with confirmation
        const deleteResult = await model.deleteMany({});
        console.log(`${name}: Deleted ${deleteResult.deletedCount} documents`);

      } catch (modelError) {
        console.error(`Error with ${name}:`, modelError.message);
        continue; // Skip this collection, continue with others
      }
    }

    res.status(200).json({
      success: true,
      message: `✅ ${resultFiles.length} collections backed up and cleared successfully.`,
      files: resultFiles,
    });
    
  } catch (err) {
    console.error('❌ Backup Error:', err.message);
    
    // Make sure response is sent
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

// Function to list existing backup files
export const getBackupFiles = (req, res) => {
  try {
    if (!fs.existsSync(backupDir)) {
      return res.status(404).json({ error: '❌ Backup directory not found' });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => `/backup/${file}`);

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

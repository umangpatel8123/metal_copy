import fs from 'fs/promises'; // Use promises version
import path from 'path';
import { fileURLToPath } from 'url';
import ActivityLog from '../models/ActivityLog.js';
import Auth from '../models/Auth.js';
import Customer from '../models/Customer.js';
import CustomerTransaction from '../models/CustomerTransaction.js';
import Vendor from '../models/Vendor.js';
import VendorTransaction from '../models/VendorTransaction.js';
import { Readable } from 'stream';
import cloudinary from '../utils/cloudinary.js'; // Ensure this is correctly set up

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
        const count = await model.countDocuments();
        if (count === 0) {
          console.log(`${name} is empty, skipping...`);
          continue;
        }

        if (count > 50000) {
          console.log(`${name} too large to backup safely, skipping...`);
          continue;
        }

        const data = await model.find({}).lean();
        const jsonString = JSON.stringify(data, null, 2);

        const uploadStream = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: 'raw',
                folder: 'mongo_backups',
                public_id: `${name}_${Date.now()}`,
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );

            Readable.from(jsonString).pipe(stream);
          });

        const uploadResult = await uploadStream();
        resultFiles.push(uploadResult.secure_url);
        console.log(`${name} backed up to Cloudinary`);

        const deleteResult = await model.deleteMany({});
        console.log(`${name}: Deleted ${deleteResult.deletedCount} documents`);
      } catch (err) {
        console.error(`❌ Error with ${name}:`, err.message);
        continue;
      }
    }

    res.status(200).json({
      success: true,
      message: `✅ ${resultFiles.length} collections backed up and cleared.`,
      files: resultFiles,
    });
  } catch (err) {
    console.error('❌ Backup Error:', err.message);
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

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

const BATCH_SIZE = 10000;

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
          continue;
        }

        const cursor = model.find({}).lean().cursor();
        let batch = [];
        let batchIndex = 1;

        for await (const doc of cursor) {
          batch.push(doc);
          if (batch.length === BATCH_SIZE) {
            const uploaded = await uploadBatch(name, batch, batchIndex++);
            resultFiles.push(uploaded.secure_url);
            batch = []; // reset
          }
        }

        // upload any remaining docs
        if (batch.length > 0) {
          const uploaded = await uploadBatch(name, batch, batchIndex++);
          resultFiles.push(uploaded.secure_url);
        }

        const deleteResult = await model.deleteMany({});
      } catch (err) {
        console.error(`❌ Error processing ${name}:`, err.message);
        continue;
      }
    }

    res.status(200).json({
      success: true,
      message: `✅ Backed up and cleared all non-empty collections.`,
      files: resultFiles,
    });
  } catch (err) {
    console.error('❌ Backup Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

const uploadBatch = (collectionName, dataBatch, index) => {
  const jsonString = JSON.stringify(dataBatch, null, 2);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'mongo_backups',
        public_id: `${collectionName}_batch_${index}_${Date.now()}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(jsonString).pipe(stream);
  });
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

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoUrl = process.env.MONGO_CONNECTION_STRING || process.env.DB_URL;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });

const app = express();

// ✅ CORS: Must be placed BEFORE all routes
app.use(cors({
  origin: 'https://scoopsandstories.com',
  credentials: true,
}));

// ✅ Optional: Add manual check if you want stricter enforcement
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin !== 'https://scoopsandstories.com') {
    return res.status(403).json({ message: 'Forbidden: Origin not allowed' });
  }
  next();
});

app.use(express.json());
app.use('/backup', express.static(path.join(__dirname, 'backup')));
app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './routes/index.js'; // Main route file

dotenv.config();

// Determine __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
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

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve backup folder statically from inside project root
app.use('/backup', express.static(path.join(__dirname, 'backup')));

// API routes
app.use('/api', router);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Server setup
const hostname = '0.0.0.0'; // or '0.0.0.0' for all interfaces
const port = process.env.PORT || 8000;

app.listen(port, hostname, () => {
  console.log(`🚀 Server running at http://${hostname}:${port}/`);
});

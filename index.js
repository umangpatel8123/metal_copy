import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routes/index.js';  // assuming you have routes here
// import path from 'path';

dotenv.config();

const hostname = '0.0.0.0';   // local loopback

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

const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount your API routes at /api
app.use('/api', router);

const port = process.env.PORT || 8000;

app.listen(port, hostname, () => {
  console.log(`🚀 Server running at http://${hostname}:${port}/`);
});

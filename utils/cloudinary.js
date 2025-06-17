// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// 👇 Extracts publicId from full Cloudinary URL
export const extractPublicId = (url) => {
  try {
    const match = url.match(/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|webp|gif)/);
    return match ? match[1] : null; // e.g. receipts/blob_xxx
  } catch {
    return null;
  }
};

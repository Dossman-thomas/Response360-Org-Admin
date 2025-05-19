import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { response, createError } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to generate a cryptographic hash for unique file names
const generateHash = (file) => {
  return crypto
    .createHash('sha256')
    .update(file.originalname + Date.now())
    .digest('hex');
};

// Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, env.filePaths.uploadPath);

    // Make sure the directory exists or handle errors if it fails
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (err) {
      console.error(`❌ Error creating directory at ${uploadPath}:`, err);
      return cb(
        createError(errorMessage, 400, {
          code: 'INVALID_FILE_TYPE',
        })
      );
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const hash = generateHash(file); // Generate cryptographic hash
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${hash}${ext}`); // Use the hash as the filename
  },
});

// File filter to only accept image files and validate extensions
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (!allowedTypes.test(ext) || !allowedTypes.test(mime)) {
    const errorMessage = `Only image files (jpeg, jpg, png, gif) are allowed. Received: ${ext}`;
    console.error(errorMessage);
    return cb(new Error(errorMessage));
  }

  // Sanitize file name to avoid harmful characters
  const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-_]/g, '');
  if (sanitizedFileName !== file.originalname) {
    const errorMessage = 'File name contains invalid characters. Sanitized.';
    console.warn(errorMessage);
  }

  cb(null, true);
};

// Export the multer upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.multer.fileSize || 5 * 1024 * 1024 },

  // fileSize exceeded error handling
  onError: (err, next) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return next(new Error(`File size exceeds the allowed limit of ${env.multer.fileSize / (1024 * 1024)} MB.`));
    } 
  },
});

// Error handling middleware for Multer
export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    return response(res, {
      statusCode: 400,
      message: 'Multer error occurred.',
      error: err.message,
    });
  }

  // Handle generic errors
  return response(res, {
    statusCode: 500,
    message: 'An error occurred during the file upload process.',
    error: err.message,
  });
};

import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer, { MulterError } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';

import { isVideo, isImage, sanitizeFilename } from '@/helpers/fileHelpers';
import { UPLOAD_CONFIG, HttpStatus, ErrorMessages, SuccessMessages } from '@/constants';
import type { UploadedFile, ApiResponse, HealthResponse } from '@/types';

const router = express.Router();
const appDir = path.dirname(require.main?.filename || '');

/**
 * Multer storage configuration with TypeScript typing
 */
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    let dest = path.join(appDir, 'uploads');
    
    const uploadedFile = file as UploadedFile;
    if (isVideo(uploadedFile)) {
      dest = path.join(dest, UPLOAD_CONFIG.UPLOAD_PATHS.VIDEO);
    } else if (isImage(uploadedFile)) {
      dest = path.join(dest, UPLOAD_CONFIG.UPLOAD_PATHS.IMAGE);
    } else {
      dest = path.join(dest, UPLOAD_CONFIG.UPLOAD_PATHS.MISC);
    }
    
    try {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    } catch (error) {
      cb(error as Error, dest);
    }
  },
  
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Strip path separators and collapse whitespace
    const safeBase = sanitizeFilename(file.originalname || 'file');
    const dotIndex = safeBase.lastIndexOf('.');
    const base = dotIndex > 0 ? safeBase.slice(0, dotIndex) : safeBase;
    const ext = dotIndex > 0 ? safeBase.slice(dotIndex + 1) : (mime.extension(file.mimetype) || 'bin');
    const filename = `${base}-${uuidv4()}.${ext}`;
    cb(null, filename);
  },
});

/**
 * Multer upload configuration
 */
const upload = multer({ 
  storage, 
  limits: { 
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: UPLOAD_CONFIG.MAX_FILES,
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Basic file validation can be added here
    cb(null, true);
  },
});

/**
 * File upload endpoint
 */
router.post('/upload-files', upload.array('files'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: ErrorMessages.INVALID_REQUEST,
        message: 'No files uploaded',
      } as ApiResponse);
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    
    res.status(HttpStatus.OK).json({
      success: true,
      data: uploadedFiles as UploadedFile[],
      message: SuccessMessages.UPLOAD_COMPLETE,
    } as ApiResponse<UploadedFile[]>);
    
  } catch (error) {
    next(error);
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  };
  
  res.status(HttpStatus.OK).json(healthResponse);
});

/**
 * Get server status and file statistics
 */
router.get('/status', (req: Request, res: Response, next: NextFunction) => {
  try {
    const uploadsDir = path.join(appDir, 'uploads');
    let fileCount = 0;
    let totalSize = 0;
    
    if (fs.existsSync(uploadsDir)) {
      const getDirectoryStats = (dir: string): void => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            getDirectoryStats(filePath);
          } else {
            fileCount++;
            totalSize += stats.size;
          }
        });
      };
      
      getDirectoryStats(uploadsDir);
    }
    
    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        fileCount,
        totalSize,
        uploadsDirectory: uploadsDir,
        maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
        maxFiles: UPLOAD_CONFIG.MAX_FILES,
      },
    } as ApiResponse);
    
  } catch (error) {
    next(error);
  }
});

/**
 * Error handler for multer errors
 */
router.use((error: Error | MulterError, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof MulterError) {
    let message = ErrorMessages.UPLOAD_FAILED;
    let statusCode = HttpStatus.BAD_REQUEST;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = ErrorMessages.FILE_TOO_LARGE;
        statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
        break;
      case 'LIMIT_FILE_COUNT':
        message = ErrorMessages.TOO_MANY_FILES;
        statusCode = HttpStatus.BAD_REQUEST;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = ErrorMessages.UNEXPECTED_FIELD;
        statusCode = HttpStatus.BAD_REQUEST;
        break;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: message,
    } as ApiResponse);
  }
  
  // Pass other errors to the main error handler
  next(error);
});

export default router;

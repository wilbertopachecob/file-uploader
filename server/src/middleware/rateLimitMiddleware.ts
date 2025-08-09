import { Request, Response, NextFunction } from 'express';
import { HttpStatus, ErrorMessages } from '@/constants';
import type { ApiResponse } from '@/types';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  UPLOAD_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_UPLOADS_PER_WINDOW: 10, // 10 uploads per 15 minutes
  MAX_FILES_PER_HOUR: 50, // 50 files per hour
  MAX_SIZE_PER_HOUR: 500 * 1024 * 1024, // 500MB per hour
  BURST_PROTECTION_MS: 5 * 1000, // 5 seconds between uploads
} as const;

interface RateLimitEntry {
  uploads: number;
  files: number;
  totalSize: number;
  lastUpload: number;
  windowStart: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > hourMs) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get or create rate limit entry for user
 */
function getRateLimitEntry(userIdentifier: string): RateLimitEntry {
  const now = Date.now();
  let entry = rateLimitStore.get(userIdentifier);
  
  if (!entry || now - entry.windowStart > RATE_LIMIT_CONFIG.UPLOAD_WINDOW_MS) {
    // Create new entry or reset window
    entry = {
      uploads: 0,
      files: 0,
      totalSize: 0,
      lastUpload: 0,
      windowStart: now,
    };
    rateLimitStore.set(userIdentifier, entry);
  }
  
  return entry;
}

/**
 * Rate limiting middleware for file uploads
 */
export function rateLimitUploads(req: Request, res: Response, next: NextFunction): void {
  try {
    // Clean up old entries periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanupExpiredEntries();
    }
    
    const userIdentifier = req.ip || 'unknown';
    const now = Date.now();
    const files = req.files as Express.Multer.File[] || [];
    const incomingFileCount = files.length;
    const incomingSize = files.reduce((total, file) => total + file.size, 0);
    
    const entry = getRateLimitEntry(userIdentifier);
    
    // Check burst protection (time between uploads)
    if (entry.lastUpload && now - entry.lastUpload < RATE_LIMIT_CONFIG.BURST_PROTECTION_MS) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: ErrorMessages.RATE_LIMIT_EXCEEDED,
        message: 'Please wait a few seconds between uploads.',
        retryAfter: Math.ceil((RATE_LIMIT_CONFIG.BURST_PROTECTION_MS - (now - entry.lastUpload)) / 1000),
      } as ApiResponse);
    }
    
    // Check upload frequency limit
    if (entry.uploads >= RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW) {
      const resetTime = entry.windowStart + RATE_LIMIT_CONFIG.UPLOAD_WINDOW_MS;
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: ErrorMessages.RATE_LIMIT_EXCEEDED,
        message: 'Too many upload requests. Please try again later.',
        retryAfter: Math.ceil((resetTime - now) / 1000),
      } as ApiResponse);
    }
    
    // Check hourly file count limit
    if (entry.files + incomingFileCount > RATE_LIMIT_CONFIG.MAX_FILES_PER_HOUR) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: ErrorMessages.RATE_LIMIT_EXCEEDED,
        message: 'Hourly file upload limit exceeded.',
        details: {
          currentFiles: entry.files,
          maxFiles: RATE_LIMIT_CONFIG.MAX_FILES_PER_HOUR,
          attemptedFiles: incomingFileCount,
        }
      } as ApiResponse);
    }
    
    // Check hourly size limit
    if (entry.totalSize + incomingSize > RATE_LIMIT_CONFIG.MAX_SIZE_PER_HOUR) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: ErrorMessages.RATE_LIMIT_EXCEEDED,
        message: 'Hourly upload size limit exceeded.',
        details: {
          currentSize: entry.totalSize,
          maxSize: RATE_LIMIT_CONFIG.MAX_SIZE_PER_HOUR,
          attemptedSize: incomingSize,
        }
      } as ApiResponse);
    }
    
    // Update counters
    entry.uploads++;
    entry.files += incomingFileCount;
    entry.totalSize += incomingSize;
    entry.lastUpload = now;
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW.toString(),
      'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW - entry.uploads).toString(),
      'X-RateLimit-Reset': new Date(entry.windowStart + RATE_LIMIT_CONFIG.UPLOAD_WINDOW_MS).toISOString(),
    });
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(); // Continue on error to avoid blocking legitimate users
  }
}

/**
 * Get rate limit status for a user
 */
export function getRateLimitStatus(userIdentifier: string) {
  const entry = getRateLimitEntry(userIdentifier);
  const now = Date.now();
  
  return {
    uploads: entry.uploads,
    maxUploads: RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW,
    files: entry.files,
    maxFiles: RATE_LIMIT_CONFIG.MAX_FILES_PER_HOUR,
    totalSize: entry.totalSize,
    maxSize: RATE_LIMIT_CONFIG.MAX_SIZE_PER_HOUR,
    windowResetTime: entry.windowStart + RATE_LIMIT_CONFIG.UPLOAD_WINDOW_MS,
    canUpload: entry.uploads < RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW &&
               (!entry.lastUpload || now - entry.lastUpload >= RATE_LIMIT_CONFIG.BURST_PROTECTION_MS),
  };
}

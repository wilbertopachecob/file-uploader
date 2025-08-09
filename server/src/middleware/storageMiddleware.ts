import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { HttpStatus, ErrorMessages } from '@/constants';
import type { ApiResponse } from '@/types';

// Storage configuration
const STORAGE_CONFIG = {
  MAX_TOTAL_STORAGE: 5 * 1024 * 1024 * 1024, // 5GB total
  MAX_USER_STORAGE: 500 * 1024 * 1024, // 500MB per IP/user
  MIN_FREE_SPACE: 1 * 1024 * 1024 * 1024, // Keep 1GB free
  CLEANUP_THRESHOLD: 0.9, // Cleanup when 90% full
} as const;

interface StorageStats {
  totalSize: number;
  fileCount: number;
  freeSpace: number;
}

/**
 * Get current storage statistics
 */
export function getStorageStats(uploadsDir: string): StorageStats {
  let totalSize = 0;
  let fileCount = 0;

  const walkDirectory = (dir: string): void => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        walkDirectory(filePath);
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    });
  };

  walkDirectory(uploadsDir);

  // Get available disk space
  const diskStats = fs.statSync(uploadsDir);
  const freeSpace = getFreeSpace(uploadsDir);

  return {
    totalSize,
    fileCount,
    freeSpace,
  };
}

/**
 * Get free disk space (cross-platform)
 */
function getFreeSpace(path: string): number {
  try {
    // For Unix-like systems
    const { execSync } = require('child_process');
    const output = execSync(`df -k "${path}" | tail -1 | awk '{print $4}'`, { encoding: 'utf8' });
    return parseInt(output.trim()) * 1024; // Convert KB to bytes
  } catch (error) {
    // Fallback - return a conservative estimate
    return 2 * 1024 * 1024 * 1024; // 2GB
  }
}

/**
 * Get storage used by specific IP address
 */
export function getUserStorageUsage(uploadsDir: string, userIdentifier: string): number {
  let userSize = 0;
  
  const walkDirectory = (dir: string): void => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        walkDirectory(filePath);
      } else {
        // Check if file was uploaded by this user (basic IP-based tracking)
        // In production, use proper user authentication
        if (file.includes(userIdentifier.replace(/\./g, '-'))) {
          userSize += stats.size;
        }
      }
    });
  };

  walkDirectory(uploadsDir);
  return userSize;
}

/**
 * Middleware to check storage limits before upload
 */
export function checkStorageLimits(req: Request, res: Response, next: NextFunction): void {
  try {
    const uploadsDir = path.join(path.dirname(require.main?.filename || ''), 'uploads');
    const userIdentifier = req.ip || 'unknown';
    
    // Calculate incoming file sizes
    const files = req.files as Express.Multer.File[] || [];
    const incomingSize = files.reduce((total, file) => total + file.size, 0);
    
    // Get current storage stats
    const stats = getStorageStats(uploadsDir);
    const userUsage = getUserStorageUsage(uploadsDir, userIdentifier);
    
    // Check total storage limit
    if (stats.totalSize + incomingSize > STORAGE_CONFIG.MAX_TOTAL_STORAGE) {
      return res.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        success: false,
        error: ErrorMessages.STORAGE_QUOTA_EXCEEDED,
        message: 'Server storage quota exceeded. Please try again later.',
        details: {
          currentUsage: stats.totalSize,
          maxStorage: STORAGE_CONFIG.MAX_TOTAL_STORAGE,
          attemptedUpload: incomingSize,
        }
      } as ApiResponse);
    }
    
    // Check user storage limit
    if (userUsage + incomingSize > STORAGE_CONFIG.MAX_USER_STORAGE) {
      return res.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        success: false,
        error: ErrorMessages.USER_QUOTA_EXCEEDED,
        message: 'Your storage quota exceeded. Please delete some files first.',
        details: {
          currentUsage: userUsage,
          maxUserStorage: STORAGE_CONFIG.MAX_USER_STORAGE,
          attemptedUpload: incomingSize,
        }
      } as ApiResponse);
    }
    
    // Check free disk space
    if (stats.freeSpace < STORAGE_CONFIG.MIN_FREE_SPACE + incomingSize) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        error: ErrorMessages.INSUFFICIENT_STORAGE,
        message: 'Server storage temporarily unavailable. Please try again later.',
      } as ApiResponse);
    }
    
    // Trigger cleanup if needed
    if (stats.totalSize > STORAGE_CONFIG.MAX_TOTAL_STORAGE * STORAGE_CONFIG.CLEANUP_THRESHOLD) {
      // Async cleanup - don't block the request
      setImmediate(() => performCleanup(uploadsDir));
    }
    
    next();
  } catch (error) {
    console.error('Storage check error:', error);
    next(error);
  }
}

/**
 * Cleanup old files when storage is getting full
 */
async function performCleanup(uploadsDir: string): Promise<void> {
  try {
    console.log('Starting storage cleanup...');
    
    const files: Array<{path: string, mtime: Date, size: number}> = [];
    
    const walkDirectory = (dir: string): void => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          walkDirectory(itemPath);
        } else {
          files.push({
            path: itemPath,
            mtime: stats.mtime,
            size: stats.size,
          });
        }
      });
    };
    
    walkDirectory(uploadsDir);
    
    // Sort by modification time (oldest first)
    files.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
    
    // Delete oldest files until we're under threshold
    const stats = getStorageStats(uploadsDir);
    const targetSize = STORAGE_CONFIG.MAX_TOTAL_STORAGE * 0.8; // Clean to 80%
    let currentSize = stats.totalSize;
    let deletedCount = 0;
    
    for (const file of files) {
      if (currentSize <= targetSize) break;
      
      try {
        fs.unlinkSync(file.path);
        currentSize -= file.size;
        deletedCount++;
        console.log(`Deleted old file: ${file.path}`);
      } catch (error) {
        console.error(`Failed to delete file ${file.path}:`, error);
      }
    }
    
    console.log(`Cleanup completed. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

/**
 * Get storage statistics for admin/monitoring
 */
export function getStorageInfo(uploadsDir: string) {
  const stats = getStorageStats(uploadsDir);
  
  return {
    totalUsed: stats.totalSize,
    totalFiles: stats.fileCount,
    freeSpace: stats.freeSpace,
    maxStorage: STORAGE_CONFIG.MAX_TOTAL_STORAGE,
    usagePercentage: (stats.totalSize / STORAGE_CONFIG.MAX_TOTAL_STORAGE) * 100,
    isNearCapacity: stats.totalSize > STORAGE_CONFIG.MAX_TOTAL_STORAGE * 0.8,
    shouldCleanup: stats.totalSize > STORAGE_CONFIG.MAX_TOTAL_STORAGE * STORAGE_CONFIG.CLEANUP_THRESHOLD,
  };
}

import { SUPPORTED_MIME_TYPES, FileCategory } from '@/constants';
import type { UploadedFile } from '@/types';

/**
 * Convert a number of bytes into a human-readable string.
 * Uses base-1024 units and up to 1 decimal for KB and above.
 *
 * @param bytes - Raw byte count
 * @returns Human-readable size (e.g., "512 Bytes", "1.2 MB")
 */
export function bytesToSize(bytes: number): string {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes || bytes < 0) return '0 Bytes';
  
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  
  return `${rounded} ${units[unitIndex]}`;
}

/**
 * Determine if an uploaded file is an image based on its MIME type.
 *
 * @param file - Multer file object
 * @returns True if the file is an image
 */
export function isImage(file: UploadedFile): boolean {
  if (!file.mimetype) return false;
  return (SUPPORTED_MIME_TYPES.IMAGES as readonly string[]).includes(file.mimetype) || 
         file.mimetype.includes('image');
}

/**
 * Determine if an uploaded file is a video based on its MIME type.
 *
 * @param file - Multer file object
 * @returns True if the file is a video
 */
export function isVideo(file: UploadedFile): boolean {
  if (!file.mimetype) return false;
  return (SUPPORTED_MIME_TYPES.VIDEOS as readonly string[]).includes(file.mimetype) || 
         file.mimetype.includes('video');
}

/**
 * Determine if an uploaded file is a document based on its MIME type.
 *
 * @param file - Multer file object
 * @returns True if the file is a document
 */
export function isDocument(file: UploadedFile): boolean {
  if (!file.mimetype) return false;
  return (SUPPORTED_MIME_TYPES.DOCUMENTS as readonly string[]).includes(file.mimetype) || 
         file.mimetype.includes('text') || 
         file.mimetype.includes('application');
}

/**
 * Determine the category of a file based on its MIME type.
 *
 * @param file - Multer file object
 * @returns The file category
 */
export function getFileCategory(file: UploadedFile): FileCategory {
  if (isImage(file)) return FileCategory.IMAGE;
  if (isVideo(file)) return FileCategory.VIDEO;
  if (isDocument(file)) return FileCategory.DOCUMENT;
  return FileCategory.OTHER;
}

/**
 * Get the appropriate upload directory for a file based on its type.
 *
 * @param file - Multer file object
 * @returns Directory name for the file type
 */
export function getUploadDirectory(file: UploadedFile): string {
  if (isVideo(file)) return 'video';
  if (isImage(file)) return 'img';
  return 'misc';
}

/**
 * Validate file size against maximum allowed size.
 *
 * @param file - Multer file object
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if file size is valid
 */
export function isValidFileSize(file: UploadedFile, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validate file type against supported MIME types.
 *
 * @param file - Multer file object
 * @returns True if file type is supported
 */
export function isValidFileType(file: UploadedFile): boolean {
  if (!file.mimetype) return false;
  
  const allSupportedTypes: string[] = [
    ...SUPPORTED_MIME_TYPES.IMAGES,
    ...SUPPORTED_MIME_TYPES.VIDEOS,
    ...SUPPORTED_MIME_TYPES.DOCUMENTS,
  ];
  
  return allSupportedTypes.includes(file.mimetype);
}

/**
 * Sanitize a filename by removing path separators and collapsing whitespace.
 *
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\\/]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

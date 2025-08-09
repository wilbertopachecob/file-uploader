import { SUPPORTED_MIME_TYPES, FILE_SIZE_UNITS, FileCategory } from "@/constants";
import type { ClientFile } from "@/types";

/**
 * Convert a byte count to a human-readable string.
 * Uses base-1024 units and up to 1 decimal for KB and above.
 *
 * @param bytes - Raw byte count
 * @returns Human-readable size string
 */
export function bytesToSize(bytes: number): string {
  if (!bytes || bytes < 0) return "0 Bytes";
  
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  
  return `${rounded} ${FILE_SIZE_UNITS[unitIndex]}`;
}

/**
 * Check whether a file is an image by MIME type.
 *
 * @param file - File object to check
 * @returns True if the file is an image
 */
export function isImage(file: ClientFile): boolean {
  if (!file.type) return false;
  return (SUPPORTED_MIME_TYPES.IMAGES as readonly string[]).includes(file.type) || file.type.includes("image");
}

/**
 * Check whether a file is a video by MIME type.
 *
 * @param file - File object to check
 * @returns True if the file is a video
 */
export function isVideo(file: ClientFile): boolean {
  if (!file.type) return false;
  return (SUPPORTED_MIME_TYPES.VIDEOS as readonly string[]).includes(file.type) || file.type.includes("video");
}

/**
 * Check whether a file is a document by MIME type.
 *
 * @param file - File object to check
 * @returns True if the file is a document
 */
export function isDocument(file: ClientFile): boolean {
  if (!file.type) return false;
  return (SUPPORTED_MIME_TYPES.DOCUMENTS as readonly string[]).includes(file.type) || file.type.includes("text");
}

/**
 * Determine the category of a file based on its MIME type.
 *
 * @param file - File object to categorize
 * @returns The file category
 */
export function getFileCategory(file: ClientFile): FileCategory {
  if (isImage(file)) return FileCategory.IMAGE;
  if (isVideo(file)) return FileCategory.VIDEO;
  if (isDocument(file)) return FileCategory.DOCUMENT;
  return FileCategory.OTHER;
}

/**
 * Validate file size against maximum allowed size.
 *
 * @param file - File object to validate
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if file size is valid
 */
export function isValidFileSize(file: ClientFile, maxSize: number): boolean {
  return !!file.size && file.size <= maxSize;
}

/**
 * Validate file type against supported MIME types.
 *
 * @param file - File object to validate
 * @returns True if file type is supported
 */
export function isValidFileType(file: ClientFile): boolean {
  if (!file.type) return false;
  
  const allSupportedTypes: string[] = [
    ...SUPPORTED_MIME_TYPES.IMAGES,
    ...SUPPORTED_MIME_TYPES.VIDEOS,
    ...SUPPORTED_MIME_TYPES.DOCUMENTS,
  ];
  
  return allSupportedTypes.includes(file.type);
}



"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToSize = bytesToSize;
exports.isImage = isImage;
exports.isVideo = isVideo;
exports.isDocument = isDocument;
exports.getFileCategory = getFileCategory;
exports.getUploadDirectory = getUploadDirectory;
exports.isValidFileSize = isValidFileSize;
exports.isValidFileType = isValidFileType;
exports.sanitizeFilename = sanitizeFilename;
const constants_1 = require("../constants");
/**
 * Convert a number of bytes into a human-readable string.
 * Uses base-1024 units and up to 1 decimal for KB and above.
 *
 * @param bytes - Raw byte count
 * @returns Human-readable size (e.g., "512 Bytes", "1.2 MB")
 */
function bytesToSize(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes || bytes < 0)
        return '0 Bytes';
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
function isImage(file) {
    if (!file.mimetype)
        return false;
    return constants_1.SUPPORTED_MIME_TYPES.IMAGES.includes(file.mimetype) ||
        file.mimetype.includes('image');
}
/**
 * Determine if an uploaded file is a video based on its MIME type.
 *
 * @param file - Multer file object
 * @returns True if the file is a video
 */
function isVideo(file) {
    if (!file.mimetype)
        return false;
    return constants_1.SUPPORTED_MIME_TYPES.VIDEOS.includes(file.mimetype) ||
        file.mimetype.includes('video');
}
/**
 * Determine if an uploaded file is a document based on its MIME type.
 *
 * @param file - Multer file object
 * @returns True if the file is a document
 */
function isDocument(file) {
    if (!file.mimetype)
        return false;
    return constants_1.SUPPORTED_MIME_TYPES.DOCUMENTS.includes(file.mimetype) ||
        file.mimetype.includes('text') ||
        file.mimetype.includes('application');
}
/**
 * Determine the category of a file based on its MIME type.
 *
 * @param file - Multer file object
 * @returns The file category
 */
function getFileCategory(file) {
    if (isImage(file))
        return constants_1.FileCategory.IMAGE;
    if (isVideo(file))
        return constants_1.FileCategory.VIDEO;
    if (isDocument(file))
        return constants_1.FileCategory.DOCUMENT;
    return constants_1.FileCategory.OTHER;
}
/**
 * Get the appropriate upload directory for a file based on its type.
 *
 * @param file - Multer file object
 * @returns Directory name for the file type
 */
function getUploadDirectory(file) {
    if (isVideo(file))
        return 'video';
    if (isImage(file))
        return 'img';
    return 'misc';
}
/**
 * Validate file size against maximum allowed size.
 *
 * @param file - Multer file object
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if file size is valid
 */
function isValidFileSize(file, maxSize) {
    return file.size <= maxSize;
}
/**
 * Validate file type against supported MIME types.
 *
 * @param file - Multer file object
 * @returns True if file type is supported
 */
function isValidFileType(file) {
    if (!file.mimetype)
        return false;
    const allSupportedTypes = [
        ...constants_1.SUPPORTED_MIME_TYPES.IMAGES,
        ...constants_1.SUPPORTED_MIME_TYPES.VIDEOS,
        ...constants_1.SUPPORTED_MIME_TYPES.DOCUMENTS,
    ];
    return allSupportedTypes.includes(file.mimetype);
}
/**
 * Sanitize a filename by removing path separators and collapsing whitespace.
 *
 * @param filename - Original filename
 * @returns Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[\\/]/g, '_')
        .replace(/\s+/g, ' ')
        .trim();
}

// @ts-check
const { imageTypes, videoTypes } = require("./mimeTypes");

/**
 * @typedef {Object} UploadedFile
 * @property {string} [mimetype] - MIME type of the uploaded file (e.g., "image/png", "video/mp4").
 * @property {number} [size] - File size in bytes.
 * @property {string} [originalname] - Original filename as uploaded by the client.
 */

/**
 * Convert a number of bytes into a human-readable string.
 * Uses base-1024 units and up to 1 decimal for KB and above.
 *
 * @param {number} bytes - Raw byte count.
 * @returns {string} Human-readable size (e.g., "512 Bytes", "1.2 MB").
 */
/**
 * @param {number} bytes
 * @returns {string}
 */
function bytesToSize(bytes) {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (!bytes || bytes < 0) return "0 Bytes";
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10; // 0 or 1 decimal
  return `${rounded} ${units[unitIndex]}`;
}

/**
 * Determine if an uploaded file is an image based on its MIME type.
 *
 * @param {UploadedFile} f - Multer file object.
 * @returns {boolean}
 */
/**
 * @param {UploadedFile} f
 * @returns {boolean}
 */
function isImage(f) {
  return (
    f.mimetype &&
    (imageTypes.includes(f.mimetype) || f.mimetype.includes("image"))
  );
}

/**
 * Determine if an uploaded file is a video based on its MIME type.
 *
 * @param {UploadedFile} f - Multer file object.
 * @returns {boolean}
 */
/**
 * @param {UploadedFile} f
 * @returns {boolean}
 */
function isVideo(f) {
  return (
    f.mimetype &&
    (videoTypes.includes(f.mimetype) || f.mimetype.includes("video"))
  );
}

module.exports = {
  bytesToSize,
  isImage,
  isVideo,
};

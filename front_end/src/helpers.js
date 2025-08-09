import { imageTypes, videoTypes } from "./mimeTypes";

/**
 * @typedef {Object} ClientFile
 * @property {string} [type] - MIME type of the file (e.g., "image/png").
 * @property {number} [size] - Size in bytes.
 * @property {string} [name] - File name.
 * @property {string} [src] - Data URL or server URL for previews.
 */

/**
 * Convert a byte count to a human-readable string.
 * Uses base-1024 units and up to 1 decimal for KB and above.
 *
 * @param {number} bytes - Raw byte count.
 * @returns {string}
 */
export function bytesToSize(bytes) {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (!bytes || bytes < 0) return "0 Bytes";
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded =
    unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unitIndex]}`;
}

/**
 * Check whether a file is an image by MIME.
 *
 * @param {ClientFile} f
 * @returns {boolean}
 */
export function isImage(f) {
  return f.type && (imageTypes.includes(f.type) || f.type.includes("image"));
}

/**
 * Check whether a file is a video by MIME.
 *
 * @param {ClientFile} f
 * @returns {boolean}
 */
export function isVideo(f) {
  return f.type && (videoTypes.includes(f.type) || f.type.includes("video"));
}

import { SUPPORTED_MIME_TYPES } from "@/constants";

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
  return !!(
    f &&
    f.type &&
    (SUPPORTED_MIME_TYPES.IMAGES.includes(f.type) || f.type.includes("image"))
  );
}

/**
 * Check whether a file is a video by MIME.
 *
 * @param {ClientFile} f
 * @returns {boolean}
 */
export function isVideo(f) {
  return !!(
    f &&
    f.type &&
    (SUPPORTED_MIME_TYPES.VIDEOS.includes(f.type) || f.type.includes("video"))
  );
}

/**
 * Generate a thumbnail image from a video file.
 * Captures a frame at 10% of video duration or 2 seconds, whichever is smaller.
 *
 * @param {string} videoSrc - The source URL of the video
 * @param {Object} options - Configuration options
 * @param {number} [options.seekPercentage=0.1] - Percentage of video duration to seek to (0.0-1.0)
 * @param {number} [options.maxSeekTime=2] - Maximum seek time in seconds
 * @param {number} [options.thumbnailWidth=300] - Width of the generated thumbnail
 * @param {number} [options.jpegQuality=0.8] - JPEG quality (0.0-1.0)
 * @returns {Promise<string>} Promise that resolves to a data URL of the thumbnail image
 */
export function generateVideoThumbnail(videoSrc, options = {}) {
  const {
    seekPercentage = 0.1,
    maxSeekTime = 2,
    thumbnailWidth = 300,
    jpegQuality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    // Cleanup function
    const cleanup = () => {
      video.remove();
    };

    video.onloadedmetadata = () => {
      try {
        // Seek to specified percentage of video duration or maxSeekTime, whichever is smaller
        const seekTime = Math.min(video.duration * seekPercentage, maxSeekTime);
        video.currentTime = seekTime;
      } catch (error) {
        cleanup();
        safeReject(new Error(`Failed to seek video: ${error.message}`));
      }
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          cleanup();
          safeReject(new Error("Failed to get canvas context"));
          return;
        }

        // Set canvas size to maintain aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailWidth / aspectRatio;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const thumbnail = canvas.toDataURL("image/jpeg", jpegQuality);

        cleanup();
        safeResolve(thumbnail);
      } catch (error) {
        cleanup();
        safeReject(new Error(`Failed to generate thumbnail: ${error.message}`));
      }
    };

    video.onerror = (event) => {
      cleanup();
      safeReject(
        new Error(`Failed to load video: ${event.message || "Unknown error"}`),
      );
    };

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      cleanup();
      safeReject(new Error("Video thumbnail generation timed out"));
    }, 10000); // 10 second timeout

    // Clear timeout on success or error
    function safeResolve(...args) {
      clearTimeout(timeout);
      resolve(...args);
    }
    function safeReject(...args) {
      clearTimeout(timeout);
      reject(...args);
    }

    video.src = videoSrc;
  });
}

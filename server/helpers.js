const { imageTypes, videoTypes } = require("./mimeTypes");

function bytesToSize(bytes) {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (!bytes || bytes < 0) return "0 Bytes";
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10; // 0 or 1 decimal
  return `${rounded} ${units[unitIndex]}`;
}

function isImage(f) {
  return (
    f.mimetype &&
    (imageTypes.includes(f.mimetype) || f.mimetype.includes("image"))
  );
}

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

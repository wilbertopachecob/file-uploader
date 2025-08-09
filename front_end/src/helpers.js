import { imageTypes, videoTypes } from "./mimeTypes";

export function bytesToSize(bytes) {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  if (!bytes || bytes < 0) return "0 Bytes";
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10; // 0 or 1 decimal
  return `${rounded} ${units[unitIndex]}`;
}

export function isImage(f) {
  return f.type && (imageTypes.includes(f.type) || f.type.includes("image"));
}

export function isVideo(f) {
  return f.type && (videoTypes.includes(f.type) || f.type.includes("video"));
}

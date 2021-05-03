import { imageTypes, videoTypes } from "./mimeTypes";

export function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

export function isImage(f) {
  return f.type && (imageTypes.includes(f.type) || f.type.includes("image"));
}

export function isVideo(f) {
  return f.type && (videoTypes.includes(f.type) || f.type.includes("video"));
}

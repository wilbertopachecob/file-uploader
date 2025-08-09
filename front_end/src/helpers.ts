import { imageTypes, videoTypes } from "./mimeTypes.js";

export type ClientFile = {
  type?: string;
  size?: number;
  name?: string;
  src?: string;
};

export function bytesToSize(bytes: number): string {
  const units = ["Bytes", "KB", "MB", "GB", "TB"] as const;
  if (!bytes || bytes < 0) return "0 Bytes";
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  const rounded = unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unitIndex]}`;
}

export function isImage(f: ClientFile): boolean {
  return !!f.type && (imageTypes.includes(f.type) || f.type.includes("image"));
}

export function isVideo(f: ClientFile): boolean {
  return !!f.type && (videoTypes.includes(f.type) || f.type.includes("video"));
}



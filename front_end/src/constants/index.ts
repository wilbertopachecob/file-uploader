/**
 * Application-wide constants and enums
 */

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for progress
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov', '.pdf', '.doc', '.docx'],
  MAX_FILES: 10,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD_FILES: '/upload-files',
  HEALTH: '/health',
  DELETE_FILE: '/delete-file',
} as const;

// Upload status
export enum UploadStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// File categories
export enum FileCategory {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  OTHER = 'other',
}

// Error messages
export enum ErrorMessages {
  FILE_TOO_LARGE = 'File size exceeds the maximum limit of 100MB',
  INVALID_FILE_TYPE = 'Invalid file type. Please select a supported file format',
  UPLOAD_FAILED = 'Upload failed. Please try again',
  CONNECTION_ERROR = 'Connection error. Please check your internet connection',
  SERVER_ERROR = 'Server error. Please try again later',
  NO_FILES_SELECTED = 'No files selected for upload',
  TOO_MANY_FILES = 'Too many files selected. Maximum allowed is 10 files',
}

// Success messages
export enum SuccessMessages {
  UPLOAD_COMPLETE = 'Files uploaded successfully',
  FILES_SELECTED = 'Files selected for upload',
  UPLOAD_CANCELLED = 'Upload cancelled',
}

// UI messages
export enum UIMessages {
  DRAG_AND_DROP = 'Drag and Drop files here',
  SELECT_FILES = 'Select files to upload',
  UPLOADING = 'Uploading...',
  PROCESSING = 'Processing files...',
  READY_TO_UPLOAD = 'Ready to upload',
}

// File size units
export const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const;

// Supported MIME types for validation
export const SUPPORTED_MIME_TYPES = {
  IMAGES: [
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
  ],
  VIDEOS: [
    'application/vnd.apple.mpegurl',
    'application/x-mpegurl',
    'video/3gpp',
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/quicktime',
    'video/webm',
    'video/x-m4v',
    'video/ms-asf',
    'video/x-ms-wmv',
    'video/x-msvideo',
  ],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
} as const;

// HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

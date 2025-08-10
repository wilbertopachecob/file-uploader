/**
 * Server-side constants and enums
 */

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  UPLOAD_PATHS: {
    IMAGE: 'img',
    VIDEO: 'video',
    MISC: 'misc',
  },
  ALLOWED_FIELDS: ['files'],
  MAX_FILES: 10,
} as const;

// HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  PAYLOAD_TOO_LARGE = 413,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// Error messages
export enum ErrorMessages {
  FILE_TOO_LARGE = 'File size exceeds the maximum limit of 100MB',
  INVALID_FILE_TYPE = 'Invalid file type',
  UPLOAD_FAILED = 'Upload failed',
  SERVER_ERROR = 'Internal server error',
  INVALID_REQUEST = 'Invalid request',
  FILE_NOT_FOUND = 'File not found',
  DIRECTORY_CREATION_FAILED = 'Failed to create upload directory',
  TOO_MANY_FILES = 'Too many files uploaded',
  UNEXPECTED_FIELD = 'Unexpected field name',
}

// Success messages  
export enum SuccessMessages {
  UPLOAD_COMPLETE = 'Files uploaded successfully',
  FILE_DELETED = 'File deleted successfully',
  HEALTH_CHECK_OK = 'Server is healthy',
}

// Supported MIME types
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

// Environment configuration
export const ENV_CONFIG = {
  DEFAULT_PORT: 3000,
  LOG_INTERVAL: '1d', // 1 day for log rotation
  CORS_ORIGIN: process.env.DEV_HOST || true,
} as const;

// File categories for routing
export enum FileCategory {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  OTHER = 'other',
}

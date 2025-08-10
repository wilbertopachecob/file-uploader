"use strict";
/**
 * Server-side constants and enums
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCategory = exports.ENV_CONFIG = exports.SUPPORTED_MIME_TYPES = exports.SuccessMessages = exports.ErrorMessages = exports.HttpStatus = exports.UPLOAD_CONFIG = void 0;
// File upload configuration
exports.UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes
    UPLOAD_PATHS: {
        IMAGE: 'img',
        VIDEO: 'video',
        MISC: 'misc',
    },
    ALLOWED_FIELDS: ['files'],
    MAX_FILES: 10,
};
// HTTP status codes
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
// Error messages
var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["FILE_TOO_LARGE"] = "File size exceeds the maximum limit of 100MB";
    ErrorMessages["INVALID_FILE_TYPE"] = "Invalid file type";
    ErrorMessages["UPLOAD_FAILED"] = "Upload failed";
    ErrorMessages["SERVER_ERROR"] = "Internal server error";
    ErrorMessages["INVALID_REQUEST"] = "Invalid request";
    ErrorMessages["FILE_NOT_FOUND"] = "File not found";
    ErrorMessages["DIRECTORY_CREATION_FAILED"] = "Failed to create upload directory";
    ErrorMessages["TOO_MANY_FILES"] = "Too many files uploaded";
    ErrorMessages["UNEXPECTED_FIELD"] = "Unexpected field name";
})(ErrorMessages || (exports.ErrorMessages = ErrorMessages = {}));
// Success messages  
var SuccessMessages;
(function (SuccessMessages) {
    SuccessMessages["UPLOAD_COMPLETE"] = "Files uploaded successfully";
    SuccessMessages["FILE_DELETED"] = "File deleted successfully";
    SuccessMessages["HEALTH_CHECK_OK"] = "Server is healthy";
})(SuccessMessages || (exports.SuccessMessages = SuccessMessages = {}));
// Supported MIME types
exports.SUPPORTED_MIME_TYPES = {
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
};
// Environment configuration
exports.ENV_CONFIG = {
    DEFAULT_PORT: 3000,
    LOG_INTERVAL: '1d', // 1 day for log rotation
    CORS_ORIGIN: process.env.DEV_HOST || true,
};
// File categories for routing
var FileCategory;
(function (FileCategory) {
    FileCategory["IMAGE"] = "image";
    FileCategory["VIDEO"] = "video";
    FileCategory["DOCUMENT"] = "document";
    FileCategory["OTHER"] = "other";
})(FileCategory || (exports.FileCategory = FileCategory = {}));

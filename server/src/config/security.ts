/**
 * Comprehensive security configuration for file uploader
 */

// Security limits and thresholds
export const SECURITY_CONFIG = {
  // Storage limits
  STORAGE: {
    MAX_TOTAL_STORAGE: 5 * 1024 * 1024 * 1024, // 5GB total
    MAX_USER_STORAGE: 500 * 1024 * 1024, // 500MB per user/IP
    MIN_FREE_SPACE: 1 * 1024 * 1024 * 1024, // Keep 1GB free
    CLEANUP_THRESHOLD: 0.9, // Cleanup when 90% full
    AUTO_CLEANUP_AGE_DAYS: 30, // Delete files older than 30 days
  },
  
  // Rate limiting
  RATE_LIMITS: {
    UPLOAD_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_UPLOADS_PER_WINDOW: 10, // 10 uploads per 15 minutes
    MAX_FILES_PER_HOUR: 50, // 50 files per hour
    MAX_SIZE_PER_HOUR: 500 * 1024 * 1024, // 500MB per hour
    BURST_PROTECTION_MS: 5 * 1000, // 5 seconds between uploads
  },
  
  // File validation
  FILE_VALIDATION: {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB per file
    MAX_FILES_PER_UPLOAD: 10, // 10 files per upload
    MAX_FILENAME_LENGTH: 255,
    ALLOWED_EXTENSIONS: [
      // Images
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
      // Videos
      '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
      // Documents
      '.pdf', '.doc', '.docx', '.txt', '.rtf',
      // Archives (be careful with these)
      '.zip', '.rar', '.7z',
    ],
    BLOCKED_EXTENSIONS: [
      // Executables
      '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
      // Scripts
      '.js', '.vbs', '.ps1', '.sh', '.php', '.asp', '.jsp',
      // System files
      '.dll', '.sys', '.ini', '.reg',
      // Potentially dangerous
      '.jar', '.war', '.ear', '.deb', '.rpm',
    ],
    SCAN_FILE_CONTENT: true, // Enable file content validation
  },
  
  // Security headers and CORS
  CORS: {
    STRICT_ORIGIN: true, // Only allow specific origins
    ALLOWED_ORIGINS: [
      'http://localhost:8080', // Development
      'http://localhost:3000', // Local production
      // Add your production domains here
      // 'https://yoursite.com',
    ],
    CREDENTIALS: false, // Don't allow credentials
    METHODS: ['GET', 'POST', 'OPTIONS'],
    HEADERS: ['Content-Type', 'Authorization'],
  },
  
  // Authentication (when implemented)
  AUTH: {
    REQUIRE_AUTH: false, // Set to true when auth is implemented
    SESSION_TIMEOUT_MS: 60 * 60 * 1000, // 1 hour
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  },
  
  // Monitoring and alerts
  MONITORING: {
    LOG_ALL_UPLOADS: true,
    LOG_FAILED_UPLOADS: true,
    LOG_RATE_LIMIT_HITS: true,
    ALERT_ON_SUSPICIOUS_ACTIVITY: true,
    MAX_LOG_SIZE_MB: 100,
    LOG_RETENTION_DAYS: 30,
  },
  
  // Content Security
  CONTENT_SECURITY: {
    SCAN_FOR_MALWARE: false, // Enable when antivirus integration is available
    QUARANTINE_SUSPICIOUS_FILES: true,
    AUTO_DELETE_MALICIOUS_FILES: false, // Manual review recommended
    CONTENT_TYPE_VALIDATION: true,
    DISABLE_SCRIPT_EXECUTION: true,
  },
} as const;

// Dangerous MIME types that should be blocked
export const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-winexe',
  'application/x-javascript',
  'text/javascript',
  'application/javascript',
  'text/html',
  'application/x-php',
  'application/x-httpd-php',
  'text/x-php',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-bat',
  'application/x-msdownload',
] as const;

// File signatures (magic numbers) for validation
export const FILE_SIGNATURES = {
  // Images
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/gif': ['474946383761', '474946383961'],
  'image/bmp': ['424d'],
  'image/webp': ['52494646'],
  
  // Videos
  'video/mp4': ['66747970'],
  'video/avi': ['52494646'],
  'video/mov': ['66747970'],
  'video/webm': ['1a45dfa3'],
  
  // Documents
  'application/pdf': ['255044462d'],
  'application/zip': ['504b0304', '504b0506', '504b0708'],
  
  // Archives
  'application/x-rar-compressed': ['526172211a0700'],
  'application/x-7z-compressed': ['377abcaf271c'],
} as const;

// Security middleware order (important!)
export const MIDDLEWARE_ORDER = [
  'cors',
  'helmet', // Security headers
  'rateLimit',
  'fileValidation',
  'storageCheck',
  'upload',
  'contentValidation',
  'virusScan', // If implemented
] as const;

// Error messages that don't reveal internal information
export const SAFE_ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  INVALID_FILE: 'Invalid file type or content.',
  QUOTA_EXCEEDED: 'Storage quota exceeded.',
  RATE_LIMITED: 'Too many requests. Please wait.',
  SERVER_ERROR: 'Server temporarily unavailable.',
  FILE_TOO_LARGE: 'File size exceeds limit.',
  SUSPICIOUS_FILE: 'File rejected for security reasons.',
} as const;

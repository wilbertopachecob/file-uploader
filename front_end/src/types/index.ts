/**
 * Common file interface for both client and server file objects
 */
export interface ClientFile {
  type?: string;
  size?: number;
  name?: string;
  src?: string;
}

/**
 * Server response for uploaded files
 */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  percentage: number;
  isLoading: boolean;
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Vue component event types
 */
export interface FileUploaderEvents {
  'files-selected': (files: File[]) => void;
  'upload-complete': (files: UploadedFile[]) => void;
  'upload-error': (error: string) => void;
  'upload-progress': (progress: UploadProgress) => void;
}

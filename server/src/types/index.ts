import { Request, Response } from 'express';
import { MulterError } from 'multer';

/**
 * Uploaded file interface - alias for Express.Multer.File for semantic clarity
 */
export interface UploadedFile extends Express.Multer.File {}

/**
 * API Error response
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * API Success response
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success: boolean;
}

/**
 * Express request with uploaded files
 */
export interface UploadRequest extends Request {
  files?: Express.Multer.File[];
}

/**
 * Express error handler
 */
export interface ErrorHandler {
  (err: Error | MulterError | ApiError, req: Request, res: Response, next: () => void): void;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}

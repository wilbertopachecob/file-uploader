import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as path from 'path';
import rfs from 'rotating-file-stream';
import dotenv from 'dotenv';

import uploadRoutes from '@/routes/uploadRoutes';
import { ENV_CONFIG, HttpStatus, ErrorMessages } from '@/constants';
import type { ApiError } from '@/types';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || ENV_CONFIG.DEFAULT_PORT;

/**
 * CORS configuration
 */
const corsOptions: cors.CorsOptions = {
  origin: ENV_CONFIG.CORS_ORIGIN,
  optionsSuccessStatus: HttpStatus.OK,
  credentials: true,
};

/**
 * Logging configuration
 */
const isProduction = process.env.NODE_ENV === 'production';

// Create a rotating write stream for production logs
const accessLogStream = rfs.createStream('access.log', {
  interval: ENV_CONFIG.LOG_INTERVAL,
  path: path.join(__dirname, '..', 'logs'),
});

// Configure morgan logger
app.use(
  isProduction
    ? morgan('combined', { stream: accessLogStream })
    : morgan('dev')
);

/**
 * Security and middleware configuration
 */
app.disable('x-powered-by');

// Static file serving
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads/img', express.static(path.join(__dirname, '..', 'uploads', 'img')));
app.use('/uploads/misc', express.static(path.join(__dirname, '..', 'uploads', 'misc')));
app.use('/uploads/video', express.static(path.join(__dirname, '..', 'uploads', 'video')));

// CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Routes
 */
app.use('/api', uploadRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'File Uploader API',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      health: '/api/health',
      upload: '/api/upload-files',
      status: '/api/status',
    },
  });
});

/**
 * 404 handler
 */
app.use('*', (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Centralized error handler
 */
app.use((err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  if (!err) return next();
  
  // Default error response
  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string = ErrorMessages.SERVER_ERROR;
  
  // Handle specific error types
  if ('statusCode' in err && err.statusCode) {
    status = err.statusCode;
  }
  
  if (err.message) {
    message = err.message;
  }
  
  // Log error in development for easier debugging
  if (!isProduction) {
    console.error('Error details:', err);
  }
  
  res.status(status).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err instanceof Error && typeof err.stack === 'string' && err.stack.length > 0 ? err.stack : undefined }),
  });
});

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

/**
 * Start server
 */
const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API endpoints available at http://localhost:${port}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path = __importStar(require("path"));
const rotating_file_stream_1 = __importDefault(require("rotating-file-stream"));
const dotenv_1 = __importDefault(require("dotenv"));
const uploadRoutes_1 = __importDefault(require("@/routes/uploadRoutes"));
const constants_1 = require("@/constants");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || constants_1.ENV_CONFIG.DEFAULT_PORT;
/**
 * CORS configuration
 */
const corsOptions = {
    origin: constants_1.ENV_CONFIG.CORS_ORIGIN,
    optionsSuccessStatus: constants_1.HttpStatus.OK,
    credentials: true,
};
/**
 * Logging configuration
 */
const isProduction = process.env.NODE_ENV === 'production';
// Create a rotating write stream for production logs
const accessLogStream = rotating_file_stream_1.default.createStream('access.log', {
    interval: constants_1.ENV_CONFIG.LOG_INTERVAL,
    path: path.join(__dirname, '..', 'logs'),
});
// Configure morgan logger
app.use(isProduction
    ? (0, morgan_1.default)('combined', { stream: accessLogStream })
    : (0, morgan_1.default)('dev'));
/**
 * Security and middleware configuration
 */
app.disable('x-powered-by');
// Static file serving
app.use(express_1.default.static(path.join(__dirname, '..', 'public')));
app.use('/uploads/img', express_1.default.static(path.join(__dirname, '..', 'uploads', 'img')));
app.use('/uploads/misc', express_1.default.static(path.join(__dirname, '..', 'uploads', 'misc')));
app.use('/uploads/video', express_1.default.static(path.join(__dirname, '..', 'uploads', 'video')));
// CORS
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
/**
 * Routes
 */
app.use('/api', uploadRoutes_1.default);
// Root endpoint
app.get('/', (req, res) => {
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
app.use('*', (req, res) => {
    res.status(constants_1.HttpStatus.NOT_FOUND).json({
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});
/**
 * Centralized error handler
 */
app.use((err, req, res, next) => {
    if (!err)
        return next();
    // Default error response
    let status = constants_1.HttpStatus.INTERNAL_SERVER_ERROR;
    let message = constants_1.ErrorMessages.SERVER_ERROR;
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
const gracefulShutdown = (signal) => {
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
exports.default = app;

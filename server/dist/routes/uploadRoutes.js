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
const uuid_1 = require("uuid");
const multer_1 = __importStar(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const mime = __importStar(require("mime-types"));
const fileHelpers_1 = require("../helpers/fileHelpers");
const constants_1 = require("../constants");
const router = express_1.default.Router();
const appDir = path.dirname(require.main?.filename || '');
/**
 * Multer storage configuration with TypeScript typing
 */
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        let dest = path.join(appDir, 'uploads');
        if ((0, fileHelpers_1.isVideo)(file)) {
            dest = path.join(dest, constants_1.UPLOAD_CONFIG.UPLOAD_PATHS.VIDEO);
        }
        else if ((0, fileHelpers_1.isImage)(file)) {
            dest = path.join(dest, constants_1.UPLOAD_CONFIG.UPLOAD_PATHS.IMAGE);
        }
        else {
            dest = path.join(dest, constants_1.UPLOAD_CONFIG.UPLOAD_PATHS.MISC);
        }
        try {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
        }
        catch (error) {
            cb(error, dest);
        }
    },
    filename: function (req, file, cb) {
        // Strip path separators and collapse whitespace
        const safeBase = (0, fileHelpers_1.sanitizeFilename)(file.originalname || 'file');
        const dotIndex = safeBase.lastIndexOf('.');
        const base = dotIndex > 0 ? safeBase.slice(0, dotIndex) : safeBase;
        const ext = dotIndex > 0 ? safeBase.slice(dotIndex + 1) : (mime.extension(file.mimetype) || 'bin');
        const filename = `${base}-${(0, uuid_1.v4)()}.${ext}`;
        cb(null, filename);
    },
});
/**
 * Multer upload configuration
 */
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: constants_1.UPLOAD_CONFIG.MAX_FILE_SIZE,
        files: constants_1.UPLOAD_CONFIG.MAX_FILES,
    },
    fileFilter: (req, file, cb) => {
        // Basic file validation can be added here
        cb(null, true);
    },
});
/**
 * File upload endpoint
 */
router.post('/upload-files', upload.array('files'), (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(constants_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: constants_1.ErrorMessages.INVALID_REQUEST,
                message: 'No files uploaded',
            });
        }
        // Runtime validation to ensure req.files is an array before type assertion
        if (!Array.isArray(req.files)) {
            return res.status(constants_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: constants_1.ErrorMessages.INVALID_REQUEST,
                message: 'Invalid file upload format',
            });
        }
        const uploadedFiles = req.files;
        res.status(constants_1.HttpStatus.OK).json({
            success: true,
            data: uploadedFiles,
            message: constants_1.SuccessMessages.UPLOAD_COMPLETE,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    const healthResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
    };
    res.status(constants_1.HttpStatus.OK).json(healthResponse);
});
/**
 * Get server status and file statistics
 */
router.get('/status', (req, res, next) => {
    try {
        const uploadsDir = path.join(appDir, 'uploads');
        let fileCount = 0;
        let totalSize = 0;
        if (fs.existsSync(uploadsDir)) {
            const getDirectoryStats = (dir) => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    if (stats.isDirectory()) {
                        getDirectoryStats(filePath);
                    }
                    else {
                        fileCount++;
                        totalSize += stats.size;
                    }
                });
            };
            getDirectoryStats(uploadsDir);
        }
        res.status(constants_1.HttpStatus.OK).json({
            success: true,
            data: {
                fileCount,
                totalSize,
                uploadsDirectory: uploadsDir,
                maxFileSize: constants_1.UPLOAD_CONFIG.MAX_FILE_SIZE,
                maxFiles: constants_1.UPLOAD_CONFIG.MAX_FILES,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Error handler for multer errors
 */
router.use((error, req, res, next) => {
    if (error instanceof multer_1.MulterError) {
        let message = constants_1.ErrorMessages.UPLOAD_FAILED;
        let statusCode = constants_1.HttpStatus.BAD_REQUEST;
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = constants_1.ErrorMessages.FILE_TOO_LARGE;
                statusCode = constants_1.HttpStatus.PAYLOAD_TOO_LARGE;
                break;
            case 'LIMIT_FILE_COUNT':
                message = constants_1.ErrorMessages.TOO_MANY_FILES;
                statusCode = constants_1.HttpStatus.BAD_REQUEST;
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = constants_1.ErrorMessages.UNEXPECTED_FIELD;
                statusCode = constants_1.HttpStatus.BAD_REQUEST;
                break;
        }
        return res.status(statusCode).json({
            success: false,
            error: message,
        });
    }
    // Pass other errors to the main error handler
    next(error);
});
exports.default = router;

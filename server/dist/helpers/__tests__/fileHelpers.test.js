"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const fileHelpers_1 = require("../fileHelpers");
const constants_1 = require("@/constants");
(0, globals_1.describe)('fileHelpers', () => {
    (0, globals_1.describe)('bytesToSize', () => {
        (0, globals_1.it)('converts bytes to human readable format', () => {
            (0, globals_1.expect)((0, fileHelpers_1.bytesToSize)(0)).toBe('0 Bytes');
            (0, globals_1.expect)((0, fileHelpers_1.bytesToSize)(1024)).toBe('1 KB');
            (0, globals_1.expect)((0, fileHelpers_1.bytesToSize)(1048576)).toBe('1 MB');
            (0, globals_1.expect)((0, fileHelpers_1.bytesToSize)(1073741824)).toBe('1 GB');
            (0, globals_1.expect)((0, fileHelpers_1.bytesToSize)(1536)).toBe('1.5 KB');
        });
        (0, globals_1.it)('handles negative values', () => {
            (0, globals_1.expect)((0, fileHelpers_1.bytesToSize)(-100)).toBe('0 Bytes');
        });
    });
    (0, globals_1.describe)('isImage', () => {
        (0, globals_1.it)('identifies image files correctly', () => {
            const imageFile = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: '',
                filename: '',
                path: '',
                size: 1024,
                stream: {},
                buffer: Buffer.from(''),
            };
            (0, globals_1.expect)((0, fileHelpers_1.isImage)(imageFile)).toBe(true);
        });
        (0, globals_1.it)('identifies non-image files correctly', () => {
            const videoFile = {
                fieldname: 'file',
                originalname: 'test.mp4',
                encoding: '7bit',
                mimetype: 'video/mp4',
                destination: '',
                filename: '',
                path: '',
                size: 1024,
                stream: {},
                buffer: Buffer.from(''),
            };
            (0, globals_1.expect)((0, fileHelpers_1.isImage)(videoFile)).toBe(false);
        });
    });
    (0, globals_1.describe)('isVideo', () => {
        (0, globals_1.it)('identifies video files correctly', () => {
            const videoFile = {
                fieldname: 'file',
                originalname: 'test.mp4',
                encoding: '7bit',
                mimetype: 'video/mp4',
                destination: '',
                filename: '',
                path: '',
                size: 1024,
                stream: {},
                buffer: Buffer.from(''),
            };
            (0, globals_1.expect)((0, fileHelpers_1.isVideo)(videoFile)).toBe(true);
        });
    });
    (0, globals_1.describe)('getFileCategory', () => {
        (0, globals_1.it)('categorizes files correctly', () => {
            const imageFile = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: '',
                filename: '',
                path: '',
                size: 1024,
                stream: {},
                buffer: Buffer.from(''),
            };
            (0, globals_1.expect)((0, fileHelpers_1.getFileCategory)(imageFile)).toBe(constants_1.FileCategory.IMAGE);
        });
    });
    (0, globals_1.describe)('isValidFileSize', () => {
        (0, globals_1.it)('validates file size correctly', () => {
            const file = {
                fieldname: 'file',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: '',
                filename: '',
                path: '',
                size: 1024,
                stream: {},
                buffer: Buffer.from(''),
            };
            (0, globals_1.expect)((0, fileHelpers_1.isValidFileSize)(file, 2048)).toBe(true);
            (0, globals_1.expect)((0, fileHelpers_1.isValidFileSize)(file, 512)).toBe(false);
        });
    });
    (0, globals_1.describe)('sanitizeFilename', () => {
        (0, globals_1.it)('sanitizes filenames correctly', () => {
            (0, globals_1.expect)((0, fileHelpers_1.sanitizeFilename)('test/file\\name.txt')).toBe('test_file_name.txt');
            (0, globals_1.expect)((0, fileHelpers_1.sanitizeFilename)('  spaced   file  .txt  ')).toBe('spaced file .txt');
        });
    });
});

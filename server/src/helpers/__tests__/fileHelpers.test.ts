import { describe, it, expect } from '@jest/globals';
import {
  bytesToSize,
  isImage,
  isVideo,
  isDocument,
  getFileCategory,
  isValidFileSize,
  isValidFileType,
  sanitizeFilename,
} from '../fileHelpers';
import { FileCategory } from '@/constants';


describe('fileHelpers', () => {
  describe('bytesToSize', () => {
    it('converts bytes to human readable format', () => {
      expect(bytesToSize(0)).toBe('0 Bytes');
      expect(bytesToSize(1024)).toBe('1 KB');
      expect(bytesToSize(1048576)).toBe('1 MB');
      expect(bytesToSize(1073741824)).toBe('1 GB');
      expect(bytesToSize(1536)).toBe('1.5 KB');
    });

    it('handles negative values', () => {
      expect(bytesToSize(-100)).toBe('0 Bytes');
    });
  });

  describe('isImage', () => {
    it('identifies image files correctly', () => {
      const imageFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '',
        filename: '',
        path: '',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      expect(isImage(imageFile)).toBe(true);
    });

    it('identifies non-image files correctly', () => {
      const videoFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        destination: '',
        filename: '',
        path: '',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      expect(isImage(videoFile)).toBe(false);
    });
  });

  describe('isVideo', () => {
    it('identifies video files correctly', () => {
      const videoFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.mp4',
        encoding: '7bit',
        mimetype: 'video/mp4',
        destination: '',
        filename: '',
        path: '',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      expect(isVideo(videoFile)).toBe(true);
    });
  });

  describe('getFileCategory', () => {
    it('categorizes files correctly', () => {
      const imageFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '',
        filename: '',
        path: '',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      expect(getFileCategory(imageFile)).toBe(FileCategory.IMAGE);
    });
  });

  describe('isValidFileSize', () => {
    it('validates file size correctly', () => {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '',
        filename: '',
        path: '',
        size: 1024,
        stream: {} as any,
        buffer: Buffer.from(''),
      };

      expect(isValidFileSize(file, 2048)).toBe(true);
      expect(isValidFileSize(file, 512)).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('sanitizes filenames correctly', () => {
      expect(sanitizeFilename('test/file\\name.txt')).toBe('test_file_name.txt');
      expect(sanitizeFilename('  spaced   file  .txt  ')).toBe('spaced file .txt');
    });
  });
});

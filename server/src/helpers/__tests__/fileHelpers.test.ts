import { Readable } from 'node:stream';
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

function mockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: '',
    filename: '',
    path: '',
    size: 1024,
    stream: Readable.from([]),
    buffer: Buffer.from(''),
    ...overrides,
  };
}

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
      expect(isImage(mockFile({ originalname: 'test.jpg', mimetype: 'image/jpeg' }))).toBe(true);
    });

    it('identifies non-image files correctly', () => {
      expect(isImage(mockFile({ originalname: 'test.mp4', mimetype: 'video/mp4' }))).toBe(false);
    });
  });

  describe('isVideo', () => {
    it('identifies video files correctly', () => {
      expect(isVideo(mockFile({ originalname: 'test.mp4', mimetype: 'video/mp4' }))).toBe(true);
    });
  });

  describe('isDocument', () => {
    it('identifies document files correctly', () => {
      expect(isDocument(mockFile({ originalname: 'test.pdf', mimetype: 'application/pdf' }))).toBe(
        true
      );
    });
  });

  describe('getFileCategory', () => {
    it('categorizes files correctly', () => {
      expect(
        getFileCategory(mockFile({ originalname: 'test.jpg', mimetype: 'image/jpeg' }))
      ).toBe(FileCategory.IMAGE);
    });
  });

  describe('isValidFileSize', () => {
    it('validates file size correctly', () => {
      const file = mockFile({ size: 1024 });

      expect(isValidFileSize(file, 2048)).toBe(true);
      expect(isValidFileSize(file, 512)).toBe(false);
    });
  });

  describe('isValidFileType', () => {
    it('accepts supported MIME types', () => {
      expect(isValidFileType(mockFile({ mimetype: 'image/jpeg' }))).toBe(true);
    });

    it('rejects unsupported MIME types', () => {
      expect(isValidFileType(mockFile({ mimetype: 'application/x-msdownload' }))).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('sanitizes filenames correctly', () => {
      expect(sanitizeFilename('test/file\\name.txt')).toBe('test_file_name.txt');
      expect(sanitizeFilename('  spaced   file  .txt  ')).toBe('spaced file .txt');
    });
  });
});

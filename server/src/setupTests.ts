// Jest setup file for server tests
import { jest, beforeAll, afterAll } from '@jest/globals';

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Global test timeout - useful for file operations
jest.setTimeout(10000);

// Mock console methods globally to avoid noisy test output
// Individual tests can override this by restoring specific methods
beforeAll(() => {
  // Suppress info/log messages in tests but keep errors and warnings
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console methods after all tests
  jest.restoreAllMocks();
});

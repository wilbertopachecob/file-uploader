// Jest setup file for server tests

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

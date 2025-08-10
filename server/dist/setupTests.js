"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Jest setup file for server tests
const globals_1 = require("@jest/globals");
// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
// Global test timeout - useful for file operations
globals_1.jest.setTimeout(10000);
// Mock console methods globally to avoid noisy test output
// Individual tests can override this by restoring specific methods
(0, globals_1.beforeAll)(() => {
    // Suppress info/log messages in tests but keep errors and warnings
    globals_1.jest.spyOn(console, 'log').mockImplementation(() => { });
    globals_1.jest.spyOn(console, 'info').mockImplementation(() => { });
});
(0, globals_1.afterAll)(() => {
    // Restore console methods after all tests
    globals_1.jest.restoreAllMocks();
});

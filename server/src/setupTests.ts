// Jest setup file for server tests

// Note: Console mocking should be done per-test using jest.spyOn() when needed
// This avoids hiding important error messages during testing
// Example: const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

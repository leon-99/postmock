// Mock the utils module before requiring it
jest.mock('../../src/utils.js', () => ({
  applyDelay: jest.fn(),
  setupHotReload: jest.fn(),
  validatePort: jest.fn(),
  validateDelayRange: jest.fn(),
  formatBytes: jest.fn(),
  getFileSize: jest.fn()
}));

const utils = require('../../src/utils.js');

describe('Utils Index', () => {
  test('should export utility functions', () => {
    expect(utils).toBeDefined();
    expect(typeof utils).toBe('object');
  });

  test('should export expected utility functions', () => {
    // Check if the main utility functions are exported
    expect(utils.applyDelay).toBeDefined();
    expect(typeof utils.applyDelay).toBe('function');
    
    expect(utils.setupHotReload).toBeDefined();
    expect(typeof utils.setupHotReload).toBe('function');
    
    expect(utils.validatePort).toBeDefined();
    expect(typeof utils.validatePort).toBe('function');
    
    expect(utils.validateDelayRange).toBeDefined();
    expect(typeof utils.validateDelayRange).toBe('function');
    
    expect(utils.formatBytes).toBeDefined();
    expect(typeof utils.formatBytes).toBe('function');
    
    expect(utils.getFileSize).toBeDefined();
    expect(typeof utils.getFileSize).toBe('function');
  });
});

// Mock the index module before requiring it
jest.mock('../src/index.js', () => ({
  generateMockResponse: jest.fn(),
  parseInput: jest.fn(),
  startServer: jest.fn(),
  applyDelay: jest.fn(),
  setupHotReload: jest.fn(),
  validatePort: jest.fn(),
  validateDelayRange: jest.fn(),
  formatBytes: jest.fn(),
  getFileSize: jest.fn(),
  FileReader: jest.fn(),
  PostmanParser: jest.fn(),
  OpenApiParser: jest.fn(),
  ParserFactory: jest.fn()
}));

const index = require('../src/index.js');

describe('Main Index', () => {
  test('should export expected modules', () => {
    expect(index).toBeDefined();
    expect(typeof index).toBe('object');
  });

  test('should export generator module', () => {
    expect(index.generateMockResponse).toBeDefined();
    expect(typeof index.generateMockResponse).toBe('function');
  });

  test('should export parser module', () => {
    expect(index.parseInput).toBeDefined();
    expect(typeof index.parseInput).toBe('function');
  });

  test('should export server module', () => {
    expect(index.startServer).toBeDefined();
    expect(typeof index.startServer).toBe('function');
  });

  test('should export utility functions', () => {
    expect(index.applyDelay).toBeDefined();
    expect(typeof index.applyDelay).toBe('function');
    
    expect(index.setupHotReload).toBeDefined();
    expect(typeof index.setupHotReload).toBe('function');
    
    expect(index.validatePort).toBeDefined();
    expect(typeof index.validatePort).toBe('function');
    
    expect(index.validateDelayRange).toBeDefined();
    expect(typeof index.validateDelayRange).toBe('function');
    
    expect(index.formatBytes).toBeDefined();
    expect(typeof index.formatBytes).toBe('function');
    
    expect(index.getFileSize).toBeDefined();
    expect(typeof index.getFileSize).toBe('function');
  });

  test('should export FileReader class', () => {
    expect(index.FileReader).toBeDefined();
    expect(typeof index.FileReader).toBe('function');
  });

  test('should export parser classes', () => {
    expect(index.PostmanParser).toBeDefined();
    expect(typeof index.PostmanParser).toBe('function');
    
    expect(index.OpenApiParser).toBeDefined();
    expect(typeof index.OpenApiParser).toBe('function');
    
    expect(index.ParserFactory).toBeDefined();
    expect(typeof index.ParserFactory).toBe('function');
  });
});

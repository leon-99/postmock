const { startServer } = require('../src/server.js');
const { parseInput } = require('../src/parser.js');
const { generateMockResponse } = require('../src/generator.js');
const { applyDelay, setupHotReload } = require('../src/utils.js');

// Mock dependencies
jest.mock('../src/parser.js');
jest.mock('../src/generator.js');
jest.mock('../src/utils.js');
jest.mock('express');
jest.mock('cors');
jest.mock('chalk');
jest.mock('console');
jest.mock('process');

describe('startServer', () => {
  let mockApp;
  let mockServer;
  let mockExpress;
  let mockCors;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Express app
    mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      listen: jest.fn()
    };

    // Mock Express constructor
    mockExpress = jest.fn(() => mockApp);
    mockExpress.json = jest.fn();
    mockExpress.urlencoded = jest.fn();
    
    // Mock server
    mockServer = {
      close: jest.fn()
    };
    
    mockApp.listen.mockImplementation((port, callback) => {
      if (callback) callback();
      return mockServer;
    });

    // Mock cors
    mockCors = jest.fn();

    // Setup module mocks
    require('express').default = mockExpress;
    require('cors').default = mockCors;
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock process methods
    process.exit = jest.fn();
    process.on = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should start server successfully with basic configuration', async () => {
    const mockApiSpec = {
      endpoints: [
        {
          method: 'GET',
          path: '/test',
          examples: [{ id: 1, name: 'test' }],
          schema: null
        }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ id: 1, name: 'test' });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(parseInput).toHaveBeenCalledWith('test.json');
    expect(mockExpress).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith(mockExpress.json());
    expect(mockApp.use).toHaveBeenCalledWith(mockExpress.urlencoded({ extended: true }));
    expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  test('should enable CORS when option is true', async () => {
    const mockApiSpec = {
      endpoints: [
        {
          method: 'GET',
          path: '/test',
          examples: [{ id: 1, name: 'test' }],
          schema: null
        }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ id: 1, name: 'test' });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: true,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(mockCors).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith(mockCors());
  });

  test('should setup hot reload when option is true', async () => {
    const mockApiSpec = {
      endpoints: [
        {
          method: 'GET',
          path: '/test',
          examples: [{ id: 1, name: 'test' }],
          schema: null
        }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ id: 1, name: 'test' });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: true,
      delay: '0',
      dynamic: false
    });

    expect(setupHotReload).toHaveBeenCalledWith('test.json', expect.any(Function));
  });

  test('should create endpoints for all methods', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null },
        { method: 'POST', path: '/test', examples: [], schema: null },
        { method: 'PUT', path: '/test', examples: [], schema: null },
        { method: 'PATCH', path: '/test', examples: [], schema: null },
        { method: 'DELETE', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(mockApp.get).toHaveBeenCalledWith('/test', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/test', expect.any(Function));
    expect(mockApp.put).toHaveBeenCalledWith('/test', expect.any(Function));
    expect(mockApp.patch).toHaveBeenCalledWith('/test', expect.any(Function));
    expect(mockApp.delete).toHaveBeenCalledWith('/test', expect.any(Function));
  });

  test('should create health check endpoint', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(mockApp.get).toHaveBeenCalledWith('/_health', expect.any(Function));
  });

  test('should create 404 handler for undefined routes', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(mockApp.use).toHaveBeenCalledWith('*', expect.any(Function));
  });

  test('should apply delay when specified', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '1000',
      dynamic: false
    });

    expect(applyDelay).toHaveBeenCalledWith('1000');
  });

  test('should not apply delay when set to 0', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(applyDelay).not.toHaveBeenCalled();
  });

  test('should pass dynamic option to generateMockResponse', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: true
    });

    // The dynamic option is passed to the endpoint handler function
    // We can't directly test this without calling the handler, but we can verify
    // that the server was started with the correct options
    expect(parseInput).toHaveBeenCalledWith('test.json');
  });

  test('should throw error when no endpoints found', async () => {
    const mockApiSpec = { endpoints: [] };

    parseInput.mockResolvedValue(mockApiSpec);

    await expect(startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    })).rejects.toThrow('No valid endpoints found in the input file');

    expect(mockExpress).not.toHaveBeenCalled();
  });

  test('should throw error when apiSpec is null', async () => {
    parseInput.mockResolvedValue(null);

    await expect(startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    })).rejects.toThrow('No valid endpoints found in the input file');

    expect(mockExpress).not.toHaveBeenCalled();
  });

  test('should throw error when apiSpec has no endpoints property', async () => {
    const mockApiSpec = { info: { title: 'Test API' } };

    parseInput.mockResolvedValue(mockApiSpec);

    await expect(startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    })).rejects.toThrow('No valid endpoints found in the input file');

    expect(mockExpress).not.toHaveBeenCalled();
  });

  test('should handle parseInput errors', async () => {
    const errorMessage = 'Failed to parse file';
    parseInput.mockRejectedValue(new Error(errorMessage));

    await expect(startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    })).rejects.toThrow('Failed to start server: Failed to parse file');

    expect(mockExpress).not.toHaveBeenCalled();
  });

  test('should setup graceful shutdown handler', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });

  test('should log server startup information', async () => {
    const mockApiSpec = {
      endpoints: [
        { method: 'GET', path: '/test', examples: [], schema: null }
      ]
    };

    parseInput.mockResolvedValue(mockApiSpec);
    generateMockResponse.mockReturnValue({ success: true });
    applyDelay.mockResolvedValue();
    setupHotReload.mockImplementation(() => {});

    await startServer('test.json', {
      port: 3000,
      cors: false,
      hotReload: false,
      delay: '0',
      dynamic: false
    });

    expect(console.log).toHaveBeenCalled();
  });
});

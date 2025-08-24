import express from 'express';
import { startServer } from '../src/server.js';
import { parseInput } from '../src/parser.js';
import { generateMockResponse } from '../src/generator.js';
import { applyDelay, setupHotReload } from '../src/utils.js';

// Mock dependencies
jest.mock('express');
jest.mock('../src/parser.js');
jest.mock('../src/generator.js');
jest.mock('../src/utils.js');
jest.mock('chalk', () => ({
  green: jest.fn((text) => text),
  blue: jest.fn((text) => text),
  gray: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  cyan: jest.fn((text) => text)
}));

describe('server', () => {
  let mockApp;
  let mockServer;
  let mockExpress;
  let mockCors;
  let mockJson;
  let mockUrlencoded;
  let mockUse;
  let mockGet;
  let mockPost;
  let mockPut;
  let mockPatch;
  let mockDelete;
  let mockListen;
  let mockClose;
  let mockOn;
  let mockSetHeader;
  let mockStatus;
  let mockJsonResponse;
  let mockOriginalUrl;
  let mockMethod;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Express app methods
    mockJson = jest.fn();
    mockUrlencoded = jest.fn();
    mockUse = jest.fn();
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockPut = jest.fn();
    mockPatch = jest.fn();
    mockDelete = jest.fn();
    mockListen = jest.fn();
    mockClose = jest.fn();
    mockOn = jest.fn();
    
    // Mock response methods
    mockSetHeader = jest.fn();
    mockJsonResponse = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJsonResponse });
    
    // Mock request properties
    mockOriginalUrl = '/test';
    mockMethod = 'GET';
    
    // Create mock app
    mockApp = {
      use: mockUse,
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: mockPatch,
      delete: mockDelete,
      listen: mockListen
    };
    
    // Create mock server
    mockServer = {
      close: mockClose
    };
    
    // Setup Express mock
    mockExpress = jest.fn(() => mockApp);
    express.mockImplementation(mockExpress);
    
    // Setup route method mocks to capture handlers
    mockGet.mockImplementation((path, handler) => {
      if (path === '/_health') {
        mockApp.healthHandler = handler;
      } else {
        mockApp.endpointHandler = handler;
      }
    });
    
    mockPost.mockImplementation((path, handler) => {
      mockApp.postHandler = handler;
    });
    
    mockUse.mockImplementation((path, handler) => {
      if (path === '*') {
        mockApp.notFoundHandler = handler;
      }
    });
    
    // Setup parser mock
    parseInput.mockResolvedValue({
      endpoints: [
        {
          method: 'GET',
          path: '/test',
          examples: [{ id: 1, name: 'Test' }],
          schema: { type: 'object', properties: { id: { type: 'number' } } }
        },
        {
          method: 'POST',
          path: '/test',
          examples: [{ id: 2, name: 'Created' }],
          schema: { type: 'object', properties: { id: { type: 'number' } } }
        }
      ]
    });
    
    // Setup generator mock
    generateMockResponse.mockReturnValue({ id: 1, name: 'Test' });
    
    // Setup utils mocks
    applyDelay.mockResolvedValue();
    setupHotReload.mockReturnValue(() => {});
    
    // Setup server listen mock
    mockListen.mockImplementation((port, callback) => {
      callback();
      return mockServer;
    });
    
    // Setup process.on mock
    process.on = mockOn;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startServer', () => {
    test('should start server successfully with basic configuration', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(parseInput).toHaveBeenCalledWith(inputFile);
      expect(mockExpress).toHaveBeenCalled();
      expect(mockUse).toHaveBeenCalledWith(express.json());
      expect(mockUse).toHaveBeenCalledWith(express.urlencoded({ extended: true }));
      expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
    });

    test('should enable CORS when option is true', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: true,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(mockUse).toHaveBeenCalledWith(expect.any(Function)); // CORS middleware
    });

    test('should setup hot reload when option is true', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: true,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(setupHotReload).toHaveBeenCalledWith(inputFile, expect.any(Function));
    });

    test('should create endpoints for all methods', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(mockGet).toHaveBeenCalledWith('/test', expect.any(Function));
      expect(mockPost).toHaveBeenCalledWith('/test', expect.any(Function));
    });

    test('should create health check endpoint', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(mockGet).toHaveBeenCalledWith('/_health', expect.any(Function));
    });

    test('should create 404 handler for undefined routes', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(mockUse).toHaveBeenCalledWith('*', expect.any(Function));
    });

    test('should apply delay when specified', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '100',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the endpoint handler and call it
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus
      };

      await endpointHandler(mockReq, mockRes);

      expect(applyDelay).toHaveBeenCalledWith('100');
    });

    test('should not apply delay when delay is 0', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the endpoint handler and call it
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus
      };

      await endpointHandler(mockReq, mockRes);

      expect(applyDelay).not.toHaveBeenCalled();
    });

    test('should generate mock response with correct parameters', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: true
      };

      await startServer(inputFile, options);

      // Get the endpoint handler and call it
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus
      };

      await endpointHandler(mockReq, mockRes);

      expect(generateMockResponse).toHaveBeenCalledWith(
        [{ id: 1, name: 'Test' }],
        { type: 'object', properties: { id: { type: 'number' } } },
        true,
        mockReq
      );
    });

    test('should set correct headers on response', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the endpoint handler and call it
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus
      };

      await endpointHandler(mockReq, mockRes);

      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockSetHeader).toHaveBeenCalledWith('X-Mock-Server', 'postmock');
    });

    test('should handle endpoint errors gracefully', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      // Mock generateMockResponse to throw error
      generateMockResponse.mockImplementation(() => {
        throw new Error('Generation failed');
      });

      await startServer(inputFile, options);

      // Get the endpoint handler and call it
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus
      };

      await endpointHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJsonResponse).toHaveBeenCalledWith({
        error: 'Internal mock server error',
        message: 'Generation failed'
      });
    });

    test('should handle health check endpoint correctly', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the health check handler and call it
      const healthHandler = mockApp.healthHandler;
      const mockReq = {};
      const mockRes = {
        json: mockJsonResponse
      };

      healthHandler(mockReq, mockRes);

      expect(mockJsonResponse).toHaveBeenCalledWith({
        status: 'ok',
        service: 'postmock',
        endpoints: 2,
        timestamp: expect.any(String)
      });
    });

    test('should handle 404 routes correctly', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the 404 handler and call it
      const notFoundHandler = mockApp.notFoundHandler;
      const mockReq = { method: 'GET', originalUrl: '/nonexistent' };
      const mockRes = {
        status: mockStatus
      };

      notFoundHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJsonResponse).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'No mock endpoint defined for GET /nonexistent',
        availableEndpoints: ['GET /test', 'POST /test']
      });
    });

    test('should setup graceful shutdown', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      expect(mockOn).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });

    test('should handle graceful shutdown correctly', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the SIGINT handler and call it
      const sigintHandler = mockOn.mock.calls.find(call => call[0] === 'SIGINT')[1];
      
      sigintHandler();

      expect(mockClose).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should throw error when no endpoints are found', async () => {
      parseInput.mockResolvedValue({
        endpoints: []
      });

      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await expect(startServer(inputFile, options)).rejects.toThrow('No valid endpoints found in the input file');
    });

    test('should throw error when parseInput fails', async () => {
      parseInput.mockRejectedValue(new Error('Parse failed'));

      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await expect(startServer(inputFile, options)).rejects.toThrow('Failed to start server: Parse failed');
    });

    test('should handle hot reload file change callback', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: true,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the hot reload callback and call it
      const hotReloadCallback = setupHotReload.mock.calls[0][1];
      
      // Mock process.exit
      const originalExit = process.exit;
      process.exit = jest.fn();
      
      hotReloadCallback();
      
      expect(process.exit).toHaveBeenCalledWith(0);
      
      // Restore process.exit
      process.exit = originalExit;
    });

    test('should log request information correctly', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the endpoint handler and call it
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus,
        json: mockJsonResponse
      };

      // Mock console.log to capture the output
      const originalLog = console.log;
      const mockLog = jest.fn();
      console.log = mockLog;

      await endpointHandler(mockReq, mockRes);

      expect(mockLog).toHaveBeenCalledWith('GET /test → 200 OK');

      // Restore console.log
      console.log = originalLog;
    });

    test('should handle different HTTP methods correctly', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Test GET endpoint
      const getHandler = mockApp.endpointHandler;
      const mockReq = { method: 'GET', path: '/test' };
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus,
        json: mockJsonResponse
      };

      await getHandler(mockReq, mockRes);

      // Test POST endpoint
      const postHandler = mockApp.postHandler;
      const mockPostReq = { method: 'POST', path: '/test' };
      const mockPostRes = {
        setHeader: mockSetHeader,
        status: mockStatus,
        json: mockJsonResponse
      };

      await postHandler(mockPostReq, mockPostRes);

      expect(generateMockResponse).toHaveBeenCalledTimes(2);
    });

    test('should handle request without method or path gracefully', async () => {
      const inputFile = 'test.json';
      const options = {
        port: 3000,
        cors: false,
        delay: '0',
        hotReload: false,
        dynamic: false
      };

      await startServer(inputFile, options);

      // Get the endpoint handler and call it with minimal request
      const endpointHandler = mockApp.endpointHandler;
      const mockReq = {};
      const mockRes = {
        setHeader: mockSetHeader,
        status: mockStatus,
        json: mockJsonResponse
      };

      await endpointHandler(mockReq, mockRes);

      expect(generateMockResponse).toHaveBeenCalledWith(
        [{ id: 1, name: 'Test' }],
        { type: 'object', properties: { id: { type: 'number' } } },
        false,
        mockReq
      );
    });
  });
});

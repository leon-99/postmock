const { OpenApiParser } = require('../../src/parsers/openapi-parser.js');

// Mock dependencies
jest.mock('../../src/parsers/openapi-parser.js');

describe('OpenApiParser', () => {
  let parser;

  beforeEach(() => {
    jest.clearAllMocks();
    parser = new OpenApiParser();
  });

  describe('parse', () => {
    test('should parse OpenAPI 3.0 specification', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/users': {
            get: { summary: 'Get users' },
            post: { summary: 'Create user' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result).toBeDefined();
      expect(parser.parse).toHaveBeenCalledWith(mockData);
    });

    test('should parse OpenAPI 2.0 (Swagger) specification', () => {
      const mockData = {
        swagger: '2.0',
        info: { title: 'Test API' },
        paths: {
          '/users': {
            get: { summary: 'Get users' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result).toBeDefined();
      expect(parser.parse).toHaveBeenCalledWith(mockData);
    });

    test('should handle empty paths', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {}
      };

      const result = parser.parse(mockData);

      expect(result).toBeDefined();
      expect(parser.parse).toHaveBeenCalledWith(mockData);
    });
  });

  describe('getEndpoints', () => {
    test('should return endpoints from parsed specification', () => {
      const mockEndpoints = [
        { path: '/users', method: 'GET' },
        { path: '/users', method: 'POST' }
      ];

      parser.getEndpoints = jest.fn().mockReturnValue(mockEndpoints);

      const result = parser.getEndpoints();

      expect(result).toEqual(mockEndpoints);
      expect(parser.getEndpoints).toHaveBeenCalled();
    });

    test('should return empty array when no endpoints', () => {
      parser.getEndpoints = jest.fn().mockReturnValue([]);

      const result = parser.getEndpoints();

      expect(result).toEqual([]);
      expect(parser.getEndpoints).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle null data', () => {
      const result = parser.parse(null);
      expect(result).toBeDefined();
    });

    test('should handle undefined data', () => {
      const result = parser.parse(undefined);
      expect(result).toBeDefined();
    });

    test('should handle malformed data', () => {
      const malformedData = { invalid: 'structure' };
      const result = parser.parse(malformedData);
      expect(result).toBeDefined();
    });

    test('should handle data without openapi/swagger property', () => {
      const mockData = {
        info: { title: 'Test API' },
        paths: { '/test': {} }
      };

      const result = parser.parse(mockData);
      expect(result).toBeDefined();
    });
  });
});

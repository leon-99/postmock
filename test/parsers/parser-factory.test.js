import { ParserFactory } from '../../src/parsers/parser-factory.js';
import { PostmanParser } from '../../src/parsers/postman-parser.js';
import { OpenApiParser } from '../../src/parsers/openapi-parser.js';

// Mock the parser classes
jest.mock('../../src/parsers/postman-parser.js');
jest.mock('../../src/parsers/openapi-parser.js');

describe('ParserFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock PostmanParser constructor
    PostmanParser.mockImplementation(() => ({
      parse: jest.fn()
    }));
    
    // Mock OpenApiParser constructor
    OpenApiParser.mockImplementation(() => ({
      parse: jest.fn()
    }));
  });

  describe('createParser', () => {
    test('should create PostmanParser for Postman collection data', () => {
      const postmanData = {
        info: { name: 'Test Collection' },
        item: [
          { name: 'Test Request', request: { method: 'GET', url: 'https://api.test.com' } }
        ]
      };

      const parser = ParserFactory.createParser(postmanData);

      expect(PostmanParser).toHaveBeenCalled();
      expect(OpenApiParser).not.toHaveBeenCalled();
      expect(parser).toBeDefined();
      expect(parser.parse).toBeDefined();
    });

    test('should create OpenApiParser for OpenAPI spec data', () => {
      const openApiData = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      const parser = ParserFactory.createParser(openApiData);

      expect(OpenApiParser).toHaveBeenCalled();
      expect(PostmanParser).not.toHaveBeenCalled();
      expect(parser).toBeDefined();
      expect(parser.parse).toBeDefined();
    });

    test('should create OpenApiParser for Swagger spec data', () => {
      const swaggerData = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      const parser = ParserFactory.createParser(swaggerData);

      expect(OpenApiParser).toHaveBeenCalled();
      expect(PostmanParser).not.toHaveBeenCalled();
      expect(parser).toBeDefined();
      expect(parser.parse).toBeDefined();
    });

    test('should throw error for invalid data', () => {
      const invalidData = {
        info: { name: 'Test' }
        // Missing required properties
      };

      expect(() => ParserFactory.createParser(invalidData))
        .toThrow('File is neither a valid Postman collection nor OpenAPI spec');
    });

    test('should throw error for null data', () => {
      expect(() => ParserFactory.createParser(null))
        .toThrow('File is neither a valid Postman collection nor OpenAPI spec');
    });

    test('should throw error for undefined data', () => {
      expect(() => ParserFactory.createParser(undefined))
        .toThrow('File is neither a valid Postman collection nor OpenAPI spec');
    });
  });

  describe('isPostmanCollection', () => {
    test('should return true for valid Postman collection', () => {
      const postmanData = {
        info: { name: 'Test Collection' },
        item: [
          { name: 'Test Request', request: { method: 'GET', url: 'https://api.test.com' } }
        ]
      };

      expect(ParserFactory.isPostmanCollection(postmanData)).toBe(true);
    });

    test('should return false for data missing info', () => {
      const data = {
        item: [{ name: 'Test Request' }]
      };

      expect(ParserFactory.isPostmanCollection(data)).toBe(false);
    });

    test('should return false for data missing item', () => {
      const data = {
        info: { name: 'Test Collection' }
      };

      expect(ParserFactory.isPostmanCollection(data)).toBe(false);
    });

    test('should return false for data with non-array item', () => {
      const data = {
        info: { name: 'Test Collection' },
        item: 'not an array'
      };

      expect(ParserFactory.isPostmanCollection(data)).toBe(false);
    });

    test('should return false for null data', () => {
      expect(ParserFactory.isPostmanCollection(null)).toBe(false);
    });

    test('should return false for undefined data', () => {
      expect(ParserFactory.isPostmanCollection(undefined)).toBe(false);
    });
  });

  describe('isOpenApiSpec', () => {
    test('should return true for OpenAPI 3.0 spec', () => {
      const openApiData = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      expect(ParserFactory.isOpenApiSpec(openApiData)).toBe(true);
    });

    test('should return true for Swagger 2.0 spec', () => {
      const swaggerData = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      expect(ParserFactory.isOpenApiSpec(swaggerData)).toBe(true);
    });

    test('should return false for data missing openapi/swagger', () => {
      const data = {
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      expect(ParserFactory.isOpenApiSpec(data)).toBe(false);
    });

    test('should return false for data missing paths', () => {
      const data = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' }
      };

      expect(ParserFactory.isOpenApiSpec(data)).toBe(false);
    });

    test('should return false for null data', () => {
      expect(ParserFactory.isOpenApiSpec(null)).toBe(false);
    });

    test('should return false for undefined data', () => {
      expect(ParserFactory.isOpenApiSpec(undefined)).toBe(false);
    });
  });

  describe('getParserType', () => {
    test('should return "postman" for Postman collection', () => {
      const postmanData = {
        info: { name: 'Test Collection' },
        item: [
          { name: 'Test Request', request: { method: 'GET', url: 'https://api.test.com' } }
        ]
      };

      expect(ParserFactory.getParserType(postmanData)).toBe('postman');
    });

    test('should return "openapi" for OpenAPI spec', () => {
      const openApiData = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      expect(ParserFactory.getParserType(openApiData)).toBe('openapi');
    });

    test('should return "openapi" for Swagger spec', () => {
      const swaggerData = {
        swagger: '2.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      expect(ParserFactory.getParserType(swaggerData)).toBe('openapi');
    });

    test('should return "unknown" for invalid data', () => {
      const invalidData = {
        info: { name: 'Test' }
        // Missing required properties
      };

      expect(ParserFactory.getParserType(invalidData)).toBe('unknown');
    });

    test('should return "unknown" for null data', () => {
      expect(ParserFactory.getParserType(null)).toBe('unknown');
    });

    test('should return "unknown" for undefined data', () => {
      expect(ParserFactory.getParserType(undefined)).toBe('unknown');
    });
  });
});

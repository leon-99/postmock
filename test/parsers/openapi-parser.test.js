import { OpenApiParser } from '../../src/parsers/openapi-parser.js';

describe('OpenApiParser', () => {
  let parser;

  beforeEach(() => {
    parser = new OpenApiParser();
  });

  describe('parse', () => {
    test('should parse OpenAPI 3.0 specification', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { 
          title: 'Test API',
          version: '1.0.0'
        },
        paths: {
          '/users': {
            get: { 
              summary: 'Get users',
              operationId: 'getUsers',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      example: { users: [] },
                      schema: { type: 'array' }
                    }
                  }
                }
              }
            },
            post: { 
              summary: 'Create user',
              operationId: 'createUser',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      example: { id: 1, name: 'John' },
                      schema: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.type).toBe('openapi');
      expect(result.name).toBe('Test API');
      expect(result.version).toBe('1.0.0');
      expect(result.endpoints).toHaveLength(2);
      expect(result.endpoints[0]).toEqual({
        method: 'GET',
        path: '/users',
        examples: [{ users: [] }],
        schema: { type: 'array' },
        description: 'Get users',
        operationId: 'getUsers'
      });
      expect(result.endpoints[1]).toEqual({
        method: 'POST',
        path: '/users',
        examples: [{ id: 1, name: 'John' }],
        schema: { type: 'object' },
        description: 'Create user',
        operationId: 'createUser'
      });
    });

    test('should handle OpenAPI spec without examples', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: { 
              summary: 'Test endpoint',
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].examples).toBeNull();
      expect(result.endpoints[0].schema).toEqual({ type: 'string' });
    });

    test('should handle OpenAPI spec without responses', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: { summary: 'Test endpoint' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].examples).toBeNull();
      expect(result.endpoints[0].schema).toBeNull();
    });

    test('should handle empty paths', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {}
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(0);
    });

    test('should handle null paths', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: null
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(0);
    });

    test('should handle multiple HTTP methods per path', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/users': {
            get: { summary: 'Get users' },
            post: { summary: 'Create user' },
            put: { summary: 'Update user' },
            delete: { summary: 'Delete user' },
            patch: { summary: 'Patch user' },
            head: { summary: 'Head users' },
            options: { summary: 'Options users' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(7);
      expect(result.endpoints.map(ep => ep.method)).toEqual([
        'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
      ]);
    });

    test('should handle invalid HTTP methods', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            invalid: { summary: 'Invalid method' },
            get: { summary: 'Valid method' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].method).toBe('GET');
    });

    test('should extract examples from multiple response examples', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      examples: {
                        example1: { value: { id: 1 } },
                        example2: { value: { id: 2 } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('should handle mixed examples and example', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      example: { id: 1 },
                      examples: {
                        example1: { value: { id: 2 } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('should handle non-200 responses', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: {
              responses: {
                '400': {
                  content: {
                    'application/json': {
                      example: { error: 'Bad Request' }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toEqual([{ error: 'Bad Request' }]);
      expect(result.endpoints[0].schema).toBeNull();
    });

    test('should handle non-JSON content types', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  content: {
                    'text/plain': {
                      example: 'Hello World'
                    }
                  }
                }
              }
            }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toBeNull();
      expect(result.endpoints[0].schema).toBeNull();
    });
  });

  describe('isValidOpenApiSpec', () => {
    test('should return true for valid OpenAPI spec', () => {
      const validSpec = {
        openapi: '3.0.0',
        paths: {}
      };

      // Debug: Check if method exists and what it returns
      expect(typeof parser.isValidOpenApiSpec).toBe('function');
      const result = parser.isValidOpenApiSpec(validSpec);
      console.log('Method result:', result, typeof result);
      expect(result).toBe(true);
    });

    test('should return false for spec without openapi property', () => {
      const invalidSpec = {
        info: { title: 'Test API' },
        paths: {}
      };

      expect(parser.isValidOpenApiSpec(invalidSpec)).toBe(false);
    });

    test('should return true for spec without paths property', () => {
      const validSpec = {
        openapi: '3.0.0',
        info: { title: 'Test API' }
      };

      expect(parser.isValidOpenApiSpec(validSpec)).toBe(true);
    });

    test('should return false for null spec', () => {
      expect(parser.isValidOpenApiSpec(null)).toBe(false);
    });

    test('should return false for undefined spec', () => {
      expect(parser.isValidOpenApiSpec(undefined)).toBe(false);
    });
  });

  describe('isValidHttpMethod', () => {
    test('should return true for valid HTTP methods', () => {
      const validMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
      
      validMethods.forEach(method => {
        expect(parser.isValidHttpMethod(method)).toBe(true);
      });
    });

    test('should return false for invalid HTTP methods', () => {
      const invalidMethods = ['invalid', 'GET', 'POST', 'test', 'method'];
      
      invalidMethods.forEach(method => {
        expect(parser.isValidHttpMethod(method)).toBe(false);
      });
    });

    test('should handle case sensitivity', () => {
      expect(parser.isValidHttpMethod('GET')).toBe(false);
      expect(parser.isValidHttpMethod('get')).toBe(true);
    });
  });

  describe('error handling', () => {
    test('should throw error for invalid OpenAPI spec', () => {
      const invalidSpec = {
        info: { title: 'Test API' }
        // Missing openapi and paths properties
      };

      expect(() => parser.parse(invalidSpec)).toThrow('Invalid OpenAPI specification format');
    });

    test('should throw error for null spec', () => {
      expect(() => parser.parse(null)).toThrow('Invalid OpenAPI specification format');
    });

    test('should throw error for undefined spec', () => {
      expect(() => parser.parse(undefined)).toThrow('Invalid OpenAPI specification format');
    });
  });

  describe('edge cases', () => {
    test('should handle operation without summary or description', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: {}
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].description).toBe('GET /test');
    });

    test('should handle operation with only description', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: { description: 'Test description' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].description).toBe('Test description');
    });

    test('should handle operation without operationId', () => {
      const mockData = {
        openapi: '3.0.0',
        info: { title: 'Test API' },
        paths: {
          '/test': {
            get: { summary: 'Test' }
          }
        }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].operationId).toBeUndefined();
    });
  });
});

import { PostmanParser } from '../../src/parsers/postman-parser.js';

describe('PostmanParser', () => {
  let parser;

  beforeEach(() => {
    parser = new PostmanParser();
  });

  describe('parse', () => {
    test('should parse Postman collection with simple requests', () => {
      const mockData = {
        info: { name: 'Test Collection' },
        item: [
          {
            name: 'Get Users',
            request: {
              method: 'GET',
              url: {
                raw: 'https://api.test.com/users',
                path: ['users']
              }
            }
          },
          {
            name: 'Create User',
            request: {
              method: 'POST',
              url: {
                raw: 'https://api.test.com/users',
                path: ['users']
              }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.type).toBe('postman');
      expect(result.name).toBe('Test Collection');
      expect(result.endpoints).toHaveLength(2);
      expect(result.endpoints[0]).toEqual({
        method: 'GET',
        path: '/users',
        examples: null,
        schema: null,
        description: 'Get Users',
        originalRequest: mockData.item[0].request
      });
      expect(result.endpoints[1]).toEqual({
        method: 'POST',
        path: '/users',
        examples: null,
        schema: null,
        description: 'Create User',
        originalRequest: mockData.item[1].request
      });
    });

    test('should handle collection with nested folders', () => {
      const mockData = {
        info: { name: 'Nested Collection' },
        item: [
          {
            name: 'User Management',
            item: [
              {
                name: 'Get Users',
                request: {
                  method: 'GET',
                  url: { path: ['users'] }
                }
              },
              {
                name: 'Create User',
                request: {
                  method: 'POST',
                  url: { path: ['users'] }
                }
              }
            ]
          },
          {
            name: 'Product Management',
            item: [
              {
                name: 'Get Products',
                request: {
                  method: 'GET',
                  url: { path: ['products'] }
                }
              }
            ]
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(3);
      expect(result.endpoints.map(ep => ep.path)).toEqual(['/users', '/users', '/products']);
      expect(result.endpoints.map(ep => ep.method)).toEqual(['GET', 'POST', 'GET']);
    });

    test('should handle deeply nested folders', () => {
      const mockData = {
        info: { name: 'Deep Nested Collection' },
        item: [
          {
            name: 'API v1',
            item: [
              {
                name: 'Users',
                item: [
                  {
                    name: 'Authentication',
                    item: [
                      {
                        name: 'Login',
                        request: {
                          method: 'POST',
                          url: { path: ['auth', 'login'] }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(1);
      expect(result.endpoints[0].path).toBe('/auth/login');
      expect(result.endpoints[0].method).toBe('POST');
    });

    test('should handle mixed folders and requests', () => {
      const mockData = {
        info: { name: 'Mixed Collection' },
        item: [
          {
            name: 'Direct Request',
            request: {
              method: 'GET',
              url: { path: ['direct'] }
            }
          },
          {
            name: 'Folder with Requests',
            item: [
              {
                name: 'Nested Request',
                request: {
                  method: 'POST',
                  url: { path: ['nested'] }
                }
              }
            ]
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(2);
      expect(result.endpoints[0].path).toBe('/direct');
      expect(result.endpoints[1].path).toBe('/nested');
    });

    test('should handle empty collection', () => {
      const mockData = {
        info: { name: 'Empty Collection' },
        item: []
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(0);
    });

    test('should handle collection without items', () => {
      const mockData = {
        info: { name: 'No Items Collection' }
      };

      const result = parser.parse(mockData);

      expect(result.endpoints).toHaveLength(0);
    });

    test('should handle requests without method (default to GET)', () => {
      const mockData = {
        info: { name: 'Default Method Collection' },
        item: [
          {
            name: 'Default Method Request',
            request: {
              url: { path: ['default'] }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].method).toBe('GET');
      expect(result.endpoints[0].path).toBe('/default');
    });

    test('should handle requests with path variables', () => {
      const mockData = {
        info: { name: 'Path Variables Collection' },
        item: [
          {
            name: 'Get User by ID',
            request: {
              method: 'GET',
              url: {
                path: ['users', '{{userId}}'],
                variables: [
                  { key: 'userId', value: '123' }
                ]
              }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].path).toBe('/users/:userId');
    });

    test('should handle multiple path variables', () => {
      const mockData = {
        info: { name: 'Multiple Path Variables Collection' },
        item: [
          {
            name: 'Get User Post',
            request: {
              method: 'GET',
              url: {
                path: ['users', '{{userId}}', 'posts', '{{postId}}'],
                variables: [
                  { key: 'userId', value: '123' },
                  { key: 'postId', value: '456' }
                ]
              }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].path).toBe('/users/:userId/posts/:postId');
    });

    test('should handle requests with responses/examples', () => {
      const mockData = {
        info: { name: 'Examples Collection' },
        item: [
          {
            name: 'Get Users with Examples',
            request: {
              method: 'GET',
              url: { path: ['users'] }
            },
            response: [
              {
                body: JSON.stringify({ users: [{ id: 1, name: 'John' }] })
              },
              {
                body: JSON.stringify({ users: [{ id: 2, name: 'Jane' }] })
              }
            ]
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toEqual([
        { users: [{ id: 1, name: 'John' }] },
        { users: [{ id: 2, name: 'Jane' }] }
      ]);
    });

    test('should handle invalid JSON in response examples', () => {
      const mockData = {
        info: { name: 'Invalid JSON Collection' },
        item: [
          {
            name: 'Invalid JSON Response',
            request: {
              method: 'GET',
              url: { path: ['test'] }
            },
            response: [
              {
                body: 'invalid json string'
              },
              {
                body: JSON.stringify({ valid: 'json' })
              }
            ]
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toEqual([{ valid: 'json' }]);
    });

    test('should handle requests with no responses', () => {
      const mockData = {
        info: { name: 'No Responses Collection' },
        item: [
          {
            name: 'No Response Request',
            request: {
              method: 'GET',
              url: { path: ['test'] }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].examples).toBeNull();
    });
  });

  describe('isValidPostmanCollection', () => {
    test('should return true for valid Postman collection', () => {
      const validCollection = {
        info: { name: 'Test Collection' },
        item: []
      };

      expect(parser.isValidPostmanCollection(validCollection)).toBe(true);
    });

    test('should return false for collection without info property', () => {
      const invalidCollection = {
        item: []
      };

      expect(parser.isValidPostmanCollection(invalidCollection)).toBe(false);
    });

    test('should return true for collection without item property', () => {
      const validCollection = {
        info: { name: 'Test Collection' }
      };

      expect(parser.isValidPostmanCollection(validCollection)).toBe(true);
    });

    test('should return false for collection with non-array item property', () => {
      const invalidCollection = {
        info: { name: 'Test Collection' },
        item: 'not an array'
      };

      expect(parser.isValidPostmanCollection(invalidCollection)).toBe(false);
    });

    test('should return false for null collection', () => {
      expect(parser.isValidPostmanCollection(null)).toBe(false);
    });

    test('should return false for undefined collection', () => {
      expect(parser.isValidPostmanCollection(undefined)).toBe(false);
    });
  });

  describe('extractPath', () => {
    test('should extract path from URL path array', () => {
      const request = {
        url: {
          path: ['users', '123', 'posts']
        }
      };

      const path = parser.extractPath(request);
      expect(path).toBe('users/123/posts');
    });

    test('should handle single path segment', () => {
      const request = {
        url: {
          path: ['users']
        }
      };

      const path = parser.extractPath(request);
      expect(path).toBe('users');
    });

    test('should handle empty path array', () => {
      const request = {
        url: {
          path: []
        }
      };

      const path = parser.extractPath(request);
      expect(path).toBe('');
    });

    test('should handle missing path property', () => {
      const request = {
        url: {}
      };

      const path = parser.extractPath(request);
      expect(path).toBe('/');
    });

    test('should handle missing URL', () => {
      const request = {};

      const path = parser.extractPath(request);
      expect(path).toBe('/');
    });

    test('should handle path with variables', () => {
      const request = {
        url: {
          path: ['users', '{{userId}}'],
          variables: [
            { key: 'userId', value: '123' }
          ]
        }
      };

      const path = parser.extractPath(request);
      expect(path).toBe('users/:userId');
    });
  });

  describe('extractExamples', () => {
    test('should extract examples from response array', () => {
      const item = {
        response: [
          {
            body: JSON.stringify({ id: 1, name: 'John' })
          },
          {
            body: JSON.stringify({ id: 2, name: 'Jane' })
          }
        ]
      };

      const examples = parser.extractExamples(item);
      expect(examples).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]);
    });

    test('should handle empty response array', () => {
      const item = {
        response: []
      };

      const examples = parser.extractExamples(item);
      expect(examples).toBeNull();
    });

    test('should handle missing response property', () => {
      const item = {};

      const examples = parser.extractExamples(item);
      expect(examples).toBeNull();
    });

    test('should handle response without body', () => {
      const item = {
        response: [
          { status: '200' }
        ]
      };

      const examples = parser.extractExamples(item);
      expect(examples).toBeNull();
    });

    test('should handle invalid JSON in response body', () => {
      const item = {
        response: [
          {
            body: 'invalid json'
          }
        ]
      };

      const examples = parser.extractExamples(item);
      expect(examples).toBeNull();
    });
  });

  describe('buildFullPath', () => {
    test('should build full path from base path and endpoint path', () => {
      const basePath = '/api/v1';
      const path = '/users';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('/api/v1/users');
    });

    test('should handle base path without leading slash', () => {
      const basePath = 'api/v1';
      const path = '/users';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('api/v1/users');
    });

    test('should handle endpoint path without leading slash', () => {
      const basePath = '/api/v1';
      const path = 'users';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('/api/v1/users');
    });

    test('should handle base path ending with slash', () => {
      const basePath = '/api/v1/';
      const path = '/users';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('/api/v1/users');
    });

    test('should handle empty base path', () => {
      const basePath = '';
      const path = '/users';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('/users');
    });

    test('should handle empty endpoint path', () => {
      const basePath = '/api/v1';
      const path = '';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('/api/v1/');
    });

    test('should handle both paths without slashes', () => {
      const basePath = 'api/v1';
      const path = 'users';
      
      const fullPath = parser.buildFullPath(basePath, path);
      expect(fullPath).toBe('api/v1/users');
    });
  });

  describe('error handling', () => {
    test('should throw error for invalid Postman collection', () => {
      const invalidCollection = {
        info: { name: 'Test Collection' },
        item: 'not an array'
        // item property exists but is not an array
      };

      expect(() => parser.parse(invalidCollection)).toThrow('Invalid Postman collection format');
    });

    test('should throw error for null collection', () => {
      expect(() => parser.parse(null)).toThrow('Invalid Postman collection format');
    });

    test('should throw error for undefined collection', () => {
      expect(() => parser.parse(undefined)).toThrow('Invalid Postman collection format');
    });
  });

  describe('edge cases', () => {
    test('should handle request without name', () => {
      const mockData = {
        info: { name: 'No Name Collection' },
        item: [
          {
            request: {
              method: 'GET',
              url: { path: ['test'] }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].description).toBe('GET /test');
    });

    test('should handle request with empty name', () => {
      const mockData = {
        info: { name: 'Empty Name Collection' },
        item: [
          {
            name: '',
            request: {
              method: 'GET',
              url: { path: ['test'] }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].description).toBe('GET /test');
    });

    test('should handle request with null name', () => {
      const mockData = {
        info: { name: 'Null Name Collection' },
        item: [
          {
            name: null,
            request: {
              method: 'GET',
              url: { path: ['test'] }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result.endpoints[0].description).toBe('GET /test');
    });
  });
});

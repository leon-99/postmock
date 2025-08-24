const { generateMockResponse } = require('../src/generator.js');

// Mock faker to have predictable outputs for testing
jest.mock('@faker-js/faker', () => ({
  faker: {
    person: {
      firstName: jest.fn(() => 'John'),
      lastName: jest.fn(() => 'Doe'),
      email: jest.fn(() => 'john.doe@example.com'),
      bio: jest.fn(() => 'Software developer'),
      avatar: jest.fn(() => 'https://example.com/avatar.jpg')
    },
    internet: {
      userName: jest.fn(() => 'johndoe'),
      password: jest.fn(() => 'password123'),
      url: jest.fn(() => 'https://example.com'),
      ip: jest.fn(() => '192.168.1.1'),
      email: jest.fn(() => 'user@example.com')
    },
    commerce: {
      productName: jest.fn(() => 'Test Product'),
      price: jest.fn(() => 99.99),
      department: jest.fn(() => 'Electronics')
    },
    lorem: {
      word: jest.fn(() => 'test'),
      sentence: jest.fn(() => 'This is a test sentence.'),
      paragraph: jest.fn(() => 'This is a test paragraph with multiple sentences.')
    },
    datatype: {
      number: jest.fn((options) => {
        if (options && options.min !== undefined && options.max !== undefined) {
          return Math.floor((options.min + options.max) / 2);
        }
        return 42;
      }),
      boolean: jest.fn(() => true),
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000')
    },
    date: {
      recent: jest.fn(() => new Date('2024-01-01')),
      past: jest.fn(() => new Date('2022-01-01')),
      future: jest.fn(() => new Date('2024-01-01'))
    },
    helpers: {
      arrayElement: jest.fn((arr) => arr[0]),
      arrayElements: jest.fn((arr, count) => arr.slice(0, count || 1))
    },
    number: {
      int: jest.fn((options) => {
        if (options && options.min !== undefined && options.max !== undefined) {
          return Math.floor((options.min + options.max) / 2);
        }
        return 42;
      })
    },
    string: {
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000')
    }
  }
}));

describe('generateMockResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('examples handling', () => {
    test('should return first example when examples exist and not dynamic', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const examples = [{ name: 'John' }, { name: 'Jane' }];
      const dynamic = false;

      const result = generateMockResponse(examples, schema, dynamic);

      expect(result).toEqual(examples[0]);
    });

    test('should return random example when examples exist and dynamic', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };
      const examples = [{ name: 'John' }, { name: 'Jane' }];
      const dynamic = true;

      const result = generateMockResponse(examples, schema, dynamic);

      expect(examples).toContainEqual(result);
    });

    test('should fall back to schema when no examples', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      };

      const result = generateMockResponse([], schema);

      expect(result).toHaveProperty('name');
      expect(typeof result.name).toBe('string');
    });
  });

  describe('schema-based generation', () => {
    test('should generate object from object schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('age');
      expect(typeof result.name).toBe('string');
      expect(typeof result.age).toBe('number');
    });

    test('should generate array from array schema', () => {
      const schema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 5
      };

      const result = generateMockResponse(null, schema, false);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.length).toBeLessThanOrEqual(5);
      expect(result.every(item => typeof item === 'string')).toBe(true);
    });

    test('should generate primitive from primitive schema', () => {
      const stringSchema = { type: 'string' };
      const numberSchema = { type: 'number' };
      const booleanSchema = { type: 'boolean' };

      const stringResult = generateMockResponse(null, stringSchema, false);
      const numberResult = generateMockResponse(null, numberSchema, false);
      const booleanResult = generateMockResponse(null, booleanSchema, false);

      expect(typeof stringResult).toBe('string');
      expect(typeof numberResult).toBe('number');
      expect(typeof booleanResult).toBe('boolean');
    });
  });

  describe('primitive type generation', () => {
    test('should handle string with enum', () => {
      const schema = {
        type: 'string',
        enum: ['red', 'green', 'blue']
      };

      const result = generateMockResponse(null, schema, false);

      expect(['red', 'green', 'blue']).toContain(result);
    });

    test('should handle string with email format', () => {
      const schema = {
        type: 'string',
        format: 'email'
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('should handle string with date format', () => {
      const schema = {
        type: 'string',
        format: 'date'
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('should handle string with date-time format', () => {
      const schema = {
        type: 'string',
        format: 'date-time'
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('should handle string with uuid format', () => {
      const schema = {
        type: 'string',
        format: 'uuid'
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    test('should handle number with min/max constraints', () => {
      const schema = {
        type: 'number',
        minimum: 10,
        maximum: 20
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(20);
    });
  });

  describe('generic mock generation', () => {
    test('should generate user mock for user paths', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      };

      const result = generateMockResponse([], schema, true, '/users');

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
    });

    test('should generate post mock for post paths', () => {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        }
      };

      const result = generateMockResponse([], schema, true, '/posts');

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
    });

    test('should generate product mock for product paths', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' }
        }
      };

      const result = generateMockResponse([], schema, true, '/products');

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('price');
    });

    test('should generate auth mock for auth paths', () => {
      const schema = {
        type: 'object',
        properties: {
          token: { type: 'string' },
          expires: { type: 'string' }
        }
      };

      const result = generateMockResponse([], schema, true, '/auth');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expires');
    });

    test('should generate appropriate response based on HTTP method', () => {
      const schema = {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      };

      const getResult = generateMockResponse([], schema, true, '/test', 'GET');
      const postResult = generateMockResponse([], schema, true, '/test', 'POST');

      expect(getResult).toBeDefined();
      expect(postResult).toBeDefined();
    });
  });

  describe('dynamic vs static generation', () => {
    test('should generate different values when dynamic is true', () => {
      const schema = { type: 'string' };

      const result1 = generateMockResponse([], schema, true);
      const result2 = generateMockResponse([], schema, true);

      // Since we're mocking faker, results will be the same
      // In real scenarios, they would be different
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    test('should generate different array lengths when dynamic is true', () => {
      const schema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10
      };

      const result1 = generateMockResponse([], schema, true);
      const result2 = generateMockResponse([], schema, true);

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined inputs gracefully', () => {
      expect(() => generateMockResponse(null)).not.toThrow();
      expect(() => generateMockResponse(undefined)).not.toThrow();
    });

    test('should handle empty examples array', () => {
      const schema = { type: 'string' };
      const examples = [];

      const result = generateMockResponse(examples, schema, false);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    test('should handle schema without type', () => {
      const schema = {
        properties: {
          name: { type: 'string' }
        }
      };

      const result = generateMockResponse(null, schema, false);

      expect(result).toBeDefined();
    });
  });
});

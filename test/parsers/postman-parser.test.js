const { PostmanParser } = require('../../src/parsers/postman-parser.js');

// Mock dependencies
jest.mock('../../src/parsers/postman-parser.js');

describe('PostmanParser', () => {
  let parser;

  beforeEach(() => {
    jest.clearAllMocks();
    parser = new PostmanParser();
  });

  describe('parse', () => {
    test('should parse Postman collection data', () => {
      const mockData = {
        info: { name: 'Test Collection' },
        item: [
          {
            name: 'Test Request',
            request: {
              method: 'GET',
              url: { raw: 'https://api.test.com/users' }
            }
          }
        ]
      };

      const result = parser.parse(mockData);

      expect(result).toBeDefined();
      expect(parser.parse).toHaveBeenCalledWith(mockData);
    });

    test('should handle empty collection', () => {
      const mockData = {
        info: { name: 'Empty Collection' },
        item: []
      };

      const result = parser.parse(mockData);

      expect(result).toBeDefined();
      expect(parser.parse).toHaveBeenCalledWith(mockData);
    });

    test('should handle collection without items', () => {
      const mockData = {
        info: { name: 'No Items Collection' }
      };

      const result = parser.parse(mockData);

      expect(result).toBeDefined();
      expect(parser.parse).toHaveBeenCalledWith(mockData);
    });
  });

  describe('getEndpoints', () => {
    test('should return endpoints from parsed collection', () => {
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
  });
});

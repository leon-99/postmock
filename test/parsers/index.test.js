const { PostmanParser, OpenApiParser, ParserFactory } = require('../../src/parsers/index.js');

describe('Parsers Index', () => {
  test('should export PostmanParser', () => {
    expect(PostmanParser).toBeDefined();
    expect(typeof PostmanParser).toBe('function');
  });

  test('should export OpenApiParser', () => {
    expect(OpenApiParser).toBeDefined();
    expect(typeof OpenApiParser).toBe('function');
  });

  test('should export ParserFactory', () => {
    expect(ParserFactory).toBeDefined();
    expect(typeof ParserFactory).toBe('function');
  });

  test('should export ParserFactory as a class with static methods', () => {
    expect(ParserFactory.createParser).toBeDefined();
    expect(typeof ParserFactory.createParser).toBe('function');
    
    expect(ParserFactory.isPostmanCollection).toBeDefined();
    expect(typeof ParserFactory.isPostmanCollection).toBe('function');
    
    expect(ParserFactory.isOpenApiSpec).toBeDefined();
    expect(typeof ParserFactory.isOpenApiSpec).toBe('function');
    
    expect(ParserFactory.getParserType).toBeDefined();
    expect(typeof ParserFactory.getParserType).toBe('function');
  });
});

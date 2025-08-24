const { parseInput } = require('../src/parser.js');
const { FileReader } = require('../src/utils/file-reader.js');
const { ParserFactory } = require('../src/parsers/parser-factory.js');

// Mock dependencies
jest.mock('../src/utils/file-reader.js');
jest.mock('../src/parsers/parser-factory.js');

describe('parseInput', () => {
  let mockParser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock parser with the required methods
    mockParser = {
      parse: jest.fn(),
      getEndpoints: jest.fn().mockReturnValue([])
    };

    // Ensure ParserFactory.createParser is properly mocked
    ParserFactory.createParser = jest.fn();
    
    FileReader.readFile.mockResolvedValue(mockData);
    ParserFactory.createParser.mockReturnValue(mockParser);
  });

  const mockData = { info: { title: 'Test API' } };

  describe('successful parsing', () => {
    test('should successfully parse input file', async () => {
      const result = await parseInput('test-file.json');

      expect(FileReader.readFile).toHaveBeenCalledWith('test-file.json');
      expect(ParserFactory.createParser).toHaveBeenCalledWith(mockData);
      expect(mockParser.parse).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    test('should throw error when file reading fails', async () => {
      const errorMessage = 'File not found';
      FileReader.readFile.mockRejectedValue(new Error(errorMessage));

      await expect(parseInput('nonexistent-file.json'))
        .rejects
        .toThrow('File not found');

      expect(FileReader.readFile).toHaveBeenCalledWith('nonexistent-file.json');
      expect(ParserFactory.createParser).not.toHaveBeenCalled();
    });

    test('should throw error when parser creation fails', async () => {
      ParserFactory.createParser.mockImplementation(() => {
        throw new Error('Invalid format');
      });

      await expect(parseInput('test-file.json'))
        .rejects
        .toThrow('Invalid format');

      expect(FileReader.readFile).toHaveBeenCalledWith('test-file.json');
      expect(ParserFactory.createParser).toHaveBeenCalledWith(mockData);
    });

    test('should throw error when parsing fails', async () => {
      const parseError = new Error('Parse failed');
      mockParser.parse.mockImplementation(() => {
        throw parseError;
      });

      await expect(parseInput('test-file.json'))
        .rejects
        .toThrow('Parse failed');

      expect(FileReader.readFile).toHaveBeenCalledWith('test-file.json');
      expect(ParserFactory.createParser).toHaveBeenCalledWith(mockData);
      expect(mockParser.parse).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle empty file content', async () => {
      const emptyData = {};
      FileReader.readFile.mockResolvedValue(emptyData);

      const result = await parseInput('empty-file.json');

      expect(FileReader.readFile).toHaveBeenCalledWith('empty-file.json');
      expect(ParserFactory.createParser).toHaveBeenCalledWith(emptyData);
      expect(result).toBeDefined();
    });

    test('should handle null file content', async () => {
      const nullData = null;
      FileReader.readFile.mockResolvedValue(nullData);

      const result = await parseInput('null-file.json');

      expect(FileReader.readFile).toHaveBeenCalledWith('null-file.json');
      expect(ParserFactory.createParser).toHaveBeenCalledWith(nullData);
      expect(result).toBeDefined();
    });
  });
});

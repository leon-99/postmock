const { FileReader } = require('../src/utils/file-reader.js');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('js-yaml');

describe('FileReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readFile', () => {
    test('should successfully read and parse JSON file', async () => {
      const mockContent = '{"name": "test", "value": 123}';
      const mockData = { name: 'test', value: 123 };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);
      path.extname.mockReturnValue('.json');
      
      const result = await FileReader.readFile('test.json');
      
      expect(fs.existsSync).toHaveBeenCalledWith('test.json');
      expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
      expect(path.extname).toHaveBeenCalledWith('test.json');
      expect(result).toEqual(mockData);
    });

    test('should successfully read and parse YAML file', async () => {
      const mockContent = 'name: test\nvalue: 123';
      const mockData = { name: 'test', value: 123 };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);
      path.extname.mockReturnValue('.yaml');
      yaml.load.mockReturnValue(mockData);
      
      const result = await FileReader.readFile('test.yaml');
      
      expect(fs.existsSync).toHaveBeenCalledWith('test.yaml');
      expect(fs.readFileSync).toHaveBeenCalledWith('test.yaml', 'utf-8');
      expect(path.extname).toHaveBeenCalledWith('test.yaml');
      expect(yaml.load).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockData);
    });

    test('should successfully read and parse YML file', async () => {
      const mockContent = 'name: test\nvalue: 123';
      const mockData = { name: 'test', value: 123 };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);
      path.extname.mockReturnValue('.yml');
      yaml.load.mockReturnValue(mockData);
      
      const result = await FileReader.readFile('test.yml');
      
      expect(fs.existsSync).toHaveBeenCalledWith('test.yml');
      expect(fs.readFileSync).toHaveBeenCalledWith('test.yml', 'utf-8');
      expect(path.extname).toHaveBeenCalledWith('test.yml');
      expect(yaml.load).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockData);
    });

    test('should throw error when file does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      
      await expect(FileReader.readFile('nonexistent.json'))
        .rejects
        .toThrow('Input file not found: nonexistent.json');
      
      expect(fs.existsSync).toHaveBeenCalledWith('nonexistent.json');
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    test('should throw error for unsupported file format', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('some content');
      path.extname.mockReturnValue('.txt');
      
      await expect(FileReader.readFile('test.txt'))
        .rejects
        .toThrow('Unsupported file format: .txt. Use .json, .yaml, or .yml');
      
      expect(fs.existsSync).toHaveBeenCalledWith('test.txt');
      expect(fs.readFileSync).toHaveBeenCalledWith('test.txt', 'utf-8');
      expect(path.extname).toHaveBeenCalledWith('test.txt');
    });
  });

  describe('fileExists', () => {
    test('should return true when file exists', () => {
      fs.existsSync.mockReturnValue(true);
      
      const result = FileReader.fileExists('test.json');
      
      expect(fs.existsSync).toHaveBeenCalledWith('test.json');
      expect(result).toBe(true);
    });

    test('should return false when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      const result = FileReader.fileExists('nonexistent.json');
      
      expect(fs.existsSync).toHaveBeenCalledWith('nonexistent.json');
      expect(result).toBe(false);
    });
  });

  describe('readFileContent', () => {
    test('should successfully read file content', () => {
      const mockContent = 'file content here';
      fs.readFileSync.mockReturnValue(mockContent);
      
      const result = FileReader.readFileContent('test.json');
      
      expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
      expect(result).toBe(mockContent);
    });

    test('should throw error when file reading fails', () => {
      const errorMessage = 'Permission denied';
      fs.readFileSync.mockImplementation(() => {
        throw new Error(errorMessage);
      });
      
      expect(() => FileReader.readFileContent('test.json'))
        .toThrow('Failed to read file: Permission denied');
      
      expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
    });
  });

  describe('getFileExtension', () => {
    test('should return lowercase file extension', () => {
      path.extname.mockReturnValue('.JSON');
      
      const result = FileReader.getFileExtension('test.JSON');
      
      expect(path.extname).toHaveBeenCalledWith('test.JSON');
      expect(result).toBe('.json');
    });

    test('should handle files without extension', () => {
      path.extname.mockReturnValue('');
      
      const result = FileReader.getFileExtension('test');
      
      expect(path.extname).toHaveBeenCalledWith('test');
      expect(result).toBe('');
    });
  });

  describe('parseFileContent', () => {
    test('should parse JSON content correctly', () => {
      const content = '{"test": "value"}';
      const result = FileReader.parseFileContent(content, '.json', 'test.json');
      
      expect(result).toEqual({ test: 'value' });
    });

    test('should parse YAML content correctly', () => {
      const content = 'test: value';
      const mockData = { test: 'value' };
      yaml.load.mockReturnValue(mockData);
      
      const result = FileReader.parseFileContent(content, '.yaml', 'test.yaml');
      
      expect(yaml.load).toHaveBeenCalledWith(content);
      expect(result).toEqual(mockData);
    });

    test('should throw error for invalid JSON', () => {
      const content = '{"invalid": json}';
      
      expect(() => FileReader.parseFileContent(content, '.json', 'test.json'))
        .toThrow('Failed to parse .json file: Invalid JSON: Unexpected token \'j\', "{"invalid": json}" is not valid JSON');
    });

    test('should throw error for invalid YAML', () => {
      const content = 'invalid: yaml: content:';
      yaml.load.mockImplementation(() => {
        throw new Error('YAML parse error');
      });
      
      expect(() => FileReader.parseFileContent(content, '.yaml', 'test.yaml'))
        .toThrow('Failed to parse .yaml file: Invalid YAML: YAML parse error');
    });
  });

  describe('parseJson', () => {
    test('should parse valid JSON', () => {
      const content = '{"name": "test", "number": 42}';
      const result = FileReader.parseJson(content);
      
      expect(result).toEqual({ name: 'test', number: 42 });
    });

    test('should throw error for invalid JSON', () => {
      const content = '{"name": "test", "number": 42,}';
      
      expect(() => FileReader.parseJson(content))
        .toThrow('Invalid JSON: Expected double-quoted property name in JSON at position 30 (line 1 column 31)');
    });
  });

  describe('parseYaml', () => {
    test('should parse valid YAML', () => {
      const content = 'name: test\nnumber: 42';
      const mockData = { name: 'test', number: 42 };
      yaml.load.mockReturnValue(mockData);
      
      const result = FileReader.parseYaml(content);
      
      expect(yaml.load).toHaveBeenCalledWith(content);
      expect(result).toEqual(mockData);
    });

    test('should throw error for invalid YAML', () => {
      const content = 'invalid: yaml: content:';
      yaml.load.mockImplementation(() => {
        throw new Error('YAML parse error');
      });
      
      expect(() => FileReader.parseYaml(content))
        .toThrow('Invalid YAML: YAML parse error');
    });
  });

  describe('getFileSize', () => {
    test('should return formatted file size', () => {
      const mockStats = { size: 1024 };
      fs.statSync.mockReturnValue(mockStats);
      
      const result = FileReader.getFileSize('test.json');
      
      expect(fs.statSync).toHaveBeenCalledWith('test.json');
      expect(result).toBe('1 KB');
    });

    test('should return "Unknown" when file stats fail', () => {
      fs.statSync.mockImplementation(() => {
        throw new Error('Stats error');
      });
      
      const result = FileReader.getFileSize('test.json');
      
      expect(fs.statSync).toHaveBeenCalledWith('test.json');
      expect(result).toBe('Unknown');
    });
  });

  describe('formatBytes', () => {
    test('should format 0 bytes', () => {
      const result = FileReader.formatBytes(0);
      expect(result).toBe('0 Bytes');
    });

    test('should format bytes', () => {
      const result = FileReader.formatBytes(512);
      expect(result).toBe('512 Bytes');
    });

    test('should format kilobytes', () => {
      const result = FileReader.formatBytes(1024);
      expect(result).toBe('1 KB');
    });

    test('should format megabytes', () => {
      const result = FileReader.formatBytes(1048576);
      expect(result).toBe('1 MB');
    });

    test('should format gigabytes', () => {
      const result = FileReader.formatBytes(1073741824);
      expect(result).toBe('1 GB');
    });

    test('should handle decimal values', () => {
      const result = FileReader.formatBytes(1536);
      expect(result).toBe('1.5 KB');
    });
  });
});

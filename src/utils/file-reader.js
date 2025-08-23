/**
 * File Reader Utility
 * Handles file reading and format detection
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export class FileReader {
  /**
   * Read and parse a file based on its extension
   * @param {string} filePath - Path to the file
   * @returns {Object} Parsed file content
   */
  static async readFile(filePath) {
    if (!this.fileExists(filePath)) {
      throw new Error(`Input file not found: ${filePath}`);
    }

    const fileContent = this.readFileContent(filePath);
    const fileExt = this.getFileExtension(filePath);
    
    return this.parseFileContent(fileContent, fileExt, filePath);
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to the file
   * @returns {boolean} True if file exists
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Read file content as string
   * @param {string} filePath - Path to the file
   * @returns {string} File content
   */
  static readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Get file extension
   * @param {string} filePath - Path to the file
   * @returns {string} File extension (lowercase)
   */
  static getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
  }

  /**
   * Parse file content based on file extension
   * @param {string} content - File content
   * @param {string} extension - File extension
   * @param {string} filePath - Original file path (for error messages)
   * @returns {Object} Parsed content
   */
  static parseFileContent(content, extension, filePath) {
    try {
      switch (extension) {
        case '.json':
          return this.parseJson(content);
        case '.yaml':
        case '.yml':
          return this.parseYaml(content);
        default:
          throw new Error(`Unsupported file format: ${extension}. Use .json, .yaml, or .yml`);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${extension} file: ${error.message}`);
    }
  }

  /**
   * Parse JSON content
   * @param {string} content - JSON content
   * @returns {Object} Parsed JSON
   */
  static parseJson(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  /**
   * Parse YAML content
   * @param {string} content - YAML content
   * @returns {Object} Parsed YAML
   */
  static parseYaml(content) {
    try {
      return yaml.load(content);
    } catch (error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }
  }

  /**
   * Get file size in human readable format
   * @param {string} filePath - Path to the file
   * @returns {string} File size
   */
  static getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return this.formatBytes(stats.size);
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted size
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

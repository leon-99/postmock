/**
 * Parser Factory
 * Determines which parser to use based on file content
 */

import { PostmanParser } from './postman-parser.js';
import { OpenApiParser } from './openapi-parser.js';

export class ParserFactory {
  /**
   * Create the appropriate parser based on file content
   * @param {Object} data - Parsed file data
   * @returns {Object} Parser instance
   */
  static createParser(data) {
    if (this.isPostmanCollection(data)) {
      return new PostmanParser();
    }
    
    if (this.isOpenApiSpec(data)) {
      return new OpenApiParser();
    }
    
    throw new Error('File is neither a valid Postman collection nor OpenAPI spec');
  }

  /**
   * Check if data is a Postman collection
   * @param {Object} data - Data to check
   * @returns {boolean} True if Postman collection
   */
  static isPostmanCollection(data) {
    return data.info && data.item && Array.isArray(data.item);
  }

  /**
   * Check if data is an OpenAPI specification
   * @param {Object} data - Data to check
   * @returns {boolean} True if OpenAPI spec
   */
  static isOpenApiSpec(data) {
    return data.openapi && data.paths;
  }

  /**
   * Get parser type for data
   * @param {Object} data - Data to analyze
   * @returns {string} Parser type ('postman' or 'openapi')
   */
  static getParserType(data) {
    if (this.isPostmanCollection(data)) {
      return 'postman';
    }
    
    if (this.isOpenApiSpec(data)) {
      return 'openapi';
    }
    
    return 'unknown';
  }
}

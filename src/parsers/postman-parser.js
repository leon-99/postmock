/**
 * Postman Collection Parser
 * Handles parsing of Postman collection files (.json)
 */

export class PostmanParser {
  constructor() {
    this.endpoints = [];
  }

  /**
   * Parse a Postman collection
   * @param {Object} data - Parsed JSON data from Postman collection
   * @returns {Object} Parsed API specification
   */
  parse(data) {
    this.endpoints = [];
    
    if (!this.isValidPostmanCollection(data)) {
      throw new Error('Invalid Postman collection format');
    }

    console.log('🔍 Parsing Postman collection:', data.info?.name);
    console.log('📁 Collection items count:', data.item?.length || 0);

    this.processItems(data.item);
    
    this.logResults();
    
    return {
      type: 'postman',
      name: data.info?.name || 'Postman Collection',
      endpoints: this.endpoints
    };
  }

  /**
   * Check if data is a valid Postman collection
   * @param {Object} data - Data to validate
   * @returns {boolean} True if valid Postman collection
   */
  isValidPostmanCollection(data) {
    return data.info && data.item && Array.isArray(data.item);
  }

  /**
   * Recursively process collection items (handles nested folders)
   * @param {Array} items - Array of collection items
   * @param {string} basePath - Base path for current level
   */
  processItems(items, basePath = '') {
    items.forEach(item => {
      if (item.request) {
        this.processRequest(item, basePath);
      } else if (item.item && Array.isArray(item.item)) {
        this.processFolder(item, basePath);
      }
    });
  }

  /**
   * Process a single request item
   * @param {Object} item - Request item
   * @param {string} basePath - Base path
   */
  processRequest(item, basePath) {
    const request = item.request;
    const method = request.method || 'GET';
    let path = this.extractPath(request);
    
    const examples = this.extractExamples(item);
    
    this.endpoints.push({
      method: method.toUpperCase(),
      path: this.buildFullPath(basePath, path),
      examples: examples.length > 0 ? examples : null,
      schema: null, // Postman doesn't have schemas
      description: item.name || `${method} ${path}`,
      originalRequest: request
    });
  }

  /**
   * Process a folder item
   * @param {Object} item - Folder item
   * @param {string} basePath - Base path
   */
  processFolder(item, basePath) {
    this.processItems(item.item, basePath);
  }

  /**
   * Extract path from request URL
   * @param {Object} request - Request object
   * @returns {string} Extracted path
   */
  extractPath(request) {
    if (!request.url || !request.url.path) {
      return '/';
    }
    
    let path = request.url.path.join('/');
    
    // Handle path variables
    if (request.url.variables) {
      request.url.variables.forEach(variable => {
        path = path.replace(`{{${variable.key}}}`, `:${variable.key}`);
      });
    }
    
    return path;
  }

  /**
   * Extract examples from responses
   * @param {Object} item - Collection item
   * @returns {Array} Array of example responses
   */
  extractExamples(item) {
    const examples = [];
    
    if (item.response) {
      item.response.forEach(response => {
        if (response.body) {
          try {
            const body = JSON.parse(response.body);
            examples.push(body);
          } catch (e) {
            // Skip invalid JSON examples
          }
        }
      });
    }
    
    return examples;
  }

  /**
   * Build full path combining base path and endpoint path
   * @param {string} basePath - Base path
   * @param {string} path - Endpoint path
   * @returns {string} Full path
   */
  buildFullPath(basePath, path) {
    if (!basePath) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    
    const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${cleanBase}${cleanPath}`;
  }

  /**
   * Log parsing results
   */
  logResults() {
    console.log(`🎯 Total endpoints found: ${this.endpoints.length}`);
    this.endpoints.forEach((ep, i) => {
      console.log(`  ${i + 1}. ${ep.method} ${ep.path}`);
    });
  }
}

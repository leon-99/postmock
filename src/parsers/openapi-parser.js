/**
 * OpenAPI/Swagger Parser
 * Handles parsing of OpenAPI specification files (.yaml/.yml/.json)
 */

export class OpenApiParser {
  constructor() {
    this.endpoints = [];
  }

  /**
   * Parse an OpenAPI specification
   * @param {Object} data - Parsed YAML/JSON data from OpenAPI spec
   * @returns {Object} Parsed API specification
   */
  parse(data) {
    this.endpoints = [];
    
    if (!this.isValidOpenApiSpec(data)) {
      throw new Error('Invalid OpenAPI specification format');
    }

    console.log('🔍 Parsing OpenAPI spec:', data.info?.title);
    console.log('📁 OpenAPI version:', data.openapi);
    console.log('📊 Paths count:', Object.keys(data.paths || {}).length);

    this.processPaths(data.paths);
    
    this.logResults();
    
    return {
      type: 'openapi',
      name: data.info?.title || 'OpenAPI Spec',
      version: data.info?.version || '1.0.0',
      endpoints: this.endpoints
    };
  }

  /**
   * Check if data is a valid OpenAPI specification
   * @param {Object} data - Data to validate
   * @returns {boolean} True if valid OpenAPI spec
   */
  isValidOpenApiSpec(data) {
    return data.openapi && data.paths;
  }

  /**
   * Process all paths in the OpenAPI spec
   * @param {Object} paths - Paths object from OpenAPI spec
   */
  processPaths(paths) {
    if (!paths) return;

    Object.entries(paths).forEach(([path, pathItem]) => {
      this.processPathItem(path, pathItem);
    });
  }

  /**
   * Process a single path item
   * @param {string} path - API path
   * @param {Object} pathItem - Path item object
   */
  processPathItem(path, pathItem) {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (this.isValidHttpMethod(method)) {
        this.processOperation(path, method, operation);
      }
    });
  }

  /**
   * Process a single operation
   * @param {string} path - API path
   * @param {string} method - HTTP method
   * @param {Object} operation - Operation object
   */
  processOperation(path, method, operation) {
    const examples = this.extractExamples(operation);
    const schema = this.extractSchema(operation);

    this.endpoints.push({
      method: method.toUpperCase(),
      path: path,
      examples: examples.length > 0 ? examples : null,
      schema: schema,
      description: operation.summary || operation.description || `${method.toUpperCase()} ${path}`,
      operationId: operation.operationId
    });
  }

  /**
   * Check if method is a valid HTTP method
   * @param {string} method - Method to validate
   * @returns {boolean} True if valid HTTP method
   */
  isValidHttpMethod(method) {
    return ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method);
  }

  /**
   * Extract examples from operation responses
   * @param {Object} operation - Operation object
   * @returns {Array} Array of example responses
   */
  extractExamples(operation) {
    const examples = [];
    
    if (!operation.responses) return examples;

    Object.values(operation.responses).forEach(response => {
      if (response.content && response.content['application/json']) {
        const content = response.content['application/json'];
        
        if (content.example) {
          examples.push(content.example);
        }
        
        if (content.examples) {
          Object.values(content.examples).forEach(example => {
            if (example.value) {
              examples.push(example.value);
            }
          });
        }
      }
    });
    
    return examples;
  }

  /**
   * Extract schema from operation responses
   * @param {Object} operation - Operation object
   * @returns {Object|null} Response schema or null
   */
  extractSchema(operation) {
    if (!operation.responses || !operation.responses['200']) {
      return null;
    }
    
    const response = operation.responses['200'];
    if (response.content && response.content['application/json']) {
      return response.content['application/json'].schema;
    }
    
    return null;
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

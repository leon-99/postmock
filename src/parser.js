import fs from 'fs';
import path from 'path';
import pkg from 'postman-collection';
const { Collection } = pkg;
import yaml from 'js-yaml';

export async function parseInput(inputFile) {
  try {
    // Check if file exists
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    const fileContent = fs.readFileSync(inputFile, 'utf-8');
    const fileExt = path.extname(inputFile).toLowerCase();

    // Parse based on file extension
    if (fileExt === '.json') {
      return parseJsonInput(fileContent, inputFile);
    } else if (fileExt === '.yaml' || fileExt === '.yml') {
      return parseYamlInput(fileContent, inputFile);
    } else {
      throw new Error(`Unsupported file format: ${fileExt}. Use .json, .yaml, or .yml`);
    }
  } catch (error) {
    throw new Error(`Failed to parse input file: ${error.message}`);
  }
}

function parseJsonInput(content, filename) {
  try {
    const data = JSON.parse(content);
    
    // Check if it's a Postman collection
    if (isPostmanCollection(data)) {
      return parsePostmanCollection(data);
    }
    
    // Check if it's an OpenAPI spec
    if (isOpenApiSpec(data)) {
      return parseOpenApiSpec(data);
    }
    
    throw new Error('File is neither a valid Postman collection nor OpenAPI spec');
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

function parseYamlInput(content, filename) {
  try {
    const data = yaml.load(content);
    
    if (isOpenApiSpec(data)) {
      return parseOpenApiSpec(data);
    }
    
    throw new Error('YAML file is not a valid OpenAPI spec');
  } catch (error) {
    throw new Error(`Invalid YAML: ${error.message}`);
  }
}

function isPostmanCollection(data) {
  return data.info && data.item && Array.isArray(data.item);
}

function isOpenApiSpec(data) {
  return data.openapi && data.paths;
}

function parsePostmanCollection(data) {
  console.log('🔍 Parsing Postman collection:', data.info?.name);
  console.log('📁 Collection items count:', data.item?.length || 0);
  
  const endpoints = [];

  // Recursively process collection items (handles nested folders)
  function processItems(items, basePath = '') {
    console.log(`📂 Processing items at level: ${basePath || 'root'}, count: ${items.length || 0}`);
    
    items.forEach(item => {
      console.log(`  📋 Item: ${item.name}, has request: ${!!item.request}, has sub-items: ${!!(item.item && Array.isArray(item.item))}`);
      
      if (item.request) {
        // This is a request item
        const request = item.request;
        const method = request.method || 'GET';
        let path = request.url ? request.url.path.join('/') : '/';
        
        console.log(`    ✅ Found request: ${method} ${path}`);
        
        // Handle path variables
        if (request.url && request.url.variables) {
          request.url.variables.forEach(variable => {
            path = path.replace(`{{${variable.key}}}`, `:${variable.key}`);
          });
        }

        // Extract examples from responses
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

        endpoints.push({
          method: method.toUpperCase(),
          path: basePath + '/' + path,
          examples: examples.length > 0 ? examples : null,
          schema: null, // Postman doesn't have schemas
          description: item.name || `${method} ${path}`,
          originalRequest: request
        });
      } else if (item.item && Array.isArray(item.item)) {
        // This is a folder item, recursively process its contents
        console.log(`    📁 Processing folder: ${item.name}`);
        processItems(item.item, basePath);
      }
    });
  }

  processItems(data.item);
  
  console.log(`🎯 Total endpoints found: ${endpoints.length}`);
  endpoints.forEach((ep, i) => {
    console.log(`  ${i + 1}. ${ep.method} ${ep.path}`);
  });
  
  return {
    type: 'postman',
    name: data.info?.name || 'Postman Collection',
    endpoints: endpoints
  };
}

function parseOpenApiSpec(data) {
  const endpoints = [];
  const paths = data.paths || {};

  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
        // Extract examples
        const examples = [];
        if (operation.responses) {
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
        }

        // Extract schema from response
        let schema = null;
        if (operation.responses && operation.responses['200']) {
          const response = operation.responses['200'];
          if (response.content && response.content['application/json']) {
            schema = response.content['application/json'].schema;
          }
        }

        endpoints.push({
          method: method.toUpperCase(),
          path: path,
          examples: examples.length > 0 ? examples : null,
          schema: schema,
          description: operation.summary || operation.description || `${method.toUpperCase()} ${path}`,
          operationId: operation.operationId
        });
      }
    });
  });

  return {
    type: 'openapi',
    name: data.info?.title || 'OpenAPI Spec',
    version: data.info?.version || '1.0.0',
    endpoints: endpoints
  };
}

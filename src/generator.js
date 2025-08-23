import { faker } from '@faker-js/faker';

export function generateMockResponse(examples, schema, dynamic, request) {
  // If examples exist and we're not in dynamic mode, use them
  if (examples && examples.length > 0 && !dynamic) {
    return examples[0];
  }

  // If examples exist and we're in dynamic mode, randomly select one
  if (examples && examples.length > 0 && dynamic) {
    return examples[Math.floor(Math.random() * examples.length)];
  }

  // If we have a schema, generate based on it
  if (schema) {
    return generateFromSchema(schema, dynamic);
  }

  // Fallback to generic mock data
  return generateGenericMock(dynamic, request);
}

function generateFromSchema(schema, dynamic) {
  if (schema.type === 'object') {
    return generateObjectFromSchema(schema, dynamic);
  } else if (schema.type === 'array') {
    return generateArrayFromSchema(schema, dynamic);
  } else {
    return generatePrimitiveFromSchema(schema, dynamic);
  }
}

function generateObjectFromSchema(schema, dynamic) {
  const result = {};
  
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      result[key] = generateFromSchema(propSchema, dynamic);
    });
  }
  
  return result;
}

function generateArrayFromSchema(schema, dynamic) {
  const minItems = schema.minItems || 1;
  const maxItems = schema.maxItems || 5;
  const count = dynamic ? 
    Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems : 
    minItems;
  
  const items = [];
  for (let i = 0; i < count; i++) {
    if (schema.items) {
      items.push(generateFromSchema(schema.items, dynamic));
    } else {
      items.push(generateGenericValue(dynamic));
    }
  }
  
  return items;
}

function generatePrimitiveFromSchema(schema, dynamic) {
  const type = schema.type || 'string';
  
  switch (type) {
    case 'string':
      if (schema.enum) {
        return dynamic ? 
          schema.enum[Math.floor(Math.random() * schema.enum.length)] : 
          schema.enum[0];
      }
      if (schema.format === 'email') {
        return dynamic ? faker.internet.email() : 'user@example.com';
      }
      if (schema.format === 'date') {
        return dynamic ? faker.date.recent().toISOString().split('T')[0] : '2024-01-01';
      }
      if (schema.format === 'date-time') {
        return dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z';
      }
      if (schema.format === 'uuid') {
        return dynamic ? faker.string.uuid() : '123e4567-e89b-12d3-a456-426614174000';
      }
      return dynamic ? faker.lorem.sentence() : 'Sample string';
      
    case 'number':
    case 'integer':
      if (schema.minimum !== undefined && schema.maximum !== undefined) {
        return dynamic ? 
          Math.floor(Math.random() * (schema.maximum - schema.minimum + 1)) + schema.minimum : 
          schema.minimum;
      }
      return dynamic ? faker.number.int({ min: 1, max: 1000 }) : 42;
      
    case 'boolean':
      return dynamic ? faker.datatype.boolean() : true;
      
    default:
      return generateGenericValue(dynamic);
  }
}

function generateGenericMock(dynamic, request) {
  // Try to generate context-aware mock based on the request
  const path = request?.path || '';
  const method = request?.method || 'GET';
  
  // Common API patterns
  if (path.includes('/users') || path.includes('/user')) {
    return generateUserMock(dynamic);
  }
  
  if (path.includes('/posts') || path.includes('/post')) {
    return generatePostMock(dynamic);
  }
  
  if (path.includes('/products') || path.includes('/product')) {
    return generateProductMock(dynamic);
  }
  
  if (path.includes('/auth') || path.includes('/login')) {
    return generateAuthMock(dynamic);
  }
  
  // Generic response based on HTTP method
  switch (method.toUpperCase()) {
    case 'GET':
      return {
        id: dynamic ? faker.number.int() : 1,
        name: dynamic ? faker.person.fullName() : 'Sample Name',
        description: dynamic ? faker.lorem.paragraph() : 'Sample description',
        createdAt: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z',
        updatedAt: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z'
      };
      
    case 'POST':
      return {
        id: dynamic ? faker.number.int() : 1,
        success: true,
        message: 'Resource created successfully',
        timestamp: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z'
      };
      
    case 'PUT':
    case 'PATCH':
      return {
        id: dynamic ? faker.number.int() : 1,
        success: true,
        message: 'Resource updated successfully',
        timestamp: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z'
      };
      
    case 'DELETE':
      return {
        success: true,
        message: 'Resource deleted successfully',
        timestamp: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z'
      };
      
    default:
      return generateGenericValue(dynamic);
  }
}

function generateUserMock(dynamic) {
  return {
    id: dynamic ? faker.number.int() : 1,
    username: dynamic ? faker.internet.userName() : 'johndoe',
    email: dynamic ? faker.internet.email() : 'john@example.com',
    firstName: dynamic ? faker.person.firstName() : 'John',
    lastName: dynamic ? faker.person.lastName() : 'Doe',
    avatar: dynamic ? faker.image.avatar() : 'https://example.com/avatar.jpg',
    isActive: dynamic ? faker.datatype.boolean() : true,
    createdAt: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z'
  };
}

function generatePostMock(dynamic) {
  return {
    id: dynamic ? faker.number.int() : 1,
    title: dynamic ? faker.lorem.sentence() : 'Sample Post Title',
    content: dynamic ? faker.lorem.paragraphs(3) : 'This is a sample post content...',
    author: dynamic ? faker.person.fullName() : 'John Doe',
    authorId: dynamic ? faker.number.int() : 1,
    tags: dynamic ? [faker.word.sample(), faker.word.sample()] : ['sample', 'post'],
    publishedAt: dynamic ? faker.date.recent().toISOString() : '2024-01-01T00:00:00.000Z',
    readCount: dynamic ? faker.number.int({ min: 0, max: 10000 }) : 42
  };
}

function generateProductMock(dynamic) {
  return {
    id: dynamic ? faker.number.int() : 1,
    name: dynamic ? faker.commerce.productName() : 'Sample Product',
    description: dynamic ? faker.commerce.productDescription() : 'A sample product description',
    price: dynamic ? parseFloat(faker.commerce.price()) : 29.99,
    category: dynamic ? faker.commerce.department() : 'Electronics',
    inStock: dynamic ? faker.datatype.boolean() : true,
    rating: dynamic ? parseFloat((Math.random() * 5).toFixed(1)) : 4.5,
    imageUrl: dynamic ? faker.image.url() : 'https://example.com/product.jpg'
  };
}

function generateAuthMock(dynamic) {
  return {
    token: dynamic ? faker.string.alphanumeric(64) : 'sample-jwt-token-here',
    refreshToken: dynamic ? faker.string.alphanumeric(64) : 'sample-refresh-token-here',
    expiresIn: dynamic ? faker.number.int({ min: 3600, max: 86400 }) : 3600,
    user: generateUserMock(dynamic)
  };
}

function generateGenericValue(dynamic) {
  if (dynamic) {
    const types = ['string', 'number', 'boolean', 'object', 'array'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    switch (randomType) {
      case 'string':
        return faker.lorem.word();
      case 'number':
        return faker.number.int();
      case 'boolean':
        return faker.datatype.boolean();
      case 'object':
        return { key: faker.lorem.word() };
      case 'array':
        return [faker.lorem.word(), faker.lorem.word()];
    }
  }
  
  return 'sample_value';
}

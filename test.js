#!/usr/bin/env node

import { parseInput, generateMockResponse } from './src/index.js';

async function testPackage() {
  console.log('🧪 Testing API Mock Generator package...\n');

  try {
    // Test parsing a Postman collection
    console.log('📋 Testing Postman collection parsing...');
    const postmanResult = await parseInput('./examples/sample-postman.json');
    console.log('✅ Postman parsing successful');
    console.log(`   Type: ${postmanResult.type}`);
    console.log(`   Name: ${postmanResult.name}`);
    console.log(`   Endpoints: ${postmanResult.endpoints.length}`);
    
    // Show first endpoint
    if (postmanResult.endpoints.length > 0) {
      const firstEndpoint = postmanResult.endpoints[0];
      console.log(`   Sample endpoint: ${firstEndpoint.method} ${firstEndpoint.path}`);
    }
    console.log('');

    // Test parsing an OpenAPI spec
    console.log('📋 Testing OpenAPI spec parsing...');
    const openapiResult = await parseInput('./examples/sample-openapi.yaml');
    console.log('✅ OpenAPI parsing successful');
    console.log(`   Type: ${openapiResult.type}`);
    console.log(`   Name: ${openapiResult.name}`);
    console.log(`   Version: ${openapiResult.version}`);
    console.log(`   Endpoints: ${openapiResult.endpoints.length}`);
    
    // Show first endpoint
    if (openapiResult.endpoints.length > 0) {
      const firstEndpoint = openapiResult.endpoints[0];
      console.log(`   Sample endpoint: ${firstEndpoint.method} ${firstEndpoint.path}`);
    }
    console.log('');

    // Test mock response generation
    console.log('🎭 Testing mock response generation...');
    const mockResponse = generateMockResponse(
      null, // no examples
      null, // no schema
      false, // not dynamic
      { path: '/users', method: 'GET' }
    );
    console.log('✅ Mock generation successful');
    console.log('   Sample response:', JSON.stringify(mockResponse, null, 2));
    console.log('');

    console.log('🎉 All tests passed! The package is working correctly.');
    console.log('\n🚀 You can now run:');
    console.log('   npm install');
    console.log('   node bin/cli.js examples/sample-postman.json');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPackage();

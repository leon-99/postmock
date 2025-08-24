# Test Suite

This directory contains comprehensive test cases for the postmock project.

## Test Structure

- **`generator.test.js`** - Tests for the mock response generator module
- **`parser.test.js`** - Tests for the main parser module
- **`parser-factory.test.js`** - Tests for the parser factory class
- **`file-reader.test.js`** - Tests for the file reading utilities
- **`server.test.js`** - Tests for the Express server module
- **`utils.test.js`** - Tests for utility functions
- **`setup.js`** - Test setup and global mocks

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers:

- **Generator Module**: Mock response generation, schema handling, examples, dynamic vs static generation
- **Parser Module**: File parsing, error handling, parser selection
- **Parser Factory**: Format detection, parser creation, validation
- **File Reader**: File reading, format detection, error handling
- **Server Module**: Express server setup, endpoint creation, middleware configuration
- **Utility Functions**: Delay handling, validation, file operations, formatting

## Mocking Strategy

- **External Dependencies**: All external packages (fs, path, yaml, express, cors, chalk) are mocked
- **Faker Library**: The faker library is mocked to provide predictable outputs for testing
- **File System**: File system operations are mocked to avoid actual file I/O during tests
- **Timers**: setTimeout and setInterval are mocked for testing asynchronous operations

## Test Patterns

- **Unit Tests**: Each function and method is tested in isolation
- **Integration Tests**: Module interactions are tested with mocked dependencies
- **Error Handling**: Edge cases and error conditions are thoroughly tested
- **Async Testing**: Promise-based functions are tested with proper async/await patterns
- **Mock Verification**: All mocks are verified to ensure correct function calls

## Adding New Tests

When adding new functionality:

1. Create a new test file in the `test/` directory
2. Follow the existing naming convention: `module-name.test.js`
3. Use descriptive test names that explain the expected behavior
4. Mock external dependencies appropriately
5. Test both success and failure scenarios
6. Include edge cases and boundary conditions

## Test Utilities

- **`setup.js`**: Contains global mocks and test setup
- **Jest Configuration**: Configured for ES modules and proper test discovery
- **Coverage Reports**: HTML and text coverage reports are generated

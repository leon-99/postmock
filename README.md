# API Mock Generator 🚀

Generate mock API servers instantly from Postman collections or OpenAPI specs. Perfect for frontend development, testing, and prototyping when you need a working API server without waiting for backend implementation.

## ✨ Features

- **Instant Mock Server**: Spin up a mock API server in seconds
- **Multiple Input Formats**: Support for Postman collections (.json) and OpenAPI specs (.yaml/.json)
- **Smart Mock Generation**: Uses examples when available, generates realistic fake data when not
- **Dynamic Responses**: Toggle between static and dynamic (randomized) responses
- **Delay Simulation**: Simulate real-world API latency
- **Hot Reload**: Auto-restart server when input files change
- **CORS Support**: Built-in CORS handling for frontend integration
- **Health Check**: Built-in health endpoint for monitoring

## 🚀 Quick Start

### Installation

```bash
npm install -g api-mockgen
```

### Basic Usage

```bash
# From a Postman collection
api-mockgen collection.json

# From an OpenAPI spec
api-mockgen openapi.yaml

# With custom port
api-mockgen collection.json --port 5000

# With dynamic responses and delay simulation
api-mockgen collection.json --dynamic --delay 100-300
```

## 📖 CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--port` | `-p` | Port to run server on | `4000` |
| `--delay` | `-d` | Simulated delay range in ms (e.g., `100-300`) | `0` |
| `--dynamic` | | Generate random responses every request | `false` |
| `--cors` | | Enable CORS | `true` |
| `--hot-reload` | | Watch for file changes and restart server | `false` |

## 🔧 Examples

### Simple Mock Server
```bash
api-mockgen my-api.json
```
Creates a mock server on port 4000 using your API specification.

### Advanced Configuration
```bash
api-mockgen openapi.yaml \
  --port 5000 \
  --dynamic \
  --delay 200-500 \
  --hot-reload
```
- Runs on port 5000
- Generates different responses each time
- Simulates 200-500ms latency
- Auto-restarts when the spec file changes

## 📁 Input File Formats

### Postman Collection
```json
{
  "info": {
    "name": "My API Collection"
  },
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/users",
          "host": ["{{baseUrl}}"],
          "path": ["users"]
        }
      },
      "response": [
        {
          "body": "{\"users\": [{\"id\": 1, \"name\": \"John Doe\"}]}"
        }
      ]
    }
  ]
}
```

### OpenAPI Specification
```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              example:
                users:
                  - id: 1
                    name: John Doe
```

## 🎯 Use Cases

### Frontend Development
- Start building frontend immediately without waiting for backend
- Test API integrations with realistic data
- Develop offline-first applications

### Testing & QA
- Create consistent test environments
- Test error handling with controlled responses
- Performance testing with configurable delays

### Prototyping
- Demo API contracts to stakeholders
- Rapid API design iteration
- Proof of concept development

### CI/CD
- Automated testing against mock APIs
- Consistent test environments
- No external dependencies

## 🏗️ Architecture

The package is built with a modular architecture:

- **CLI Layer** (`bin/cli.js`): Command-line interface and argument parsing
- **Server Layer** (`src/server.js`): Express server setup and endpoint routing
- **Parser Layer** (`src/parser.js`): Input file parsing for Postman and OpenAPI
- **Generator Layer** (`src/generator.js`): Mock response generation with faker.js
- **Utils Layer** (`src/utils.js`): Helper functions for delays, hot reload, etc.

## 🔌 API Endpoints

### Health Check
```
GET /_health
```
Returns server status and endpoint count.

### Mock Endpoints
All endpoints defined in your input file will be automatically created with appropriate HTTP methods and paths.

## 🛠️ Development

### Local Development
```bash
# Clone and install dependencies
git clone <repository>
cd api-mockgen
npm install

# Run in development mode
npm run dev

# Test with a sample file
node bin/cli.js examples/sample.json
```

### Project Structure
```
api-mockgen/
├── bin/
│   └── cli.js          # CLI entry point
├── src/
│   ├── server.js       # Express server setup
│   ├── parser.js       # File parsing logic
│   ├── generator.js    # Mock response generation
│   ├── utils.js        # Utility functions
│   └── index.js        # Main exports
├── examples/            # Sample input files
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Mock data powered by [Faker.js](https://fakerjs.dev/)
- CLI framework by [Commander.js](https://github.com/tj/commander.js)
- Postman collection parsing by [postman-collection](https://github.com/postmanlabs/postman-collection)

---

**Happy Mocking! 🎭**

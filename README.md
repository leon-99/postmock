# PostMock

> **Instant Mock API Server Generator** - Create mock servers from Postman collections or OpenAPI specs in seconds!

![PostMock Cover](cover.png)

[![npm version](https://img.shields.io/npm/v/postmock.svg?style=flat-square)](https://www.npmjs.com/package/postmock)
[![npm downloads](https://img.shields.io/npm/dm/postmock.svg?style=flat-square)](https://www.npmjs.com/package/postmock)
[![GitHub license](https://img.shields.io/github/license/leon-99/postmock.svg?style=flat-square)](https://github.com/leon-99/postmock/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/leon-99/postmock.svg?style=flat-square)](https://github.com/leon-99/postmock/issues)
---

**PostMock** is a powerful CLI tool that instantly generates mock API servers from your existing Postman collections or OpenAPI specifications. Perfect for frontend development, testing, and prototyping when you need a working API server without waiting for backend implementation.

## ✨ Features

- 🚀 **Instant Setup** - Generate a mock server in seconds
- 📚 **Multiple Formats** - Support for Postman (.json) and OpenAPI (.yaml/.yml/.json)
- 🎭 **Smart Mocking** - Uses existing examples or generates realistic fake data
- 🔄 **Dynamic Responses** - Generate different responses for each request
- ⚡ **Hot Reload** - Automatically restart server when files change
- 🎯 **CORS Support** - Built-in CORS for frontend integration
- ⏱️ **Delay Simulation** - Simulate network latency
- 🐳 **Docker Ready** - Easy containerization
- 📊 **Health Checks** - Built-in health monitoring endpoints

## 🚀 Quick Start

### Installation

```bash
npm install -g postmock
```

### Basic Usage

```bash
# From a Postman collection
postmock collection.json

# From an OpenAPI spec
postmock swagger.yaml

# With custom port
postmock collection.json --port 5000

# With dynamic responses and delay simulation
postmock collection.json --dynamic --delay 100-300
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
postmock my-api.json
```
Creates a mock server on port 4000 using your API specification.

### Advanced Configuration
```bash
postmock openapi.yaml \
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



## 🔌 API Endpoints

### Health Check
```
GET /_health
```
Returns server status and endpoint count.

### Mock Endpoints
All endpoints defined in your input file will be automatically created with appropriate HTTP methods and paths.



## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.





---

<div align="center">

**Happy Mocking! 🎭**

[Install Now](https://www.npmjs.com/package/postmock) • [View on GitHub](https://github.com/leon-99/postmock) • [Report Bug](https://github.com/leon-99/postmock/issues)

---

**Made with ❤️ by Win Khant Aung**

</div>

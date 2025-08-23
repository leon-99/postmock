import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { parseInput } from './parser.js';
import { generateMockResponse } from './generator.js';
import { applyDelay, setupHotReload } from './utils.js';

export async function startServer(inputFile, options) {
  try {
    // Parse the input file
    const apiSpec = await parseInput(inputFile);
    
    if (!apiSpec || !apiSpec.endpoints || apiSpec.endpoints.length === 0) {
      throw new Error('No valid endpoints found in the input file');
    }

    const app = express();
    
    // Middleware
    if (options.cors) {
      app.use(cors());
    }
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup hot reload if enabled
    if (options.hotReload) {
      setupHotReload(inputFile, () => {
        console.log(chalk.yellow('🔄 File changed, restarting server...'));
        process.exit(0);
      });
    }

    // Create mock endpoints
    apiSpec.endpoints.forEach(endpoint => {
      const { method, path, examples, schema } = endpoint;
      
      app[method.toLowerCase()](path, async (req, res) => {
        try {
          // Apply delay if specified
          if (options.delay !== '0') {
            await applyDelay(options.delay);
          }

          // Generate mock response
          const response = generateMockResponse(examples, schema, options.dynamic, req);
          
          // Set appropriate headers
          res.setHeader('Content-Type', 'application/json');
                      res.setHeader('X-Mock-Server', 'mockify');
          
          res.json(response);
          
          // Log the request
          console.log(chalk.green(`${method.toUpperCase()} ${path} → ${chalk.gray('200 OK')}`));
          
        } catch (error) {
          console.error(chalk.red(`Error handling ${method} ${path}:`), error);
          res.status(500).json({ 
            error: 'Internal mock server error',
            message: error.message 
          });
        }
      });
    });

    // Health check endpoint
    app.get('/_health', (req, res) => {
      res.json({ 
        status: 'ok', 
        service: 'mockify',
        endpoints: apiSpec.endpoints.length,
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler for undefined routes
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `No mock endpoint defined for ${req.method} ${req.originalUrl}`,
        availableEndpoints: apiSpec.endpoints.map(ep => `${ep.method} ${ep.path}`)
      });
    });

    // Start the server
    const server = app.listen(options.port, () => {
      console.log(chalk.green('\n✅ Mock API server is running!'));
      console.log(chalk.blue(`📍 Server URL: http://localhost:${options.port}`));
      console.log(chalk.blue(`🔍 Health check: http://localhost:${options.port}/_health`));
      console.log(chalk.gray(`📊 Total endpoints: ${apiSpec.endpoints.length}`));
      console.log(chalk.gray('\nPress Ctrl+C to stop the server\n'));
      
      // Display all available endpoints
      apiSpec.endpoints.forEach(endpoint => {
        console.log(chalk.cyan(`  ${endpoint.method.padEnd(6)} ${endpoint.path}`));
      });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down mock server...'));
      server.close(() => {
        console.log(chalk.green('✅ Server stopped'));
        process.exit(0);
      });
    });

  } catch (error) {
    throw new Error(`Failed to start server: ${error.message}`);
  }
}

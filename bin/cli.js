#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { startServer } from '../src/server.js';

const program = new Command();

program
  .name('postmock')
  .description('Generate mock API servers from Postman collections or OpenAPI specs')
  .version('1.0.0')
  .argument('<input>', 'Postman collection (.json) or OpenAPI spec (.yaml/.json) file')
  .option('-p, --port <number>', 'Port to run server on', '4000')
  .option('-d, --delay <range>', 'Simulated delay range in ms (e.g., 100-300)', '0')
  .option('--dynamic', 'Generate random responses every request', false)
  .option('--cors', 'Enable CORS', true)
  .option('--hot-reload', 'Watch for file changes and restart server', false)
  .action(async (input, options) => {
    try {
      console.log(chalk.blue('🚀 Starting PostMock...'));
      console.log(chalk.gray(`Input file: ${input}`));
      console.log(chalk.gray(`Port: ${options.port}`));
      console.log(chalk.gray(`Dynamic responses: ${options.dynamic ? 'Yes' : 'No'}`));
      
      if (options.delay !== '0') {
        console.log(chalk.gray(`Delay simulation: ${options.delay}ms`));
      }
      
      await startServer(input, options);
    } catch (error) {
      console.error(chalk.red('❌ Error starting server:'), error.message);
      process.exit(1);
    }
  });

program.parse();

#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import { startServer } from '../src/server.js';

async function main() {
  console.log(chalk.blue('🚀 Welcome to PostMock!'));
  console.log(chalk.gray('Generate mock API servers from Postman collections or OpenAPI specs\n'));

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Enter the path to your Postman collection (.json) or OpenAPI spec (.yaml/.json) file:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Please enter a file path';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'port',
        message: 'What port would you like to run the server on?',
        default: '4000',
        validate: (input) => {
          const port = parseInt(input);
          if (isNaN(port) || port < 1 || port > 65535) {
            return 'Please enter a valid port number (1-65535)';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'delay',
        message: 'Enter simulated delay range in milliseconds (e.g., 100-300) or press Enter for no delay:',
        default: '0',
        validate: (input) => {
          if (input === '0' || input.trim() === '') {
            return true;
          }
          if (input.includes('-')) {
            const [min, max] = input.split('-').map(Number);
            if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > max) {
              return 'Please enter a valid delay range (e.g., 100-300)';
            }
          } else {
            const delay = parseInt(input);
            if (isNaN(delay) || delay < 0) {
              return 'Please enter a valid delay value';
            }
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'dynamic',
        message: 'Would you like to generate random responses for every request?',
        default: false
      },
      {
        type: 'confirm',
        name: 'cors',
        message: 'Enable CORS for cross-origin requests?',
        default: true
      },
      {
        type: 'confirm',
        name: 'hotReload',
        message: 'Enable hot reload to watch for file changes and restart server?',
        default: false
      }
    ]);

    // Convert answers to the format expected by startServer
    const options = {
      port: parseInt(answers.port),
      delay: answers.delay === '0' ? '0' : answers.delay,
      dynamic: answers.dynamic,
      cors: answers.cors,
      'hot-reload': answers.hotReload
    };

    console.log(chalk.blue('\n🚀 Starting PostMock...'));
    console.log(chalk.gray(`Input file: ${answers.input}`));
    console.log(chalk.gray(`Port: ${options.port}`));
    console.log(chalk.gray(`Dynamic responses: ${options.dynamic ? 'Yes' : 'No'}`));
    
    if (options.delay !== '0') {
      console.log(chalk.gray(`Delay simulation: ${options.delay}ms`));
    }
    
    await startServer(answers.input, options);
  } catch (error) {
    if (error.isTtyError) {
      console.error(chalk.red('❌ Error: This CLI requires an interactive terminal'));
      console.error(chalk.yellow('Please run this command in a terminal that supports interactive prompts'));
    } else {
      console.error(chalk.red('❌ Error starting server:'), error.message);
    }
    process.exit(1);
  }
}

main();

/**
 * Main Parser Module
 * Orchestrates file reading and parsing using specialized parser classes
 */

import { FileReader } from './utils/file-reader.js';
import { ParserFactory } from './parsers/index.js';

/**
 * Parse input file and return API specification
 * @param {string} inputFile - Path to input file
 * @returns {Promise<Object>} Parsed API specification
 */
export async function parseInput(inputFile) {
  try {
    // Read and parse the file
    const data = await FileReader.readFile(inputFile);
    
    // Create appropriate parser
    const parser = ParserFactory.createParser(data);
    
    // Parse the data
    return parser.parse(data);
    
  } catch (error) {
    throw new Error(`Failed to parse input file: ${error.message}`);
  }
}

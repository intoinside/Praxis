/**
 * Command Generator
 *
 * Functions for generating command files using tool adapters.
 */
import type { CommandContent, ToolCommandAdapter, GeneratedCommand } from './types.js';
/**
 * Generate a single command file using the provided adapter.
 * @param content - The tool-agnostic command content
 * @param adapter - The tool-specific adapter
 * @returns Generated command with path and file content
 */
export declare function generateCommand(content: CommandContent, adapter: ToolCommandAdapter): GeneratedCommand;
/**
 * Generate multiple command files using the provided adapter.
 * @param contents - Array of tool-agnostic command contents
 * @param adapter - The tool-specific adapter
 * @returns Array of generated commands with paths and file contents
 */
export declare function generateCommands(contents: CommandContent[], adapter: ToolCommandAdapter): GeneratedCommand[];

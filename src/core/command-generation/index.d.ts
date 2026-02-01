/**
 * Command Generation Module
 *
 * Generic command generation system with tool-specific adapters.
 *
 * Usage:
 * ```typescript
 * import { generateCommands, CommandAdapterRegistry, type CommandContent } from './command-generation/index.js';
 *
 * const contents: CommandContent[] = [...];
 * const adapter = CommandAdapterRegistry.get('cursor');
 * if (adapter) {
 *   const commands = generateCommands(contents, adapter);
 *   // Write commands to disk
 * }
 * ```
 */
export type { CommandContent, ToolCommandAdapter, GeneratedCommand, } from './types.js';
export { CommandAdapterRegistry } from './registry.js';
export { generateCommand, generateCommands } from './generator.js';
